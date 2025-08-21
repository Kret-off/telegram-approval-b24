const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { Approval, Approver, UserMapping } = require('../models');
const telegramService = require('../services/telegramService');
const bitrix24Service = require('../services/bitrix24Service');

const router = express.Router();

// Схема валидации для входящих данных от Bitrix24
const notifySchema = Joi.object({
  approval_id: Joi.string().max(50).required(),
  bitrix24_portal: Joi.string().uri().required(),
  bitrix24_user_id: Joi.number().integer().positive().required(),
  document_type: Joi.string().max(50).required(),
  document_id: Joi.number().integer().positive().required(),
  document_title: Joi.string().max(500).required(),
  document_url: Joi.string().uri().required(),
  message_text: Joi.string().required(),
  button_approve: Joi.string().max(100).default('Согласовать'),
  button_reject: Joi.string().max(100).default('Отклонить'),
  mode: Joi.string().valid('single', 'multiple_wait_all', 'multiple_first').default('single'),
  timeout_hours: Joi.number().integer().min(1).max(168).default(24),
  approvers: Joi.array().items(
    Joi.object({
      bitrix24_user_id: Joi.number().integer().positive().required(),
      telegram_username: Joi.string().max(100).optional(),
    })
  ).min(1).required(),
  signature: Joi.string().required(),
  timestamp: Joi.number().integer().positive().required(),
});

// Middleware для проверки HMAC подписи
const verifySignature = (req, res, next) => {
  try {
    const signature = req.headers['x-signature'] || req.body.signature;
    const timestamp = req.headers['x-timestamp'] || req.body.timestamp;
    const secret = process.env.BACKEND_SECRET;

    if (!signature || !timestamp || !secret) {
      logger.logSecurity('Missing signature or timestamp', {
        ip: req.ip,
        headers: req.headers,
      });
      return res.status(401).json({
        error: 'Missing authentication data',
      });
    }

    // Проверка таймаута (5 минут)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      logger.logSecurity('Request timestamp expired', {
        ip: req.ip,
        timestamp,
        now,
      });
      return res.status(401).json({
        error: 'Request timestamp expired',
      });
    }

    // Проверка подписи
    const data = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data + timestamp)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.logSecurity('Invalid signature', {
        ip: req.ip,
        expected: expectedSignature,
        received: signature,
      });
      return res.status(401).json({
        error: 'Invalid signature',
      });
    }

    next();
  } catch (error) {
    logger.logError(error, { context: 'verifySignature' });
    res.status(500).json({
      error: 'Signature verification failed',
    });
  }
};

// POST /api/b24/notify - Получение уведомления от Bitrix24 Activity
router.post('/notify', verifySignature, async (req, res) => {
  try {
    // Валидация входящих данных
    const { error, value } = notifySchema.validate(req.body);
    if (error) {
      logger.warn('Validation error in notify request', {
        error: error.details,
        body: req.body,
      });
      return res.status(400).json({
        error: 'Validation error',
        details: error.details,
      });
    }

    const {
      approval_id,
      bitrix24_portal,
      bitrix24_user_id,
      document_type,
      document_id,
      document_title,
      document_url,
      message_text,
      button_approve,
      button_reject,
      mode,
      timeout_hours,
      approvers,
    } = value;

    // Проверка существования согласования
    const existingApproval = await Approval.findByApprovalId(approval_id);
    if (existingApproval) {
      logger.warn('Duplicate approval request', { approval_id });
      return res.status(409).json({
        error: 'Approval already exists',
        approval_id,
      });
    }

    // Создание записи согласования
    const approval = await Approval.create({
      approval_id,
      bitrix24_portal,
      bitrix24_user_id,
      document_type,
      document_id,
      document_title,
      document_url,
      message_text,
      button_approve,
      button_reject,
      mode,
      timeout_hours,
      status: 'pending',
    });

    // Создание записей согласантов
    const approverPromises = approvers.map(async (approver) => {
      // Поиск маппинга пользователя
      const userMapping = await UserMapping.findByBitrix24User(
        bitrix24_portal,
        approver.bitrix24_user_id
      );

      if (!userMapping) {
        logger.warn('User mapping not found', {
          portal: bitrix24_portal,
          bitrix24_user_id: approver.bitrix24_user_id,
        });
        return null;
      }

      // Создание записи согласанта
      return Approver.create({
        approval_id,
        bitrix24_user_id: approver.bitrix24_user_id,
        telegram_user_id: userMapping.telegram_user_id,
        telegram_username: userMapping.telegram_username,
        telegram_first_name: userMapping.telegram_first_name,
        telegram_last_name: userMapping.telegram_last_name,
        status: 'pending',
      });
    });

    const createdApprovers = (await Promise.all(approverPromises)).filter(Boolean);

    if (createdApprovers.length === 0) {
      logger.error('No approvers created', { approval_id, approvers });
      return res.status(400).json({
        error: 'No valid approvers found',
      });
    }

    // Отправка сообщений в Telegram
    const telegramPromises = createdApprovers.map(async (approver) => {
      try {
        const messageData = {
          approval_id,
          document_title,
          document_url,
          message_text,
          button_approve,
          button_reject,
          approver_telegram_id: approver.telegram_user_id,
        };

        const result = await telegramService.sendApprovalMessage(messageData);
        
        // Обновление информации о сообщении
        if (result.success) {
          await approver.updateMessageInfo(
            approval_id,
            approver.bitrix24_user_id,
            result.message_id,
            result.chat_id
          );
        }

        return result;
      } catch (error) {
        logger.logError(error, {
          context: 'sendTelegramMessage',
          approval_id,
          approver_id: approver.id,
        });
        return { success: false, error: error.message };
      }
    });

    const telegramResults = await Promise.all(telegramPromises);
    const successCount = telegramResults.filter(r => r.success).length;

    logger.logBusiness('approval_created', {
      approval_id,
      approvers_count: createdApprovers.length,
      telegram_success: successCount,
      mode,
    });

    res.status(200).json({
      success: true,
      approval_id,
      approvers_created: createdApprovers.length,
      telegram_messages_sent: successCount,
    });

  } catch (error) {
    logger.logError(error, { context: 'notifyEndpoint' });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// GET /api/b24/status/:approval_id - Получение статуса согласования
router.get('/status/:approval_id', async (req, res) => {
  try {
    const { approval_id } = req.params;

    const approval = await Approval.findByApprovalId(approval_id);
    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        approval_id,
      });
    }

    res.json({
      approval_id,
      status: approval.status,
      created_at: approval.created_at,
      responded_at: approval.responded_at,
      approvers: approval.approvers.map(approver => ({
        bitrix24_user_id: approver.bitrix24_user_id,
        telegram_username: approver.telegram_username,
        status: approver.status,
        responded_at: approver.responded_at,
      })),
    });

  } catch (error) {
    logger.logError(error, { context: 'getStatus' });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// POST /api/b24/cancel/:approval_id - Отмена согласования
router.post('/cancel/:approval_id', verifySignature, async (req, res) => {
  try {
    const { approval_id } = req.params;

    const approval = await Approval.findByApprovalId(approval_id);
    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        approval_id,
      });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({
        error: 'Approval cannot be cancelled',
        status: approval.status,
      });
    }

    // Обновление статуса
    await approval.updateStatus(approval_id, 'cancelled');

    // Отправка уведомлений в Telegram об отмене
    const telegramPromises = approval.approvers
      .filter(approver => approver.status === 'pending')
      .map(approver => 
        telegramService.sendCancellationMessage({
          chat_id: approver.chat_id,
          message_id: approver.message_id,
          approval_id,
        })
      );

    await Promise.all(telegramPromises);

    logger.logBusiness('approval_cancelled', { approval_id });

    res.json({
      success: true,
      approval_id,
      status: 'cancelled',
    });

  } catch (error) {
    logger.logError(error, { context: 'cancelApproval' });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router;

const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

// Создание экземпляра бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false, // Отключаем polling, используем webhook
});

// Кэш для информации о боте
let botInfoCache = null;
let botInfoCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

class TelegramService {
  // Получение информации о боте
  async getBotInfo() {
    try {
      const now = Date.now();
      
      // Проверяем кэш
      if (botInfoCache && (now - botInfoCacheTime) < CACHE_TTL) {
        return botInfoCache;
      }

      const info = await bot.getMe();
      botInfoCache = info;
      botInfoCacheTime = now;
      
      logger.debug('Bot info retrieved', { bot_info: info });
      return info;
    } catch (error) {
      logger.logError(error, { context: 'getBotInfo' });
      throw error;
    }
  }

  // Настройка webhook
  async setWebhook(webhookUrl) {
    try {
      const result = await bot.setWebhook(webhookUrl);
      logger.info('Webhook set successfully', { webhook_url: webhookUrl, result });
      return result;
    } catch (error) {
      logger.logError(error, { context: 'setWebhook', webhook_url: webhookUrl });
      throw error;
    }
  }

  // Удаление webhook
  async deleteWebhook() {
    try {
      const result = await bot.deleteWebhook();
      logger.info('Webhook deleted successfully', { result });
      return result;
    } catch (error) {
      logger.logError(error, { context: 'deleteWebhook' });
      throw error;
    }
  }

  // Получение информации о webhook
  async getWebhookInfo() {
    try {
      const info = await bot.getWebhookInfo();
      logger.debug('Webhook info retrieved', { webhook_info: info });
      return info;
    } catch (error) {
      logger.logError(error, { context: 'getWebhookInfo' });
      throw error;
    }
  }

  // Отправка сообщения с согласованием
  async sendApprovalMessage(messageData) {
    try {
      const {
        approval_id,
        document_title,
        document_url,
        message_text,
        button_approve,
        button_reject,
        approver_telegram_id,
      } = messageData;

      // Формирование текста сообщения
      const messageText = this.formatApprovalMessage({
        document_title,
        document_url,
        message_text,
      });

      // Создание inline кнопок
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: button_approve,
              callback_data: `approve:${approval_id}`,
            },
            {
              text: button_reject,
              callback_data: `reject:${approval_id}`,
            },
          ],
        ],
      };

      // Отправка сообщения
      const result = await bot.sendMessage(approver_telegram_id, messageText, {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false,
      });

      logger.logBusiness('approval_message_sent', {
        approval_id,
        telegram_user_id: approver_telegram_id,
        message_id: result.message_id,
        chat_id: result.chat.id,
      });

      return {
        success: true,
        message_id: result.message_id,
        chat_id: result.chat.id,
        result,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'sendApprovalMessage',
        message_data: messageData,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Обновление сообщения с согласованием
  async updateApprovalMessage(updateData) {
    try {
      const {
        chat_id,
        message_id,
        approval_id,
        action,
        responder_name,
      } = updateData;

      // Формирование обновленного текста
      const updatedText = this.formatUpdatedApprovalMessage({
        approval_id,
        action,
        responder_name,
      });

      // Обновление сообщения
      const result = await bot.editMessageText(updatedText, {
        chat_id,
        message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Согласовано',
                callback_data: 'completed',
              },
            ],
          ],
        },
      });

      logger.logBusiness('approval_message_updated', {
        approval_id,
        chat_id,
        message_id,
        action,
        responder_name,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'updateApprovalMessage',
        update_data: updateData,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Отправка сообщения об отмене согласования
  async sendCancellationMessage(cancellationData) {
    try {
      const { chat_id, message_id, approval_id } = cancellationData;

      const cancellationText = this.formatCancellationMessage({ approval_id });

      // Обновление сообщения
      const result = await bot.editMessageText(cancellationText, {
        chat_id,
        message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '❌ Отменено',
                callback_data: 'cancelled',
              },
            ],
          ],
        },
      });

      logger.logBusiness('cancellation_message_sent', {
        approval_id,
        chat_id,
        message_id,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'sendCancellationMessage',
        cancellation_data: cancellationData,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Ответ на callback query
  async answerCallbackQuery(callbackQueryId, text, showAlert = false) {
    try {
      const result = await bot.answerCallbackQuery(callbackQueryId, {
        text,
        show_alert: showAlert,
      });

      logger.debug('Callback query answered', {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
        result,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'answerCallbackQuery',
        callback_query_id: callbackQueryId,
        text,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Отправка простого сообщения
  async sendMessage(chatId, text, options = {}) {
    try {
      const result = await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...options,
      });

      logger.debug('Message sent', {
        chat_id: chatId,
        text: text.substring(0, 100), // Логируем только первые 100 символов
        message_id: result.message_id,
      });

      return {
        success: true,
        message_id: result.message_id,
        result,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'sendMessage',
        chat_id: chatId,
        text: text.substring(0, 100),
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Форматирование сообщения с согласованием
  formatApprovalMessage({ document_title, document_url, message_text }) {
    return `📋 <b>Требуется согласование</b>

📄 <b>Документ:</b> <a href="${document_url}">${document_title}</a>

💬 <b>Сообщение:</b>
${message_text}

⏰ <i>Пожалуйста, ответьте в течение 24 часов</i>`;
  }

  // Форматирование обновленного сообщения
  formatUpdatedApprovalMessage({ approval_id, action, responder_name }) {
    const actionText = action === 'approve' ? '✅ Согласовано' : '❌ Отклонено';
    return `📋 <b>Согласование завершено</b>

${actionText} пользователем <b>${responder_name}</b>

🆔 <b>ID согласования:</b> ${approval_id}

⏰ <i>Время ответа: ${new Date().toLocaleString('ru-RU')}</i>`;
  }

  // Форматирование сообщения об отмене
  formatCancellationMessage({ approval_id }) {
    return `📋 <b>Согласование отменено</b>

❌ <b>Статус:</b> Отменено

🆔 <b>ID согласования:</b> ${approval_id}

⏰ <i>Время отмены: ${new Date().toLocaleString('ru-RU')}</i>`;
  }

  // Проверка валидности токена бота
  async validateToken(token) {
    try {
      const testBot = new TelegramBot(token, { polling: false });
      const info = await testBot.getMe();
      return {
        valid: true,
        bot_info: info,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  // Получение статистики бота
  async getBotStats() {
    try {
      const info = await this.getBotInfo();
      const webhookInfo = await this.getWebhookInfo();
      
      return {
        bot_info: info,
        webhook_info: webhookInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.logError(error, { context: 'getBotStats' });
      throw error;
    }
  }
}

module.exports = new TelegramService();

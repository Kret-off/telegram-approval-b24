const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class Bitrix24Service {
  constructor() {
    this.defaultTimeout = 30000; // 30 секунд
  }

  // Отправка результата согласования в Bitrix24
  async sendApprovalResult(resultData) {
    try {
      const {
        approval_id,
        bitrix24_portal,
        status,
        result_code,
        result_label,
        comment,
        responded_by,
      } = resultData;

      // Формирование URL для OnExternalEvent
      const webhookUrl = `${bitrix24_portal}/rest/bizproc.event.send`;
      
      // Формирование данных для отправки
      const eventData = {
        event_token: approval_id, // Используем approval_id как event_token
        return_values: {
          RESULT_CODE: result_code,
          RESULT_LABEL: result_label,
          COMMENT: comment || '',
          RESPONDED_BY: responded_by || '',
          RESPONDED_AT: new Date().toISOString(),
        },
      };

      // Генерация подписи для безопасности
      const signature = this.generateSignature(eventData, process.env.BACKEND_SECRET);

      // Отправка запроса
      const response = await axios.post(webhookUrl, eventData, {
        timeout: this.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'User-Agent': 'TelegramApprovalBackend/1.0',
        },
      });

      logger.logBusiness('approval_result_sent', {
        approval_id,
        bitrix24_portal,
        status,
        result_code,
        response_status: response.status,
      });

      return {
        success: true,
        response: response.data,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'sendApprovalResult',
        result_data: resultData,
      });

      // Определение типа ошибки
      let errorType = 'unknown';
      let errorMessage = error.message;

      if (error.response) {
        // Ошибка от сервера
        errorType = 'server_error';
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        if (error.response.data) {
          errorMessage += ` - ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        // Ошибка сети
        errorType = 'network_error';
        errorMessage = 'Network error - no response received';
      } else if (error.code === 'ECONNABORTED') {
        // Таймаут
        errorType = 'timeout';
        errorMessage = 'Request timeout';
      }

      return {
        success: false,
        error: errorMessage,
        error_type: errorType,
      };
    }
  }

  // Отправка уведомления об отмене согласования
  async sendCancellationNotification(cancellationData) {
    try {
      const {
        approval_id,
        bitrix24_portal,
        reason = 'Согласование отменено',
      } = cancellationData;

      const webhookUrl = `${bitrix24_portal}/rest/bizproc.event.send`;
      
      const eventData = {
        event_token: approval_id,
        return_values: {
          RESULT_CODE: 'cancelled',
          RESULT_LABEL: 'Отменено',
          COMMENT: reason,
          RESPONDED_BY: 'System',
          RESPONDED_AT: new Date().toISOString(),
        },
      };

      const signature = this.generateSignature(eventData, process.env.BACKEND_SECRET);

      const response = await axios.post(webhookUrl, eventData, {
        timeout: this.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'User-Agent': 'TelegramApprovalBackend/1.0',
        },
      });

      logger.logBusiness('cancellation_notification_sent', {
        approval_id,
        bitrix24_portal,
        reason,
        response_status: response.status,
      });

      return {
        success: true,
        response: response.data,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'sendCancellationNotification',
        cancellation_data: cancellationData,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Проверка доступности портала Bitrix24
  async checkPortalAvailability(portalUrl) {
    try {
      const healthUrl = `${portalUrl}/rest/server.time`;
      
      const response = await axios.get(healthUrl, {
        timeout: 10000, // 10 секунд для проверки
        headers: {
          'User-Agent': 'TelegramApprovalBackend/1.0',
        },
      });

      return {
        available: true,
        response_time: response.headers['x-response-time'] || 'unknown',
        server_time: response.data?.result || null,
      };
    } catch (error) {
      logger.logError(error, {
        context: 'checkPortalAvailability',
        portal_url: portalUrl,
      });

      return {
        available: false,
        error: error.message,
      };
    }
  }

  // Получение информации о пользователе Bitrix24
  async getUserInfo(portalUrl, userId, authToken) {
    try {
      const webhookUrl = `${portalUrl}/rest/user.get`;
      
      const response = await axios.post(webhookUrl, {
        ID: userId,
        auth: authToken,
      }, {
        timeout: this.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TelegramApprovalBackend/1.0',
        },
      });

      if (response.data?.result && response.data.result.length > 0) {
        return {
          success: true,
          user_info: response.data.result[0],
        };
      } else {
        return {
          success: false,
          error: 'User not found',
        };
      }
    } catch (error) {
      logger.logError(error, {
        context: 'getUserInfo',
        portal_url: portalUrl,
        user_id: userId,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Валидация URL портала Bitrix24
  validatePortalUrl(portalUrl) {
    try {
      const url = new URL(portalUrl);
      
      // Проверяем, что это HTTP или HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        return {
          valid: false,
          error: 'Invalid protocol. Only HTTP and HTTPS are supported.',
        };
      }

      // Проверяем наличие домена
      if (!url.hostname) {
        return {
          valid: false,
          error: 'Invalid hostname.',
        };
      }

      // Проверяем, что это не localhost в продакшене
      if (process.env.NODE_ENV === 'production' && 
          (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        return {
          valid: false,
          error: 'Localhost is not allowed in production.',
        };
      }

      return {
        valid: true,
        normalized_url: url.toString(),
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format.',
      };
    }
  }

  // Генерация HMAC подписи
  generateSignature(data, secret) {
    const dataString = JSON.stringify(data);
    return crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');
  }

  // Проверка HMAC подписи
  verifySignature(data, signature, secret) {
    const expectedSignature = this.generateSignature(data, secret);
    return signature === expectedSignature;
  }

  // Получение статистики по порталу
  async getPortalStats(portalUrl, authToken) {
    try {
      const stats = {};

      // Получение количества пользователей
      try {
        const usersResponse = await axios.post(`${portalUrl}/rest/user.get`, {
          auth: authToken,
          ACTIVE: true,
        }, {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'TelegramApprovalBackend/1.0',
          },
        });

        stats.active_users = usersResponse.data?.result?.length || 0;
      } catch (error) {
        logger.warn('Failed to get users count', { portal_url: portalUrl, error: error.message });
        stats.active_users = 'unknown';
      }

      // Получение информации о портале
      try {
        const portalResponse = await axios.post(`${portalUrl}/rest/app.info`, {
          auth: authToken,
        }, {
          timeout: this.defaultTimeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'TelegramApprovalBackend/1.0',
          },
        });

        stats.portal_info = portalResponse.data?.result || {};
      } catch (error) {
        logger.warn('Failed to get portal info', { portal_url: portalUrl, error: error.message });
        stats.portal_info = 'unknown';
      }

      return {
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.logError(error, {
        context: 'getPortalStats',
        portal_url: portalUrl,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new Bitrix24Service();

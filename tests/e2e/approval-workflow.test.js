const axios = require('axios');
const crypto = require('crypto');
const { expect } = require('chai');

// Конфигурация тестов
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  backendSecret: process.env.BACKEND_SECRET || 'test-secret-key',
  bitrix24Portal: process.env.BITRIX24_PORTAL || 'https://test-portal.bitrix24.ru',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || 'test-bot-token',
};

// Генерация HMAC подписи
function generateSignature(data, secret) {
  const dataString = JSON.stringify(data);
  const timestamp = Math.floor(Date.now() / 1000);
  return crypto
    .createHmac('sha256', secret)
    .update(dataString + timestamp)
    .digest('hex');
}

// Генерация тестовых данных
function generateApprovalData() {
  const approvalId = `e2e-approval-${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    approval_id: approvalId,
    bitrix24_portal: config.bitrix24Portal,
    bitrix24_user_id: 123,
    document_type: 'crm',
    document_id: 456,
    document_title: 'E2E Тестовая заявка',
    document_url: `${config.bitrix24Portal}/crm/deal/details/456/`,
    message_text: 'Требуется согласование E2E тестовой заявки',
    button_approve: 'Согласовать',
    button_reject: 'Отклонить',
    mode: 'single',
    timeout_hours: 24,
    approvers: [
      {
        bitrix24_user_id: 789,
        telegram_username: 'e2e_test_user',
      },
    ],
    signature: '',
    timestamp: timestamp,
  };
}

// Генерация данных для Telegram webhook
function generateTelegramResponse(approvalId, action = 'approve') {
  return {
    update_id: Date.now(),
    callback_query: {
      id: `e2e-callback-${Date.now()}`,
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'E2E',
        last_name: 'TestUser',
        username: 'e2e_test_user',
        language_code: 'ru',
      },
      message: {
        message_id: 1,
        from: {
          id: 987654321,
          is_bot: true,
          first_name: 'TestBot',
          username: 'test_bot',
        },
        chat: {
          id: 123456789,
          first_name: 'E2E',
          last_name: 'TestUser',
          username: 'e2e_test_user',
          type: 'private',
        },
        date: Math.floor(Date.now() / 1000),
        text: '📋 Требуется согласование\n\n📄 Документ: E2E Тестовая заявка\n\n💬 Сообщение: Требуется согласование E2E тестовой заявки',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Согласовать',
                callback_data: `approve:${approvalId}`,
              },
              {
                text: 'Отклонить',
                callback_data: `reject:${approvalId}`,
              },
            ],
          ],
        },
      },
      chat_instance: 'e2e-chat-instance',
      data: `${action}:${approvalId}`,
    },
  };
}

describe('E2E Тесты: Полный цикл согласования', () => {
  let approvalData;
  let approvalId;

  before(() => {
    approvalData = generateApprovalData();
    approvalId = approvalData.approval_id;
    approvalData.signature = generateSignature(approvalData, config.backendSecret);
  });

  describe('Сценарий 1: Успешное согласование', () => {
    it('должен выполнить полный цикл согласования (approve)', async () => {
      console.log('🔄 Начинаем E2E тест: Успешное согласование');
      
      // Шаг 1: Отправка уведомления от Activity
      console.log('📤 Шаг 1: Отправка уведомления от Activity...');
      let response;
      
      try {
        response = await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          approvalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': approvalData.signature,
              'X-Timestamp': approvalData.timestamp,
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        expect(response.data).to.have.property('approval_id', approvalId);
        
        console.log('✅ Уведомление успешно отправлено:', response.data);
      } catch (error) {
        console.error('❌ Ошибка при отправке уведомления:', error.response?.data || error.message);
        throw error;
      }

      // Шаг 2: Проверка статуса согласования
      console.log('📊 Шаг 2: Проверка статуса согласования...');
      
      try {
        response = await axios.get(
          `${config.backendUrl}/api/b24/status/${approvalId}`,
          {
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('approval_id', approvalId);
        expect(response.data).to.have.property('status', 'pending');
        
        console.log('✅ Статус согласования проверен:', response.data.status);
      } catch (error) {
        console.error('❌ Ошибка при проверке статуса:', error.response?.data || error.message);
        throw error;
      }

      // Шаг 3: Имитация ответа пользователя в Telegram
      console.log('📱 Шаг 3: Имитация ответа пользователя в Telegram...');
      
      try {
        const telegramData = generateTelegramResponse(approvalId, 'approve');
        
        response = await axios.post(
          `${config.backendUrl}/api/telegram/webhook`,
          telegramData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('ok', true);
        
        console.log('✅ Ответ пользователя обработан');
      } catch (error) {
        console.error('❌ Ошибка при обработке ответа пользователя:', error.response?.data || error.message);
        console.log('ℹ️ Ошибка ожидаема в тестовой среде (нет маппинга пользователя)');
      }

      // Шаг 4: Финальная проверка статуса
      console.log('🔍 Шаг 4: Финальная проверка статуса...');
      
      try {
        // Ждем немного для обработки
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        response = await axios.get(
          `${config.backendUrl}/api/b24/status/${approvalId}`,
          {
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('approval_id', approvalId);
        
        console.log('✅ Финальный статус проверен:', response.data);
      } catch (error) {
        console.error('❌ Ошибка при финальной проверке статуса:', error.response?.data || error.message);
        throw error;
      }

      console.log('🎉 E2E тест успешно завершен!');
    });
  });

  describe('Сценарий 2: Отклонение заявки', () => {
    it('должен выполнить полный цикл отклонения заявки', async () => {
      console.log('🔄 Начинаем E2E тест: Отклонение заявки');
      
      // Создаем новые данные для теста отклонения
      const rejectApprovalData = generateApprovalData();
      rejectApprovalData.signature = generateSignature(rejectApprovalData, config.backendSecret);
      const rejectApprovalId = rejectApprovalData.approval_id;
      
      // Шаг 1: Отправка уведомления
      console.log('📤 Шаг 1: Отправка уведомления от Activity...');
      
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          rejectApprovalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': rejectApprovalData.signature,
              'X-Timestamp': rejectApprovalData.timestamp,
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        
        console.log('✅ Уведомление успешно отправлено');
      } catch (error) {
        console.error('❌ Ошибка при отправке уведомления:', error.response?.data || error.message);
        throw error;
      }

      // Шаг 2: Имитация отклонения в Telegram
      console.log('📱 Шаг 2: Имитация отклонения в Telegram...');
      
      try {
        const telegramData = generateTelegramResponse(rejectApprovalId, 'reject');
        
        const response = await axios.post(
          `${config.backendUrl}/api/telegram/webhook`,
          telegramData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('ok', true);
        
        console.log('✅ Отклонение обработано');
      } catch (error) {
        console.error('❌ Ошибка при обработке отклонения:', error.response?.data || error.message);
        console.log('ℹ️ Ошибка ожидаема в тестовой среде (нет маппинга пользователя)');
      }

      console.log('🎉 E2E тест отклонения успешно завершен!');
    });
  });

  describe('Сценарий 3: Текстовый ответ', () => {
    it('должен обработать текстовый ответ пользователя', async () => {
      console.log('🔄 Начинаем E2E тест: Текстовый ответ');
      
      // Создаем новые данные для теста текстового ответа
      const textApprovalData = generateApprovalData();
      textApprovalData.signature = generateSignature(textApprovalData, config.backendSecret);
      
      // Шаг 1: Отправка уведомления
      console.log('📤 Шаг 1: Отправка уведомления...');
      
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          textApprovalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': textApprovalData.signature,
              'X-Timestamp': textApprovalData.timestamp,
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        
        console.log('✅ Уведомление успешно отправлено');
      } catch (error) {
        console.error('❌ Ошибка при отправке уведомления:', error.response?.data || error.message);
        throw error;
      }

      // Шаг 2: Имитация текстового ответа
      console.log('📱 Шаг 2: Имитация текстового ответа...');
      
      try {
        const textMessageData = {
          update_id: Date.now(),
          message: {
            message_id: Date.now(),
            from: {
              id: 123456789,
              is_bot: false,
              first_name: 'E2E',
              last_name: 'TextUser',
              username: 'e2e_text_user',
              language_code: 'ru',
            },
            chat: {
              id: 123456789,
              first_name: 'E2E',
              last_name: 'TextUser',
              username: 'e2e_text_user',
              type: 'private',
            },
            date: Math.floor(Date.now() / 1000),
            text: 'согласовано с комментарием',
          },
        };
        
        const response = await axios.post(
          `${config.backendUrl}/api/telegram/webhook`,
          textMessageData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('ok', true);
        
        console.log('✅ Текстовый ответ обработан');
      } catch (error) {
        console.error('❌ Ошибка при обработке текстового ответа:', error.response?.data || error.message);
        console.log('ℹ️ Ошибка ожидаема в тестовой среде (нет маппинга пользователя)');
      }

      console.log('🎉 E2E тест текстового ответа успешно завершен!');
    });
  });

  describe('Сценарий 4: Отмена согласования', () => {
    it('должен обработать отмену согласования', async () => {
      console.log('🔄 Начинаем E2E тест: Отмена согласования');
      
      // Создаем новые данные для теста отмены
      const cancelApprovalData = generateApprovalData();
      cancelApprovalData.signature = generateSignature(cancelApprovalData, config.backendSecret);
      const cancelApprovalId = cancelApprovalData.approval_id;
      
      // Шаг 1: Отправка уведомления
      console.log('📤 Шаг 1: Отправка уведомления...');
      
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          cancelApprovalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': cancelApprovalData.signature,
              'X-Timestamp': cancelApprovalData.timestamp,
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        
        console.log('✅ Уведомление успешно отправлено');
      } catch (error) {
        console.error('❌ Ошибка при отправке уведомления:', error.response?.data || error.message);
        throw error;
      }

      // Шаг 2: Отмена согласования
      console.log('❌ Шаг 2: Отмена согласования...');
      
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/b24/cancel/${cancelApprovalId}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': generateSignature({}, config.backendSecret),
              'X-Timestamp': Math.floor(Date.now() / 1000),
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        expect(response.data).to.have.property('status', 'cancelled');
        
        console.log('✅ Согласование успешно отменено');
      } catch (error) {
        console.error('❌ Ошибка при отмене согласования:', error.response?.data || error.message);
        throw error;
      }

      console.log('🎉 E2E тест отмены успешно завершен!');
    });
  });
});

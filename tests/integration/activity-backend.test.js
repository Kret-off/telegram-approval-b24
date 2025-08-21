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

// Генерация HMAC подписи для тестов
function generateSignature(data, secret) {
  const dataString = JSON.stringify(data);
  const timestamp = Math.floor(Date.now() / 1000);
  return crypto
    .createHmac('sha256', secret)
    .update(dataString + timestamp)
    .digest('hex');
}

// Генерация тестовых данных
function generateTestApprovalData() {
  const approvalId = `test-approval-${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    approval_id: approvalId,
    bitrix24_portal: config.bitrix24Portal,
    bitrix24_user_id: 123,
    document_type: 'crm',
    document_id: 456,
    document_title: 'Тестовая заявка #123',
    document_url: `${config.bitrix24Portal}/crm/deal/details/456/`,
    message_text: 'Требуется согласование тестовой заявки',
    button_approve: 'Согласовать',
    button_reject: 'Отклонить',
    mode: 'single',
    timeout_hours: 24,
    approvers: [
      {
        bitrix24_user_id: 789,
        telegram_username: 'test_user',
      },
    ],
    signature: '',
    timestamp: timestamp,
  };
}

describe('Интеграционные тесты: Activity + Backend', () => {
  let testApprovalData;

  before(() => {
    testApprovalData = generateTestApprovalData();
    // Генерируем подпись для тестовых данных
    testApprovalData.signature = generateSignature(testApprovalData, config.backendSecret);
  });

  describe('POST /api/b24/notify', () => {
    it('должен успешно принять уведомление от Activity', async () => {
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          testApprovalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': testApprovalData.signature,
              'X-Timestamp': testApprovalData.timestamp,
            },
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('success', true);
        expect(response.data).to.have.property('approval_id', testApprovalData.approval_id);
        expect(response.data).to.have.property('approvers_created');
        expect(response.data).to.have.property('telegram_messages_sent');

        console.log('✅ Уведомление успешно принято:', response.data);
      } catch (error) {
        console.error('❌ Ошибка при отправке уведомления:', error.response?.data || error.message);
        throw error;
      }
    });

    it('должен отклонить запрос с неверной подписью', async () => {
      const invalidData = { ...testApprovalData };
      invalidData.signature = 'invalid-signature';

      try {
        await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          invalidData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': invalidData.signature,
              'X-Timestamp': invalidData.timestamp,
            },
            timeout: 10000,
          }
        );

        throw new Error('Запрос должен был быть отклонен');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('error');
        console.log('✅ Запрос с неверной подписью корректно отклонен');
      }
    });

    it('должен отклонить запрос с истекшим таймаутом', async () => {
      const expiredData = { ...testApprovalData };
      expiredData.timestamp = Math.floor(Date.now() / 1000) - 400; // 6+ минут назад

      try {
        await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          expiredData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': expiredData.signature,
              'X-Timestamp': expiredData.timestamp,
            },
            timeout: 10000,
          }
        );

        throw new Error('Запрос должен был быть отклонен');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('error');
        console.log('✅ Запрос с истекшим таймаутом корректно отклонен');
      }
    });

    it('должен отклонить дублирующийся запрос', async () => {
      // Отправляем первый запрос
      await axios.post(
        `${config.backendUrl}/api/b24/notify`,
        testApprovalData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': testApprovalData.signature,
            'X-Timestamp': testApprovalData.timestamp,
          },
          timeout: 10000,
        }
      );

      // Отправляем дублирующийся запрос
      try {
        await axios.post(
          `${config.backendUrl}/api/b24/notify`,
          testApprovalData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': testApprovalData.signature,
              'X-Timestamp': testApprovalData.timestamp,
            },
            timeout: 10000,
          }
        );

        throw new Error('Дублирующийся запрос должен был быть отклонен');
      } catch (error) {
        expect(error.response.status).to.equal(409);
        expect(error.response.data).to.have.property('error');
        console.log('✅ Дублирующийся запрос корректно отклонен');
      }
    });
  });

  describe('GET /api/b24/status/:approval_id', () => {
    it('должен вернуть статус согласования', async () => {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/b24/status/${testApprovalData.approval_id}`,
          {
            timeout: 10000,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('approval_id', testApprovalData.approval_id);
        expect(response.data).to.have.property('status');
        expect(response.data).to.have.property('approvers');
        expect(response.data.approvers).to.be.an('array');

        console.log('✅ Статус согласования получен:', response.data);
      } catch (error) {
        console.error('❌ Ошибка при получении статуса:', error.response?.data || error.message);
        throw error;
      }
    });

    it('должен вернуть 404 для несуществующего согласования', async () => {
      try {
        await axios.get(
          `${config.backendUrl}/api/b24/status/non-existent-approval`,
          {
            timeout: 10000,
          }
        );

        throw new Error('Запрос должен был вернуть 404');
      } catch (error) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data).to.have.property('error');
        console.log('✅ Несуществующее согласование корректно обработано');
      }
    });
  });

  describe('Health Check', () => {
    it('должен вернуть статус здоровья сервиса', async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/health`, {
          timeout: 5000,
        });

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('status', 'ok');
        expect(response.data).to.have.property('timestamp');

        console.log('✅ Health check прошел успешно:', response.data);
      } catch (error) {
        console.error('❌ Ошибка health check:', error.response?.data || error.message);
        throw error;
      }
    });

    it('должен вернуть детальную информацию о здоровье', async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/health/detailed`, {
          timeout: 10000,
        });

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('status');
        expect(response.data).to.have.property('checks');
        expect(response.data.checks).to.have.property('database');
        expect(response.data.checks).to.have.property('telegram');

        console.log('✅ Детальный health check прошел успешно');
      } catch (error) {
        console.error('❌ Ошибка детального health check:', error.response?.data || error.message);
        throw error;
      }
    });
  });
});

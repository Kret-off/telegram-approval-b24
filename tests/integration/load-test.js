const axios = require('axios');
const crypto = require('crypto');
const { expect } = require('chai');

// Конфигурация тестов
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  backendSecret: process.env.BACKEND_SECRET || 'test-secret-key',
  bitrix24Portal: process.env.BITRIX24_PORTAL || 'https://test-portal.bitrix24.ru',
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
function generateTestApprovalData(index) {
  const approvalId = `load-test-approval-${Date.now()}-${index}`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    approval_id: approvalId,
    bitrix24_portal: config.bitrix24Portal,
    bitrix24_user_id: 100 + index,
    document_type: 'crm',
    document_id: 1000 + index,
    document_title: `Нагрузочная заявка #${index}`,
    document_url: `${config.bitrix24Portal}/crm/deal/details/${1000 + index}/`,
    message_text: `Требуется согласование нагрузочной заявки #${index}`,
    button_approve: 'Согласовать',
    button_reject: 'Отклонить',
    mode: 'single',
    timeout_hours: 24,
    approvers: [
      {
        bitrix24_user_id: 200 + index,
        telegram_username: `test_user_${index}`,
      },
    ],
    signature: '',
    timestamp: timestamp,
  };
}

// Функция для отправки одного запроса
async function sendRequest(index) {
  const testData = generateTestApprovalData(index);
  testData.signature = generateSignature(testData, config.backendSecret);

  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/b24/notify`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': testData.signature,
          'X-Timestamp': testData.timestamp,
        },
        timeout: 30000,
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      status: response.status,
      responseTime,
      approvalId: testData.approval_id,
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: false,
      status: error.response?.status || 0,
      responseTime,
      error: error.response?.data?.error || error.message,
      approvalId: testData.approval_id,
    };
  }
}

// Функция для отправки множественных запросов
async function sendConcurrentRequests(count, delay = 0) {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    const promise = sendRequest(i);
    promises.push(promise);
    
    if (delay > 0 && i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return Promise.all(promises);
}

describe('Нагрузочные тесты', () => {
  describe('Одиночные запросы', () => {
    it('должен обработать 10 последовательных запросов', async () => {
      const results = [];
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        const result = await sendRequest(i);
        results.push(result);
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.filter(r => !r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(`📊 Результаты последовательных запросов:`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Неудачных: ${failedRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);
      console.log(`   Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).to.be.greaterThan(0);
      expect(avgResponseTime).to.be.lessThan(5000); // Менее 5 секунд
    });
  });

  describe('Параллельные запросы', () => {
    it('должен обработать 5 параллельных запросов', async () => {
      const startTime = Date.now();
      const results = await sendConcurrentRequests(5);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.filter(r => !r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(`📊 Результаты параллельных запросов (5):`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Неудачных: ${failedRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);
      console.log(`   Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).to.be.greaterThan(0);
      expect(avgResponseTime).to.be.lessThan(10000); // Менее 10 секунд
    });

    it('должен обработать 10 параллельных запросов', async () => {
      const startTime = Date.now();
      const results = await sendConcurrentRequests(10);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.filter(r => !r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(`📊 Результаты параллельных запросов (10):`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Неудачных: ${failedRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);
      console.log(`   Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).to.be.greaterThan(0);
      expect(avgResponseTime).to.be.lessThan(15000); // Менее 15 секунд
    });
  });

  describe('Нагрузочное тестирование с задержкой', () => {
    it('должен обработать 20 запросов с задержкой 50ms', async () => {
      const startTime = Date.now();
      const results = await sendConcurrentRequests(20, 50);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.filter(r => !r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(`📊 Результаты запросов с задержкой (20 запросов, 50ms задержка):`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Неудачных: ${failedRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);
      console.log(`   Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).to.be.greaterThan(0);
      expect(avgResponseTime).to.be.lessThan(20000); // Менее 20 секунд
    });
  });

  describe('Тестирование rate limiting', () => {
    it('должен обработать запросы в пределах rate limit', async () => {
      const results = [];
      const startTime = Date.now();

      // Отправляем 50 запросов быстро
      for (let i = 0; i < 50; i++) {
        const result = await sendRequest(i);
        results.push(result);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const rateLimitedRequests = results.filter(r => !r.success && r.status === 429).length;
      const otherFailedRequests = results.filter(r => !r.success && r.status !== 429).length;

      console.log(`📊 Результаты rate limiting теста:`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Rate limited (429): ${rateLimitedRequests}`);
      console.log(`   Другие ошибки: ${otherFailedRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);

      // Проверяем, что rate limiting работает
      expect(rateLimitedRequests).to.be.greaterThan(0);
    });
  });

  describe('Тестирование производительности health check', () => {
    it('должен быстро отвечать на health check запросы', async () => {
      const results = [];
      const startTime = Date.now();

      // Отправляем 100 health check запросов
      for (let i = 0; i < 100; i++) {
        const requestStart = Date.now();
        
        try {
          const response = await axios.get(`${config.backendUrl}/health`, {
            timeout: 5000,
          });
          
          const requestEnd = Date.now();
          results.push({
            success: true,
            status: response.status,
            responseTime: requestEnd - requestStart,
          });
        } catch (error) {
          const requestEnd = Date.now();
          results.push({
            success: false,
            status: error.response?.status || 0,
            responseTime: requestEnd - requestStart,
            error: error.message,
          });
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulRequests = results.filter(r => r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(`📊 Результаты health check теста:`);
      console.log(`   Всего запросов: ${results.length}`);
      console.log(`   Успешных: ${successfulRequests}`);
      console.log(`   Общее время: ${totalTime}ms`);
      console.log(`   Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).to.be.greaterThan(90); // 90% успешных запросов
      expect(avgResponseTime).to.be.lessThan(1000); // Менее 1 секунды
    });
  });
});

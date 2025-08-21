// Настройка тестового окружения
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// Настройка Chai
chai.use(sinonChai);

// Глобальные переменные для тестов
global.expect = chai.expect;
global.sinon = sinon;

// Настройка окружения
process.env.NODE_ENV = 'test';

// Отключение логирования в тестах (если нужно)
if (process.env.SUPPRESS_LOGS === 'true') {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  
  // Восстановление логирования после тестов
  after(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
}

// Глобальные хуки для тестов
beforeEach(() => {
  // Очистка всех стабов и моков перед каждым тестом
  sinon.restore();
});

afterEach(() => {
  // Очистка после каждого теста
  sinon.restore();
});

// Утилиты для тестов
global.testUtils = {
  // Генерация тестовых данных
  generateTestData: (type = 'approval') => {
    const timestamp = Math.floor(Date.now() / 1000);
    
    switch (type) {
      case 'approval':
        return {
          approval_id: `test-approval-${timestamp}`,
          bitrix24_portal: 'https://test-portal.bitrix24.ru',
          bitrix24_user_id: 123,
          document_type: 'crm',
          document_id: 456,
          document_title: 'Тестовая заявка',
          document_url: 'https://test-portal.bitrix24.ru/crm/deal/details/456/',
          message_text: 'Требуется согласование',
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
          timestamp: timestamp,
        };
      
      case 'telegram_message':
        return {
          update_id: timestamp,
          message: {
            message_id: timestamp,
            from: {
              id: 123456789,
              is_bot: false,
              first_name: 'Test',
              last_name: 'User',
              username: 'test_user',
              language_code: 'ru',
            },
            chat: {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'test_user',
              type: 'private',
            },
            date: timestamp,
            text: 'согласовано',
          },
        };
      
      case 'callback_query':
        return {
          update_id: timestamp,
          callback_query: {
            id: `callback-${timestamp}`,
            from: {
              id: 123456789,
              is_bot: false,
              first_name: 'Test',
              last_name: 'User',
              username: 'test_user',
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
                first_name: 'Test',
                last_name: 'User',
                username: 'test_user',
                type: 'private',
              },
              date: timestamp,
              text: '📋 Требуется согласование',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Согласовать',
                      callback_data: 'approve:test-approval',
                    },
                    {
                      text: 'Отклонить',
                      callback_data: 'reject:test-approval',
                    },
                  ],
                ],
              },
            },
            chat_instance: 'test-chat-instance',
            data: 'approve:test-approval',
          },
        };
      
      default:
        return {};
    }
  },

  // Генерация HMAC подписи
  generateSignature: (data, secret) => {
    const crypto = require('crypto');
    const dataString = JSON.stringify(data);
    const timestamp = Math.floor(Date.now() / 1000);
    return crypto
      .createHmac('sha256', secret)
      .update(dataString + timestamp)
      .digest('hex');
  },

  // Ожидание
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Проверка статуса HTTP ответа
  expectHttpStatus: (response, expectedStatus) => {
    expect(response.status).to.equal(expectedStatus);
  },

  // Проверка структуры JSON ответа
  expectJsonStructure: (response, expectedStructure) => {
    expect(response.data).to.have.property('success');
    Object.keys(expectedStructure).forEach(key => {
      expect(response.data).to.have.property(key, expectedStructure[key]);
    });
  },

  // Мок для axios
  mockAxios: () => {
    const axios = require('axios');
    const axiosMock = sinon.stub(axios);
    
    // Мок для успешного ответа
    axiosMock.post.resolves({
      status: 200,
      data: { success: true },
    });
    
    axiosMock.get.resolves({
      status: 200,
      data: { success: true },
    });
    
    return axiosMock;
  },

  // Мок для базы данных
  mockDatabase: () => {
    const dbMock = {
      Approval: {
        create: sinon.stub(),
        findOne: sinon.stub(),
        update: sinon.stub(),
        destroy: sinon.stub(),
      },
      Approver: {
        create: sinon.stub(),
        findOne: sinon.stub(),
        update: sinon.stub(),
        destroy: sinon.stub(),
      },
      UserMapping: {
        create: sinon.stub(),
        findOne: sinon.stub(),
        update: sinon.stub(),
        destroy: sinon.stub(),
      },
    };
    
    return dbMock;
  },
};

// Настройка таймаутов для тестов
const originalTimeout = 30000;
const extendedTimeout = 60000;

// Увеличение таймаута для интеграционных тестов
if (process.env.TEST_TYPE === 'integration' || process.env.TEST_TYPE === 'e2e') {
  this.timeout(extendedTimeout);
}

// Обработка необработанных исключений в тестах
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

console.log('🧪 Тестовое окружение инициализировано');

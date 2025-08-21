// Конфигурация для всех тестов
module.exports = {
  // Настройки сервера
  server: {
    url: process.env.BACKEND_URL || 'http://localhost:3000',
    port: process.env.BACKEND_PORT || 3000,
    timeout: 30000,
  },

  // Настройки безопасности
  security: {
    secret: process.env.BACKEND_SECRET || 'test-secret-key',
    hmacAlgorithm: 'sha256',
    tokenExpiration: 300, // 5 минут
  },

  // Настройки Bitrix24
  bitrix24: {
    portal: process.env.BITRIX24_PORTAL || 'https://test-portal.bitrix24.ru',
    authToken: process.env.BITRIX24_AUTH_TOKEN || 'test-auth-token',
    webhookUrl: process.env.BITRIX24_WEBHOOK_URL || 'https://test-portal.bitrix24.ru/rest/1/test-webhook',
  },

  // Настройки Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || 'test-bot-token',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'test_bot',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || 'https://test-backend.com/api/telegram/webhook',
  },

  // Настройки базы данных
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'telegram_approval_test',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
  },

  // Настройки тестирования
  testing: {
    // Временные интервалы
    timeouts: {
      short: 5000,    // 5 секунд
      medium: 10000,  // 10 секунд
      long: 30000,    // 30 секунд
      veryLong: 60000, // 1 минута
    },

    // Нагрузочное тестирование
    load: {
      concurrentUsers: 10,
      requestsPerUser: 5,
      rampUpTime: 1000, // 1 секунда
      testDuration: 30000, // 30 секунд
    },

    // Retry настройки
    retry: {
      attempts: 3,
      delay: 1000, // 1 секунда
    },

    // Ожидаемые значения
    expectations: {
      responseTime: {
        fast: 1000,    // Менее 1 секунды
        normal: 5000,  // Менее 5 секунд
        slow: 10000,   // Менее 10 секунд
      },
      successRate: {
        excellent: 0.95, // 95%
        good: 0.90,      // 90%
        acceptable: 0.80, // 80%
      },
    },
  },

  // Настройки логирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/test.log',
    console: process.env.LOG_CONSOLE !== 'false',
  },

  // Настройки окружения
  environment: {
    nodeEnv: process.env.NODE_ENV || 'test',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Утилиты для тестов
  utils: {
    // Генерация уникальных ID
    generateId: (prefix = 'test') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    
    // Генерация временных меток
    generateTimestamp: () => Math.floor(Date.now() / 1000),
    
    // Ожидание
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Генерация случайных данных
    random: {
      string: (length = 10) => Math.random().toString(36).substring(2, length + 2),
      number: (min = 1, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min,
      email: () => `test-${Date.now()}@example.com`,
      phone: () => `+7${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    },
  },

  // Настройки мониторинга
  monitoring: {
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    },
    health: {
      endpoint: process.env.HEALTH_ENDPOINT || '/health',
      detailedEndpoint: process.env.HEALTH_DETAILED_ENDPOINT || '/health/detailed',
    },
  },
};

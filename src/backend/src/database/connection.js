const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Конфигурация подключения к БД
const sequelize = new Sequelize(
  process.env.DB_NAME || 'telegram_approval',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Database Query:', { query: msg });
      }
    },
    pool: {
      max: 10, // максимальное количество соединений в пуле
      min: 0, // минимальное количество соединений в пуле
      acquire: 30000, // максимальное время в миллисекундах для получения соединения
      idle: 10000, // максимальное время в миллисекундах, которое соединение может быть неактивным
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      // SSL для продакшена
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }),
    },
    define: {
      // Автоматическое добавление timestamps
      timestamps: true,
      // Использование snake_case для имен колонок
      underscored: true,
      // Использование snake_case для имен таблиц
      freezeTableName: true,
    },
    timezone: '+03:00', // Московское время
  }
);

// Функция для проверки подключения
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
}

// Функция для синхронизации моделей
async function syncModels(force = false) {
  try {
    await sequelize.sync({ force });
    logger.info('Database models synchronized successfully.');
    return true;
  } catch (error) {
    logger.error('Error synchronizing database models:', error);
    return false;
  }
}

// Функция для закрытия подключения
async function closeConnection() {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}

// Обработка событий подключения
sequelize.addHook('beforeConnect', async (config) => {
  logger.debug('Attempting to connect to database...');
});

sequelize.addHook('afterConnect', async (connection) => {
  logger.debug('Database connection established.');
});

// Обработка ошибок подключения
sequelize.addHook('afterDisconnect', async (connection) => {
  logger.warn('Database connection lost.');
});

module.exports = {
  sequelize,
  testConnection,
  syncModels,
  closeConnection,
};

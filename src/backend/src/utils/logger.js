const winston = require('winston');
const path = require('path');

// Создание директории для логов
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Форматы для логов
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Конфигурация транспортов
const transports = [
  // Консольный вывод
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // Файл для всех логов
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
  }),
  
  // Файл для ошибок
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
  }),
];

// Создание logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Создание отдельного logger для Telegram Bot
const telegramLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'telegram.log'),
      format: logFormat,
    }),
  ],
  exitOnError: false,
});

// Создание отдельного logger для Bitrix24
const bitrix24Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'bitrix24.log'),
      format: logFormat,
    }),
  ],
  exitOnError: false,
});

// Функции для логирования запросов
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: res.get('Content-Length'),
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Функции для логирования ошибок
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Функции для логирования безопасности
logger.logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    ...details,
  });
};

// Функции для логирования бизнес-логики
logger.logBusiness = (action, data = {}) => {
  logger.info('Business Action', {
    action,
    ...data,
  });
};

module.exports = logger;
module.exports.telegramLogger = telegramLogger;
module.exports.bitrix24Logger = bitrix24Logger;

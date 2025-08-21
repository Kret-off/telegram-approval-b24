const logger = require('../utils/logger');

// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
  // Логирование ошибки
  logger.logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Определение типа ошибки
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Ошибки валидации
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details || err.message;
  }

  // Ошибки Joi
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
  }

  // Ошибки Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
    }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate Entry';
    details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
    }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign Key Constraint Error';
    details = err.message;
  }

  // Ошибки аутентификации
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  }

  // Ошибки HMAC
  if (err.name === 'HMACError') {
    statusCode = 401;
    message = 'Invalid Signature';
  }

  // Ошибки Telegram Bot API
  if (err.code === 'ETELEGRAM') {
    statusCode = 400;
    message = 'Telegram Bot Error';
    details = err.response?.body || err.message;
  }

  // Ошибки Bitrix24 API
  if (err.code === 'EBITRIX24') {
    statusCode = 400;
    message = 'Bitrix24 API Error';
    details = err.response?.data || err.message;
  }

  // Ошибки сети
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
  }

  // Ошибки таймаута
  if (err.code === 'ETIMEDOUT') {
    statusCode = 408;
    message = 'Request Timeout';
  }

  // Формирование ответа
  const response = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  // Добавление деталей в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    response.error.details = details || err.message;
    response.error.stack = err.stack;
  }

  // Отправка ответа
  res.status(statusCode).json(response);
};

module.exports = errorHandler;

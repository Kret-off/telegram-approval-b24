const express = require('express');
const { sequelize } = require('../database/connection');
const telegramService = require('../services/telegramService');
const logger = require('../utils/logger');

const router = express.Router();

// GET /health - Базовая проверка здоровья
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// GET /health/detailed - Детальная проверка здоровья
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unknown' },
      telegram: { status: 'unknown' },
      memory: { status: 'unknown' },
      disk: { status: 'unknown' },
    },
  };

  try {
    // Проверка базы данных
    try {
      await sequelize.authenticate();
      health.checks.database = {
        status: 'ok',
        message: 'Database connection is healthy',
      };
    } catch (dbError) {
      health.checks.database = {
        status: 'error',
        message: 'Database connection failed',
        error: dbError.message,
      };
      health.status = 'error';
    }

    // Проверка Telegram Bot API
    try {
      const botInfo = await telegramService.getBotInfo();
      health.checks.telegram = {
        status: 'ok',
        message: 'Telegram Bot API is accessible',
        bot_info: {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
        },
      };
    } catch (telegramError) {
      health.checks.telegram = {
        status: 'error',
        message: 'Telegram Bot API is not accessible',
        error: telegramError.message,
      };
      health.status = 'error';
    }

    // Проверка памяти
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    const memoryThreshold = 500; // 500 MB
    const isMemoryOk = memUsageMB.heapUsed < memoryThreshold;

    health.checks.memory = {
      status: isMemoryOk ? 'ok' : 'warning',
      message: isMemoryOk ? 'Memory usage is normal' : 'High memory usage detected',
      usage: memUsageMB,
      threshold: memoryThreshold,
    };

    if (!isMemoryOk) {
      health.status = 'warning';
    }

    // Проверка диска (базовая)
    const fs = require('fs');
    const path = require('path');
    
    try {
      const logDir = path.join(__dirname, '../../logs');
      const stats = fs.statSync(logDir);
      const freeSpace = stats.size || 0;
      
      health.checks.disk = {
        status: 'ok',
        message: 'Disk access is normal',
        log_directory: logDir,
        log_directory_size: freeSpace,
      };
    } catch (diskError) {
      health.checks.disk = {
        status: 'error',
        message: 'Disk access failed',
        error: diskError.message,
      };
      health.status = 'error';
    }

    res.json(health);
  } catch (error) {
    logger.logError(error, { context: 'healthCheck' });
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error.message,
    });
  }
});

// GET /health/ready - Проверка готовности к работе
router.get('/ready', async (req, res) => {
  try {
    const checks = [];

    // Проверка базы данных
    try {
      await sequelize.authenticate();
      checks.push({ service: 'database', status: 'ok' });
    } catch (error) {
      checks.push({ service: 'database', status: 'error', error: error.message });
    }

    // Проверка Telegram Bot API
    try {
      await telegramService.getBotInfo();
      checks.push({ service: 'telegram', status: 'ok' });
    } catch (error) {
      checks.push({ service: 'telegram', status: 'error', error: error.message });
    }

    const allOk = checks.every(check => check.status === 'ok');
    const statusCode = allOk ? 200 : 503;

    res.status(statusCode).json({
      ready: allOk,
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    logger.logError(error, { context: 'readinessCheck' });
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
      details: error.message,
    });
  }
});

// GET /health/live - Проверка жизнеспособности (для Kubernetes)
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

module.exports = router;

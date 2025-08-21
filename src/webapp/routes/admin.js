const express = require('express');
const router = express.Router();

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
};

// Получение статистики системы
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть логика получения статистики из базы данных
    const stats = {
      total_approvals: 150,
      pending_approvals: 25,
      approved_approvals: 100,
      rejected_approvals: 20,
      cancelled_approvals: 5,
      average_response_time: '2.5 часа',
      this_month: {
        total: 45,
        pending: 8,
        approved: 32,
        rejected: 5
      },
      system_health: {
        status: 'ok',
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получение метрик производительности
router.get('/metrics', requireAuth, async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      },
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch
    };

    res.json(metrics);
  } catch (error) {
    console.error('Ошибка получения метрик:', error);
    res.status(500).json({ error: 'Ошибка получения метрик' });
  }
});

// Получение логов системы
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { level = 'info', limit = 100, offset = 0 } = req.query;

    // Здесь должна быть логика получения логов из файловой системы или базы данных
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Система запущена',
        details: { uptime: process.uptime() }
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'Пользователь авторизовался',
        details: { userId: 123, portal: 'example.bitrix24.ru' }
      }
    ];

    res.json({
      logs: logs.slice(offset, offset + limit),
      total: logs.length,
      level,
      limit,
      offset
    });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({ error: 'Ошибка получения логов' });
  }
});

// Очистка логов
router.delete('/logs', requireAuth, async (req, res) => {
  try {
    const { older_than } = req.query;

    // Здесь должна быть логика очистки логов
    console.log('Очистка логов старше:', older_than);

    res.json({ 
      success: true, 
      message: 'Логи очищены',
      older_than
    });
  } catch (error) {
    console.error('Ошибка очистки логов:', error);
    res.status(500).json({ error: 'Ошибка очистки логов' });
  }
});

// Получение информации о пользователях
router.get('/users', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть логика получения информации о пользователях
    const users = [
      {
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        role: 'admin',
        last_login: new Date().toISOString(),
        approvals_count: 25
      },
      {
        id: 2,
        name: 'Петр Петров',
        email: 'petr@example.com',
        role: 'user',
        last_login: new Date(Date.now() - 3600000).toISOString(),
        approvals_count: 15
      }
    ];

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Управление пользователями
router.post('/users', requireAuth, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Здесь должна быть логика создания пользователя
    console.log('Создание пользователя:', { name, email, role });

    res.json({ 
      success: true, 
      message: 'Пользователь создан',
      user: { id: 3, name, email, role }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
});

// Обновление пользователя
router.put('/users/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Здесь должна быть логика обновления пользователя
    console.log('Обновление пользователя:', { id, name, email, role });

    res.json({ 
      success: true, 
      message: 'Пользователь обновлен',
      user: { id, name, email, role }
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ error: 'Ошибка обновления пользователя' });
  }
});

// Удаление пользователя
router.delete('/users/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Здесь должна быть логика удаления пользователя
    console.log('Удаление пользователя:', id);

    res.json({ 
      success: true, 
      message: 'Пользователь удален',
      user_id: id
    });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
});

// Получение настроек системы
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settings = {
      telegram: {
        bot_token: process.env.TELEGRAM_BOT_TOKEN ? '***' : null,
        bot_username: process.env.TELEGRAM_BOT_USERNAME,
        webhook_url: `${process.env.BACKEND_URL}/api/telegram/webhook`
      },
      bitrix24: {
        client_id: process.env.BITRIX24_CLIENT_ID ? '***' : null,
        callback_url: process.env.BITRIX24_CALLBACK_URL,
        portal_url: req.user?.portal
      },
      system: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT,
        backend_url: process.env.BACKEND_URL,
        session_secret: process.env.SESSION_SECRET ? '***' : null
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка получения настроек' });
  }
});

// Обновление настроек системы
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const { telegram, bitrix24, system } = req.body;

    // Здесь должна быть логика обновления настроек
    console.log('Обновление настроек:', { telegram, bitrix24, system });

    res.json({ 
      success: true, 
      message: 'Настройки обновлены'
    });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({ error: 'Ошибка обновления настроек' });
  }
});

// Тестирование подключений
router.post('/test-connections', requireAuth, async (req, res) => {
  try {
    const results = {
      telegram: {
        status: 'unknown',
        message: 'Тест не выполнен'
      },
      bitrix24: {
        status: 'unknown',
        message: 'Тест не выполнен'
      }
    };

    // Тест подключения к Telegram
    try {
      const axios = require('axios');
      const telegramResponse = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
      results.telegram = {
        status: 'ok',
        message: 'Подключение к Telegram успешно',
        bot_info: telegramResponse.data.result
      };
    } catch (error) {
      results.telegram = {
        status: 'error',
        message: 'Ошибка подключения к Telegram',
        error: error.message
      };
    }

    // Тест подключения к Bitrix24
    try {
      const axios = require('axios');
      const bitrix24Response = await axios.get(`${req.user.portal}/rest/user.current`, {
        params: { auth: req.user.accessToken }
      });
      results.bitrix24 = {
        status: 'ok',
        message: 'Подключение к Bitrix24 успешно',
        user_info: bitrix24Response.data.result
      };
    } catch (error) {
      results.bitrix24 = {
        status: 'error',
        message: 'Ошибка подключения к Bitrix24',
        error: error.message
      };
    }

    res.json(results);
  } catch (error) {
    console.error('Ошибка тестирования подключений:', error);
    res.status(500).json({ error: 'Ошибка тестирования подключений' });
  }
});

// Перезапуск системы
router.post('/restart', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть логика перезапуска системы
    console.log('Перезапуск системы запрошен');

    res.json({ 
      success: true, 
      message: 'Система будет перезапущена',
      timestamp: new Date().toISOString()
    });

    // Перезапуск через 1 секунду
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('Ошибка перезапуска системы:', error);
    res.status(500).json({ error: 'Ошибка перезапуска системы' });
  }
});

module.exports = router;

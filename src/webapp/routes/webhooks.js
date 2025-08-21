const express = require('express');
const router = express.Router();

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
};

// Webhook для создания сделки
router.post('/deal-created', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Получен webhook создания сделки:', { event, data });

    // Здесь должна быть логика создания согласования
    // на основе данных о сделке

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки webhook создания сделки:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Webhook для изменения сделки
router.post('/deal-updated', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Получен webhook изменения сделки:', { event, data });

    // Здесь должна быть логика обновления согласования
    // на основе изменений в сделке

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки webhook изменения сделки:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Webhook для создания задачи
router.post('/task-created', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Получен webhook создания задачи:', { event, data });

    // Здесь должна быть логика создания согласования
    // на основе данных о задаче

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки webhook создания задачи:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Webhook для изменения задачи
router.post('/task-updated', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Получен webhook изменения задачи:', { event, data });

    // Здесь должна быть логика обновления согласования
    // на основе изменений в задаче

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки webhook изменения задачи:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Webhook для создания лида
router.post('/lead-created', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Получен webhook создания лида:', { event, data });

    // Здесь должна быть логика создания согласования
    // на основе данных о лиде

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки webhook создания лида:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Универсальный webhook для всех событий
router.post('/universal', async (req, res) => {
  try {
    const { event, data, ts } = req.body;
    
    console.log('Получен универсальный webhook:', { event, data, ts });

    // Определяем тип события и обрабатываем соответственно
    switch (event) {
      case 'ONCRMDEALADD':
        // Обработка создания сделки
        break;
      case 'ONCRMDEALUPDATE':
        // Обработка изменения сделки
        break;
      case 'ONTASKADD':
        // Обработка создания задачи
        break;
      case 'ONTASKUPDATE':
        // Обработка изменения задачи
        break;
      case 'ONCRMLEADADD':
        // Обработка создания лида
        break;
      default:
        console.log('Неизвестное событие:', event);
    }

    res.json({ success: true, message: 'Webhook обработан' });
  } catch (error) {
    console.error('Ошибка обработки универсального webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Тестовый webhook
router.post('/test', (req, res) => {
  console.log('Получен тестовый webhook:', req.body);
  res.json({ 
    success: true, 
    message: 'Тестовый webhook обработан',
    timestamp: new Date().toISOString(),
    data: req.body
  });
});

// Получение списка настроенных webhook'ов
router.get('/list', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть логика получения списка webhook'ов из Bitrix24
    const webhooks = [
      {
        event: 'ONCRMDEALADD',
        handler: `${process.env.BACKEND_URL}/api/webhooks/deal-created`,
        status: 'active'
      },
      {
        event: 'ONCRMDEALUPDATE',
        handler: `${process.env.BACKEND_URL}/api/webhooks/deal-updated`,
        status: 'active'
      },
      {
        event: 'ONTASKADD',
        handler: `${process.env.BACKEND_URL}/api/webhooks/task-created`,
        status: 'active'
      }
    ];

    res.json(webhooks);
  } catch (error) {
    console.error('Ошибка получения списка webhook\'ов:', error);
    res.status(500).json({ error: 'Ошибка получения списка webhook\'ов' });
  }
});

// Создание нового webhook
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { event, handler } = req.body;

    // Здесь должна быть логика создания webhook в Bitrix24
    console.log('Создание webhook:', { event, handler });

    res.json({ 
      success: true, 
      message: 'Webhook создан',
      event,
      handler
    });
  } catch (error) {
    console.error('Ошибка создания webhook:', error);
    res.status(500).json({ error: 'Ошибка создания webhook' });
  }
});

// Удаление webhook
router.delete('/:event', requireAuth, async (req, res) => {
  try {
    const { event } = req.params;

    // Здесь должна быть логика удаления webhook из Bitrix24
    console.log('Удаление webhook:', event);

    res.json({ 
      success: true, 
      message: 'Webhook удален',
      event
    });
  } catch (error) {
    console.error('Ошибка удаления webhook:', error);
    res.status(500).json({ error: 'Ошибка удаления webhook' });
  }
});

module.exports = router;

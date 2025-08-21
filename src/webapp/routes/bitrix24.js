const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
};

// Получение списка пользователей
router.get('/users', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${req.user.portal}/rest/user.get`, {
      params: {
        auth: req.user.accessToken
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Создание задачи
router.post('/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, responsibleId, deadline } = req.body;

    const response = await axios.post(`${req.user.portal}/rest/task.item.add`, {
      auth: req.user.accessToken,
      fields: {
        TITLE: title,
        DESCRIPTION: description,
        RESPONSIBLE_ID: responsibleId,
        DEADLINE: deadline,
        CREATED_BY: req.user.id
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ error: 'Ошибка создания задачи' });
  }
});

// Обновление задачи
router.put('/tasks/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, responsibleId } = req.body;

    const response = await axios.post(`${req.user.portal}/rest/task.item.update`, {
      auth: req.user.accessToken,
      taskId: taskId,
      fields: {
        TITLE: title,
        DESCRIPTION: description,
        STATUS: status,
        RESPONSIBLE_ID: responsibleId
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка обновления задачи' });
  }
});

// Получение списка задач
router.get('/tasks', requireAuth, async (req, res) => {
  try {
    const { status, responsibleId, createdBy } = req.query;
    const params = { auth: req.user.accessToken };

    if (status) params.STATUS = status;
    if (responsibleId) params.RESPONSIBLE_ID = responsibleId;
    if (createdBy) params.CREATED_BY = createdBy;

    const response = await axios.get(`${req.user.portal}/rest/task.item.list`, {
      params
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка получения задач' });
  }
});

// Отправка уведомления
router.post('/notify', requireAuth, async (req, res) => {
  try {
    const { userId, message } = req.body;

    const response = await axios.post(`${req.user.portal}/rest/im.notify`, {
      auth: req.user.accessToken,
      to: userId,
      message: message,
      type: 'SYSTEM'
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    res.status(500).json({ error: 'Ошибка отправки уведомления' });
  }
});

// Получение информации о сделке
router.get('/deals/:dealId', requireAuth, async (req, res) => {
  try {
    const { dealId } = req.params;

    const response = await axios.get(`${req.user.portal}/rest/crm.deal.get`, {
      params: {
        auth: req.user.accessToken,
        id: dealId
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка получения сделки:', error);
    res.status(500).json({ error: 'Ошибка получения сделки' });
  }
});

// Обновление сделки
router.put('/deals/:dealId', requireAuth, async (req, res) => {
  try {
    const { dealId } = req.params;
    const { title, stageId, amount, currencyId } = req.body;

    const response = await axios.post(`${req.user.portal}/rest/crm.deal.update`, {
      auth: req.user.accessToken,
      id: dealId,
      fields: {
        TITLE: title,
        STAGE_ID: stageId,
        OPPORTUNITY: amount,
        CURRENCY_ID: currencyId
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка обновления сделки:', error);
    res.status(500).json({ error: 'Ошибка обновления сделки' });
  }
});

// Получение стадий сделок
router.get('/deal-stages', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${req.user.portal}/rest/crm.deal.fields`, {
      params: {
        auth: req.user.accessToken
      }
    });

    res.json(response.data.result.STAGE_ID.items);
  } catch (error) {
    console.error('Ошибка получения стадий сделок:', error);
    res.status(500).json({ error: 'Ошибка получения стадий сделок' });
  }
});

// Создание веб-хука
router.post('/webhooks', requireAuth, async (req, res) => {
  try {
    const { event, handler } = req.body;

    const response = await axios.post(`${req.user.portal}/rest/event.bind`, {
      auth: req.user.accessToken,
      event: event,
      handler: handler
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка создания веб-хука:', error);
    res.status(500).json({ error: 'Ошибка создания веб-хука' });
  }
});

// Получение списка веб-хуков
router.get('/webhooks', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${req.user.portal}/rest/event.list`, {
      params: {
        auth: req.user.accessToken
      }
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка получения веб-хуков:', error);
    res.status(500).json({ error: 'Ошибка получения веб-хуков' });
  }
});

// Удаление веб-хука
router.delete('/webhooks/:event', requireAuth, async (req, res) => {
  try {
    const { event } = req.params;

    const response = await axios.post(`${req.user.portal}/rest/event.unbind`, {
      auth: req.user.accessToken,
      event: event
    });

    res.json(response.data.result);
  } catch (error) {
    console.error('Ошибка удаления веб-хука:', error);
    res.status(500).json({ error: 'Ошибка удаления веб-хука' });
  }
});

// Проверка подключения к Bitrix24
router.get('/test-connection', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${req.user.portal}/rest/user.current`, {
      params: {
        auth: req.user.accessToken
      }
    });

    res.json({
      success: true,
      user: response.data.result,
      portal: req.user.portal
    });
  } catch (error) {
    console.error('Ошибка проверки подключения:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка подключения к Bitrix24',
      details: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
};

// Создание нового согласования
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      approvers,
      dealId,
      taskId,
      messageText,
      timeout,
      mode
    } = req.body;

    // Создаем задачу в Bitrix24
    const taskResponse = await axios.post(`${req.user.portal}/rest/task.item.add`, {
      auth: req.user.accessToken,
      fields: {
        TITLE: `Согласование: ${title}`,
        DESCRIPTION: description,
        RESPONSIBLE_ID: req.user.id,
        CREATED_BY: req.user.id,
        DEADLINE: new Date(Date.now() + (timeout || 24) * 60 * 60 * 1000).toISOString()
      }
    });

    // Создаем запись согласования в нашей системе
    const approval = {
      id: require('uuid').v4(),
      taskId: taskResponse.data.result,
      dealId,
      title,
      description,
      approvers: approvers.split(',').map(id => id.trim()),
      messageText,
      timeout: timeout || 24,
      mode: mode || 'single',
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      portal: req.user.portal
    };

    // Отправляем уведомления в Telegram
    const telegramPromises = approval.approvers.map(approverId => 
      axios.post(`${process.env.BACKEND_URL}/api/telegram/send-approval`, {
        approvalId: approval.id,
        approverId,
        message: messageText.replace('{TITLE}', title).replace('{DESCRIPTION}', description),
        taskId: approval.taskId,
        dealId: approval.dealId
      })
    );

    await Promise.all(telegramPromises);

    // Сохраняем в базу данных (здесь должна быть реальная БД)
    // await Approval.create(approval);

    res.json({
      success: true,
      approval,
      taskId: approval.taskId
    });

  } catch (error) {
    console.error('Ошибка создания согласования:', error);
    res.status(500).json({ error: 'Ошибка создания согласования' });
  }
});

// Получение списка согласований
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, createdBy, approverId } = req.query;

    // Здесь должна быть выборка из базы данных
    // const approvals = await Approval.find({
    //   ...(status && { status }),
    //   ...(createdBy && { createdBy }),
    //   ...(approverId && { approvers: { $in: [approverId] } })
    // });

    // Временные данные для демонстрации
    const approvals = [
      {
        id: '1',
        title: 'Согласование сделки #123',
        status: 'pending',
        createdAt: new Date().toISOString(),
        approvers: ['user1', 'user2'],
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json(approvals);
  } catch (error) {
    console.error('Ошибка получения согласований:', error);
    res.status(500).json({ error: 'Ошибка получения согласований' });
  }
});

// Получение конкретного согласования
router.get('/:approvalId', requireAuth, async (req, res) => {
  try {
    const { approvalId } = req.params;

    // Здесь должна быть выборка из базы данных
    // const approval = await Approval.findById(approvalId);

    // Временные данные для демонстрации
    const approval = {
      id: approvalId,
      title: 'Согласование сделки #123',
      description: 'Описание согласования',
      status: 'pending',
      approvers: ['user1', 'user2'],
      responses: [],
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    if (!approval) {
      return res.status(404).json({ error: 'Согласование не найдено' });
    }

    res.json(approval);
  } catch (error) {
    console.error('Ошибка получения согласования:', error);
    res.status(500).json({ error: 'Ошибка получения согласования' });
  }
});

// Обновление статуса согласования
router.put('/:approvalId/status', requireAuth, async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { status, comment, approverId } = req.body;

    // Здесь должно быть обновление в базе данных
    // const approval = await Approval.findByIdAndUpdate(approvalId, {
    //   status,
    //   $push: { responses: { approverId, status, comment, timestamp: new Date() } }
    // });

    // Обновляем задачу в Bitrix24
    const taskStatus = status === 'approved' ? 5 : status === 'rejected' ? 6 : 2;
    
    await axios.post(`${req.user.portal}/rest/task.item.update`, {
      auth: req.user.accessToken,
      taskId: approvalId, // Здесь должен быть реальный taskId
      fields: {
        STATUS: taskStatus,
        COMMENTS: comment || `Статус изменен на: ${status}`
      }
    });

    // Отправляем уведомление в Bitrix24
    await axios.post(`${req.user.portal}/rest/im.notify`, {
      auth: req.user.accessToken,
      to: req.user.id,
      message: `Согласование "${approvalId}" ${status === 'approved' ? 'одобрено' : 'отклонено'}`,
      type: 'SYSTEM'
    });

    res.json({ success: true, status });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

// Отмена согласования
router.delete('/:approvalId', requireAuth, async (req, res) => {
  try {
    const { approvalId } = req.params;

    // Здесь должно быть удаление из базы данных
    // await Approval.findByIdAndDelete(approvalId);

    // Обновляем задачу в Bitrix24
    await axios.post(`${req.user.portal}/rest/task.item.update`, {
      auth: req.user.accessToken,
      taskId: approvalId, // Здесь должен быть реальный taskId
      fields: {
        STATUS: 7, // Отменена
        COMMENTS: 'Согласование отменено'
      }
    });

    res.json({ success: true, message: 'Согласование отменено' });
  } catch (error) {
    console.error('Ошибка отмены согласования:', error);
    res.status(500).json({ error: 'Ошибка отмены согласования' });
  }
});

// Получение статистики согласований
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть агрегация из базы данных
    const stats = {
      total: 150,
      pending: 25,
      approved: 100,
      rejected: 20,
      cancelled: 5,
      averageResponseTime: '2.5 часа',
      thisMonth: {
        total: 45,
        pending: 8,
        approved: 32,
        rejected: 5
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получение истории согласований
router.get('/:approvalId/history', requireAuth, async (req, res) => {
  try {
    const { approvalId } = req.params;

    // Здесь должна быть выборка истории из базы данных
    const history = [
      {
        id: '1',
        action: 'created',
        user: 'user1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: 'Создано согласование'
      },
      {
        id: '2',
        action: 'notified',
        user: 'system',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        details: 'Отправлены уведомления согласантам'
      }
    ];

    res.json(history);
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({ error: 'Ошибка получения истории' });
  }
});

// Создание шаблона согласования
router.post('/templates', requireAuth, async (req, res) => {
  try {
    const { name, description, approvers, messageText, timeout, mode } = req.body;

    const template = {
      id: require('uuid').v4(),
      name,
      description,
      approvers,
      messageText,
      timeout,
      mode,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    // Здесь должно быть сохранение в базу данных
    // await Template.create(template);

    res.json({ success: true, template });
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    res.status(500).json({ error: 'Ошибка создания шаблона' });
  }
});

// Получение шаблонов согласований
router.get('/templates', requireAuth, async (req, res) => {
  try {
    // Здесь должна быть выборка из базы данных
    const templates = [
      {
        id: '1',
        name: 'Согласование сделки',
        description: 'Стандартный шаблон для согласования сделок',
        approvers: ['user1', 'user2'],
        messageText: 'Требуется согласование сделки {TITLE}',
        timeout: 24,
        mode: 'single'
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ error: 'Ошибка получения шаблонов' });
  }
});

module.exports = router;

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

// Webhook от Telegram
router.post('/webhook', async (req, res) => {
  try {
    const { message, callback_query } = req.body;

    if (message) {
      await handleMessage(message);
    } else if (callback_query) {
      await handleCallbackQuery(callback_query);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Обработка текстовых сообщений
async function handleMessage(message) {
  const { text, from, chat } = message;
  
  if (!text) return;

  const userId = from.id;
  const chatId = chat.id;
  const messageText = text.toLowerCase();

  // Проверяем, есть ли активное согласование для этого пользователя
  const activeApproval = await getActiveApproval(userId);
  
  if (!activeApproval) {
    await sendMessage(chatId, 'У вас нет активных согласований.');
    return;
  }

  // Обрабатываем ответ пользователя
  if (messageText.includes('согласовано') || messageText.includes('одобрено') || messageText.includes('да')) {
    await approveDocument(activeApproval.id, userId, text);
    await sendMessage(chatId, '✅ Согласование одобрено!');
  } else if (messageText.includes('отклонено') || messageText.includes('не согласовано') || messageText.includes('нет')) {
    await rejectDocument(activeApproval.id, userId, text);
    await sendMessage(chatId, '❌ Согласование отклонено!');
  } else {
    await sendMessage(chatId, 'Пожалуйста, ответьте "согласовано" или "отклонено".');
  }
}

// Обработка callback query (кнопки)
async function handleCallbackQuery(callbackQuery) {
  const { data, from, message } = callbackQuery;
  const userId = from.id;
  const chatId = message.chat.id;

  if (data.startsWith('approve_')) {
    const approvalId = data.split('_')[1];
    await approveDocument(approvalId, userId);
    await sendMessage(chatId, '✅ Согласование одобрено!');
  } else if (data.startsWith('reject_')) {
    const approvalId = data.split('_')[1];
    await rejectDocument(approvalId, userId);
    await sendMessage(chatId, '❌ Согласование отклонено!');
  } else if (data.startsWith('comment_')) {
    const approvalId = data.split('_')[1];
    await sendMessage(chatId, 'Пожалуйста, напишите ваш комментарий:');
    // Здесь можно сохранить состояние ожидания комментария
  }
}

// Отправка согласования в Telegram
router.post('/send-approval', requireAuth, async (req, res) => {
  try {
    const { approvalId, approverId, message, taskId, dealId } = req.body;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Согласовать", callback_data: `approve_${approvalId}` },
          { text: "❌ Отклонить", callback_data: `reject_${approvalId}` }
        ],
        [
          { text: "💬 Комментарий", callback_data: `comment_${approvalId}` }
        ]
      ]
    };

    const telegramMessage = `
📋 Требуется согласование

${message}

📄 Задача: #${taskId}
${dealId ? `📊 Сделка: #${dealId}` : ''}
⏰ Срок: 24 часа

Выберите действие:
    `;

    await sendMessageWithKeyboard(approverId, telegramMessage, keyboard);

    res.json({ success: true, message: 'Согласование отправлено' });
  } catch (error) {
    console.error('Ошибка отправки согласования:', error);
    res.status(500).json({ error: 'Ошибка отправки согласования' });
  }
});

// Отправка простого сообщения
async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
}

// Отправка сообщения с клавиатурой
async function sendMessageWithKeyboard(chatId, text, keyboard) {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка отправки сообщения с клавиатурой:', error);
  }
}

// Получение активного согласования (заглушка)
async function getActiveApproval(userId) {
  // Здесь должна быть логика получения активного согласования из базы данных
  return {
    id: '1',
    title: 'Тестовое согласование',
    status: 'pending'
  };
}

// Одобрение документа (заглушка)
async function approveDocument(approvalId, userId, comment = '') {
  console.log(`Документ ${approvalId} одобрен пользователем ${userId}: ${comment}`);
  // Здесь должна быть логика обновления статуса в базе данных и Bitrix24
}

// Отклонение документа (заглушка)
async function rejectDocument(approvalId, userId, comment = '') {
  console.log(`Документ ${approvalId} отклонен пользователем ${userId}: ${comment}`);
  // Здесь должна быть логика обновления статуса в базе данных и Bitrix24
}

// Настройка webhook
router.post('/setup-webhook', requireAuth, async (req, res) => {
  try {
    const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`;
    
    const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true
    });

    if (response.data.ok) {
      res.json({ 
        success: true, 
        message: 'Webhook настроен успешно',
        webhook_url: webhookUrl
      });
    } else {
      res.status(400).json({ error: 'Ошибка настройки webhook' });
    }
  } catch (error) {
    console.error('Ошибка настройки webhook:', error);
    res.status(500).json({ error: 'Ошибка настройки webhook' });
  }
});

// Получение информации о webhook
router.get('/webhook-info', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка получения информации о webhook:', error);
    res.status(500).json({ error: 'Ошибка получения информации о webhook' });
  }
});

// Отправка тестового сообщения
router.post('/test-message', requireAuth, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    await sendMessage(chatId, message || 'Тестовое сообщение от Telegram Approval Cloud');
    
    res.json({ success: true, message: 'Тестовое сообщение отправлено' });
  } catch (error) {
    console.error('Ошибка отправки тестового сообщения:', error);
    res.status(500).json({ error: 'Ошибка отправки тестового сообщения' });
  }
});

module.exports = router;

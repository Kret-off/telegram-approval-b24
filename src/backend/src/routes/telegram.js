const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/telegram/webhook - Webhook от Telegram
router.post('/webhook', async (req, res) => {
  try {
    const { message, callback_query } = req.body;
    
    if (callback_query) {
      console.log('Button pressed:', callback_query.data);
      await processCallbackQuery(callback_query);
    } else if (message && message.text) {
      console.log('Text message:', message.text);
      await processTextMessage(message);
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/telegram/setup - Настройка webhook
router.get('/setup', async (req, res) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`;
    
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/setWebhook`,
      { url: webhookUrl }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to setup webhook',
      message: error.message
    });
  }
});

// GET /api/telegram/info - Информация о боте
router.get('/info', async (req, res) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get bot info',
      message: error.message
    });
  }
});

async function processCallbackQuery(callbackQuery) {
  console.log('Processing callback query:', callbackQuery.data);
}

async function processTextMessage(message) {
  const text = message.text.toLowerCase();
  
  if (text.includes('согласовано') || text.includes('согласен')) {
    console.log('Approval received via text');
  } else if (text.includes('отклонено') || text.includes('не согласен')) {
    console.log('Rejection received via text');
  }
}

module.exports = router;

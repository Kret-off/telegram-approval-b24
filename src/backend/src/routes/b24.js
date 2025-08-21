const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Middleware для проверки HMAC подписи
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const secret = process.env.BACKEND_SECRET;
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};

// POST /api/b24/notify - Уведомление от Activity
router.post('/notify', verifySignature, (req, res) => {
  try {
    const { approval_id, message_text, approvers, timeout_hours } = req.body;
    
    console.log('Received approval request:', { approval_id, message_text, approvers });
    
    // Здесь будет логика отправки в Telegram
    // Пока просто логируем
    
    res.json({
      status: 'success',
      approval_id,
      message: 'Approval request received'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process approval request',
      message: error.message
    });
  }
});

// GET /api/b24/status/:approval_id - Проверка статуса
router.get('/status/:approval_id', (req, res) => {
  try {
    const { approval_id } = req.params;
    
    res.json({
      approval_id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get approval status',
      message: error.message
    });
  }
});

module.exports = router;

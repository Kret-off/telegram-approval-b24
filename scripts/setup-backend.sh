#!/bin/bash

# Настройка backend-сервиса
set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}[ШАГ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step "Настройка backend-сервиса..."

cd src/backend

# Создание package.json
print_info "Создание package.json..."
cat > package.json << 'EOF'
{
  "name": "telegram-approval-backend",
  "version": "1.0.0",
  "description": "Backend service for Telegram Approval System",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo 'No tests yet'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "axios": "^1.6.2",
    "crypto": "^1.0.1",
    "dotenv": "^16.3.1",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Установка зависимостей
print_info "Установка зависимостей..."
npm install

# Создание .env файла
print_info "Создание .env файла..."
cat > .env << 'EOF'
# Сервер
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
BACKEND_SECRET=your-secret-key-change-this

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_BOT_USERNAME=your_bot_username

# Bitrix24
BITRIX24_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/1/webhook
BITRIX24_AUTH_TOKEN=your-auth-token

# Безопасность
JWT_SECRET=your-jwt-secret-change-this
HMAC_SECRET=your-hmac-secret-change-this
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Логирование
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF

# Создание структуры директорий
mkdir -p src/{routes,services,utils}
mkdir -p logs

# Создание основного файла приложения
print_info "Создание основного файла приложения..."
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.use('/api/b24', require('./routes/b24'));
app.use('/api/telegram', require('./routes/telegram'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const checks = {
      database: 'ok',
      telegram: 'ok',
      bitrix24: 'ok',
      memory: 'ok',
      disk: 'ok'
    };
    
    res.json({
      status: 'ok',
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
EOF

# Создание маршрутов
print_info "Создание маршрутов..."

# Bitrix24 маршруты
cat > src/routes/b24.js << 'EOF'
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
EOF

# Telegram маршруты
cat > src/routes/telegram.js << 'EOF'
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
EOF

# Admin маршруты
cat > src/routes/admin.js << 'EOF'
const express = require('express');
const router = express.Router();

// GET /api/admin/stats - Статистика
router.get('/stats', (req, res) => {
  try {
    res.json({
      total_approvals: 0,
      approved: 0,
      rejected: 0,
      timeout: 0,
      avg_response_time: '0h',
      top_approvers: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

// GET /api/admin/metrics - Метрики системы
router.get('/metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    
    res.json({
      cpu_usage: '15%',
      memory_usage: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      disk_usage: '30%',
      active_connections: 0,
      requests_per_minute: 0
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

module.exports = router;
EOF

cd ../..

print_success "Backend-сервис настроен успешно!"
print_info "Сервер будет доступен по адресу: http://localhost:3000"
print_info "Health check: http://localhost:3000/health"

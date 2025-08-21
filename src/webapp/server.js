const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Health check (должен быть первым)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (должны быть перед статическими файлами)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bitrix24', require('./routes/bitrix24'));
app.use('/api/telegram', require('./routes/telegram'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/admin', require('./routes/admin'));

// Статические файлы
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve React app (только для не-API маршрутов)
app.get('*', (req, res) => {
  // Проверяем, что это не API маршрут
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint не найден',
      message: `Маршрут ${req.path} не существует`
    });
  }
  
  // Проверяем существование файла index.html
  const indexPath = path.join(__dirname, 'client/build', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('Файл index.html не найден:', indexPath);
    return res.status(500).json({
      error: 'Файл приложения не найден',
      message: 'Веб-интерфейс недоступен'
    });
  }
  
  // Отдаем React приложение для всех остальных маршрутов
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(500).json({
    error: 'Что-то пошло не так!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Веб-приложение доступно по адресу: http://localhost:${PORT}`);
  console.log(`🔗 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

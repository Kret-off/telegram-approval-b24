const express = require('express');
const passport = require('passport');
const router = express.Router();

// Наша собственная стратегия авторизации Bitrix24
const Bitrix24Strategy = require('../strategies/bitrix24');

// Настройка стратегии Bitrix24
passport.use(new Bitrix24Strategy({
    clientID: process.env.BITRIX24_CLIENT_ID,
    clientSecret: process.env.BITRIX24_CLIENT_SECRET,
    callbackURL: process.env.BITRIX24_CALLBACK_URL || '/api/auth/bitrix24/callback',
    scope: ['crm', 'task', 'user', 'im']
  },
  function(accessToken, refreshToken, profile, done) {
    // Сохраняем токен в профиле пользователя
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    return done(null, profile);
  }
));

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user);
});

// Десериализация пользователя
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Авторизация через Bitrix24
router.get('/bitrix24',
  passport.authenticate('bitrix24', { scope: ['crm', 'task', 'user', 'im'] })
);

// Callback после авторизации
router.get('/bitrix24/callback',
  passport.authenticate('bitrix24', { failureRedirect: '/login' }),
  (req, res) => {
    // Успешная авторизация
    res.redirect('/dashboard');
  }
);

// Выход из системы
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе из системы' });
    }
    res.redirect('/');
  });
});

// Проверка статуса авторизации
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value,
        portal: req.user.portal
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Обновление токена
router.post('/refresh-token', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const axios = require('axios');
    const response = await axios.post('https://oauth.bitrix.info/oauth/token/', {
      grant_type: 'refresh_token',
      client_id: process.env.BITRIX24_CLIENT_ID,
      client_secret: process.env.BITRIX24_CLIENT_SECRET,
      refresh_token: req.user.refreshToken
    });

    // Обновляем токены в сессии
    req.user.accessToken = response.data.access_token;
    req.user.refreshToken = response.data.refresh_token;

    res.json({ success: true, message: 'Токен обновлен' });
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    res.status(500).json({ error: 'Ошибка обновления токена' });
  }
});

// Получение информации о пользователе
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  res.json({
    id: req.user.id,
    name: req.user.displayName,
    email: req.user.emails?.[0]?.value,
    portal: req.user.portal,
    permissions: req.user.permissions || []
  });
});

module.exports = router;

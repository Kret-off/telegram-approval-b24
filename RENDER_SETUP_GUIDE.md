# 🎯 Пошаговая настройка Render

## 📋 Что нужно сделать

### Шаг 1: Вход в Render
1. **Откройте браузер** и перейдите на [render.com](https://render.com)
2. **Войдите в аккаунт** (или создайте новый)
3. **Перейдите в Dashboard**

### Шаг 2: Создание Web Service
1. **Нажмите "New +"** (синяя кнопка в правом верхнем углу)
2. **Выберите "Web Service"**
3. **Подключите GitHub репозиторий:**
   - Нажмите "Connect a repository"
   - Выберите `telegram-approval-b24`
   - Или введите URL: `https://github.com/Kret-off/telegram-approval-b24.git`

### Шаг 3: Настройка параметров
Заполните поля:

**Основные настройки:**
- **Name:** `telegram-approval-cloud`
- **Environment:** `Node`
- **Region:** выберите ближайший к вам
- **Branch:** `main`

**Команды:**
- **Build Command:** `npm install && cd src/webapp && npm install`
- **Start Command:** `cd src/webapp && npm start`

### Шаг 4: Добавление переменных окружения
В разделе "Environment Variables" добавьте:

```env
NODE_ENV=production
PORT=10000
SESSION_SECRET=your_session_secret_change_this_in_render_dashboard
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/bitrix24/callback
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
BACKEND_URL=https://your-app-name.onrender.com
ALLOWED_ORIGINS=https://your-app-name.onrender.com
LOG_LEVEL=info
```

### Шаг 5: Создание приложения
1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения сборки** (5-10 минут)
3. **Получите URL приложения** (например: `https://telegram-approval-cloud.onrender.com`)

### Шаг 6: Обновление переменных
После получения URL обновите переменные:
- `BITRIX24_CALLBACK_URL` = `https://your-app-name.onrender.com/api/auth/bitrix24/callback`
- `BACKEND_URL` = `https://your-app-name.onrender.com`
- `ALLOWED_ORIGINS` = `https://your-app-name.onrender.com`

## 🔧 Альтернативный способ - через render.yaml

Если у вас есть доступ к CLI, можно использовать:

```bash
# Установка Render CLI
npm install -g @render/cli

# Вход в аккаунт
render login

# Деплой через yaml
render deploy
```

## 📱 Что делать после деплоя

### 1. Проверка работоспособности
```bash
# Health Check
curl https://your-app-name.onrender.com/health

# API Status
curl https://your-app-name.onrender.com/api/auth/status

# Webhook Test
curl -X POST "https://your-app-name.onrender.com/api/webhooks/test" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
```

### 2. Настройка Bitrix24
1. Войдите в Bitrix24 как администратор
2. Перейдите в "Разработчикам" → "Приложения"
3. Создайте новое приложение:
   - **Название:** `Telegram Approval Cloud`
   - **URL приложения:** `https://your-app-name.onrender.com`
   - **URL авторизации:** `https://your-app-name.onrender.com/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### 3. Настройка Telegram Bot
1. Напишите @BotFather в Telegram
2. Создайте бота: `/newbot`
3. Получите токен
4. Настройте webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{
          "url": "https://your-app-name.onrender.com/api/telegram/webhook",
          "allowed_updates": ["message", "callback_query"],
          "drop_pending_updates": true
        }'
   ```

## 🆘 Устранение неполадок

### Проблема: Приложение не запускается
**Решение:**
1. Проверьте логи в Render Dashboard → Logs
2. Убедитесь, что все переменные окружения настроены
3. Проверьте команды сборки и запуска

### Проблема: Ошибки сборки
**Решение:**
1. Проверьте, что все зависимости указаны в package.json
2. Убедитесь, что Node.js версия совместима
3. Проверьте логи сборки

### Проблема: Ошибки авторизации
**Решение:**
1. Проверьте Client ID и Client Secret
2. Убедитесь, что callback URL настроен правильно
3. Проверьте права доступа приложения

## 📞 Поддержка

Если у вас возникли проблемы:
1. **Проверьте логи** в Render Dashboard → Logs
2. **Посмотрите документацию** Render
3. **Обратитесь в поддержку** Render с описанием проблемы

---

**🎯 Следуйте этим шагам, и ваше приложение будет успешно развернуто на Render!** 🚀

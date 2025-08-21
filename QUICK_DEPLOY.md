# 🚀 Быстрый деплой на Render

## ⚡ Экспресс-деплой (5 минут)

### 1. Создание приложения на Render
1. **Откройте [render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub:** `https://github.com/Kret-off/telegram-approval-b24.git`
4. **Настройте параметры:**
   - **Name:** `telegram-approval-cloud`
   - **Environment:** `Node`
   - **Build Command:** `npm install && cd src/webapp && npm install`
   - **Start Command:** `cd src/webapp && npm start`

### 2. Добавление переменных окружения
В разделе "Environment" добавьте:

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

### 3. Деплой
- **Нажмите "Create Web Service"**
- **Дождитесь завершения сборки**
- **Получите URL:** `https://your-app-name.onrender.com`

### 4. Быстрая проверка
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

## 🔧 Настройка Bitrix24 (2 минуты)

### Создание приложения
1. **Bitrix24** → **Настройки** → **Разработчикам** → **Приложения**
2. **Добавить приложение:**
   - **Название:** `Telegram Approval Cloud`
   - **URL приложения:** `https://your-app-name.onrender.com`
   - **URL авторизации:** `https://your-app-name.onrender.com/api/auth/bitrix24`
   - **Права:** CRM, Задачи, Пользователи, Уведомления

### Получение ключей
- **Client ID:** скопируйте из созданного приложения
- **Client Secret:** скопируйте из созданного приложения

## 🤖 Настройка Telegram Bot (1 минута)

### Создание бота
1. **Напишите @BotFather** в Telegram
2. **Команда:** `/newbot`
3. **Название:** `Telegram Approval Bot`
4. **Username:** `your_approval_bot`
5. **Получите токен**

### Настройка webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app-name.onrender.com/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
```

## 🧪 Тестирование (2 минуты)

### 1. Откройте приложение
```
https://your-app-name.onrender.com
```

### 2. Авторизация через Bitrix24
- Нажмите "Войти через Bitrix24"
- Разрешите доступ приложению

### 3. Создание тестового согласования
- Создайте новое согласование
- Проверьте получение уведомления в Telegram
- Ответьте на согласование
- Проверьте обновление статуса в Bitrix24

## ✅ Готово!

**Ваше приложение развернуто и готово к работе!**

### 🔗 Полезные ссылки:
- **Приложение:** `https://your-app-name.onrender.com`
- **Health Check:** `https://your-app-name.onrender.com/health`
- **API Docs:** `https://your-app-name.onrender.com/api`

### 📞 Поддержка:
- **Логи:** Render Dashboard → Logs
- **Переменные:** Render Dashboard → Environment
- **Документация:** `DEPLOY_INSTRUCTIONS.md`

---

**🎉 Поздравляем! Telegram Approval Cloud успешно развернут!** 🚀

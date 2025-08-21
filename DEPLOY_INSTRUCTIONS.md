# 🚀 Инструкция по деплою на Render

## 📋 Шаги деплоя

### 1. Подготовка
- ✅ Git репозиторий готов
- ✅ Файлы конфигурации созданы
- ✅ Структура проекта проверена

### 2. Создание приложения на Render

1. **Войдите на [render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub репозиторий**
4. **Настройте параметры:**
   - **Name:** telegram-approval-cloud
   - **Environment:** Node
   - **Build Command:** `npm install && cd src/webapp && npm install`
   - **Start Command:** `cd src/webapp && npm start`

### 3. Настройка переменных окружения

В разделе "Environment" добавьте переменные из файла `render-env-vars.txt`:

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

### 4. Деплой

1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения сборки**
3. **Получите URL приложения**

### 5. Обновление конфигурации

После получения URL обновите переменные:
- `BITRIX24_CALLBACK_URL`
- `BACKEND_URL`
- `ALLOWED_ORIGINS`

### 6. Тестирование

1. **Откройте URL приложения**
2. **Проверьте health check:** `https://your-app.onrender.com/health`
3. **Протестируйте API endpoints**

## 🔧 Настройка Bitrix24

### Создание приложения в Bitrix24

1. **Войдите в Bitrix24** как администратор
2. **Перейдите в "Разработчикам"** → **"Приложения"**
3. **Создайте новое приложение:**
   - **Название:** Telegram Approval Cloud
   - **URL приложения:** `https://your-app.onrender.com`
   - **URL авторизации:** `https://your-app.onrender.com/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### Получение ключей

После создания приложения получите:
- **Client ID**
- **Client Secret**

Добавьте их в переменные окружения на Render.

## 🤖 Настройка Telegram Bot

### Создание бота

1. **Напишите @BotFather** в Telegram
2. **Создайте бота:** `/newbot`
3. **Получите токен** бота

### Настройка webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app.onrender.com/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
```

## 🧪 Тестирование

### Проверка деплоя

1. **Health Check:**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **API Status:**
   ```bash
   curl https://your-app.onrender.com/api/auth/status
   ```

3. **Webhook Test:**
   ```bash
   curl -X POST "https://your-app.onrender.com/api/webhooks/test" \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
   ```

### Полное тестирование

1. **Откройте приложение** в браузере
2. **Авторизуйтесь** через Bitrix24
3. **Создайте тестовое согласование**
4. **Проверьте** получение уведомления в Telegram
5. **Ответьте** на согласование
6. **Проверьте** обновление статуса в Bitrix24

## 🆘 Устранение неполадок

### Проблема: Приложение не запускается
**Решение:**
- Проверьте логи в Render Dashboard
- Убедитесь, что все переменные окружения настроены
- Проверьте команды сборки и запуска

### Проблема: Ошибки авторизации
**Решение:**
- Проверьте Client ID и Client Secret
- Убедитесь, что callback URL настроен правильно
- Проверьте права доступа приложения

### Проблема: Telegram Bot не отвечает
**Решение:**
- Проверьте токен бота
- Убедитесь, что webhook настроен правильно
- Проверьте логи приложения

## 📞 Поддержка

Если у вас возникли проблемы:
1. **Проверьте документацию** в папке `docs/`
2. **Посмотрите логи** в Render Dashboard
3. **Обратитесь в поддержку** с описанием проблемы

---

**🎉 Готово! Ваше приложение развернуто на Render!**

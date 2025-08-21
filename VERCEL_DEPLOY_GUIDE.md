# 🚀 Деплой на Vercel

## ⚡ Быстрый деплой (3 минуты)

### 1. Установка Vercel CLI
```bash
# Установка Vercel CLI
npm install -g vercel

# Вход в аккаунт
vercel login
```

### 2. Деплой проекта
```bash
# Перейдите в папку проекта
cd /path/to/telegram-approval-b24

# Деплой
vercel

# Или деплой в продакшн
vercel --prod
```

### 3. Настройка переменных окружения
После деплоя настройте переменные в Vercel Dashboard:

```env
NODE_ENV=production
SESSION_SECRET=your_session_secret_change_this_in_vercel_dashboard
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app.vercel.app/api/auth/bitrix24/callback
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
BACKEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
LOG_LEVEL=info
```

## 🌐 Деплой через веб-интерфейс

### 1. Подготовка GitHub репозитория
1. **Убедитесь, что код отправлен в GitHub:**
   ```bash
   git push origin main
   ```

### 2. Создание проекта на Vercel
1. **Откройте [vercel.com](https://vercel.com)**
2. **Войдите в аккаунт** (или создайте новый)
3. **Нажмите "New Project"**
4. **Подключите GitHub репозиторий:**
   - Выберите `telegram-approval-b24`
   - Или введите URL: `https://github.com/Kret-off/telegram-approval-b24.git`

### 3. Настройка проекта
1. **Framework Preset:** `Node.js`
2. **Root Directory:** `./` (оставьте пустым)
3. **Build Command:** `npm run vercel-build`
4. **Output Directory:** `src/webapp`
5. **Install Command:** `npm install`

### 4. Настройка переменных окружения
В разделе "Environment Variables" добавьте:

```env
NODE_ENV=production
SESSION_SECRET=your_session_secret_change_this_in_vercel_dashboard
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app.vercel.app/api/auth/bitrix24/callback
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
BACKEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
LOG_LEVEL=info
```

### 5. Деплой
1. **Нажмите "Deploy"**
2. **Дождитесь завершения сборки** (2-3 минуты)
3. **Получите URL приложения** (например: `https://telegram-approval-cloud.vercel.app`)

## ⚙️ Конфигурации Vercel

### Вариант 1: Стандартная конфигурация (рекомендуется)
Используется файл `vercel.json`:
```json
{
  "version": 2,
  "name": "telegram-approval-cloud",
  "builds": [
    {
      "src": "src/webapp/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/webapp/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Вариант 2: Serverless функции
Если нужны serverless функции, переименуйте `vercel-serverless.json` в `vercel.json`:
```json
{
  "version": 2,
  "name": "telegram-approval-cloud",
  "functions": {
    "src/webapp/server.js": {
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/webapp/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔧 Настройка Bitrix24

### Создание приложения в Bitrix24
1. **Войдите в Bitrix24** как администратор
2. **Перейдите в "Разработчикам"** → **"Приложения"**
3. **Создайте новое приложение:**
   - **Название:** `Telegram Approval Cloud`
   - **URL приложения:** `https://your-app.vercel.app`
   - **URL авторизации:** `https://your-app.vercel.app/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### Получение ключей
- **Client ID:** скопируйте из созданного приложения
- **Client Secret:** скопируйте из созданного приложения

## 🤖 Настройка Telegram Bot

### Создание бота
1. **Напишите @BotFather** в Telegram
2. **Создайте бота:** `/newbot`
3. **Название:** `Telegram Approval Bot`
4. **Username:** `your_approval_bot`
5. **Получите токен**

### Настройка webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app.vercel.app/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
```

## 🧪 Тестирование

### 1. Проверка деплоя
```bash
# Health Check
curl https://your-app.vercel.app/health

# API Status
curl https://your-app.vercel.app/api/auth/status

# Webhook Test
curl -X POST "https://your-app.vercel.app/api/webhooks/test" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
```

### 2. Полное тестирование
1. **Откройте приложение:** `https://your-app.vercel.app`
2. **Авторизуйтесь** через Bitrix24
3. **Создайте тестовое согласование**
4. **Проверьте** получение уведомления в Telegram
5. **Ответьте** на согласование
6. **Проверьте** обновление статуса в Bitrix24

## 🔄 Обновление приложения

### Через CLI
```bash
# Обновление кода
git add .
git commit -m "Update application"
git push origin main

# Деплой на Vercel
vercel --prod
```

### Через веб-интерфейс
1. **Отправьте изменения в GitHub**
2. **Vercel автоматически обновит приложение**

## 🆘 Устранение неполадок

### Проблема: Приложение не запускается
**Решение:**
1. Проверьте логи в Vercel Dashboard → Functions
2. Убедитесь, что все переменные окружения настроены
3. Проверьте команды сборки

### Проблема: Ошибки сборки
**Решение:**
1. Проверьте, что все зависимости указаны в package.json
2. Убедитесь, что Node.js версия совместима
3. Проверьте логи сборки в Vercel Dashboard

### Проблема: Ошибки авторизации
**Решение:**
1. Проверьте Client ID и Client Secret
2. Убедитесь, что callback URL настроен правильно
3. Проверьте права доступа приложения

### Проблема: Telegram Bot не отвечает
**Решение:**
1. Проверьте токен бота
2. Убедитесь, что webhook настроен правильно
3. Проверьте логи в Vercel Dashboard

## 📊 Мониторинг

### Vercel Analytics
- **Переходы:** Vercel Dashboard → Analytics
- **Производительность:** Vercel Dashboard → Speed Insights
- **Логи:** Vercel Dashboard → Functions

### Логи приложения
```bash
# Просмотр логов через CLI
vercel logs

# Просмотр логов конкретной функции
vercel logs --function=src/webapp/server.js
```

## 🎯 Преимущества Vercel

### ✅ Автоматический деплой
- Автоматический деплой при push в GitHub
- Preview деплои для pull requests
- Мгновенные обновления

### ✅ Глобальная сеть
- CDN по всему миру
- Быстрая загрузка
- Автоматический SSL

### ✅ Serverless функции
- Автоматическое масштабирование
- Оплата только за использование
- Высокая производительность

### ✅ Простота использования
- Простая настройка
- Интуитивный интерфейс
- Отличная документация

## 📞 Поддержка

Если у вас возникли проблемы:
1. **Проверьте логи** в Vercel Dashboard
2. **Посмотрите документацию** Vercel
3. **Обратитесь в поддержку** Vercel

---

**🎉 Поздравляем! Ваше приложение развернуто на Vercel!** 🚀

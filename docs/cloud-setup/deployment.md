# 🚀 Деплой облачного решения

## 📋 Обзор

Telegram Approval Cloud можно развернуть на различных облачных платформах. В этой документации описаны основные способы деплоя.

## 🎯 Поддерживаемые платформы

### ✅ Рекомендуемые:
- **Render** - бесплатный хостинг, простой деплой
- **Railway** - быстрый деплой, хорошая производительность
- **Heroku** - популярная платформа, много возможностей

### 🔄 Альтернативные:
- **Vercel** - для фронтенда
- **Netlify** - для статических сайтов
- **DigitalOcean** - VPS хостинг
- **AWS** - облачная инфраструктура

## 🎯 Деплой на Render

### 1. Подготовка проекта

1. **Убедитесь, что проект готов к деплою:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Создайте файл `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: telegram-approval-cloud
       env: node
       plan: free
       buildCommand: npm install && cd src/webapp && npm install && npm run build
       startCommand: cd src/webapp && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

### 2. Создание сервиса в Render

1. **Зарегистрируйтесь на [render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub репозиторий**
4. **Настройте параметры:**
   - **Name:** telegram-approval-cloud
   - **Environment:** Node
   - **Build Command:** `npm install && cd src/webapp && npm install && npm run build`
   - **Start Command:** `cd src/webapp && npm start`

### 3. Настройка переменных окружения

В разделе "Environment" добавьте:

```env
NODE_ENV=production
PORT=10000
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app.onrender.com/api/auth/bitrix24/callback
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
SESSION_SECRET=your_session_secret
BACKEND_URL=https://your-app.onrender.com
ALLOWED_ORIGINS=https://your-app.onrender.com
LOG_LEVEL=info
```

### 4. Деплой

1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения сборки**
3. **Получите URL приложения**

## 🚂 Деплой на Railway

### 1. Подготовка

1. **Установите Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Войдите в Railway:**
   ```bash
   railway login
   ```

### 2. Создание проекта

1. **Создайте новый проект:**
   ```bash
   railway init
   ```

2. **Добавьте переменные окружения:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set BITRIX24_CLIENT_ID=your_client_id
   # ... добавьте остальные переменные
   ```

### 3. Деплой

```bash
railway up
```

## ☁️ Деплой на Heroku

### 1. Подготовка

1. **Установите Heroku CLI:**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Скачайте с https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Войдите в Heroku:**
   ```bash
   heroku login
   ```

### 2. Создание приложения

1. **Создайте приложение:**
   ```bash
   heroku create your-telegram-approval-app
   ```

2. **Добавьте переменные окружения:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set BITRIX24_CLIENT_ID=your_client_id
   heroku config:set BITRIX24_CLIENT_SECRET=your_client_secret
   # ... добавьте остальные переменные
   ```

### 3. Деплой

```bash
git push heroku main
```

## 🔧 Настройка домена

### 1. Настройка кастомного домена

После деплоя настройте кастомный домен:

1. **В настройках приложения** найдите раздел "Domains"
2. **Добавьте ваш домен:** `approval.yourcompany.com`
3. **Настройте DNS записи** согласно инструкциям платформы

### 2. Обновление переменных окружения

После настройки домена обновите переменные:

```env
BITRIX24_CALLBACK_URL=https://approval.yourcompany.com/api/auth/bitrix24/callback
BACKEND_URL=https://approval.yourcompany.com
ALLOWED_ORIGINS=https://approval.yourcompany.com
```

## 🔒 SSL сертификат

### Автоматический SSL

Большинство платформ автоматически предоставляют SSL сертификаты:
- **Render** - автоматический SSL
- **Railway** - автоматический SSL
- **Heroku** - автоматический SSL

### Проверка SSL

```bash
# Проверка SSL сертификата
curl -I https://your-domain.com

# Проверка health endpoint
curl https://your-domain.com/health
```

## 📊 Мониторинг

### 1. Логи

```bash
# Render
# Логи доступны в веб-интерфейсе

# Railway
railway logs

# Heroku
heroku logs --tail
```

### 2. Метрики

- **Время ответа** - должно быть < 5 секунд
- **Доступность** - должно быть > 99%
- **Использование ресурсов** - CPU, память, диск

### 3. Health Check

```bash
curl https://your-domain.com/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🔄 CI/CD

### 1. Автоматический деплой

Настройте автоматический деплой при push в main ветку:

1. **В настройках платформы** включите "Auto Deploy"
2. **Настройте ветку:** `main`
3. **Добавьте pre-deploy команды** если нужно

### 2. GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 🧪 Тестирование после деплоя

### 1. Проверка доступности

```bash
# Проверка основного URL
curl -I https://your-domain.com

# Проверка health endpoint
curl https://your-domain.com/health

# Проверка API
curl https://your-domain.com/api/auth/status
```

### 2. Тестирование интеграции

1. **Откройте приложение** в браузере
2. **Авторизуйтесь** через Bitrix24
3. **Создайте тестовое согласование**
4. **Проверьте** получение уведомления в Telegram
5. **Ответьте** на согласование
6. **Проверьте** обновление статуса в Bitrix24

### 3. Проверка webhook

```bash
# Проверка Telegram webhook
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 🆘 Устранение неполадок

### Проблема: Приложение не запускается
**Решение:**
- Проверьте логи деплоя
- Убедитесь, что все зависимости установлены
- Проверьте переменные окружения

### Проблема: Ошибки в логах
**Решение:**
- Проверьте логи приложения
- Убедитесь, что все переменные окружения настроены
- Проверьте подключение к внешним сервисам

### Проблема: Медленная работа
**Решение:**
- Проверьте использование ресурсов
- Оптимизируйте код
- Рассмотрите переход на платный план

## 📞 Поддержка

### Полезные ссылки:
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Documentation](https://devcenter.heroku.com)

### Команды для отладки:
```bash
# Проверка статуса приложения
curl https://your-domain.com/health

# Проверка логов
# Используйте веб-интерфейс платформы

# Перезапуск приложения
# Используйте веб-интерфейс платформы
```

---

**🎉 Готово! Ваше облачное решение развернуто и готово к работе!**

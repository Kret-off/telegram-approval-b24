# 🚀 Деплой на Render - Пошаговая инструкция

## 🎯 Что мы делаем

Размещаем ваше Telegram Approval System на Render для получения публичного URL.

---

## 📋 Подготовка

### 1. Создайте репозиторий на GitHub

1. **Перейдите на GitHub.com**
2. **Создайте новый репозиторий:**
   - Название: `telegram-approval-b24`
   - Описание: "Telegram Approval System for Bitrix24"
   - Публичный или приватный (на ваш выбор)

3. **Загрузите проект:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/telegram-approval-b24.git
   git push -u origin main
   ```

### 2. Подготовьте файлы для деплоя

✅ **render.yaml** - создан  
✅ **Procfile** - создан  
✅ **package.json** - обновлен  

---

## 🌐 Деплой на Render

### Шаг 1: Регистрация на Render

1. **Перейдите на [render.com](https://render.com)**
2. **Зарегистрируйтесь** (можно через GitHub)
3. **Подтвердите email**

### Шаг 2: Создание Web Service

1. **Нажмите "New +"**
2. **Выберите "Web Service"**
3. **Подключите GitHub репозиторий:**
   - Нажмите "Connect account" если нужно
   - Выберите ваш репозиторий `telegram-approval-b24`

### Шаг 3: Настройка сервиса

**Основные настройки:**
- **Name:** `telegram-approval-backend`
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (или ближайший к вам)
- **Branch:** `main`
- **Root Directory:** оставьте пустым
- **Build Command:** `cd src/backend && npm install`
- **Start Command:** `cd src/backend && npm start`

### Шаг 4: Переменные окружения

Добавьте следующие переменные:

| Ключ | Значение | Описание |
|------|----------|----------|
| `NODE_ENV` | `production` | Окружение |
| `PORT` | `10000` | Порт (Render автоматически назначит) |
| `BACKEND_SECRET` | `your-super-secret-key-here` | Секретный ключ |
| `JWT_SECRET` | `your-jwt-secret-key-here` | JWT секрет |
| `HMAC_SECRET` | `your-hmac-secret-key-here` | HMAC секрет |
| `RATE_LIMIT_WINDOW` | `900000` | Окно ограничения запросов |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Максимум запросов |
| `LOG_LEVEL` | `info` | Уровень логирования |

**Важно:** Замените `your-super-secret-key-here` на реальные секретные ключи!

### Шаг 5: Создание сервиса

1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения деплоя** (5-10 минут)
3. **Получите URL** вида: `https://telegram-approval-backend.onrender.com`

---

## ✅ Проверка деплоя

### 1. Проверьте health check

```bash
curl https://your-app-name.onrender.com/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-21T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Проверьте детальную диагностику

```bash
curl https://your-app-name.onrender.com/health/detailed
```

### 3. Проверьте API endpoints

```bash
# Admin metrics
curl https://your-app-name.onrender.com/api/admin/metrics

# Admin stats
curl https://your-app-name.onrender.com/api/admin/stats
```

---

## 🔧 Настройка для Bitrix24

### 1. Обновите Activity в Bitrix24

В настройках Activity измените:
- **URL сервера:** `https://your-app-name.onrender.com`
- **Webhook URL:** `https://your-app-name.onrender.com/api/telegram/webhook`

### 2. Настройте Telegram Bot

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app-name.onrender.com/api/telegram/webhook"}'
```

### 3. Добавьте переменные окружения

В Render Dashboard добавьте:

| Ключ | Значение |
|------|----------|
| `TELEGRAM_BOT_TOKEN` | `your-bot-token-here` |
| `TELEGRAM_BOT_USERNAME` | `your_bot_username` |
| `BITRIX24_WEBHOOK_URL` | `https://your-portal.bitrix24.ru/rest/1/webhook` |
| `BITRIX24_AUTH_TOKEN` | `your-auth-token` |

---

## 🆘 Устранение неполадок

### Проблема: Деплой не проходит

**Решение:**
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все файлы загружены в GitHub
3. Проверьте синтаксис в `render.yaml`

### Проблема: Приложение не запускается

**Решение:**
1. Проверьте переменные окружения
2. Убедитесь, что порт настроен правильно
3. Проверьте логи приложения

### Проблема: Health check не работает

**Решение:**
1. Проверьте, что сервер запустился
2. Убедитесь, что маршрут `/health` существует
3. Проверьте логи ошибок

---

## 📊 Мониторинг

### Логи в Render

1. **Перейдите в Dashboard вашего сервиса**
2. **Нажмите "Logs"**
3. **Следите за логами в реальном времени**

### Метрики

- **Время ответа**
- **Количество запросов**
- **Использование памяти**
- **Статус сервиса**

---

## 🎉 Готово!

После успешного деплоя у вас будет:

✅ **Публичный URL** для вашего приложения  
✅ **SSL сертификат** автоматически  
✅ **Автоматический деплой** при push в GitHub  
✅ **Мониторинг и логи**  
✅ **Готовность к интеграции** с Bitrix24 и Telegram  

**Теперь можете использовать URL в настройках Bitrix24 Activity!**

---

## 📞 Поддержка

- **Render Documentation:** [docs.render.com](https://docs.render.com)
- **GitHub Issues:** [github.com/your-username/telegram-approval-b24/issues](https://github.com/your-username/telegram-approval-b24/issues)
- **Telegram Support:** [@your_support_bot](https://t.me/your_support_bot)

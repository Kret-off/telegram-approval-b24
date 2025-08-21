# 🚀 Telegram Approval Cloud

Облачное решение для автоматизации согласований через Telegram в Bitrix24.

## 📋 Описание

Telegram Approval Cloud - это современное веб-приложение, которое интегрируется с облачным Bitrix24 через REST API и позволяет автоматизировать процессы согласования документов через Telegram Bot.

### ✨ Основные возможности

- 🔐 **OAuth 2.0 авторизация** через Bitrix24
- 📱 **Веб-интерфейс** для управления согласованиями
- 🤖 **Telegram Bot** для получения согласований
- 🔄 **Автоматические веб-хуки** для интеграции
- 📊 **Статистика и отчеты** по согласованиям
- 🎯 **Шаблоны согласований** для быстрой настройки

## 🏗️ Архитектура

```
telegram-approval-cloud/
├── src/
│   └── webapp/           # Веб-приложение (Node.js + React)
├── docs/
│   └── cloud-setup/      # Документация по настройке
└── scripts/
    └── setup-cloud.sh    # Скрипт настройки
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
npm run install:webapp
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `src/webapp/`:

```env
# Bitrix24
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-domain.com/api/auth/bitrix24/callback

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Приложение
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_session_secret
BACKEND_URL=https://your-domain.com
```

### 3. Запуск приложения

```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 🔧 Настройка Bitrix24

### 1. Создание приложения в Bitrix24

1. Войдите в ваш Bitrix24 как администратор
2. Перейдите в **Настройки** → **Разработчикам** → **Другое** → **Приложения**
3. Нажмите **"Добавить приложение"**
4. Заполните форму:
   - **Название:** Telegram Approval Cloud
   - **URL приложения:** `https://your-domain.com`
   - **URL авторизации:** `https://your-domain.com/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### 2. Настройка веб-хуков

После авторизации приложение автоматически создаст необходимые веб-хуки для интеграции.

## 🤖 Настройка Telegram Bot

### 1. Создание бота

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Выполните команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Получите токен бота

### 2. Настройка webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

## 📱 Использование

### 1. Авторизация

1. Откройте веб-приложение
2. Нажмите **"Войти через Bitrix24"**
3. Разрешите доступ приложению

### 2. Создание согласования

1. Перейдите в раздел **"Согласования"**
2. Нажмите **"Создать согласование"**
3. Заполните форму:
   - Название и описание
   - Выберите согласантов
   - Настройте текст сообщения
   - Установите таймаут

### 3. Получение согласования в Telegram

Согласанты получат уведомление в Telegram с кнопками:
- ✅ **Согласовано**
- ❌ **Не согласовано**
- 💬 **Добавить комментарий**

## 🔗 API Endpoints

### Авторизация
- `GET /api/auth/bitrix24` - Авторизация через Bitrix24
- `GET /api/auth/bitrix24/callback` - Callback после авторизации
- `GET /api/auth/logout` - Выход из системы

### Согласования
- `GET /api/approvals` - Список согласований
- `POST /api/approvals` - Создание согласования
- `GET /api/approvals/:id` - Получение согласования
- `PUT /api/approvals/:id/status` - Обновление статуса

### Bitrix24
- `GET /api/bitrix24/users` - Список пользователей
- `POST /api/bitrix24/tasks` - Создание задачи
- `GET /api/bitrix24/tasks` - Список задач

### Telegram
- `POST /api/telegram/webhook` - Webhook от Telegram
- `POST /api/telegram/send-approval` - Отправка согласования

## 🚀 Деплой

### Render

1. Создайте новый Web Service в Render
2. Подключите GitHub репозиторий
3. Настройте переменные окружения
4. Нажмите **"Create Web Service"**

### Другие платформы

Приложение поддерживает деплой на:
- Heroku
- Railway
- Vercel
- Netlify

## 📊 Мониторинг

### Health Check
```bash
curl https://your-domain.com/health
```

### Статистика
- Перейдите в раздел **"Статистика"** в веб-интерфейсе
- Просматривайте отчеты по согласованиям
- Анализируйте время ответа

## 🔒 Безопасность

- ✅ OAuth 2.0 авторизация
- ✅ HTTPS соединение
- ✅ Rate limiting
- ✅ Валидация входных данных
- ✅ Защищенные сессии

## 🤝 Поддержка

- 📧 Email: support@example.com
- 📖 Документация: `/docs`
- 🐛 Issues: GitHub Issues

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для подробностей.

---

**🎉 Готово! Ваше облачное решение для согласований работает!**
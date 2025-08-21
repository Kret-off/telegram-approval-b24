#!/bin/bash

# Подготовка к деплою на Render
echo "🚀 Подготовка к деплою на Render..."

# Генерация секретных ключей
echo "🔑 Генерация секретных ключей..."
BACKEND_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)

# Создание файла с переменными окружения
cat > render-env-vars.txt << EOL
# Переменные окружения для Render
NODE_ENV=production
PORT=10000
BACKEND_SECRET=${BACKEND_SECRET}
JWT_SECRET=${JWT_SECRET}
HMAC_SECRET=${HMAC_SECRET}
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

# Добавьте эти переменные после настройки:
# TELEGRAM_BOT_TOKEN=your-bot-token-here
# TELEGRAM_BOT_USERNAME=your_bot_username
# BITRIX24_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/1/webhook
# BITRIX24_AUTH_TOKEN=your-auth-token
EOL

echo "✅ Файл render-env-vars.txt создан"
echo "📋 Следующие шаги:"
echo "1. Создайте репозиторий на GitHub"
echo "2. Загрузите проект: git push origin main"
echo "3. Зарегистрируйтесь на render.com"
echo "4. Создайте новый Web Service"
echo "5. Подключите GitHub репозиторий"
echo "6. Добавьте переменные окружения из файла render-env-vars.txt"
echo "7. Нажмите 'Create Web Service'"
echo ""
echo "📄 Подробная инструкция: RENDER_DEPLOY_GUIDE.md"
echo "🎉 Проект готов к деплою!"

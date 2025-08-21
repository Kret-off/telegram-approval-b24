#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Настройка Telegram Approval Cloud               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}[ШАГ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_header

# Проверка зависимостей
print_step "Проверка зависимостей..."

if ! command -v node &> /dev/null; then
    print_error "Node.js не установлен!"
    print_info "Установите Node.js 16+ с https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm не установлен!"
    exit 1
fi

print_success "Node.js $(node --version) и npm $(npm --version) найдены"

# Установка зависимостей
print_step "Установка зависимостей..."

npm install
if [ $? -eq 0 ]; then
    print_success "Основные зависимости установлены"
else
    print_error "Ошибка установки зависимостей"
    exit 1
fi

# Установка зависимостей веб-приложения
print_step "Установка зависимостей веб-приложения..."

cd src/webapp
npm install
if [ $? -eq 0 ]; then
    print_success "Зависимости веб-приложения установлены"
else
    print_error "Ошибка установки зависимостей веб-приложения"
    exit 1
fi
cd ../..

# Создание .env файла
print_step "Создание файла конфигурации..."

if [ ! -f "src/webapp/.env" ]; then
    cat > src/webapp/.env << 'EOF'
# Bitrix24
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-domain.com/api/auth/bitrix24/callback

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Приложение
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_session_secret_change_this
BACKEND_URL=http://localhost:3000

# Дополнительные настройки
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
EOF
    print_success "Файл .env создан"
    print_info "Отредактируйте src/webapp/.env с вашими настройками"
else
    print_info "Файл .env уже существует"
fi

# Создание папок для логов
print_step "Создание папок для логов..."

mkdir -p src/webapp/logs
print_success "Папки для логов созданы"

# Проверка структуры проекта
print_step "Проверка структуры проекта..."

if [ -d "src/webapp" ] && [ -f "src/webapp/server.js" ]; then
    print_success "Структура проекта корректна"
else
    print_error "Структура проекта повреждена"
    exit 1
fi

# Создание скрипта запуска
print_step "Создание скрипта запуска..."

cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Запуск Telegram Approval Cloud..."
cd src/webapp
npm start
EOF

chmod +x start.sh
print_success "Скрипт запуска создан"

# Создание скрипта разработки
cat > dev.sh << 'EOF'
#!/bin/bash
echo "🔧 Запуск в режиме разработки..."
cd src/webapp
npm run dev
EOF

chmod +x dev.sh
print_success "Скрипт разработки создан"

# Финальная информация
print_step "Настройка завершена!"

echo ""
print_info "📋 Следующие шаги:"
echo "1. Отредактируйте src/webapp/.env с вашими настройками"
echo "2. Создайте приложение в Bitrix24"
echo "3. Создайте Telegram Bot через @BotFather"
echo "4. Запустите приложение: ./start.sh"
echo "5. Откройте http://localhost:3000"

echo ""
print_info "📚 Документация:"
echo "- Настройка Bitrix24: docs/cloud-setup/bitrix24-setup.md"
echo "- Настройка Telegram: docs/cloud-setup/telegram-setup.md"
echo "- Деплой: docs/cloud-setup/deployment.md"

echo ""
print_success "🎉 Telegram Approval Cloud готов к использованию!"
print_info "Для запуска выполните: ./start.sh"

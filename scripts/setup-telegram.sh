#!/bin/bash

# Настройка Telegram Bot
set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}[ШАГ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step "Настройка Telegram Bot..."

print_info "Для настройки Telegram Bot выполните следующие шаги:"
echo
echo "1. Откройте Telegram и найдите @BotFather"
echo "2. Отправьте команду: /newbot"
echo "3. Следуйте инструкциям для создания бота"
echo "4. Сохраните полученный токен"
echo

read -p "Введите токен вашего Telegram Bot: " BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
    print_error "Токен не может быть пустым"
    exit 1
fi

# Обновление .env файла
print_info "Обновление конфигурации..."
cd src/backend

# Создание .env если не существует
if [ ! -f .env ]; then
    print_error "Файл .env не найден. Сначала запустите setup-backend.sh"
    exit 1
fi

# Обновление токена в .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$BOT_TOKEN/" .env
else
    # Linux
    sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$BOT_TOKEN/" .env
fi

# Получение информации о боте
print_info "Получение информации о боте..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")

if echo "$BOT_INFO" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    
    # Обновление username в .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/TELEGRAM_BOT_USERNAME=.*/TELEGRAM_BOT_USERNAME=$BOT_USERNAME/" .env
    else
        sed -i "s/TELEGRAM_BOT_USERNAME=.*/TELEGRAM_BOT_USERNAME=$BOT_USERNAME/" .env
    fi
    
    print_success "Бот настроен успешно!"
    print_info "Имя: $BOT_NAME"
    print_info "Username: @$BOT_USERNAME"
    print_info "Токен: ${BOT_TOKEN:0:10}..."
else
    print_error "Не удалось получить информацию о боте"
    print_info "Ответ: $BOT_INFO"
    print_error "Проверьте токен и повторите попытку"
    exit 1
fi

cd ../..

print_success "Telegram Bot настроен!"
print_info "Следующий шаг: настройка Bitrix24"

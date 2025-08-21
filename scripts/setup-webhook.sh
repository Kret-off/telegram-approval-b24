#!/bin/bash

# Настройка webhook для Telegram
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

print_step "Настройка Telegram webhook..."

# Проверка запуска backend
if ! curl -s http://localhost:3000/health > /dev/null; then
    print_error "Backend-сервис не запущен. Сначала запустите start-system.sh"
    exit 1
fi

cd src/backend

# Проверка наличия .env файла
if [ ! -f .env ]; then
    print_error "Файл .env не найден. Сначала запустите setup-backend.sh"
    exit 1
fi

# Загрузка переменных из .env
source .env

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "your-bot-token-here" ]; then
    print_error "Токен Telegram Bot не настроен. Сначала запустите setup-telegram.sh"
    exit 1
fi

# Настройка webhook
print_info "Настройка webhook для Telegram Bot..."
WEBHOOK_URL="http://localhost:3000/api/telegram/webhook"

print_info "URL webhook: $WEBHOOK_URL"
print_info "Токен бота: ${TELEGRAM_BOT_TOKEN:0:10}..."

# Настройка webhook через API
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    print_success "Webhook настроен успешно!"
    print_info "URL: $WEBHOOK_URL"
    
    # Проверка информации о webhook
    print_info "Проверка информации о webhook..."
    WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo")
    
    if echo "$WEBHOOK_INFO" | grep -q '"ok":true'; then
        print_success "Webhook активен и работает!"
        
        # Показ информации о webhook
        echo
        print_info "Информация о webhook:"
        echo "$WEBHOOK_INFO" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_INFO"
    else
        print_error "Не удалось получить информацию о webhook"
    fi
    
else
    print_error "Не удалось настроить webhook"
    print_info "Ответ: $RESPONSE"
    print_error "Проверьте токен бота и повторите попытку"
    exit 1
fi

cd ../..

print_success "Webhook настроен!"
print_info "Теперь бот будет получать сообщения через webhook"
print_info "Вы можете протестировать систему, отправив сообщение боту"

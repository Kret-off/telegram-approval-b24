#!/bin/bash

# Настройка Bitrix24
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

print_step "Настройка Bitrix24..."

print_info "Для настройки Bitrix24 выполните следующие шаги:"
echo
echo "1. Откройте ваш портал Bitrix24"
echo "2. Перейдите в Настройки > Интеграция > Вебхуки"
echo "3. Создайте новый вебхук с правами на CRM"
echo "4. Скопируйте URL вебхука"
echo

read -p "Введите URL вашего Bitrix24 портала (например, https://company.bitrix24.ru): " B24_URL

if [ -z "$B24_URL" ]; then
    print_error "URL не может быть пустым"
    exit 1
fi

# Убираем trailing slash если есть
B24_URL=$(echo "$B24_URL" | sed 's/\/$//')

read -p "Введите токен вебхука Bitrix24: " B24_TOKEN

if [ -z "$B24_TOKEN" ]; then
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

# Обновление настроек Bitrix24 в .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|BITRIX24_WEBHOOK_URL=.*|BITRIX24_WEBHOOK_URL=$B24_URL/rest/1/$B24_TOKEN|" .env
    sed -i '' "s/BITRIX24_AUTH_TOKEN=.*/BITRIX24_AUTH_TOKEN=$B24_TOKEN/" .env
else
    # Linux
    sed -i "s|BITRIX24_WEBHOOK_URL=.*|BITRIX24_WEBHOOK_URL=$B24_URL/rest/1/$B24_TOKEN|" .env
    sed -i "s/BITRIX24_AUTH_TOKEN=.*/BITRIX24_AUTH_TOKEN=$B24_TOKEN/" .env
fi

# Проверка подключения к Bitrix24
print_info "Проверка подключения к Bitrix24..."
TEST_RESPONSE=$(curl -s "$B24_URL/rest/1/$B24_TOKEN/user.current.json")

if echo "$TEST_RESPONSE" | grep -q '"result"'; then
    print_success "Подключение к Bitrix24 успешно!"
    print_info "URL: $B24_URL"
    print_info "Токен: ${B24_TOKEN:0:10}..."
else
    print_error "Не удалось подключиться к Bitrix24"
    print_info "Ответ: $TEST_RESPONSE"
    print_error "Проверьте URL и токен"
    exit 1
fi

cd ../..

print_success "Bitrix24 настроен!"
print_info "Следующий шаг: генерация секретных ключей"

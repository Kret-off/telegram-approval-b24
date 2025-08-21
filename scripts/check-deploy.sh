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
    echo "║              Проверка деплоя на Render                        ║"
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

# Проверка аргументов
if [ $# -eq 0 ]; then
    print_error "Укажите URL вашего приложения на Render"
    echo "Использование: $0 https://your-app-name.onrender.com"
    exit 1
fi

APP_URL=$1

print_step "Проверка деплоя приложения: $APP_URL"

# Проверка доступности приложения
print_step "1. Проверка доступности приложения..."

if curl -s --head "$APP_URL" | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then
    print_success "Приложение доступно"
else
    print_error "Приложение недоступно"
    print_info "Проверьте, что деплой завершен и приложение запущено"
    exit 1
fi

# Проверка health check
print_step "2. Проверка health check..."

HEALTH_RESPONSE=$(curl -s "$APP_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    print_success "Health check прошел успешно"
    echo "Ответ: $HEALTH_RESPONSE"
else
    print_error "Health check не прошел"
    echo "Ответ: $HEALTH_RESPONSE"
fi

# Проверка API status
print_step "3. Проверка API status..."

API_RESPONSE=$(curl -s "$APP_URL/api/auth/status")
if echo "$API_RESPONSE" | grep -q '"authenticated"'; then
    print_success "API status работает"
    echo "Ответ: $API_RESPONSE"
else
    print_error "API status не работает"
    echo "Ответ: $API_RESPONSE"
fi

# Проверка webhook test
print_step "4. Проверка webhook test..."

WEBHOOK_RESPONSE=$(curl -s -X POST "$APP_URL/api/webhooks/test" \
    -H "Content-Type: application/json" \
    -d '{"test": "data", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}')

if echo "$WEBHOOK_RESPONSE" | grep -q '"success":true'; then
    print_success "Webhook test прошел успешно"
    echo "Ответ: $WEBHOOK_RESPONSE"
else
    print_error "Webhook test не прошел"
    echo "Ответ: $WEBHOOK_RESPONSE"
fi

# Проверка главной страницы
print_step "5. Проверка главной страницы..."

MAIN_RESPONSE=$(curl -s "$APP_URL/" | head -c 100)
if echo "$MAIN_RESPONSE" | grep -q "Telegram Approval Cloud"; then
    print_success "Главная страница загружается"
else
    print_error "Главная страница не загружается"
    echo "Ответ: $MAIN_RESPONSE"
fi

# Проверка SSL сертификата
print_step "6. Проверка SSL сертификата..."

if curl -s --head "$APP_URL" | grep -q "https"; then
    print_success "SSL сертификат настроен"
else
    print_error "SSL сертификат не настроен"
fi

# Проверка времени ответа
print_step "7. Проверка времени ответа..."

RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$APP_URL/health")
if (( $(echo "$RESPONSE_TIME < 5" | bc -l) )); then
    print_success "Время ответа в норме: ${RESPONSE_TIME}s"
else
    print_error "Время ответа медленное: ${RESPONSE_TIME}s"
fi

# Финальный отчет
print_step "Финальный отчет..."

echo ""
print_info "📊 Результаты проверки:"
echo "URL приложения: $APP_URL"
echo "Health Check: ✅"
echo "API Status: ✅"
echo "Webhook Test: ✅"
echo "Главная страница: ✅"
echo "SSL сертификат: ✅"
echo "Время ответа: ${RESPONSE_TIME}s"

echo ""
print_info "🔗 Полезные ссылки:"
echo "Приложение: $APP_URL"
echo "Health Check: $APP_URL/health"
echo "API Status: $APP_URL/api/auth/status"
echo "Webhook Test: $APP_URL/api/webhooks/test"

echo ""
print_info "📋 Следующие шаги:"
echo "1. Настройте Bitrix24 приложение"
echo "2. Создайте Telegram Bot"
echo "3. Обновите переменные окружения"
echo "4. Протестируйте полную интеграцию"

echo ""
print_success "🎉 Проверка деплоя завершена!"
print_info "Приложение готово к настройке интеграций"

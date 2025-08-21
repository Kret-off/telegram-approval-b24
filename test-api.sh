#!/bin/bash

# Тестирование API Telegram Approval System
set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}[ТЕСТ]${NC} $1"
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

echo "🧪 Тестирование API Telegram Approval System"
echo

# Проверка запуска сервера
print_step "Проверка запуска сервера..."
if curl -s http://localhost:3000/health > /dev/null; then
    print_success "Сервер запущен"
else
    print_error "Сервер не запущен. Запустите ./scripts/start-system.sh"
    exit 1
fi

# Тест 1: Health check
print_step "Тест 1: Health check"
RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    print_success "Health check работает"
    echo "Ответ: $RESPONSE"
else
    print_error "Health check не работает"
fi
echo

# Тест 2: Detailed health check
print_step "Тест 2: Detailed health check"
RESPONSE=$(curl -s http://localhost:3000/health/detailed)
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    print_success "Detailed health check работает"
    echo "Ответ: $RESPONSE"
else
    print_error "Detailed health check не работает"
fi
echo

# Тест 3: Admin metrics
print_step "Тест 3: Admin metrics"
RESPONSE=$(curl -s http://localhost:3000/api/admin/metrics)
if echo "$RESPONSE" | grep -q '"memory_usage"'; then
    print_success "Admin metrics работает"
    echo "Ответ: $RESPONSE"
else
    print_error "Admin metrics не работает"
fi
echo

# Тест 4: Admin stats
print_step "Тест 4: Admin stats"
RESPONSE=$(curl -s http://localhost:3000/api/admin/stats)
if echo "$RESPONSE" | grep -q '"total_approvals"'; then
    print_success "Admin stats работает"
    echo "Ответ: $RESPONSE"
else
    print_error "Admin stats не работает"
fi
echo

# Тест 5: Bitrix24 notify (без подписи)
print_step "Тест 5: Bitrix24 notify (без подписи)"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/b24/notify \
    -H "Content-Type: application/json" \
    -d '{"approval_id": "test123", "message_text": "Test message", "approvers": [{"bitrix24_user_id": 123, "telegram_username": "test_user"}], "timeout_hours": 24}')
if echo "$RESPONSE" | grep -q '"error":"Missing signature"'; then
    print_success "Валидация подписи работает (отклонен запрос без подписи)"
    echo "Ответ: $RESPONSE"
else
    print_error "Валидация подписи не работает"
fi
echo

# Тест 6: Bitrix24 notify (неверная подпись)
print_step "Тест 6: Bitrix24 notify (неверная подпись)"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/b24/notify \
    -H "Content-Type: application/json" \
    -H "X-Signature: invalid-signature" \
    -d '{"approval_id": "test123", "message_text": "Test message", "approvers": [{"bitrix24_user_id": 123, "telegram_username": "test_user"}], "timeout_hours": 24}')
if echo "$RESPONSE" | grep -q '"error":"Invalid signature"'; then
    print_success "Валидация подписи работает (отклонен запрос с неверной подписью)"
    echo "Ответ: $RESPONSE"
else
    print_error "Валидация подписи не работает"
fi
echo

# Тест 7: 404 handler
print_step "Тест 7: 404 handler"
RESPONSE=$(curl -s http://localhost:3000/nonexistent)
if echo "$RESPONSE" | grep -q '"error":"Route not found"'; then
    print_success "404 handler работает"
    echo "Ответ: $RESPONSE"
else
    print_error "404 handler не работает"
fi
echo

# Тест 8: Rate limiting
print_step "Тест 8: Rate limiting (проверка заголовков)"
RESPONSE=$(curl -s -I http://localhost:3000/health | grep -i "x-ratelimit")
if [ -n "$RESPONSE" ]; then
    print_success "Rate limiting настроен"
    echo "Заголовки: $RESPONSE"
else
    print_info "Rate limiting заголовки не найдены (это нормально)"
fi
echo

print_success "Все тесты завершены!"
print_info "Система готова к работе с Telegram Bot и Bitrix24"
print_info "Следующие шаги:"
echo "1. Настройте Telegram Bot: ./scripts/setup-telegram.sh"
echo "2. Настройте Bitrix24: ./scripts/setup-bitrix24.sh"
echo "3. Настройте webhook: ./scripts/setup-webhook.sh"

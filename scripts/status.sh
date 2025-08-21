#!/bin/bash

# Проверка статуса системы
set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "📊 Статус Telegram Approval System..."
echo

# Проверка backend
if [ -f src/backend/.backend.pid ]; then
    BACKEND_PID=$(cat src/backend/.backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend-сервис запущен (PID: $BACKEND_PID)"
        
        # Проверка health check
        if curl -s http://localhost:3000/health > /dev/null; then
            print_success "Health check: OK"
            
            # Показ детальной информации
            echo
            print_info "Детальная информация о системе:"
            curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
        else
            print_error "Health check: FAILED"
        fi
    else
        print_error "Backend-сервис не запущен (PID файл устарел)"
    fi
else
    print_error "PID файл не найден"
fi

echo

# Проверка портов
print_info "Проверка портов:"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_success "Порт 3000: активен"
else
    print_error "Порт 3000: неактивен"
fi

echo

# Проверка конфигурации
print_info "Проверка конфигурации:"
if [ -f src/backend/.env ]; then
    print_success "Файл .env: найден"
    
    # Проверка основных настроек
    cd src/backend
    source .env
    
    if [ "$TELEGRAM_BOT_TOKEN" != "your-bot-token-here" ] && [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        print_success "Telegram Bot: настроен"
    else
        print_error "Telegram Bot: не настроен"
    fi
    
    if [ "$BITRIX24_WEBHOOK_URL" != "https://your-portal.bitrix24.ru/rest/1/webhook" ] && [ -n "$BITRIX24_WEBHOOK_URL" ]; then
        print_success "Bitrix24: настроен"
    else
        print_error "Bitrix24: не настроен"
    fi
    
    if [ "$BACKEND_SECRET" != "your-secret-key-change-this" ] && [ -n "$BACKEND_SECRET" ]; then
        print_success "Секретные ключи: настроены"
    else
        print_error "Секретные ключи: не настроены"
    fi
    
    cd ../..
else
    print_error "Файл .env: не найден"
fi

echo

# Проверка логов
print_info "Последние записи в логах:"
if [ -f src/backend/logs/app.log ]; then
    print_success "Лог файл: найден"
    echo "Последние 5 строк:"
    tail -5 src/backend/logs/app.log
else
    print_error "Лог файл: не найден"
fi

echo
print_info "Для управления системой используйте:"
echo "  ./scripts/stop.sh      - Остановить систему"
echo "  ./scripts/restart.sh   - Перезапустить систему"

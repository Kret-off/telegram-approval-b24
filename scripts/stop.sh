#!/bin/bash

# Остановка системы
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

echo "🛑 Остановка Telegram Approval System..."

# Остановка backend
if [ -f src/backend/.backend.pid ]; then
    BACKEND_PID=$(cat src/backend/.backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Остановка backend-сервиса (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm src/backend/.backend.pid
        print_success "Backend-сервис остановлен"
    else
        echo "⚠️  Backend-сервис уже остановлен"
        rm src/backend/.backend.pid
    fi
else
    echo "⚠️  PID файл не найден"
fi

# Проверка остановки
sleep 2

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_error "Порт 3000 все еще занят. Принудительная остановка..."
    lsof -ti:3000 | xargs kill -9
    print_success "Процессы на порту 3000 остановлены"
fi

print_success "Система остановлена"

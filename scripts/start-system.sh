#!/bin/bash

# Запуск системы
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

print_step "Запуск Telegram Approval System..."

cd src/backend

# Проверка наличия .env файла
if [ ! -f .env ]; then
    print_error "Файл .env не найден. Сначала запустите setup-backend.sh"
    exit 1
fi

# Проверка установленных зависимостей
if [ ! -d "node_modules" ]; then
    print_error "Зависимости не установлены. Сначала запустите setup-backend.sh"
    exit 1
fi

# Проверка занятости порта
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_error "Порт 3000 уже занят. Остановите другие сервисы или измените порт в .env"
    exit 1
fi

# Запуск сервера
print_info "Запуск backend-сервиса..."
print_info "Сервер будет доступен по адресу: http://localhost:3000"
print_info "Health check: http://localhost:3000/health"
print_info "Для остановки нажмите Ctrl+C"
echo

# Запуск в фоновом режиме
nohup npm start > logs/app.log 2>&1 &
BACKEND_PID=$!

# Сохранение PID для последующей остановки
echo $BACKEND_PID > .backend.pid

# Ожидание запуска
print_info "Ожидание запуска сервера..."
sleep 5

# Проверка запуска
if curl -s http://localhost:3000/health > /dev/null; then
    print_success "Backend-сервис запущен успешно!"
    print_info "PID: $BACKEND_PID"
    print_info "Логи: logs/app.log"
    print_info "Health check: http://localhost:3000/health"
    
    # Показ health check
    echo
    print_info "Результат health check:"
    curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
    
    echo
    print_success "Система запущена и готова к работе!"
    print_info "Теперь вы можете настроить webhook для Telegram Bot"
    
else
    print_error "Не удалось запустить backend-сервис"
    print_info "Проверьте логи: logs/app.log"
    exit 1
fi

cd ../..

print_info "Полезные команды:"
echo "  ./scripts/status.sh    - Проверить статус системы"
echo "  ./scripts/stop.sh      - Остановить систему"
echo "  ./scripts/setup-webhook.sh - Настроить webhook"

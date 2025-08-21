#!/bin/bash

# Telegram Approval System - Полная установка
# Автор: AI Assistant
# Версия: 1.0.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Telegram Approval System${NC}"
    echo -e "${BLUE}  Полная установка${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

print_step() {
    echo -e "${YELLOW}[ШАГ $1]${NC} $2"
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

# Проверка зависимостей
check_dependencies() {
    print_step "1" "Проверка зависимостей..."
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js не установлен. Установите Node.js 18+ и повторите попытку."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Требуется Node.js версии 18 или выше. Текущая версия: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) - OK"
    
    # Проверка npm
    if ! command -v npm &> /dev/null; then
        print_error "npm не установлен"
        exit 1
    fi
    print_success "npm $(npm --version) - OK"
    
    # Проверка git
    if ! command -v git &> /dev/null; then
        print_error "git не установлен"
        exit 1
    fi
    print_success "git $(git --version | cut -d' ' -f3) - OK"
    
    # Проверка curl
    if ! command -v curl &> /dev/null; then
        print_error "curl не установлен"
        exit 1
    fi
    print_success "curl - OK"
    
    echo
}

# Создание структуры проекта
create_project_structure() {
    print_step "2" "Создание структуры проекта..."
    
    # Создание директорий
    mkdir -p src/backend/logs
    mkdir -p src/backend/config
    mkdir -p tests/reports
    mkdir -p docs/user-guide
    mkdir -p scripts
    
    print_success "Структура проекта создана"
    echo
}

# Настройка backend
setup_backend() {
    print_step "3" "Настройка backend-сервиса..."
    
    if [ -f "scripts/setup-backend.sh" ]; then
        ./scripts/setup-backend.sh
    else
        print_error "Скрипт setup-backend.sh не найден"
        exit 1
    fi
    echo
}

# Настройка Telegram Bot
setup_telegram() {
    print_step "4" "Настройка Telegram Bot..."
    
    if [ -f "scripts/setup-telegram.sh" ]; then
        ./scripts/setup-telegram.sh
    else
        print_error "Скрипт setup-telegram.sh не найден"
        exit 1
    fi
    echo
}

# Настройка Bitrix24
setup_bitrix24() {
    print_step "5" "Настройка Bitrix24..."
    
    if [ -f "scripts/setup-bitrix24.sh" ]; then
        ./scripts/setup-bitrix24.sh
    else
        print_error "Скрипт setup-bitrix24.sh не найден"
        exit 1
    fi
    echo
}

# Генерация секретных ключей
generate_secrets() {
    print_step "6" "Генерация секретных ключей..."
    
    if [ -f "scripts/generate-secrets.sh" ]; then
        ./scripts/generate-secrets.sh
    else
        print_error "Скрипт generate-secrets.sh не найден"
        exit 1
    fi
    echo
}

# Запуск системы
start_system() {
    print_step "7" "Запуск системы..."
    
    if [ -f "scripts/start-system.sh" ]; then
        ./scripts/start-system.sh
    else
        print_error "Скрипт start-system.sh не найден"
        exit 1
    fi
    echo
}

# Настройка webhook
setup_webhook() {
    print_step "8" "Настройка webhook..."
    
    if [ -f "scripts/setup-webhook.sh" ]; then
        ./scripts/setup-webhook.sh
    else
        print_error "Скрипт setup-webhook.sh не найден"
        exit 1
    fi
    echo
}

# Финальная настройка
final_setup() {
    print_step "9" "Финальная настройка..."
    
    print_info "Настройка завершена! Вот что было сделано:"
    echo
    echo "✅ Проверены зависимости"
    echo "✅ Создана структура проекта"
    echo "✅ Настроен backend-сервис"
    echo "✅ Настроен Telegram Bot"
    echo "✅ Настроен Bitrix24"
    echo "✅ Сгенерированы секретные ключи"
    echo "✅ Запущен backend-сервис"
    echo "✅ Настроен webhook"
    echo
    
    print_info "Полезные команды:"
    echo "  ./scripts/status.sh    - Проверить статус системы"
    echo "  ./scripts/stop.sh      - Остановить систему"
    echo "  ./scripts/restart.sh   - Перезапустить систему"
    echo
    
    print_info "Следующие шаги:"
    echo "1. Установите Activity в Bitrix24 (скопируйте папку src/activity/telegram_approval)"
    echo "2. Создайте бизнес-процесс с Activity 'Telegram Approval'"
    echo "3. Протестируйте систему"
    echo
    
    print_success "Установка завершена! 🎉"
}

# Главная функция
main() {
    print_header
    
    check_dependencies
    create_project_structure
    setup_backend
    setup_telegram
    setup_bitrix24
    generate_secrets
    start_system
    setup_webhook
    final_setup
}

# Запуск скрипта
main "$@"

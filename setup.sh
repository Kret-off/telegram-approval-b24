#!/bin/bash

# Telegram Approval System - Автоматическая установка
# Автор: AI Assistant
# Версия: 1.0.0

set -e  # Остановка при ошибке

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
    echo -e "${BLUE}  Автоматическая установка${NC}"
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

# Главная функция
main() {
    print_header
    check_dependencies
    create_project_structure
    print_success "Базовая настройка завершена!"
}

# Запуск скрипта
main "$@"

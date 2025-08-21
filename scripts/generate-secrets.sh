#!/bin/bash

# Генерация секретных ключей
set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}[ШАГ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step "Генерация секретных ключей..."

cd src/backend

# Создание .env если не существует
if [ ! -f .env ]; then
    print_error "Файл .env не найден. Сначала запустите setup-backend.sh"
    exit 1
fi

# Генерация случайных секретов
print_info "Генерация секретных ключей..."
BACKEND_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)

print_info "Сгенерированные ключи:"
echo "BACKEND_SECRET: ${BACKEND_SECRET:0:16}..."
echo "JWT_SECRET: ${JWT_SECRET:0:16}..."
echo "HMAC_SECRET: ${HMAC_SECRET:0:16}..."

# Обновление .env файла
print_info "Обновление .env файла..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/BACKEND_SECRET=.*/BACKEND_SECRET=$BACKEND_SECRET/" .env
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i '' "s/HMAC_SECRET=.*/HMAC_SECRET=$HMAC_SECRET/" .env
else
    # Linux
    sed -i "s/BACKEND_SECRET=.*/BACKEND_SECRET=$BACKEND_SECRET/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/HMAC_SECRET=.*/HMAC_SECRET=$HMAC_SECRET/" .env
fi

cd ../..

print_success "Секретные ключи сгенерированы и сохранены!"
print_info "Ключи сохранены в файле src/backend/.env"
print_info "Следующий шаг: запуск системы"

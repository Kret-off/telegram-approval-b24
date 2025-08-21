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
    echo "║                Подготовка Activity для Bitrix24              ║"
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

print_step "Подготовка файлов Activity для Bitrix24..."

# Проверяем наличие папки Activity
if [ ! -d "src/activity/telegram_approval" ]; then
    print_error "Папка Activity не найдена!"
    exit 1
fi

# Создаем папку для экспорта
EXPORT_DIR="bitrix24_activity_export"
print_info "Создание папки для экспорта: $EXPORT_DIR"

if [ -d "$EXPORT_DIR" ]; then
    rm -rf "$EXPORT_DIR"
fi

mkdir -p "$EXPORT_DIR"

# Копируем файлы Activity
print_info "Копирование файлов Activity..."
cp -r src/activity/telegram_approval "$EXPORT_DIR/"

# Создаем инструкцию по установке
print_info "Создание инструкции по установке..."

cat > "$EXPORT_DIR/INSTALL_INSTRUCTIONS.txt" << 'EOF'
📋 ИНСТРУКЦИЯ ПО УСТАНОВКЕ ACTIVITY В BITRIX24

🎯 Что делать:
1. Войдите в ваш Bitrix24 как администратор
2. Перейдите в Настройки → Бизнес-процессы → Дополнительные поля и действия
3. Нажмите "Добавить действие" или "Загрузить"
4. Выберите файл include.php из этой папки
5. Загрузите файл

📁 Файлы в этой папке:
- include.php - главный файл Activity
- install/ - файлы установки
- lang/ - переводы
- lib/ - библиотеки

⚙️ После установки:
1. Перейдите в Бизнес-процессы
2. Создайте новый процесс или откройте существующий
3. Добавьте действие "Telegram Approval"
4. Настройте параметры

🔧 Настройки в Activity:
- URL сервера: http://localhost:3000 (ваш локальный сервер)
- Получатели: выберите пользователей для уведомлений
- Таймаут: время ожидания ответа (например, 24 часа)

✅ Проверка:
1. Запустите тестовый бизнес-процесс
2. Проверьте, что уведомление пришло в Telegram
3. Проверьте, что ответ вернулся в Bitrix24

🆘 Если не работает:
- Проверьте, что backend запущен: ./scripts/status.sh
- Проверьте настройки URL в Activity
- Посмотрите логи в Bitrix24

📞 Поддержка:
- Документация: docs/
- Статус системы: ./scripts/status.sh
- Логи: src/backend/logs/
EOF

# Создаем README
cat > "$EXPORT_DIR/README.md" << 'EOF'
# Telegram Approval Activity для Bitrix24

## Описание
Activity для отправки документов на согласование через Telegram Bot.

## Установка
1. Загрузите файл `include.php` в Bitrix24 через интерфейс администратора
2. Или скопируйте всю папку в `/bitrix/activities/custom/` на сервере

## Использование
1. Добавьте действие "Telegram Approval" в бизнес-процесс
2. Настройте получателей и параметры
3. Запустите процесс

## Требования
- Backend-сервис должен быть запущен на http://localhost:3000
- Telegram Bot должен быть настроен
- Webhook должен быть настроен

## Поддержка
См. файл INSTALL_INSTRUCTIONS.txt для подробной инструкции.
EOF

print_success "Файлы подготовлены успешно!"
print_info "Папка с файлами: $EXPORT_DIR"

echo ""
print_info "📋 Следующие шаги:"
echo "1. Откройте папку: $EXPORT_DIR"
echo "2. Прочитайте: INSTALL_INSTRUCTIONS.txt"
echo "3. Загрузите include.php в ваш Bitrix24"
echo "4. Настройте бизнес-процесс"

echo ""
print_info "📁 Структура экспортированных файлов:"
tree "$EXPORT_DIR" 2>/dev/null || ls -la "$EXPORT_DIR"

echo ""
print_success "Готово! Теперь можете устанавливать Activity в Bitrix24!"

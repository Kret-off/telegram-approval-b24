# Telegram Approval Backend Service

Backend-сервис для интеграции согласований между Битрикс24 и Telegram Bot.

## 🚀 Возможности

- **REST API** для приема уведомлений от Bitrix24 Activity
- **Telegram Bot API** интеграция для отправки сообщений
- **Webhook обработка** для получения ответов от пользователей
- **База данных** для хранения данных согласований
- **Безопасность** с HMAC подписями и валидацией
- **Логирование** и мониторинг
- **Health checks** для проверки состояния сервиса

## 📋 Требования

- Node.js 18.0.0+
- MySQL 8.0+ или PostgreSQL 13+
- Telegram Bot Token
- SSL сертификат (для продакшена)

## 🛠 Установка

### 1. Клонирование и установка зависимостей

```bash
cd src/backend
npm install
```

### 2. Настройка окружения

```bash
cp env.example .env
# Отредактируйте .env файл
```

### 3. Настройка базы данных

```bash
# Создайте базу данных
mysql -u root -p
CREATE DATABASE telegram_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Запустите миграции
npm run db:migrate
```

### 4. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Добавьте токен в `.env` файл
4. Настройте webhook:

```bash
curl "http://localhost:3000/api/telegram/setup"
```

### 5. Запуск сервиса

```bash
# Режим разработки
npm run dev

# Продакшен
npm start
```

## ⚙️ Конфигурация

### Основные настройки

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `NODE_ENV` | Окружение | `development` |
| `PORT` | Порт сервера | `3000` |
| `BACKEND_URL` | URL сервера | `http://localhost:3000` |
| `BACKEND_SECRET` | Секретный ключ для HMAC | - |

### База данных

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DB_HOST` | Хост БД | `localhost` |
| `DB_PORT` | Порт БД | `3306` |
| `DB_NAME` | Имя БД | `telegram_approval` |
| `DB_USER` | Пользователь БД | `root` |
| `DB_PASSWORD` | Пароль БД | - |

### Telegram Bot

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота | - |
| `TELEGRAM_BOT_NAME` | Имя бота | - |

## 📡 API Endpoints

### Bitrix24 API

#### POST `/api/b24/notify`
Получение уведомления от Bitrix24 Activity.

**Заголовки:**
```
Content-Type: application/json
X-Signature: <hmac-signature>
X-Timestamp: <unix-timestamp>
```

**Тело запроса:**
```json
{
  "approval_id": "unique-approval-id",
  "bitrix24_portal": "https://portal.bitrix24.ru",
  "bitrix24_user_id": 123,
  "document_type": "crm",
  "document_id": 456,
  "document_title": "Заявка #123",
  "document_url": "https://portal.bitrix24.ru/crm/deal/details/456/",
  "message_text": "Требуется согласование заявки",
  "button_approve": "Согласовать",
  "button_reject": "Отклонить",
  "mode": "single",
  "timeout_hours": 24,
  "approvers": [
    {
      "bitrix24_user_id": 789,
      "telegram_username": "user123"
    }
  ]
}
```

#### GET `/api/b24/status/:approval_id`
Получение статуса согласования.

#### POST `/api/b24/cancel/:approval_id`
Отмена согласования.

### Telegram API

#### POST `/api/telegram/webhook`
Webhook для получения обновлений от Telegram Bot API.

#### GET `/api/telegram/setup`
Настройка webhook для Telegram Bot.

#### GET `/api/telegram/info`
Получение информации о боте.

### Health Checks

#### GET `/health`
Базовая проверка здоровья сервиса.

#### GET `/health/detailed`
Детальная проверка всех компонентов.

#### GET `/health/ready`
Проверка готовности к работе.

#### GET `/health/live`
Проверка жизнеспособности (для Kubernetes).

## 🗄️ База данных

### Таблицы

#### `approvals`
Основная таблица согласований.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT | Первичный ключ |
| `approval_id` | VARCHAR(50) | Уникальный ID согласования |
| `bitrix24_portal` | VARCHAR(255) | URL портала |
| `bitrix24_user_id` | INT | ID пользователя в Б24 |
| `document_type` | VARCHAR(50) | Тип документа |
| `document_id` | INT | ID документа |
| `document_title` | VARCHAR(500) | Заголовок документа |
| `document_url` | TEXT | URL документа |
| `message_text` | TEXT | Текст сообщения |
| `button_approve` | VARCHAR(100) | Текст кнопки согласования |
| `button_reject` | VARCHAR(100) | Текст кнопки отклонения |
| `mode` | ENUM | Режим работы |
| `timeout_hours` | INT | Таймаут в часах |
| `status` | ENUM | Статус согласования |
| `result_code` | VARCHAR(20) | Код результата |
| `result_label` | VARCHAR(100) | Подпись кнопки |
| `comment` | TEXT | Комментарий |
| `responded_by` | VARCHAR(255) | Кто ответил |
| `responded_at` | DATETIME | Время ответа |

#### `approvers`
Таблица согласантов.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT | Первичный ключ |
| `approval_id` | VARCHAR(50) | ID согласования |
| `bitrix24_user_id` | INT | ID пользователя в Б24 |
| `telegram_user_id` | BIGINT | ID пользователя в Telegram |
| `telegram_username` | VARCHAR(100) | Username в Telegram |
| `telegram_first_name` | VARCHAR(100) | Имя в Telegram |
| `telegram_last_name` | VARCHAR(100) | Фамилия в Telegram |
| `status` | ENUM | Статус ответа |
| `response_code` | VARCHAR(20) | Код ответа |
| `response_label` | VARCHAR(100) | Подпись кнопки |
| `comment` | TEXT | Комментарий |
| `responded_at` | DATETIME | Время ответа |
| `message_id` | INT | ID сообщения в Telegram |
| `chat_id` | BIGINT | ID чата в Telegram |

#### `user_mappings`
Таблица маппинга пользователей.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT | Первичный ключ |
| `bitrix24_portal` | VARCHAR(255) | URL портала |
| `bitrix24_user_id` | INT | ID пользователя в Б24 |
| `bitrix24_user_name` | VARCHAR(255) | Имя пользователя в Б24 |
| `bitrix24_user_email` | VARCHAR(255) | Email пользователя в Б24 |
| `telegram_user_id` | BIGINT | ID пользователя в Telegram |
| `telegram_username` | VARCHAR(100) | Username в Telegram |
| `telegram_first_name` | VARCHAR(100) | Имя в Telegram |
| `telegram_last_name` | VARCHAR(100) | Фамилия в Telegram |
| `is_active` | BOOLEAN | Активен ли маппинг |

## 🔒 Безопасность

### HMAC Подписи
Все запросы от Bitrix24 должны содержать HMAC-SHA256 подпись.

### Rate Limiting
Ограничение количества запросов: 100 запросов за 15 минут с одного IP.

### Валидация данных
Все входящие данные валидируются с помощью Joi схем.

## 📊 Логирование

Логи сохраняются в папку `logs/`:

- `combined.log` - Все логи
- `error.log` - Только ошибки
- `telegram.log` - Логи Telegram Bot
- `bitrix24.log` - Логи Bitrix24 API

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# Тесты в режиме watch
npm run test:watch
```

## 🚀 Развертывание

### Docker

```bash
# Сборка образа
npm run docker:build

# Запуск контейнера
npm run docker:run
```

### PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit
```

### Nginx

Пример конфигурации для Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Устранение неполадок

### Проверка состояния сервиса

```bash
# Проверка здоровья
curl http://localhost:3000/health

# Детальная проверка
curl http://localhost:3000/health/detailed
```

### Проверка логов

```bash
# Просмотр логов в реальном времени
tail -f logs/combined.log

# Поиск ошибок
grep "ERROR" logs/error.log
```

### Проверка базы данных

```bash
# Подключение к БД
mysql -u root -p telegram_approval

# Проверка таблиц
SHOW TABLES;
SELECT COUNT(*) FROM approvals;
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в папке `logs/`
2. Убедитесь в корректности настроек в `.env`
3. Проверьте доступность внешних сервисов
4. Обратитесь к документации API

## 📄 Лицензия

MIT License

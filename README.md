# 🤖 Telegram Approval System для Bitrix24

Система интеграции Telegram с Bitrix24 для автоматического согласования документов через мессенджер.

## 📋 Описание проекта

Telegram Approval System позволяет автоматизировать процесс согласования документов в Bitrix24 через Telegram. Согласанты получают уведомления в мессенджере и могут быстро отвечать нажатием кнопок или текстовыми сообщениями.

### 🎯 Основные возможности

- ✅ **Автоматические уведомления** в Telegram при создании запроса на согласование
- ✅ **Быстрые ответы** через inline-кнопки
- ✅ **Текстовые ответы** с распознаванием "согласовано"/"отклонено"
- ✅ **Поддержка множественных согласантов** с различными режимами
- ✅ **Таймауты и напоминания** для ускорения процесса
- ✅ **Безопасность** с HMAC подписями и валидацией
- ✅ **Мониторинг и логирование** всех операций
- ✅ **Полная интеграция** с бизнес-процессами Bitrix24

## 🏗️ Архитектура системы

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Bitrix24      │    │   Backend API    │    │   Telegram Bot  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Activity  │◄┼────┼►│  Express.js  │◄┼────┼►│   Bot API   │ │
│ │             │ │    │ │              │ │    │ │             │ │
│ │  Telegram   │ │    │ │  Telegram    │ │    │ │  Webhook    │ │
│ │  Approval   │ │    │ │  Service     │ │    │ │  Handler    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │ │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │  Business   │ │    │ │  Database    │ │    │ │  Users      │ │
│ │  Process    │ │    │ │  (MySQL)     │ │    │ │  (Chats)    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Быстрый старт

### Предварительные требования

- **Bitrix24:** Коробочная версия 22.0.0+
- **Node.js:** 18.0.0+
- **MySQL:** 5.7+
- **Telegram Bot:** Созданный через @BotFather

### Установка

1. **Клонирование репозитория:**
   ```bash
   git clone https://github.com/your-org/telegram-approval-system.git
   cd telegram-approval-system
   ```

2. **Установка зависимостей:**
   ```bash
   # Backend
   cd src/backend
   npm install
   
   # Activity (если нужно)
   cd ../activity
   # Файлы готовы к использованию
   ```

3. **Настройка конфигурации:**
   ```bash
   # Backend
   cp src/backend/env.example src/backend/.env
   # Отредактируйте .env файл
   ```

4. **Запуск системы:**
   ```bash
   # Backend
   cd src/backend
   npm start
   ```

## 📚 Документация

### 📖 Руководства пользователей

- **[Руководство по установке](docs/user-guide/installation-guide.md)** - Пошаговая установка системы
- **[Настройка бизнес-процессов](docs/user-guide/business-process-setup.md)** - Создание процессов согласования
- **[Руководство пользователя Telegram](docs/user-guide/telegram-user-guide.md)** - Работа с ботом
- **[Руководство администратора](docs/user-guide/admin-guide.md)** - Управление системой

### 🔧 Техническая документация

- **[API документация](docs/api/README.md)** - Описание API endpoints
- **[Архитектура системы](docs/architecture/README.md)** - Детальное описание архитектуры
- **[База данных](docs/database/README.md)** - Схема и структура БД
- **[Безопасность](docs/security/README.md)** - Меры безопасности

### 🧪 Тестирование

- **[Руководство по тестированию](tests/README.md)** - Запуск тестов
- **[Тестовые сценарии](docs/testing/scenarios.md)** - Примеры тестирования

## 🎯 Использование

### Создание бизнес-процесса

1. **Откройте конструктор БП в Bitrix24**
2. **Добавьте Activity "Telegram Approval"**
3. **Настройте параметры:**
   ```php
   BACKEND_URL = https://your-domain.com
   SECRET_KEY = your-secret-key
   MESSAGE_TEXT = Требуется согласование "{=Document:NAME}"
   APPROVERS = [{"bitrix24_user_id": 123, "telegram_username": "user1"}]
   ```

### Получение согласования

1. **Пользователь получает сообщение в Telegram:**
   ```
   📋 Требуется согласование
   
   📄 Документ: Заявка на закупку #12345
   💰 Сумма: 150,000 руб.
   
   [Согласовать] [Отклонить]
   ```

2. **Быстрый ответ кнопкой или текстом:**
   - Нажать "Согласовать" или написать "согласовано"
   - Нажать "Отклонить" или написать "отклонено"

3. **Результат автоматически возвращается в Bitrix24**

## 🔧 Конфигурация

### Переменные окружения

```env
# Сервер
PORT=3000
NODE_ENV=production
BACKEND_URL=https://your-domain.com
BACKEND_SECRET=your-secret-key

# База данных
DB_HOST=localhost
DB_PORT=3306
DB_NAME=telegram_approval
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=your_bot_username

# Безопасность
JWT_SECRET=your-jwt-secret
HMAC_SECRET=your-hmac-secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Настройка Activity

```php
// Параметры Activity в Bitrix24
$arActivityParameters = array(
    'BACKEND_URL' => 'https://your-domain.com',
    'SECRET_KEY' => 'your-secret-key',
    'MESSAGE_TEXT' => 'Требуется согласование "{=Document:NAME}"',
    'BUTTON_APPROVE' => 'Согласовать',
    'BUTTON_REJECT' => 'Отклонить',
    'TIMEOUT_HOURS' => 24,
    'APPROVERS' => array(
        array('bitrix24_user_id' => 123, 'telegram_username' => 'user1'),
        array('bitrix24_user_id' => 456, 'telegram_username' => 'user2')
    ),
    'MODE' => 'single' // или 'multiple'
);
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Конкретные типы тестов
npm run test:integration
npm run test:e2e
npm run test:load

# С отчетами
npm run test:report
npm run test:coverage
```

### Тестовые сценарии

- ✅ Интеграционное тестирование Activity + Backend
- ✅ Тестирование Telegram webhook
- ✅ Нагрузочное тестирование
- ✅ E2E тестирование полного цикла
- ✅ Тестирование безопасности

## 📊 Мониторинг

### Health Check

```bash
# Проверка состояния системы
curl https://your-domain.com/health

# Детальная диагностика
curl https://your-domain.com/health/detailed
```

### Логирование

```bash
# Просмотр логов
tail -f logs/app.log
tail -f logs/telegram.log
tail -f logs/bitrix24.log
```

### Метрики

```bash
# Получение метрик
curl https://your-domain.com/api/admin/metrics
```

## 🔒 Безопасность

### Меры безопасности

- **HMAC подписи** для валидации запросов
- **Rate limiting** для защиты от DDoS
- **Валидация входных данных** с Joi
- **SSL/TLS** для всех соединений
- **Логирование безопасности** всех событий

### Аудит

```bash
# Проверка логов безопасности
grep "SECURITY" logs/app.log
grep "AUTH_FAILED" logs/app.log
grep "RATE_LIMIT" logs/app.log
```

## 🚀 Развертывание

### Docker

```bash
# Сборка образа
docker build -t telegram-approval-backend .

# Запуск контейнера
docker run -p 3000:3000 telegram-approval-backend
```

### PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start src/backend/src/app.js --name "telegram-approval"

# Мониторинг
pm2 status
pm2 logs telegram-approval
```

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

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

## 📈 Производительность

### Метрики

- **Время ответа:** < 5 секунд для обычных запросов
- **Health check:** < 1 секунды
- **Покрытие кода:** 80%+
- **Успешность запросов:** > 90%

### Оптимизация

- **Connection pooling** для базы данных
- **Кэширование** с Redis (опционально)
- **Сжатие ответов** с gzip
- **Оптимизированные запросы** к БД

## 🤝 Вклад в проект

### Разработка

1. **Форкните репозиторий**
2. **Создайте ветку для фичи:** `git checkout -b feature/amazing-feature`
3. **Закоммитьте изменения:** `git commit -m 'Add amazing feature'`
4. **Запушьте ветку:** `git push origin feature/amazing-feature`
5. **Откройте Pull Request**

### Тестирование

```bash
# Запуск тестов перед коммитом
npm run test
npm run lint
npm run format
```

## 📞 Поддержка

### Получение помощи

- **Документация:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/telegram-approval-system/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/telegram-approval-system/discussions)

### Сообщество

- **Telegram канал:** [@telegram_approval_support](https://t.me/telegram_approval_support)
- **Email:** support@your-org.com

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- **Bitrix24** за отличную платформу
- **Telegram** за мощный Bot API
- **Node.js** сообществу за инструменты
- **Всем контрибьюторам** проекта

---

**Сделано с ❤️ для автоматизации бизнес-процессов**

---

## 📊 Статус проекта

- **Этап 1:** ✅ Аналитика и проектирование (100%)
- **Этап 2:** ✅ Разработка Activity для Битрикс24 (100%)
- **Этап 3:** ✅ Разработка backend-сервиса (100%)
- **Этап 4:** ✅ Интеграция и тестирование (100%)
- **Этап 5:** ✅ Документация и внедрение (100%)

**Общий прогресс:** 100% (45 из 45 задач завершено)
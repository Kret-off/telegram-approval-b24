# 📁 Детальная структура проекта
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 🎯 Общая архитектура

```
soglasovanie_TG_B24/
├── 📖 docs/                          # Документация проекта
├── 💻 src/                           # Исходный код
├── 🧪 tests/                         # Тесты
├── ⚙️ config/                        # Конфигурация
├── 🔧 scripts/                       # Скрипты
├── 📄 README.md                      # Главная страница
├── 📦 package.json                   # Зависимости Node.js
└── 🚫 .gitignore                     # Исключения Git
```

---

## 📖 Документация (docs/)

### 📊 Аналитика (docs/analysis/)
**Назначение:** Бизнес-анализ и требования

```
docs/analysis/
├── business_scenarios.md             # Детальные сценарии использования
├── text_response_policy.md           # Политика обработки текстовых ответов
└── requirements.md                   # Функциональные требования
```

**Содержимое:**
- Анализ бизнес-процессов согласования
- Сценарии работы с одним/несколькими согласантами
- Политика обработки различных типов ответов
- Требования к функциональности

### 🏗️ Архитектура (docs/architecture/)
**Назначение:** Техническая архитектура и проектирование

```
docs/architecture/
├── database_schema.md                # Схема базы данных
├── project_structure.md              # Общая структура проекта
├── system_architecture.md            # Системная архитектура
├── security_architecture.md          # Архитектура безопасности
└── deployment_architecture.md        # Архитектура развертывания
```

**Содержимое:**
- ER-диаграммы базы данных
- Схемы взаимодействия компонентов
- Модели безопасности
- Диаграммы развертывания

### 🔌 API (docs/api/)
**Назначение:** Документация API и интерфейсов

```
docs/api/
├── api_contracts.md                  # API контракты
├── json_schemas.md                   # JSON схемы данных
├── webhook_specification.md          # Спецификация webhook
└── error_codes.md                    # Коды ошибок
```

**Содержимое:**
- REST API спецификации
- JSON схемы для валидации
- Webhook интерфейсы
- Стандарты обработки ошибок

### 🛠️ Разработка (docs/development/)
**Назначение:** Документация для разработчиков

```
docs/development/
├── tasks.md                          # Детальный план задач
├── backlog.md                        # Backlog проекта
├── progress_summary.md               # Отчет о прогрессе
├── stage1_completion_report.md       # Отчет о завершении этапа 1
├── coding_standards.md               # Стандарты кодирования
├── git_workflow.md                   # Рабочий процесс Git
└── testing_strategy.md               # Стратегия тестирования
```

**Содержимое:**
- Планы разработки
- User Stories
- Отчеты о прогрессе
- Стандарты разработки

### 🚀 Развертывание (docs/deployment/)
**Назначение:** Инструкции по развертыванию

```
docs/deployment/
├── INSTALLATION.md                   # Инструкция по установке
├── DOCKER_SETUP.md                   # Настройка Docker
├── PRODUCTION_SETUP.md               # Настройка продакшена
├── MONITORING.md                     # Мониторинг
└── MAINTENANCE.md                    # Обслуживание
```

**Содержимое:**
- Пошаговые инструкции установки
- Конфигурация Docker
- Настройка продакшена
- Мониторинг и обслуживание

---

## 💻 Исходный код (src/)

### 🎯 Activity (src/activity/)
**Назначение:** PHP-модуль для Битрикс24

```
src/activity/
├── telegram_approval/                # Основная папка модуля
│   ├── lib/                          # Библиотеки
│   │   ├── activity.php              # Основной класс Activity
│   │   ├── form.php                  # Форма настроек
│   │   └── validator.php             # Валидация данных
│   ├── lang/                         # Локализация
│   │   ├── ru/                       # Русский язык
│   │   │   └── telegram_approval.php
│   │   └── en/                       # Английский язык
│   │       └── telegram_approval.php
│   ├── install/                      # Установка
│   │   ├── index.php                 # Скрипт установки
│   │   └── step.php                  # Шаги установки
│   ├── uninstall/                    # Удаление
│   │   └── index.php                 # Скрипт удаления
│   └── include.php                   # Подключение модуля
├── composer.json                     # Зависимости PHP
└── README.md                         # Документация модуля
```

**Основные файлы:**
- `activity.php` - Основной класс Activity
- `form.php` - Форма настроек в конструкторе БП
- `validator.php` - Валидация входных данных

### 🔧 Backend (src/backend/)
**Назначение:** Node.js сервис для обработки запросов

```
src/backend/
├── server.js                         # Точка входа сервера
├── app.js                            # Основное приложение
├── config/                           # Конфигурация
│   ├── database.js                   # Настройки БД
│   ├── telegram.js                   # Настройки Telegram
│   └── bitrix24.js                   # Настройки Битрикс24
├── models/                           # Модели данных
│   ├── Approval.js                   # Модель согласования
│   ├── User.js                       # Модель пользователя
│   ├── Response.js                   # Модель ответа
│   └── index.js                      # Экспорт моделей
├── controllers/                      # Контроллеры
│   ├── approvalController.js         # Контроллер согласований
│   ├── telegramController.js         # Контроллер Telegram
│   └── bitrix24Controller.js         # Контроллер Битрикс24
├── services/                         # Сервисы
│   ├── telegramService.js            # Сервис Telegram
│   ├── bitrix24Service.js            # Сервис Битрикс24
│   ├── approvalService.js            # Сервис согласований
│   └── notificationService.js        # Сервис уведомлений
├── middleware/                       # Middleware
│   ├── auth.js                       # Аутентификация
│   ├── validation.js                 # Валидация
│   ├── rateLimit.js                  # Ограничение запросов
│   └── errorHandler.js               # Обработка ошибок
├── routes/                           # Маршруты
│   ├── api.js                        # API маршруты
│   ├── webhook.js                    # Webhook маршруты
│   └── health.js                     # Health check
├── utils/                            # Утилиты
│   ├── logger.js                     # Логирование
│   ├── validator.js                  # Валидация
│   ├── crypto.js                     # Криптография
│   └── helpers.js                    # Вспомогательные функции
└── migrations/                       # Миграции БД
    ├── 001_create_tables.js          # Создание таблиц
    ├── 002_add_indexes.js            # Добавление индексов
    └── 003_seed_data.js              # Тестовые данные
```

**Основные файлы:**
- `server.js` - Запуск сервера
- `app.js` - Настройка Express приложения
- `controllers/` - Обработка HTTP запросов
- `services/` - Бизнес-логика
- `models/` - Модели Sequelize

### 🤖 Telegram (src/telegram/)
**Назначение:** Telegram Bot для обработки сообщений

```
src/telegram/
├── bot.js                            # Основной файл бота
├── handlers/                         # Обработчики
│   ├── messageHandler.js             # Обработка сообщений
│   ├── callbackHandler.js            # Обработка callback
│   ├── commandHandler.js             # Обработка команд
│   └── errorHandler.js               # Обработка ошибок
├── keyboards/                        # Клавиатуры
│   ├── approvalKeyboard.js           # Клавиатура согласования
│   ├── mainKeyboard.js               # Главная клавиатура
│   └── inlineKeyboard.js             # Inline кнопки
├── messages/                         # Шаблоны сообщений
│   ├── approvalMessage.js            # Сообщение согласования
│   ├── helpMessage.js                # Справка
│   └── errorMessage.js               # Сообщения об ошибках
├── services/                         # Сервисы
│   ├── userService.js                # Работа с пользователями
│   ├── approvalService.js            # Работа с согласованиями
│   └── notificationService.js        # Уведомления
└── utils/                            # Утилиты
    ├── logger.js                     # Логирование
    ├── validator.js                  # Валидация
    └── helpers.js                    # Вспомогательные функции
```

**Основные файлы:**
- `bot.js` - Инициализация и запуск бота
- `handlers/` - Обработчики различных типов сообщений
- `keyboards/` - Генерация клавиатур
- `messages/` - Шаблоны сообщений

---

## 🧪 Тесты (tests/)

### 🔬 Модульные тесты (tests/unit/)
**Назначение:** Тестирование отдельных функций

```
tests/unit/
├── backend/                          # Тесты backend
│   ├── services/                     # Тесты сервисов
│   ├── controllers/                  # Тесты контроллеров
│   ├── models/                       # Тесты моделей
│   └── utils/                        # Тесты утилит
├── telegram/                         # Тесты Telegram
│   ├── handlers/                     # Тесты обработчиков
│   ├── keyboards/                    # Тесты клавиатур
│   └── services/                     # Тесты сервисов
└── activity/                         # Тесты Activity
    ├── form/                         # Тесты форм
    └── validation/                   # Тесты валидации
```

### 🔗 Интеграционные тесты (tests/integration/)
**Назначение:** Тестирование взаимодействия компонентов

```
tests/integration/
├── api/                              # Тесты API
│   ├── approval.test.js              # Тесты согласований
│   ├── webhook.test.js               # Тесты webhook
│   └── auth.test.js                  # Тесты аутентификации
├── database/                         # Тесты БД
│   ├── models.test.js                # Тесты моделей
│   └── migrations.test.js            # Тесты миграций
└── telegram/                         # Тесты Telegram
    ├── bot.test.js                   # Тесты бота
    └── handlers.test.js              # Тесты обработчиков
```

### 🌐 End-to-end тесты (tests/e2e/)
**Назначение:** Тестирование полного flow

```
tests/e2e/
├── scenarios/                        # Тестовые сценарии
│   ├── singleApprover.test.js        # Один согласант
│   ├── multipleApprovers.test.js     # Несколько согласантов
│   ├── conflictResolution.test.js    # Разрешение конфликтов
│   └── timeoutHandling.test.js       # Обработка таймаутов
├── fixtures/                         # Тестовые данные
│   ├── users.json                    # Пользователи
│   ├── approvals.json                # Согласования
│   └── responses.json                # Ответы
└── utils/                            # Утилиты для тестов
    ├── testSetup.js                  # Настройка тестов
    ├── mockData.js                   # Мок данные
    └── assertions.js                 # Дополнительные проверки
```

---

## ⚙️ Конфигурация (config/)

```
config/
├── env.example                       # Пример конфигурации
├── .env                              # Активная конфигурация (не в Git)
├── database.js                       # Настройки БД
├── telegram.js                       # Настройки Telegram
├── bitrix24.js                       # Настройки Битрикс24
├── logging.js                        # Настройки логирования
├── security.js                       # Настройки безопасности
└── production.js                     # Продакшен настройки
```

---

## 🔧 Скрипты (scripts/)

```
scripts/
├── setup.sh                          # Автоматическая установка
├── migrate.js                        # Миграции БД
├── seed.js                           # Заполнение тестовыми данными
├── backup.js                         # Резервное копирование
├── deploy.sh                         # Развертывание
├── test.sh                           # Запуск тестов
└── maintenance.sh                    # Обслуживание
```

---

## 📊 Связи между компонентами

### 🔄 Поток данных

```
Битрикс24 Activity → Backend API → Telegram Bot
                ↓
            Database
                ↓
        Backend API → Битрикс24 OnExternalEvent
```

### 📡 API Endpoints

```
POST /api/approval/create              # Создание согласования
POST /webhook/telegram                 # Webhook от Telegram
GET  /api/approval/:id                 # Получение статуса
PUT  /api/approval/:id/complete        # Завершение согласования
POST /api/bitrix24/event              # Событие в Битрикс24
```

### 🗄️ База данных

```
approvals          # Согласования
├── id (PK)
├── b24_task_id
├── message_text
├── approvers
├── status
└── created_at

responses          # Ответы
├── id (PK)
├── approval_id (FK)
├── user_id
├── response_type
├── response_data
└── created_at

users              # Пользователи
├── id (PK)
├── b24_user_id
├── telegram_id
├── username
└── created_at
```

---

## 🚀 Готовность к разработке

### ✅ Что готово:
- [x] Структура папок создана
- [x] Документация распределена
- [x] Конфигурационные файлы созданы
- [x] package.json настроен
- [x] .gitignore настроен

### 🔄 Следующие шаги:
1. **Создать базовые файлы Activity**
2. **Настроить backend-сервис**
3. **Создать Telegram Bot**
4. **Настроить базу данных**
5. **Написать тесты**

---

**Статус структуры:** ✅ ГОТОВА К РАЗРАБОТКЕ

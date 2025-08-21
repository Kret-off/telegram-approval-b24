# 🧪 Тестирование Telegram Approval System

Данная директория содержит полную систему тестирования для проекта интеграции Telegram с Bitrix24.

## 📁 Структура тестов

```
tests/
├── integration/           # Интеграционные тесты
│   ├── activity-backend.test.js    # Тесты взаимодействия Activity + Backend
│   ├── telegram-webhook.test.js    # Тесты Telegram webhook
│   └── load-test.js               # Нагрузочные тесты
├── e2e/                   # End-to-End тесты
│   └── approval-workflow.test.js  # Полный цикл согласования
├── unit/                  # Модульные тесты (будут добавлены)
├── reports/               # Отчеты о тестировании
├── logs/                  # Логи тестов
├── test-config.js         # Конфигурация тестов
├── test-setup.js          # Настройка тестового окружения
├── .mocharc.js            # Конфигурация Mocha
├── run-tests.js           # Скрипт запуска тестов
└── README.md              # Документация
```

## 🚀 Быстрый старт

### Установка зависимостей

```bash
# Установка тестовых зависимостей
npm install --save-dev mocha chai sinon sinon-chai axios nyc mocha-multi-reporters

# Или если зависимости уже установлены
npm install
```

### Запуск тестов

```bash
# Все тесты
npm test

# Или через скрипт
node tests/run-tests.js

# Конкретные типы тестов
node tests/run-tests.js integration
node tests/run-tests.js e2e
node tests/run-tests.js load

# С отчетами
node tests/run-tests.js all --report

# С покрытием кода
node tests/run-tests.js all --coverage
```

## 📋 Типы тестов

### 1. Интеграционные тесты (`integration/`)

Проверяют взаимодействие между компонентами системы:

- **activity-backend.test.js** - Тесты API между Bitrix24 Activity и Backend
- **telegram-webhook.test.js** - Тесты обработки webhook'ов от Telegram
- **load-test.js** - Нагрузочное тестирование производительности

### 2. End-to-End тесты (`e2e/`)

Проверяют полные пользовательские сценарии:

- **approval-workflow.test.js** - Полный цикл согласования от начала до конца

### 3. Модульные тесты (`unit/`)

Проверяют отдельные функции и модули (будут добавлены в будущем)

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env.test` в корне проекта:

```env
# Сервер
BACKEND_URL=http://localhost:3000
BACKEND_PORT=3000
BACKEND_SECRET=test-secret-key

# Bitrix24
BITRIX24_PORTAL=https://test-portal.bitrix24.ru
BITRIX24_AUTH_TOKEN=test-auth-token

# Telegram
TELEGRAM_BOT_TOKEN=test-bot-token
TELEGRAM_BOT_USERNAME=test_bot

# База данных
DB_HOST=localhost
DB_PORT=3306
DB_NAME=telegram_approval_test
DB_USER=root
DB_PASSWORD=

# Логирование
LOG_LEVEL=info
SUPPRESS_LOGS=false
```

### Настройки тестов

Основные настройки находятся в `test-config.js`:

- Временные интервалы
- Ожидаемые значения производительности
- Настройки нагрузочного тестирования
- Утилиты для генерации тестовых данных

## 🔧 Команды тестирования

### Базовые команды

```bash
# Запуск всех тестов
npm test

# Запуск конкретных тестов
npm run test:integration
npm run test:e2e
npm run test:load
npm run test:security
```

### Расширенные команды

```bash
# Тесты с отчетами
npm run test:report

# Тесты с покрытием кода
npm run test:coverage

# Нагрузочное тестирование
npm run test:load

# Тесты безопасности
npm run test:security

# Тесты в режиме watch
npm run test:watch
```

### Через скрипт

```bash
# Все тесты
node tests/run-tests.js

# Интеграционные тесты
node tests/run-tests.js integration

# E2E тесты
node tests/run-tests.js e2e

# Нагрузочные тесты
node tests/run-tests.js load

# С отчетами
node tests/run-tests.js all --report

# С покрытием
node tests/run-tests.js all --coverage
```

## 📊 Отчеты и метрики

### Отчеты о тестировании

После запуска тестов с флагом `--report` создаются:

- **HTML отчеты** в `tests/reports/`
- **JSON отчеты** для CI/CD
- **Логи тестов** в `tests/logs/`

### Покрытие кода

При запуске с флагом `--coverage`:

- **HTML отчеты** покрытия в `tests/reports/coverage/`
- **JSON отчеты** для CI/CD
- **Консольный вывод** с процентами покрытия

### Метрики производительности

Нагрузочные тесты предоставляют:

- Время ответа (среднее, медиана, 95-й процентиль)
- Количество запросов в секунду
- Процент успешных запросов
- Использование ресурсов

## 🎯 Сценарии тестирования

### 1. Интеграционное тестирование

```javascript
describe('Интеграционные тесты: Activity + Backend', () => {
  it('должен успешно принять уведомление от Activity', async () => {
    // Тест отправки уведомления от Bitrix24 Activity
  });

  it('должен отклонить запрос с неверной подписью', async () => {
    // Тест безопасности HMAC подписи
  });

  it('должен обработать дублирующийся запрос', async () => {
    // Тест идемпотентности
  });
});
```

### 2. E2E тестирование

```javascript
describe('E2E Тесты: Полный цикл согласования', () => {
  it('должен выполнить полный цикл согласования', async () => {
    // 1. Отправка уведомления от Activity
    // 2. Проверка статуса
    // 3. Имитация ответа пользователя
    // 4. Финальная проверка результата
  });
});
```

### 3. Нагрузочное тестирование

```javascript
describe('Нагрузочные тесты', () => {
  it('должен обработать 10 параллельных запросов', async () => {
    // Тест производительности при параллельной нагрузке
  });

  it('должен быстро отвечать на health check', async () => {
    // Тест скорости ответа health check
  });
});
```

## 🔒 Тестирование безопасности

### Проверяемые аспекты

- **HMAC подписи** - Валидация подписей запросов
- **Rate limiting** - Ограничение частоты запросов
- **Валидация входных данных** - Проверка корректности данных
- **Аутентификация** - Проверка токенов доступа
- **Авторизация** - Проверка прав доступа

### Команды безопасности

```bash
# Запуск тестов безопасности
npm run test:security

# Или через скрипт
node tests/run-tests.js security
```

## 🐛 Отладка тестов

### Включение подробного логирования

```bash
# Включение логов
SUPPRESS_LOGS=false npm test

# Или через переменную окружения
export SUPPRESS_LOGS=false
npm test
```

### Отладка конкретного теста

```bash
# Запуск одного теста
npx mocha tests/integration/activity-backend.test.js --grep "должен успешно принять уведомление"

# Запуск с отладкой
NODE_OPTIONS="--inspect-brk" npx mocha tests/integration/activity-backend.test.js
```

### Просмотр отчетов

```bash
# Открытие HTML отчета
open tests/reports/index.html

# Открытие отчета покрытия
open tests/reports/coverage/lcov-report/index.html
```

## 📈 CI/CD интеграция

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### GitLab CI

```yaml
test:
  stage: test
  script:
    - npm install
    - npm test
    - npm run test:coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: tests/reports/coverage/cobertura-coverage.xml
```

## 🤝 Вклад в тестирование

### Добавление новых тестов

1. Создайте файл теста в соответствующей директории
2. Используйте существующие утилиты из `test-setup.js`
3. Следуйте паттернам именования и структуры
4. Добавьте документацию для новых тестов

### Пример нового теста

```javascript
const { expect } = require('chai');
const testUtils = global.testUtils;

describe('Новый функционал', () => {
  it('должен корректно работать', async () => {
    // Используйте утилиты
    const testData = testUtils.generateTestData('approval');
    
    // Ваш тест
    expect(testData).to.have.property('approval_id');
  });
});
```

## 📞 Поддержка

При возникновении проблем с тестами:

1. Проверьте конфигурацию в `test-config.js`
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения
4. Посмотрите логи в `tests/logs/`

---

**Тестирование - ключ к качеству! 🎯**

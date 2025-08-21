# 🔧 Настройка приложения в Bitrix24

## 📋 Пошаговая инструкция

### Шаг 1: Создание приложения

1. **Войдите в ваш Bitrix24**
   - Откройте ваш портал: `https://your-portal.bitrix24.ru`
   - Войдите под администратором

2. **Перейдите в раздел приложений**
   - В левом меню найдите "Приложения" или "Marketplace"
   - Нажмите "Разработчикам" → "Другое" → "Создать приложение"

3. **Заполните основную информацию**
   ```
   Название: Telegram Approval Cloud
   Код: telegram_approval_cloud
   Описание: Интеграция для согласования задач через Telegram
   ```

### Шаг 2: Настройка OAuth

1. **В разделе "OAuth" укажите:**
   ```
   Redirect URI: https://telegram-approval-b2411.vercel.app/api/auth/bitrix24/callback
   ```

2. **Скопируйте полученные данные:**
   - **Client ID** (сохраните для .env)
   - **Client Secret** (сохраните для .env)

### Шаг 3: Настройка прав доступа

**Отметьте следующие права:**
- ✅ `crm` - доступ к CRM
- ✅ `task` - доступ к задачам
- ✅ `user` - доступ к пользователям
- ✅ `im` - доступ к сообщениям
- ✅ `department` - доступ к отделам

### Шаг 4: Настройка webhook'ов

**Добавьте следующие webhook'и:**

1. **CRM события:**
   ```
   URL: https://telegram-approval-b2411.vercel.app/api/webhooks/crm
   События: 
   - ONCRMDEALADD
   - ONCRMDEALUPDATE
   - ONCRMLEADADD
   - ONCRMLEADUPDATE
   ```

2. **Задачи:**
   ```
   URL: https://telegram-approval-b2411.vercel.app/api/webhooks/tasks
   События:
   - ONTASKADD
   - ONTASKUPDATE
   - ONTASKCOMMENTADD
   ```

3. **Универсальный webhook:**
   ```
   URL: https://telegram-approval-b2411.vercel.app/api/webhooks/universal
   События: Все события
   ```

### Шаг 5: Активация приложения

1. **Нажмите "Сохранить"**
2. **Перейдите в "Установка"**
3. **Нажмите "Установить приложение"**
4. **Подтвердите права доступа**

## 🔑 Получение данных для конфигурации

После создания приложения у вас будут:

```
BITRIX24_CLIENT_ID=your_client_id_here
BITRIX24_CLIENT_SECRET=your_client_secret_here
BITRIX24_DOMAIN=https://your-portal.bitrix24.ru
```

## 📝 Настройка переменных окружения

Добавьте эти переменные в Vercel:

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Найдите проект `telegram-approval-b2411`
3. Перейдите в "Settings" → "Environment Variables"
4. Добавьте переменные из файла `vercel-env-vars.txt`

## 🧪 Тестирование интеграции

1. **Проверьте авторизацию:**
   ```
   https://telegram-approval-b2411.vercel.app/api/auth/bitrix24
   ```

2. **Проверьте webhook'и:**
   - Создайте тестовую задачу в Bitrix24
   - Проверьте логи в Vercel Dashboard

## 🎯 Следующие шаги

После настройки Bitrix24:
1. Настройте Telegram Bot
2. Протестируйте полную интеграцию
3. Настройте бизнес-логику согласований

## ❓ Возможные проблемы

**Если webhook'и не работают:**
- Проверьте URL в настройках Bitrix24
- Убедитесь, что приложение установлено
- Проверьте права доступа

**Если авторизация не работает:**
- Проверьте Redirect URI
- Убедитесь, что Client ID и Secret правильные
- Проверьте переменные окружения в Vercel

# 🤖 Настройка Telegram Bot для облачного решения

## 📋 Обзор

Telegram Bot является ключевым компонентом системы согласований. Он получает уведомления о согласованиях и позволяет пользователям быстро отвечать через кнопки или текстовые сообщения.

## 🎯 Создание Telegram Bot

### 1. Создание бота через @BotFather

1. **Откройте Telegram** и найдите [@BotFather](https://t.me/BotFather)
2. **Отправьте команду:** `/newbot`
3. **Введите название бота:** `Telegram Approval Bot`
4. **Введите username бота:** `your_approval_bot` (должен заканчиваться на 'bot')
5. **Получите токен бота** - сохраните его!

### 2. Настройка бота

Отправьте @BotFather следующие команды:

```bash
# Описание бота
/setdescription
Описание: Бот для согласования документов в Bitrix24

# Информация о боте
/setabouttext
О боте: Система автоматических согласований через Telegram

# Команды бота
/setcommands
start - Начать работу с ботом
help - Получить справку
status - Проверить статус согласований
```

## ⚙️ Настройка webhook

### 1. Настройка webhook URL

После деплоя приложения настройте webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-domain.com/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
```

### 2. Проверка webhook

```bash
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### 3. Удаление webhook (если нужно)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

## 🔧 Конфигурация приложения

### 1. Добавление токена в .env

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_approval_bot
```

### 2. Настройка webhook URL

Убедитесь, что webhook URL настроен правильно в вашем приложении.

## 📱 Структура сообщений

### 1. Сообщение о согласовании

```
📋 Требуется согласование

📄 Документ: Заявка на закупку #12345
💰 Сумма: 150,000 руб.
📅 Срок: 24 часа
👤 Создатель: Иван Иванов

[✅ Согласовать] [❌ Отклонить] [💬 Комментарий]
```

### 2. Подтверждение ответа

```
✅ Согласование одобрено

📄 Документ: Заявка на закупку #12345
👤 Ответил: Петр Петров
⏰ Время: 15:30
💬 Комментарий: Согласовано

Статус обновлен в Bitrix24
```

### 3. Напоминание о таймауте

```
⏰ Напоминание о согласовании

📄 Документ: Заявка на закупку #12345
⏳ Осталось: 2 часа
⚠️ Не забудьте ответить!

[✅ Согласовать] [❌ Отклонить]
```

## 🎨 Настройка кнопок

### 1. Inline кнопки

```javascript
const keyboard = {
  inline_keyboard: [
    [
      { text: "✅ Согласовать", callback_data: "approve_123" },
      { text: "❌ Отклонить", callback_data: "reject_123" }
    ],
    [
      { text: "💬 Комментарий", callback_data: "comment_123" }
    ]
  ]
};
```

### 2. Команды бота

```javascript
const commands = [
  { command: "start", description: "Начать работу с ботом" },
  { command: "help", description: "Получить справку" },
  { command: "status", description: "Проверить статус согласований" },
  { command: "settings", description: "Настройки уведомлений" }
];
```

## 🔄 Обработка ответов

### 1. Обработка кнопок

```javascript
// Обработка нажатия кнопки "Согласовать"
if (callback_data.startsWith('approve_')) {
  const approvalId = callback_data.split('_')[1];
  await approveDocument(approvalId, userId);
}

// Обработка нажатия кнопки "Отклонить"
if (callback_data.startsWith('reject_')) {
  const approvalId = callback_data.split('_')[1];
  await rejectDocument(approvalId, userId);
}
```

### 2. Обработка текстовых сообщений

```javascript
// Распознавание текстовых ответов
const message = update.message.text.toLowerCase();

if (message.includes('согласовано') || message.includes('одобрено')) {
  await approveDocument(approvalId, userId);
} else if (message.includes('отклонено') || message.includes('не согласовано')) {
  await rejectDocument(approvalId, userId);
}
```

## 🔒 Безопасность

### 1. Валидация запросов

```javascript
// Проверка подписи webhook
const isValidRequest = validateTelegramWebhook(request);
if (!isValidRequest) {
  return res.status(403).json({ error: 'Invalid signature' });
}
```

### 2. Проверка пользователей

```javascript
// Проверка, что пользователь авторизован
const isAuthorized = await checkUserAuthorization(userId);
if (!isAuthorized) {
  await bot.sendMessage(chatId, 'У вас нет доступа к этому согласованию');
  return;
}
```

## 📊 Мониторинг

### 1. Логирование

```javascript
// Логирование всех действий
logger.info('Telegram webhook received', {
  userId: update.message.from.id,
  action: 'approval_response',
  approvalId: approvalId,
  response: response
});
```

### 2. Статистика

- Количество отправленных уведомлений
- Время ответа пользователей
- Процент согласований/отклонений
- Популярные времена ответов

## 🧪 Тестирование

### 1. Тестирование webhook

```bash
# Отправка тестового сообщения
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "YOUR_CHAT_ID",
       "text": "Тестовое сообщение",
       "reply_markup": {
         "inline_keyboard": [
           [{"text": "Тест", "callback_data": "test"}]
         ]
       }
     }'
```

### 2. Проверка обработки

1. Отправьте тестовое согласование
2. Проверьте, что бот получил уведомление
3. Нажмите кнопку или отправьте текстовый ответ
4. Проверьте, что статус обновился в Bitrix24

## 🆘 Устранение неполадок

### Проблема: Бот не отвечает
**Решение:**
- Проверьте токен бота
- Убедитесь, что webhook настроен правильно
- Проверьте логи приложения

### Проблема: Webhook не работает
**Решение:**
- Проверьте URL webhook
- Убедитесь, что сервер доступен извне
- Проверьте SSL сертификат

### Проблема: Кнопки не работают
**Решение:**
- Проверьте callback_data
- Убедитесь, что обработчик настроен
- Проверьте права доступа пользователя

## 📞 Поддержка

### Полезные ссылки:
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/BotFather)
- [Telegram Bot FAQ](https://core.telegram.org/bots/faq)

### Команды для отладки:
```bash
# Получить информацию о боте
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"

# Получить обновления
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"

# Получить статистику
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

**🎉 Готово! Ваш Telegram Bot настроен и готов к работе!**

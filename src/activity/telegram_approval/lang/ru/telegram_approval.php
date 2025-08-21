<?php
/**
 * Локализация для Activity «Согласование через Telegram»
 * Русский язык
 * 
 * @package TelegramApproval
 * @version 1.0.0
 */

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

$MESS = [
    // Основные названия
    'TELEGRAM_APPROVAL_ACTIVITY_NAME' => 'Согласование через Telegram',
    'TELEGRAM_APPROVAL_ACTIVITY_DESCRIPTION' => 'Отправляет запрос на согласование в Telegram и ожидает ответ',
    'TELEGRAM_APPROVAL_CATEGORY_NAME' => 'Кастомные Activity',

    // Поля формы
    'TELEGRAM_APPROVAL_TITLE' => 'Название Activity',
    'TELEGRAM_APPROVAL_TITLE_PLACEHOLDER' => 'Введите название для этого шага согласования',
    'TELEGRAM_APPROVAL_APPROVERS' => 'Согласанты',
    'TELEGRAM_APPROVAL_APPROVERS_PLACEHOLDER' => 'Введите Telegram ID согласантов (по одному на строку или через запятую)',
    'TELEGRAM_APPROVAL_APPROVERS_HELP' => 'Укажите Telegram ID пользователей, которые должны согласовать документ',
    'TELEGRAM_APPROVAL_MESSAGE_TEXT' => 'Текст сообщения',
    'TELEGRAM_APPROVAL_MESSAGE_TEXT_PLACEHOLDER' => 'Введите текст сообщения для отправки в Telegram',
    'TELEGRAM_APPROVAL_MESSAGE_TEXT_HELP' => 'Текст сообщения, которое будет отправлено согласантам. Можно использовать переменные {DOCUMENT_TITLE}, {DOCUMENT_ID}, {CREATED_BY}',
    'TELEGRAM_APPROVAL_BUTTON_APPROVE' => 'Кнопка "Согласовано"',
    'TELEGRAM_APPROVAL_BUTTON_REJECT' => 'Кнопка "Не согласовано"',
    'TELEGRAM_APPROVAL_MODE' => 'Режим работы',
    'TELEGRAM_APPROVAL_MODE_SINGLE' => 'Один согласант',
    'TELEGRAM_APPROVAL_MODE_MULTIPLE_WAIT_ALL' => 'Несколько согласантов (ждать всех)',
    'TELEGRAM_APPROVAL_MODE_MULTIPLE_FIRST' => 'Несколько согласантов (первый ответ)',
    'TELEGRAM_APPROVAL_MODE_HELP' => 'Выберите режим работы с несколькими согласантами',
    'TELEGRAM_APPROVAL_TIMEOUT_HOURS' => 'Таймаут (часы)',
    'TELEGRAM_APPROVAL_TIMEOUT_HELP' => 'Время ожидания ответа в часах (1-168)',
    'TELEGRAM_APPROVAL_BACKEND_URL' => 'URL Backend-сервиса',
    'TELEGRAM_APPROVAL_BACKEND_URL_HELP' => 'URL вашего backend-сервиса для обработки запросов',
    'TELEGRAM_APPROVAL_BACKEND_SECRET' => 'Секретный ключ',
    'TELEGRAM_APPROVAL_BACKEND_SECRET_PLACEHOLDER' => 'Введите секретный ключ для аутентификации',
    'TELEGRAM_APPROVAL_BACKEND_SECRET_HELP' => 'Секретный ключ для безопасной связи с backend-сервисом',

    // Переменные
    'TELEGRAM_APPROVAL_VARIABLES' => 'Доступные переменные',
    'TELEGRAM_APPROVAL_VARIABLES_AVAILABLE' => 'В тексте сообщения можно использовать следующие переменные:',
    'TELEGRAM_APPROVAL_VARIABLE_DOCUMENT_TITLE' => 'Название документа',
    'TELEGRAM_APPROVAL_VARIABLE_DOCUMENT_ID' => 'ID документа',
    'TELEGRAM_APPROVAL_VARIABLE_CREATED_BY' => 'Создатель документа',

    // Выходные параметры
    'TELEGRAM_APPROVAL_RESULT_CODE' => 'Код результата',
    'TELEGRAM_APPROVAL_RESULT_LABEL' => 'Подпись результата',
    'TELEGRAM_APPROVAL_COMMENT' => 'Комментарий',
    'TELEGRAM_APPROVAL_RESPONDED_BY' => 'Кто ответил',
    'TELEGRAM_APPROVAL_RESPONDED_AT' => 'Время ответа',

    // Сообщения об ошибках
    'TELEGRAM_APPROVAL_ERROR_NO_APPROVERS' => 'Не указаны согласанты',
    'TELEGRAM_APPROVAL_ERROR_NO_MESSAGE' => 'Не указан текст сообщения',
    'TELEGRAM_APPROVAL_ERROR_NO_BACKEND_URL' => 'Не указан URL backend-сервиса',
    'TELEGRAM_APPROVAL_ERROR_BACKEND_REQUEST' => 'Ошибка при обращении к backend-сервису',
    'TELEGRAM_APPROVAL_ERROR_INVALID_URL' => 'Некорректный URL',
    'TELEGRAM_APPROVAL_ERROR_INVALID_TIMEOUT' => 'Некорректное значение таймаута (должно быть от 1 до 168 часов)',
    'TELEGRAM_APPROVAL_VALIDATION_ERRORS' => 'Ошибки валидации',

    // Сообщения о результатах
    'TELEGRAM_APPROVAL_COMPLETED' => 'Согласование завершено. Результат: #RESULT#, ответил: #USER#, комментарий: #COMMENT#',
    'TELEGRAM_APPROVAL_TIMEOUT' => 'Таймаут',
    'TELEGRAM_APPROVAL_TIMEOUT_COMMENT' => 'Время ожидания ответа истекло',
    'TELEGRAM_APPROVAL_TIMEOUT_LOG' => 'Согласование завершено по таймауту',

    // Статусы
    'TELEGRAM_APPROVAL_STATUS_WAITING' => 'Ожидание ответа',
    'TELEGRAM_APPROVAL_STATUS_APPROVED' => 'Согласовано',
    'TELEGRAM_APPROVAL_STATUS_REJECTED' => 'Не согласовано',
    'TELEGRAM_APPROVAL_STATUS_TIMEOUT' => 'Таймаут',

    // Подсказки
    'TELEGRAM_APPROVAL_HINT_APPROVERS' => 'Укажите Telegram ID пользователей. Можно найти через @userinfobot',
    'TELEGRAM_APPROVAL_HINT_MESSAGE' => 'Используйте переменные для персонализации сообщения',
    'TELEGRAM_APPROVAL_HINT_BUTTONS' => 'Текст кнопок будет отображаться в Telegram',
    'TELEGRAM_APPROVAL_HINT_MODE' => 'Выберите подходящий режим для вашего процесса',
    'TELEGRAM_APPROVAL_HINT_TIMEOUT' => 'После истечения времени процесс продолжится автоматически',
    'TELEGRAM_APPROVAL_HINT_BACKEND' => 'Убедитесь, что backend-сервис доступен и настроен',

    // Примеры
    'TELEGRAM_APPROVAL_EXAMPLE_MESSAGE' => 'Требуется согласование документа "{DOCUMENT_TITLE}" (ID: {DOCUMENT_ID}). Создатель: {CREATED_BY}',
    'TELEGRAM_APPROVAL_EXAMPLE_APPROVERS' => '123456789, 987654321',
    'TELEGRAM_APPROVAL_EXAMPLE_BACKEND_URL' => 'https://your-backend-domain.com',

    // Информационные сообщения
    'TELEGRAM_APPROVAL_INFO_SETUP' => 'Для работы Activity необходимо настроить backend-сервис и Telegram Bot',
    'TELEGRAM_APPROVAL_INFO_SECURITY' => 'Секретный ключ должен совпадать с настройками backend-сервиса',
    'TELEGRAM_APPROVAL_INFO_VARIABLES' => 'Переменные будут заменены на реальные значения при отправке',

    // Успешные операции
    'TELEGRAM_APPROVAL_SUCCESS_SENT' => 'Запрос на согласование отправлен',
    'TELEGRAM_APPROVAL_SUCCESS_SAVED' => 'Настройки Activity сохранены',
    'TELEGRAM_APPROVAL_SUCCESS_REGISTERED' => 'Activity успешно зарегистрирован',

    // Предупреждения
    'TELEGRAM_APPROVAL_WARNING_NO_SECRET' => 'Секретный ключ не указан. Связь с backend-сервисом может быть небезопасной',
    'TELEGRAM_APPROVAL_WARNING_LONG_TIMEOUT' => 'Установлен длительный таймаут. Процесс может долго ожидать ответа',
    'TELEGRAM_APPROVAL_WARNING_MANY_APPROVERS' => 'Указано много согласантов. Это может замедлить процесс',

    // Помощь
    'TELEGRAM_APPROVAL_HELP_TITLE' => 'Справка по настройке',
    'TELEGRAM_APPROVAL_HELP_APPROVERS' => 'Telegram ID можно получить, написав боту @userinfobot',
    'TELEGRAM_APPROVAL_HELP_BACKEND' => 'Backend-сервис должен быть доступен по указанному URL',
    'TELEGRAM_APPROVAL_HELP_SECRET' => 'Секретный ключ используется для подписи запросов',
    'TELEGRAM_APPROVAL_HELP_MODE' => 'Режим "ждать всех" требует ответа от каждого согласанта',
    'TELEGRAM_APPROVAL_HELP_TIMEOUT' => 'При таймауте процесс продолжается с результатом "Таймаут"',

    // Кнопки
    'TELEGRAM_APPROVAL_BUTTON_SAVE' => 'Сохранить',
    'TELEGRAM_APPROVAL_BUTTON_CANCEL' => 'Отмена',
    'TELEGRAM_APPROVAL_BUTTON_TEST' => 'Тест',
    'TELEGRAM_APPROVAL_BUTTON_HELP' => 'Справка',

    // Тестирование
    'TELEGRAM_APPROVAL_TEST_TITLE' => 'Тестирование Activity',
    'TELEGRAM_APPROVAL_TEST_SENDING' => 'Отправка тестового запроса...',
    'TELEGRAM_APPROVAL_TEST_SUCCESS' => 'Тестовый запрос отправлен успешно',
    'TELEGRAM_APPROVAL_TEST_ERROR' => 'Ошибка при отправке тестового запроса: ',
    'TELEGRAM_APPROVAL_TEST_CONNECTION' => 'Проверка соединения с backend-сервисом...',
    'TELEGRAM_APPROVAL_TEST_CONNECTION_SUCCESS' => 'Соединение с backend-сервисом установлено',
    'TELEGRAM_APPROVAL_TEST_CONNECTION_ERROR' => 'Не удалось подключиться к backend-сервису',

    // Логирование
    'TELEGRAM_APPROVAL_LOG_STARTED' => 'Activity "Согласование через Telegram" запущен',
    'TELEGRAM_APPROVAL_LOG_SENT' => 'Запрос на согласование отправлен согласантам: ',
    'TELEGRAM_APPROVAL_LOG_RECEIVED' => 'Получен ответ от согласанта: ',
    'TELEGRAM_APPROVAL_LOG_COMPLETED' => 'Согласование завершено с результатом: ',
    'TELEGRAM_APPROVAL_LOG_ERROR' => 'Ошибка в Activity: ',
    'TELEGRAM_APPROVAL_LOG_TIMEOUT' => 'Согласование завершено по таймауту',

    // Настройки по умолчанию
    'TELEGRAM_APPROVAL_DEFAULT_TITLE' => 'Согласование документа',
    'TELEGRAM_APPROVAL_DEFAULT_MESSAGE' => 'Требуется ваше согласование документа "{DOCUMENT_TITLE}"',
    'TELEGRAM_APPROVAL_DEFAULT_BUTTON_APPROVE' => 'Согласовано',
    'TELEGRAM_APPROVAL_DEFAULT_BUTTON_REJECT' => 'Не согласовано',
    'TELEGRAM_APPROVAL_DEFAULT_TIMEOUT' => '24',
];

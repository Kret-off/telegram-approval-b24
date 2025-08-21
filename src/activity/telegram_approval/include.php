<?php
/**
 * Кастомное Activity «Согласование через Telegram» для Битрикс24
 * 
 * @package TelegramApproval
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Loader;
use Bitrix\Main\Localization\Loc;

// Подключаем локализацию
Loc::loadMessages(__FILE__);

// Проверяем, что модуль бизнес-процессов подключен
if (!Loader::includeModule('bizproc')) {
    return;
}

// Регистрируем Activity
CBPDocument::RegisterActivity(
    'TelegramApprovalActivity',
    [
        'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_ACTIVITY_NAME'),
        'DESCRIPTION' => Loc::getMessage('TELEGRAM_APPROVAL_ACTIVITY_DESCRIPTION'),
        'TYPE' => 'activity',
        'CLASS' => 'TelegramApprovalActivity',
        'JSCLASS' => 'TelegramApprovalActivity',
        'CATEGORY' => [
            'ID' => 'document',
            'OWN_ID' => 'custom',
            'OWN_NAME' => Loc::getMessage('TELEGRAM_APPROVAL_CATEGORY_NAME'),
        ],
        'RETURN' => [
            'RESULT_CODE' => [
                'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_RESULT_CODE'),
                'TYPE' => 'string',
            ],
            'RESULT_LABEL' => [
                'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_RESULT_LABEL'),
                'TYPE' => 'string',
            ],
            'COMMENT' => [
                'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_COMMENT'),
                'TYPE' => 'string',
            ],
            'RESPONDED_BY' => [
                'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_RESPONDED_BY'),
                'TYPE' => 'string',
            ],
            'RESPONDED_AT' => [
                'NAME' => Loc::getMessage('TELEGRAM_APPROVAL_RESPONDED_AT'),
                'TYPE' => 'datetime',
            ],
        ],
    ]
);

// Подключаем основной класс Activity
require_once __DIR__ . '/lib/activity.php';

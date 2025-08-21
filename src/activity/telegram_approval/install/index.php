<?php
use Bitrix\Main\ModuleManager;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

class TelegramApprovalActivity extends CModule
{
    public $MODULE_ID = 'telegram.approval';
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;

    public function __construct()
    {
        $this->MODULE_NAME = 'Telegram Approval Activity';
        $this->MODULE_DESCRIPTION = 'Activity для согласования задач через Telegram';
        $this->MODULE_VERSION = '1.0.0';
        $this->MODULE_VERSION_DATE = '2024-12-21 00:00:00';
    }

    public function DoInstall()
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallActivity();
        $this->InstallOptions();
    }

    public function DoUninstall()
    {
        $this->UnInstallActivity();
        $this->UnInstallOptions();
        ModuleManager::unRegisterModule($this->MODULE_ID);
    }

    private function InstallActivity()
    {
        // Регистрируем Activity в системе
        $activity = array(
            'NAME' => 'TelegramApprovalActivity',
            'TITLE' => 'Согласование через Telegram',
            'DESCRIPTION' => 'Отправляет задачу на согласование в Telegram',
            'CLASS' => 'Bitrix\Bizproc\Activity\TelegramApprovalActivity',
            'JSCLASS' => 'BizProcActivity',
            'CATEGORY' => array(
                'ID' => 'other'
            ),
            'RETURN' => array(
                'Success' => array(
                    'NAME' => 'Успешно',
                    'TYPE' => 'bool'
                )
            )
        );

        \Bitrix\Bizproc\Activity\ActivityManager::registerActivity($activity);
    }

    private function UnInstallActivity()
    {
        \Bitrix\Bizproc\Activity\ActivityManager::unregisterActivity('TelegramApprovalActivity');
    }

    private function InstallOptions()
    {
        // Устанавливаем настройки по умолчанию
        \Bitrix\Main\Config\Option::set($this->MODULE_ID, 'api_token', '');
        \Bitrix\Main\Config\Option::set($this->MODULE_ID, 'cloud_app_url', 'https://telegram-approval-b2411.vercel.app');
    }

    private function UnInstallOptions()
    {
        \Bitrix\Main\Config\Option::delete($this->MODULE_ID, array('api_token', 'cloud_app_url'));
    }
}

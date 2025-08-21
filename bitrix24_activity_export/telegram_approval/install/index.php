<?php
/**
 * Скрипт установки Activity «Согласование через Telegram»
 * 
 * @package TelegramApproval
 * @version 1.0.0
 */

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Loader;
use Bitrix\Main\Localization\Loc;

// Подключаем локализацию
Loc::loadMessages(__FILE__);

/**
 * Класс установки Activity
 */
class TelegramApprovalInstaller
{
    /**
     * @var string Путь к модулю
     */
    private $modulePath;

    /**
     * @var array Результаты установки
     */
    private $results = [];

    /**
     * Конструктор
     */
    public function __construct()
    {
        $this->modulePath = __DIR__ . '/../';
    }

    /**
     * Установка Activity
     * 
     * @return bool Результат установки
     */
    public function install()
    {
        try {
            $this->results = [];

            // Проверяем требования
            if (!$this->checkRequirements()) {
                return false;
            }

            // Копируем файлы
            if (!$this->copyFiles()) {
                return false;
            }

            // Регистрируем Activity
            if (!$this->registerActivity()) {
                return false;
            }

            // Создаем настройки
            if (!$this->createSettings()) {
                return false;
            }

            // Проверяем установку
            if (!$this->verifyInstallation()) {
                return false;
            }

            $this->results[] = [
                'type' => 'success',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_SUCCESS')
            ];

            return true;

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Удаление Activity
     * 
     * @return bool Результат удаления
     */
    public function uninstall()
    {
        try {
            $this->results = [];

            // Удаляем регистрацию Activity
            if (!$this->unregisterActivity()) {
                return false;
            }

            // Удаляем настройки
            if (!$this->removeSettings()) {
                return false;
            }

            // Удаляем файлы
            if (!$this->removeFiles()) {
                return false;
            }

            $this->results[] = [
                'type' => 'success',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_UNINSTALL_SUCCESS')
            ];

            return true;

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Проверка требований
     * 
     * @return bool Результат проверки
     */
    private function checkRequirements()
    {
        // Проверяем версию Битрикс24
        if (!defined('SM_VERSION')) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_BITRIX_VERSION')
            ];
            return false;
        }

        // Проверяем модуль бизнес-процессов
        if (!Loader::includeModule('bizproc')) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_BIZPROC_MODULE')
            ];
            return false;
        }

        // Проверяем права доступа
        if (!$this->checkPermissions()) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_PERMISSIONS')
            ];
            return false;
        }

        $this->results[] = [
            'type' => 'info',
            'message' => Loc::getMessage('TELEGRAM_APPROVAL_CHECK_REQUIREMENTS_SUCCESS')
        ];

        return true;
    }

    /**
     * Проверка прав доступа
     * 
     * @return bool Результат проверки
     */
    private function checkPermissions()
    {
        global $USER;

        if (!$USER->IsAdmin()) {
            return false;
        }

        return true;
    }

    /**
     * Копирование файлов
     * 
     * @return bool Результат копирования
     */
    private function copyFiles()
    {
        $sourcePath = $this->modulePath;
        $targetPath = $_SERVER['DOCUMENT_ROOT'] . '/local/activities/telegram_approval/';

        // Создаем папку назначения
        if (!is_dir($targetPath)) {
            if (!mkdir($targetPath, 0755, true)) {
                $this->results[] = [
                    'type' => 'error',
                    'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_CREATE_DIR', ['#PATH#' => $targetPath])
                ];
                return false;
            }
        }

        // Копируем файлы
        $files = [
            'include.php',
            'lib/activity.php',
            'lib/form.php',
            'lang/ru/telegram_approval.php'
        ];

        foreach ($files as $file) {
            $sourceFile = $sourcePath . $file;
            $targetFile = $targetPath . $file;

            // Создаем папки для файла
            $targetDir = dirname($targetFile);
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // Копируем файл
            if (!copy($sourceFile, $targetFile)) {
                $this->results[] = [
                    'type' => 'error',
                    'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_COPY_FILE', ['#FILE#' => $file])
                ];
                return false;
            }
        }

        $this->results[] = [
            'type' => 'info',
            'message' => Loc::getMessage('TELEGRAM_APPROVAL_COPY_FILES_SUCCESS')
        ];

        return true;
    }

    /**
     * Регистрация Activity
     * 
     * @return bool Результат регистрации
     */
    private function registerActivity()
    {
        try {
            // Подключаем файл с регистрацией
            $activityFile = $_SERVER['DOCUMENT_ROOT'] . '/local/activities/telegram_approval/include.php';
            
            if (file_exists($activityFile)) {
                include_once $activityFile;
                
                $this->results[] = [
                    'type' => 'info',
                    'message' => Loc::getMessage('TELEGRAM_APPROVAL_REGISTER_ACTIVITY_SUCCESS')
                ];
                
                return true;
            } else {
                $this->results[] = [
                    'type' => 'error',
                    'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_ACTIVITY_FILE_NOT_FOUND')
                ];
                return false;
            }

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_REGISTER_ACTIVITY') . ': ' . $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Создание настроек
     * 
     * @return bool Результат создания
     */
    private function createSettings()
    {
        try {
            // Создаем настройки в базе данных
            $settings = [
                'BACKEND_URL' => '',
                'BACKEND_SECRET' => '',
                'DEFAULT_TIMEOUT' => 24,
                'DEFAULT_MODE' => 'single',
                'ENABLE_LOGGING' => true,
            ];

            foreach ($settings as $key => $value) {
                \COption::SetOptionString('telegram_approval', $key, $value);
            }

            $this->results[] = [
                'type' => 'info',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_CREATE_SETTINGS_SUCCESS')
            ];

            return true;

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_CREATE_SETTINGS') . ': ' . $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Проверка установки
     * 
     * @return bool Результат проверки
     */
    private function verifyInstallation()
    {
        // Проверяем наличие файлов
        $files = [
            '/local/activities/telegram_approval/include.php',
            '/local/activities/telegram_approval/lib/activity.php',
            '/local/activities/telegram_approval/lib/form.php',
            '/local/activities/telegram_approval/lang/ru/telegram_approval.php'
        ];

        foreach ($files as $file) {
            if (!file_exists($_SERVER['DOCUMENT_ROOT'] . $file)) {
                $this->results[] = [
                    'type' => 'error',
                    'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_FILE_NOT_FOUND', ['#FILE#' => $file])
                ];
                return false;
            }
        }

        // Проверяем регистрацию Activity
        if (!class_exists('TelegramApprovalActivity')) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_ACTIVITY_CLASS_NOT_FOUND')
            ];
            return false;
        }

        $this->results[] = [
            'type' => 'info',
            'message' => Loc::getMessage('TELEGRAM_APPROVAL_VERIFY_INSTALLATION_SUCCESS')
        ];

        return true;
    }

    /**
     * Удаление регистрации Activity
     * 
     * @return bool Результат удаления
     */
    private function unregisterActivity()
    {
        try {
            // Удаляем регистрацию Activity из системы
            // В Битрикс24 нет прямого API для удаления Activity,
            // поэтому просто удаляем файлы

            $this->results[] = [
                'type' => 'info',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_UNREGISTER_ACTIVITY_SUCCESS')
            ];

            return true;

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_UNREGISTER_ACTIVITY') . ': ' . $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Удаление настроек
     * 
     * @return bool Результат удаления
     */
    private function removeSettings()
    {
        try {
            // Удаляем настройки из базы данных
            $settings = [
                'BACKEND_URL',
                'BACKEND_SECRET',
                'DEFAULT_TIMEOUT',
                'DEFAULT_MODE',
                'ENABLE_LOGGING',
            ];

            foreach ($settings as $key) {
                \COption::RemoveOption('telegram_approval', $key);
            }

            $this->results[] = [
                'type' => 'info',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_REMOVE_SETTINGS_SUCCESS')
            ];

            return true;

        } catch (Exception $e) {
            $this->results[] = [
                'type' => 'error',
                'message' => Loc::getMessage('TELEGRAM_APPROVAL_ERROR_REMOVE_SETTINGS') . ': ' . $e->getMessage()
            ];
            return false;
        }
    }

    /**
     * Удаление файлов
     * 
     * @return bool Результат удаления
     */
    private function removeFiles()
    {
        $targetPath = $_SERVER['DOCUMENT_ROOT'] . '/local/activities/telegram_approval/';

        if (is_dir($targetPath)) {
            $this->removeDirectory($targetPath);
        }

        $this->results[] = [
            'type' => 'info',
            'message' => Loc::getMessage('TELEGRAM_APPROVAL_REMOVE_FILES_SUCCESS')
        ];

        return true;
    }

    /**
     * Рекурсивное удаление папки
     * 
     * @param string $dir Путь к папке
     */
    private function removeDirectory($dir)
    {
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file != "." && $file != "..") {
                    $path = $dir . '/' . $file;
                    if (is_dir($path)) {
                        $this->removeDirectory($path);
                    } else {
                        unlink($path);
                    }
                }
            }
            rmdir($dir);
        }
    }

    /**
     * Получение результатов
     * 
     * @return array Результаты
     */
    public function getResults()
    {
        return $this->results;
    }

    /**
     * Получение HTML отчета
     * 
     * @return string HTML отчет
     */
    public function getHtmlReport()
    {
        $html = '<div class="telegram-approval-install-report">';
        $html .= '<h3>' . Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_REPORT') . '</h3>';
        
        foreach ($this->results as $result) {
            $class = 'alert-' . ($result['type'] === 'error' ? 'danger' : ($result['type'] === 'success' ? 'success' : 'info'));
            $html .= '<div class="alert ' . $class . '">' . htmlspecialchars($result['message']) . '</div>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
}

// Обработка запроса установки/удаления
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $installer = new TelegramApprovalInstaller();
    
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'install':
                $success = $installer->install();
                break;
            case 'uninstall':
                $success = $installer->uninstall();
                break;
            default:
                $success = false;
        }
        
        echo json_encode([
            'success' => $success,
            'results' => $installer->getResults(),
            'html' => $installer->getHtmlReport()
        ]);
        exit;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?= Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_TITLE') ?></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .btn { padding: 10px 20px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }
        .alert { padding: 15px; margin: 10px 0; border-radius: 4px; }
        .alert-success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .alert-danger { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-info { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .install-report { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?= Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_TITLE') ?></h1>
        <p><?= Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_DESCRIPTION') ?></p>
        
        <div>
            <button class="btn btn-primary" onclick="installActivity()">
                <?= Loc::getMessage('TELEGRAM_APPROVAL_INSTALL_BUTTON') ?>
            </button>
            <button class="btn btn-danger" onclick="uninstallActivity()">
                <?= Loc::getMessage('TELEGRAM_APPROVAL_UNINSTALL_BUTTON') ?>
            </button>
        </div>
        
        <div id="report" class="install-report"></div>
    </div>

    <script>
        function installActivity() {
            performAction('install');
        }
        
        function uninstallActivity() {
            if (confirm('<?= Loc::getMessage('TELEGRAM_APPROVAL_UNINSTALL_CONFIRM') ?>')) {
                performAction('uninstall');
            }
        }
        
        function performAction(action) {
            var formData = new FormData();
            formData.append('action', action);
            
            fetch('', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('report').innerHTML = data.html;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_REQUEST') ?>');
            });
        }
    </script>
</body>
</html>

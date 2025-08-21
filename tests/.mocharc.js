module.exports = {
  // Временные ограничения
  timeout: 30000,
  slow: 5000,

  // Репортеры
  reporter: 'spec',
  'reporter-option': [
    'mochaFile=./tests/reports/results.xml',
    'toConsole=true',
  ],

  // Цвета в выводе
  colors: true,

  // Параллельное выполнение
  parallel: false,
  jobs: 1,

  // Повторные попытки для неудачных тестов
  retries: 1,

  // Исключения
  ignore: [
    'node_modules/**',
    'coverage/**',
    'tests/reports/**',
    'tests/logs/**',
  ],

  // Расширения файлов
  extension: ['js'],

  // Рекурсивный поиск
  recursive: true,

  // Сортировка тестов
  sort: false,

  // Выход при первой ошибке
  bail: false,

  // Подробный вывод
  verbose: true,

  // Глобальные переменные
  globals: [
    'expect',
    'sinon',
    'chai',
  ],

  // Require файлы
  require: [
    'chai/register-expect',
    'sinon-chai',
    './tests/test-setup.js',
  ],

  // Настройки для разных окружений
  env: {
    NODE_ENV: 'test',
  },
};

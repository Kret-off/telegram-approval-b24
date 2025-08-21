#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Конфигурация
const config = {
  testDir: path.join(__dirname),
  reportsDir: path.join(__dirname, 'reports'),
  logsDir: path.join(__dirname, 'logs'),
  mochaConfig: path.join(__dirname, '.mocharc.js'),
};

// Создание директорий если не существуют
function ensureDirectories() {
  [config.reportsDir, config.logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Запуск команды
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Запуск: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Команда завершена успешно: ${command}`);
        resolve();
      } else {
        console.error(`❌ Команда завершена с ошибкой (код ${code}): ${command}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Ошибка запуска команды: ${error.message}`);
      reject(error);
    });
  });
}

// Запуск тестов
async function runTests(type = 'all', options = {}) {
  ensureDirectories();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(config.reportsDir, `test-report-${timestamp}.json`);
  const logFile = path.join(config.logsDir, `test-log-${timestamp}.log`);

  const mochaArgs = [
    '--config', config.mochaConfig,
    '--reporter', 'spec',
    '--timeout', '30000',
    '--colors',
  ];

  // Добавляем JSON reporter для отчетов
  if (options.report) {
    mochaArgs.push('--reporter', 'mocha-multi-reporters');
    mochaArgs.push('--reporter-option', `configFile=${path.join(__dirname, 'reporter-config.json')}`);
  }

  // Выбираем тесты для запуска
  let testPattern;
  switch (type) {
    case 'unit':
      testPattern = path.join(config.testDir, 'unit', '**/*.test.js');
      break;
    case 'integration':
      testPattern = path.join(config.testDir, 'integration', '**/*.test.js');
      break;
    case 'e2e':
      testPattern = path.join(config.testDir, 'e2e', '**/*.test.js');
      break;
    case 'load':
      testPattern = path.join(config.testDir, 'integration', 'load-test.js');
      break;
    case 'all':
    default:
      testPattern = path.join(config.testDir, '**/*.test.js');
      break;
  }

  mochaArgs.push(testPattern);

  try {
    await runCommand('npx', ['mocha', ...mochaArgs]);
    console.log(`🎉 Тесты типа "${type}" успешно завершены!`);
  } catch (error) {
    console.error(`💥 Тесты типа "${type}" завершились с ошибками`);
    throw error;
  }
}

// Запуск тестов с покрытием
async function runTestsWithCoverage(type = 'all') {
  ensureDirectories();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const coverageDir = path.join(config.reportsDir, 'coverage', timestamp);

  const nycArgs = [
    '--reporter=text',
    '--reporter=html',
    '--reporter=json',
    '--report-dir', coverageDir,
    '--exclude', 'tests/**',
    '--exclude', 'node_modules/**',
    '--exclude', 'coverage/**',
  ];

  let testPattern;
  switch (type) {
    case 'unit':
      testPattern = path.join(config.testDir, 'unit', '**/*.test.js');
      break;
    case 'integration':
      testPattern = path.join(config.testDir, 'integration', '**/*.test.js');
      break;
    case 'e2e':
      testPattern = path.join(config.testDir, 'e2e', '**/*.test.js');
      break;
    case 'all':
    default:
      testPattern = path.join(config.testDir, '**/*.test.js');
      break;
  }

  const mochaArgs = [
    '--config', config.mochaConfig,
    '--reporter', 'spec',
    '--timeout', '30000',
    '--colors',
    testPattern,
  ];

  try {
    await runCommand('npx', ['nyc', ...nycArgs, 'mocha', ...mochaArgs]);
    console.log(`🎉 Тесты с покрытием типа "${type}" успешно завершены!`);
    console.log(`📊 Отчет о покрытии сохранен в: ${coverageDir}`);
  } catch (error) {
    console.error(`💥 Тесты с покрытием типа "${type}" завершились с ошибками`);
    throw error;
  }
}

// Запуск нагрузочного тестирования
async function runLoadTest() {
  console.log('🔥 Запуск нагрузочного тестирования...');
  
  try {
    await runTests('load', { report: true });
    console.log('🎉 Нагрузочное тестирование завершено!');
  } catch (error) {
    console.error('💥 Нагрузочное тестирование завершилось с ошибками');
    throw error;
  }
}

// Запуск тестов безопасности
async function runSecurityTests() {
  console.log('🔒 Запуск тестов безопасности...');
  
  try {
    // Здесь можно добавить специфичные тесты безопасности
    await runTests('integration', { report: true });
    console.log('🎉 Тесты безопасности завершены!');
  } catch (error) {
    console.error('💥 Тесты безопасности завершились с ошибками');
    throw error;
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const options = {
    report: args.includes('--report'),
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
  };

  console.log('🧪 Запуск тестов для Telegram Approval System');
  console.log(`📋 Команда: ${command}`);
  console.log(`⚙️ Опции:`, options);

  try {
    switch (command) {
      case 'unit':
        if (options.coverage) {
          await runTestsWithCoverage('unit');
        } else {
          await runTests('unit', options);
        }
        break;

      case 'integration':
        if (options.coverage) {
          await runTestsWithCoverage('integration');
        } else {
          await runTests('integration', options);
        }
        break;

      case 'e2e':
        if (options.coverage) {
          await runTestsWithCoverage('e2e');
        } else {
          await runTests('e2e', options);
        }
        break;

      case 'load':
        await runLoadTest();
        break;

      case 'security':
        await runSecurityTests();
        break;

      case 'all':
      default:
        if (options.coverage) {
          await runTestsWithCoverage('all');
        } else {
          await runTests('all', options);
        }
        break;
    }

    console.log('🎉 Все тесты успешно завершены!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Тесты завершились с ошибками:', error.message);
    process.exit(1);
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  runTestsWithCoverage,
  runLoadTest,
  runSecurityTests,
};

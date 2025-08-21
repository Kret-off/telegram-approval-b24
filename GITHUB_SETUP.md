# 🔗 Создание GitHub репозитория

## 🎯 Следующие шаги

### 1. Создайте репозиторий на GitHub

1. **Перейдите на [github.com](https://github.com)**
2. **Нажмите "New repository"** (зеленая кнопка)
3. **Заполните форму:**
   - **Repository name:** `telegram-approval-b24`
   - **Description:** `Telegram Approval System for Bitrix24 - Custom Activity for document approval via Telegram`
   - **Visibility:** Public или Private (на ваш выбор)
   - **НЕ ставьте галочки** на "Add a README file", "Add .gitignore", "Choose a license"
4. **Нажмите "Create repository"**

### 2. Подключите локальный репозиторий

После создания репозитория GitHub покажет инструкции. Выполните:

```bash
# Добавьте удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/telegram-approval-b24.git

# Переименуйте ветку в main
git branch -M main

# Загрузите код
git push -u origin main
```

### 3. Проверьте загрузку

1. **Обновите страницу GitHub**
2. **Убедитесь, что все файлы загружены**
3. **Скопируйте URL репозитория** для Render

---

## 🔧 Команды для выполнения

```bash
# Добавьте ваш GitHub username вместо YOUR_USERNAME
git remote add origin https://github.com/YOUR_USERNAME/telegram-approval-b24.git

# Переименуйте ветку
git branch -M main

# Загрузите код
git push -u origin main
```

---

## ✅ После загрузки

1. **Скопируйте URL репозитория** (например: `https://github.com/your-username/telegram-approval-b24`)
2. **Перейдите к деплою на Render** используя инструкцию `QUICK_DEPLOY.md`
3. **Используйте URL репозитория** в настройках Render

---

## 🎉 Готово!

После загрузки в GitHub ваш проект будет готов к деплою на Render!

# 🎮 Bot_Fenrir на HeavenCloud

Полное руководство по развертыванию Bot_Fenrir на хостинге **HeavenCloud**.

## 📋 Требования

- Активный сервер на HeavenCloud
- Node.js 18+ (обычно установлен по умолчанию)
- Discord Bot Token
- Git репозиторий (выполняется автоматически)

## 🚀 Пошаговая установка

### Шаг 1: Скачайте код с GitHub

**Вариант A: Через консоль (РЕКОМЕНДУЕТСЯ)**

1. Откройте **Console** в HeavenCloud
2. Выполните команды:

```bash
cd /home/container

# Удалить старый код (если есть)
rm -rf *

# Клонировать репозиторий
git clone https://github.com/blacktime882/Bot_Fenrir.git .

# Установить зависимости
npm install
```

✅ **Готово!** Git будет инициализирован, и команда `/обновить` будет работать.

**Вариант B: Через File Manager**

1. Скачайте ZIP с GitHub:
   - https://github.com/blacktime882/Bot_Fenrir/archive/refs/heads/main.zip

2. В HeavenCloud откройте **File Manager**

3. Распакуйте ZIP в корневую папку

4. В консоли выполните:
   ```bash
   cd /home/container
   npm install
   ```

⚠️ **Минус:** Команда `/обновить` не будет работать.

---

### Шаг 2: Создайте файл конфигурации

1. В **File Manager** создайте файл `.env` в корневой папке

2. Добавьте в него:

```env
DISCORD_TOKEN=your_bot_token_here
NOTIFY_CHANNEL_ID=your_channel_id
```

**Как получить значения:**

- **DISCORD_TOKEN**: 
  - Перейдите на https://discord.com/developers/applications
  - Выберите ваше приложение
  - Откройте **Bot** → **TOKEN** → Copy

- **NOTIFY_CHANNEL_ID** (опционально):
  - Откройте Discord
  - Нажмите правой кнопкой на канал
  - "Copy Channel ID"
  - Вставьте в `.env`

---

### Шаг 3: Настройка автозапуска

В **HeavenCloud Console** посмотрите текущие настройки:

1. Откройте **Server Settings** → **Startup**

2. Проверьте:
   - **Node Version:** v20+ ✓
   - **Main File:** `index.js` ✓
   - **Command:** `node index.js` ✓

3. Сохраните изменения

---

### Шаг 4: Запустите бота

1. В консоли выполните:

```bash
npm start
```

Или в HeavenCloud нажмите кнопку **START**

2. Проверьте логи:

```
[Bot] Starting Fenrir Bot v2.0
[Bot] Logged in as BotName#0000
[Data] Loaded: 43 tiers, 44056 slots
```

✅ **Бот запущен!**

---

## 🔧 Первичная настройка

После запуска бота:

### 1. Загрузите данные

```bash
node lib/verify-sources.js
```

Должно вывести:
```
✓ Все источники доступны
✓ Все данные загружаются с browse.wf
✓ Нет хардкода данных
```

### 2. Проверьте команды

В Discord напишите:
```
/пинг
```

Бот должен ответить с пингом (например: `🏓 Пинг: 125ms`)

---

## 📁 Структура файлов на HeavenCloud

После установки в `/home/container` должно быть:

```
/home/container/
├── .env                 ⚠️ СОЗДАЙТЕ (содержит TOKEN)
├── .git/                (автоматически при git clone)
├── index.js            (главный файл)
├── package.json
├── package-lock.json
├── README.md
├── lib/
│   ├── data.js
│   ├── embeds.js
│   ├── webhooks.js
│   ├── constants.js
│   └── verify-sources.js
├── commands/
│   ├── arbi.js
│   ├── arbilist.js
│   ├── ping.js
│   ├── help.js
│   └── update.js
└── config/
    └── webhooks.json
```

---

## 📝 Файлы конфигурации

### `.env` (СОЗДАЙТЕ ЭТО)

```env
# Обязательные
DISCORD_TOKEN=your_token_here

# Опциональные
DISCORD_GUILD_ID=guild_id_here
NOTIFY_CHANNEL_ID=channel_id_here
```

### `config/webhooks.json` (опционально)

Для отправки уведомлений в вебхуки:

```json
{
  "webhooks": [
    {
      "name": "notifications",
      "url": "https://discord.com/api/webhooks/...",
      "events": ["arbi"]
    }
  ]
}
```

---

## 🔄 Обновление кода

### Способ 1: Команда в Discord (если используется git clone)

```
/обновить
```

Только администраторы могут использовать эту команду.

### Способ 2: Вручную

1. Откройте **Console** в HeavenCloud

2. Выполните:

```bash
cd /home/container
git pull origin main
npm install
```

3. Перезагрузите сервер

---

## 🆘 Решение проблем

### Проблема 1: "DISCORD_TOKEN not found"

**Решение:**
1. File Manager → Create File → `.env`
2. Добавьте: `DISCORD_TOKEN=your_token`
3. Сохраните
4. Перезагрузите сервер

### Проблема 2: "Cannot find module axios"

**Решение:**
```bash
npm install
```

### Проблема 3: "не a git repository"

Это нормально, если вы использовали ZIP вместо git clone.

**Для включения обновлений:**

```bash
cd /home/container
git init
git remote add origin https://github.com/blacktime882/Bot_Fenrir.git
git fetch origin main
git checkout main
```

### Проблема 4: Бот не отвечает на команды

1. Проверьте логи консоли
2. Убедитесь что:
   - DISCORD_TOKEN правильный
   - Бот имеет права в сервере Discord
   - Команды зарегистрированы (подождите 30 секунд)

3. Перезагрузите сервер

### Проблема 5: "Ошибка обновления: Command failed"

Это означает что код был залит как ZIP (без git).

**Решение:** Используйте git clone (Вариант A выше)

---

## 💡 Полезные команды

Выполняйте в **Console** HeavenCloud:

```bash
# Проверить статус
git status

# Посмотреть последние коммиты
git log --oneline -5

# Обновить код
git pull origin main

# Установить зависимости
npm install

# Проверить версию Node
node --version

# Просмотреть логи
npm start
```

---

## 📊 Мониторинг

### Проверка логов

В HeavenCloud откройте **Console** и смотрите логи:

```
[Bot] Starting...
[Bot] Logged in as ...
[Data] Loaded: 43 tiers, 44056 slots
[Alert Check] Current time: ...
```

### Проверка источников данных

```bash
node lib/verify-sources.js
```

Должны быть **зеленые галочки** (✓) для всех источников.

---

## 🎯 Основные команды бота

После запуска в Discord доступны:

| Команда | Описание |
|---------|----------|
| `/пинг` | Пинг бота |
| `/арбитраж` | Текущий и следующий арбитраж |
| `/арбитраж-список` | Список ближайших арбитражей |
| `/помощь` | Справка по командам |
| `/обновить` | Обновить код (админы) |

---

## 📚 Дополнительная информация

- 📖 [Главная документация](README.md)
- 🚀 [Общее руководство развертывания](DEPLOYMENT.md)
- 📊 [Источники данных](DATA_SOURCES.md)
- 🔍 [Проверка API](VERIFICATION_REPORT.md)
- ❌ [Ошибка Git репозитория](GIT_REPOSITORY_ERROR.md)

---

## 🔗 Полезные ссылки

- **GitHub:** https://github.com/blacktime882/Bot_Fenrir
- **HeavenCloud:** https://control.heavencloud.in
- **Discord Developer:** https://discord.com/developers

---

**Вопросы?** Откройте Issue на GitHub или проверьте логи консоли HeavenCloud.

**Готово!** Ваш Bot_Fenrir работает на HeavenCloud! 🎉

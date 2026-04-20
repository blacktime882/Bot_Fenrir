# 🎮 Bot_Fenrir на HeavenCloud

Полное руководство по развертыванию Bot_Fenrir на хостинге **HeavenCloud**.

## 📋 Требования

- Активный сервер на HeavenCloud
- Node.js 18+ (обычно установлен по умолчанию)
- Discord Bot Token
- Git репозиторий (выполняется автоматически)

## 🚀 Пошаговая установка

### Шаг 1: Скачайте код с GitHub

**Вариант A: Через File Manager (ЕСЛИ КОНСОЛЬ НЕ РАБОТАЕТ)**

1. На твоем компьютере скачай ZIP:
   - https://github.com/blacktime882/Bot_Fenrir/archive/refs/heads/main.zip

2. Распакуй ZIP локально (на компьютере)

3. В HeavenCloud откройте **File Manager** → корневая папка

4. Загрузи **все файлы** из распакованной папки:
   - `index.js`
   - `package.json`
   - Папка `lib/` (со всеми файлами)
   - Папка `commands/` (со всеми файлами)
   - Папка `config/`
   - README.md и другие файлы

5. **Готово!** Файлы загружены

⚠️ **Минус:** Команда `/обновить` не будет работать и нужно будет обновлять вручную.

**Вариант B: Через консоль (если консоль работает)**

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

---

### Шаг 1.5: Установите зависимости (ЕСЛИ КОНСОЛЬ НЕ РАБОТАЕТ)

⚠️ Если ты загрузил файлы через File Manager, нужно установить npm зависимости.

**Способ 1: Через File Manager (если консоль не работает)**

1. В HeavenCloud **File Manager** перейди в папку `/home/container`

2. Убедись что там есть файл `package.json`

3. Попробуй нажать **STOP** и потом **START** сервер

   HeavenCloud автоматически выполнит `npm install` при запуске (если видит package.json)

4. Проверь логи — должно быть:
   ```
   npm install
   [список установленных пакетов]
   ```

**Способ 2: Создать скрипт установки**

Если автоматическая установка не сработала:

1. В File Manager создай файл `setup.sh`

2. Содержимое:
   ```bash
   #!/bin/bash
   cd /home/container
   npm install
   ```

3. Но это может не сработать без консоли...

**Решение если ничего не работает:**

Свяжись с поддержкой HeavenCloud — они могут помочь запустить `npm install` вручную.

---

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

### Шаг 3: Настройка переменных окружения (ВАЖНО!)

⚠️ **ЭТО САМОЕ ВАЖНОЕ! Если это не сделать, бот не запустится!**

В **HeavenCloud** откройте **Server Settings** и установите переменные:

#### В разделе "Startup" или "Environment Variables":

```
MAIN_FILE=index.js
NODE_ARGS=
```

#### ИЛИ если вы видите такой интерфейс:

1. Откройте **Server Settings** → **Startup**
2. Найдите поле **"Main File"** или **"MAIN_FILE"**
3. Установите значение: `index.js`
4. Сохраните

#### ИЛИ установите через консоль:

```bash
export MAIN_FILE=index.js
```

**Проверьте что установлено:**

```bash
echo $MAIN_FILE
```

Должно вывести: `index.js`

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

### Проблема 6: "Cannot find module './index.js'" (Crash loop)

**Это самая частая проблема на HeavenCloud!**

Ошибка:
```
Error: Cannot find module './index.js'
```

**Причина:** Переменная `MAIN_FILE` не установлена или установлена неправильно.

**Решение:**

1. Откройте **Server Settings** в HeavenCloud

2. Найдите раздел "Startup" или "Environment Variables"

3. Установите переменную:
   ```
   MAIN_FILE=index.js
   ```

4. Сохраните и перезагрузите сервер

5. Если нет такого поля, выполните в консоли:
   ```bash
   export MAIN_FILE=index.js
   ```

6. Запустите сервер

**Проверьте:** В консоли должно появиться:
```
[Bot] Starting Fenrir Bot v2.0
[Bot] Logged in as ...
```

### Проблема 7: Crash loop - сервер падает за 60 секунд

Это происходит когда:
- `MAIN_FILE` не установлен → Cannot find module
- `.env` файл не создан → DISCORD_TOKEN not found
- Зависимости не установлены → Cannot find module axios

**Решение - проверьте по порядку:**

1. ✅ Переменная `MAIN_FILE=index.js` установлена
2. ✅ Файл `.env` создан с `DISCORD_TOKEN`
3. ✅ Выполнена команда `npm install`
4. ✅ Перезагрузите сервер (START)

### Проблема 8: Консоль HeavenCloud не принимает команды

**Признаки:**
- Консоль открывается но команды не выполняются
- Нет поля ввода внизу
- Логи видны но команды не работают

**Причины:**
- Проблема с браузером (консоль HeavenCloud может быть нестабильна)
- JavaScript отключен
- Расширения браузера блокируют консоль
- WebSocket соединение заблокировано

**Решение:**

1. **Используй File Manager вместо консоли:**
   - Скачай ZIP: https://github.com/blacktime882/Bot_Fenrir/archive/refs/heads/main.zip
   - Распакуй на компьютере
   - В HeavenCloud File Manager загрузи все файлы

2. **Установи зависимости:**
   - Нажми STOP → START на сервере
   - HeavenCloud автоматически выполнит `npm install`
   - Проверь логи

3. **Если всё ещё не работает:**
   - Попробуй другой браузер
   - Отключи расширения браузера
   - Очисти кэш (Ctrl+Shift+Del)
   - Свяжись с поддержкой HeavenCloud

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

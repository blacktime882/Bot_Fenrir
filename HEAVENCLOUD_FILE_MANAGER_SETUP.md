# 📁 HeavenCloud - Установка через File Manager

## 🎯 Если консоль HeavenCloud не работает

Используй этот способ для установки бота через **File Manager** (браузерный файловый менеджер HeavenCloud).

---

## 📥 Шаг 1: Скачай код на компьютер

1. Перейди на GitHub:
   - https://github.com/blacktime882/Bot_Fenrir

2. Нажми зелёную кнопку **"Code"** → **"Download ZIP"**

3. Распакуй ZIP на твоём компьютере (используй WinRAR, 7-Zip, или встроенный архиватор)

4. Получится папка: `Bot_Fenrir-main/`

---

## 🌐 Шаг 2: Откройте File Manager в HeavenCloud

1. Откройте https://control.heavencloud.in

2. Выберите свой сервер

3. Нажмите **File Manager** в левом меню

4. Вы должны быть в папке `/home/container`

---

## ⬆️ Шаг 3: Загрузи файлы бота

**Вариант A: Через браузер (медленнее)**

1. В File Manager нажми кнопку **"Upload"** или **"+ Add File"**

2. Выбери файлы из распакованной папки `Bot_Fenrir-main/`:
   - `index.js`
   - `package.json`
   - `package-lock.json`
   - `README.md`
   - `.env.example` (переименуешь позже)

3. Загрузи папки:
   - Нажми **"Create Folder"** → назови `lib`
   - Загрузи в неё файлы: `data.js`, `embeds.js`, `webhooks.js`, `constants.js`, `verify-sources.js`
   
   - Нажми **"Create Folder"** → назови `commands`
   - Загрузи в неё файлы: `arbi.js`, `arbilist.js`, `ping.js`, `help.js`, `update.js`
   
   - Нажми **"Create Folder"** → назови `config`
   - Загрузи в неё файл: `webhooks.json`

**Вариант B: Через архив (быстрее)**

1. Нажми **"Upload"** в File Manager

2. Загрузи **всю папку** `Bot_Fenrir-main.zip` (не распаковывая)

3. Нажми правой кнопкой на ZIP → **"Extract"**

4. Получится папка `Bot_Fenrir-main/`

5. Перемести **ВСЕ файлы** из `Bot_Fenrir-main/` в `/home/container/`:
   - Выдели все файлы в папке
   - Cut → Paste в `/home/container/`

6. Удали пустую папку `Bot_Fenrir-main/`

---

## 🔧 Шаг 4: Создай файл .env

1. В File Manager (в папке `/home/container`)

2. Нажми **"Create File"** или **"+ New File"**

3. Назови файл: `.env`

4. Открой его двойным кликком или нажми "Edit"

5. Добавь содержимое:

```
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
NOTIFY_CHANNEL_ID=YOUR_CHANNEL_ID
```

**Где получить токен:**
- Перейди на https://discord.com/developers/applications
- Выбери свое приложение
- Нажми **Bot** → скопируй **TOKEN**
- Вставь в `.env`

6. **Сохрани** файл (обычно Ctrl+S)

---

## ⚙️ Шаг 5: Настройи переменные сервера

1. Вернись на HeavenCloud главную

2. Откройте **Server Settings**

3. Найди раздел **"Startup"** или **"Environment Variables"**

4. Установи:
   ```
   MAIN_FILE=index.js
   ```

5. **Сохрани** изменения

---

## 🚀 Шаг 6: Запусти сервер

1. Нажми кнопку **STOP** (если сервер запущен)

2. Ждай пока сервер остановится

3. Нажми кнопку **START**

4. ⏳ Ждите 5-10 секунд

5. HeavenCloud автоматически выполнит `npm install` (если видит package.json)

---

## ✅ Шаг 7: Проверь что всё работает

1. Откройте **Console** в HeavenCloud

2. Смотрите логи - должно быть:

```
Node.js Version: v20.x.x
npm install
npm notice
[... список установленных пакетов ...]
[Bot] Starting Fenrir Bot v2.0
[Bot] Logged in as YourBotName#0000
[Data] Loaded: 43 tiers, 44056 slots
```

3. Если видишь это - **ВСЁ РАБОТАЕТ!** ✅

---

## 📋 Структура папок после загрузки

Проверь что в `/home/container/` есть:

```
index.js              ← главный файл
package.json          ← зависимости
.env                  ← конфиг (ТЫ ЭТО СОЗДАЛ)
lib/                  ← папка
  data.js
  embeds.js
  webhooks.js
  constants.js
  verify-sources.js
commands/             ← папка
  arbi.js
  arbilist.js
  ping.js
  help.js
  update.js
config/               ← папка
  webhooks.json
```

Если что-то не хватает - загрузи вручную в File Manager.

---

## 🆘 Проблемы

### "npm install не выполнилась"

Если сервер запустился но `npm install` не выполнилась:

1. Убедись что в файловой системе есть `package.json`
2. Перезагрузи сервер (STOP → START)
3. Если не помогает - свяжись с поддержкой HeavenCloud

### "Cannot find module ./index.js"

- Проверь что `MAIN_FILE=index.js` установлена в Server Settings
- Перезагрузи сервер

### "Cannot find module axios"

- `npm install` не выполнилась
- Попробуй перезагрузить сервер (STOP → START)

### "DISCORD_TOKEN not found"

- Создай файл `.env` как описано в Шаг 4
- Вставь реальный токен
- Перезагрузи сервер

---

## 🎯 Что дальше?

После успешного запуска:

1. Проверь команды в Discord:
   ```
   /пинг
   ```

2. Бот должен ответить пингом

3. Готово! 🎉

---

## 📚 Документация

- 📖 [Основное руководство HeavenCloud](HEAVENCLOUD_SETUP.md)
- ⚡ [Быстрый старт](QUICKSTART_HEAVENCLOUD.md)
- 🔴 [Решение crash loop](HEAVENCLOUD_CRASH_LOOP_FIX.md)
- 🚀 [Общее руководство развертывания](DEPLOYMENT.md)

---

**Всё работает?** Отлично! 🎉

# 🔴 HEAVENCLOUD: Cannot find module './index.js' - Решение

## ❌ Вы видите эту ошибку?

```
Error: Cannot find module './index.js'
Require stack:
- /home/container/imaginaryUncacheableRequireResolveScript
```

И сервер в **Crash Loop** (падает каждые 60 секунд)?

## 🔍 Почему это происходит?

HeavenCloud использует переменную окружения `${MAIN_FILE}` чтобы запустить приложение.

Команда запуска:
```bash
if [[ "${MAIN_FILE}" == "*.js" ]]; then 
  /usr/local/bin/node "/home/container/${MAIN_FILE}" ${NODE_ARGS}
else 
  /usr/local/bin/ts-node --esm "/home/container/${MAIN_FILE}" ${NODE_ARGS}
fi
```

**Проблема:** Если `MAIN_FILE` пуста или неправильна, Node.js не может найти файл!

## ✅ РЕШЕНИЕ

### Способ 1: Через Server Settings (РЕКОМЕНДУЕТСЯ)

1. Откройте **Server Settings** в HeavenCloud (левое меню)

2. Найдите раздел **"Startup"** или **"Environment Variables"**

3. Найдите поле **"MAIN_FILE"** или **"Main File"**

4. Установите значение:
   ```
   index.js
   ```

5. **Сохраните** изменения

6. Нажмите **Restart** (или **Stop** → **START**)

7. Проверьте консоль - должно быть:
   ```
   [Bot] Starting Fenrir Bot v2.0
   [Bot] Logged in as ...
   ```

### Способ 2: Через Console

Если вы не нашли поле MAIN_FILE в Settings:

1. Откройте **Console**

2. Выполните:
   ```bash
   export MAIN_FILE=index.js
   npm start
   ```

3. Бот должен запуститься

### Способ 3: Проверка

В консоли HeavenCloud выполните:

```bash
# Проверить текущее значение
echo "MAIN_FILE is: $MAIN_FILE"

# Проверить что файл существует
ls -la /home/container/index.js

# Установить и запустить
export MAIN_FILE=index.js
npm start
```

## 🧪 Полная проверка

Выполните ВСЕ эти шаги по порядку:

```bash
# 1. Перейти в правильную папку
cd /home/container

# 2. Проверить что файл index.js есть
ls -la index.js
# Должно быть: -rw-r--r-- 1 container container ... index.js

# 3. Проверить что .env существует
ls -la .env
# Должно быть: -rw-r--r-- 1 container container ... .env

# 4. Проверить что node_modules установлены
ls -la node_modules | head -5
# Должно быть: список папок модулей

# 5. Установить MAIN_FILE
export MAIN_FILE=index.js

# 6. Проверить что MAIN_FILE установлена
echo $MAIN_FILE
# Должно вывести: index.js

# 7. Попробовать запустить напрямую
node index.js
```

Если всё работает - нажмите **Ctrl+C** чтобы остановить, потом нажмите **START** в HeavenCloud.

## 📋 Чек-лист перед запуском

- ✅ `MAIN_FILE=index.js` установлена в Settings или консоли
- ✅ Файл `/home/container/index.js` существует
- ✅ Файл `/home/container/.env` создан с `DISCORD_TOKEN`
- ✅ Папка `/home/container/node_modules` существует (выполнена `npm install`)
- ✅ Сервер перезагружен (**STOP** → **START**)

## 🚀 Если всё в порядке

Нажмите **START** в HeavenCloud и проверьте консоль:

**Должно быть:**
```
Node.js Version: v20.20.2
[Bot] Starting Fenrir Bot v2.0 - Auto-update test
[Bot] Logged in as YourBotName#0000
[Data] Loaded: 43 tiers, 44056 slots
```

**НЕ должно быть:**
```
Error: Cannot find module
crash loop
Aborting automatic restart
```

## 🎯 Что дальше?

После успешного запуска:

1. Проверьте в Discord:
   ```
   /пинг
   ```

2. Бот должен ответить пингом

3. Готово! 🎉

---

## 💡 Советы

- **Переменные сохраняются только в текущей сессии консоли.** Используйте Server Settings для постоянного хранения!
- **Crash loop = что-то не так.** Проверьте:
  - MAIN_FILE установлена?
  - .env файл создан?
  - npm install выполнена?
  - Нет синтаксических ошибок в коде?

- **Логи помогают.** Смотрите Console в HeavenCloud для деталей ошибки

---

## 🔗 Полезные ссылки

- 📖 [QUICKSTART_HEAVENCLOUD.md](QUICKSTART_HEAVENCLOUD.md) - Быстрая установка
- 📖 [HEAVENCLOUD_SETUP.md](HEAVENCLOUD_SETUP.md) - Полное руководство
- 🐙 [GitHub](https://github.com/blacktime882/Bot_Fenrir)

**Не работает?** Проверьте что все пункты в чек-листе выполнены, и перезагрузите сервер!

# Bot_Fenrir

Discord бот для отслеживания Arbitration (Арбитраж) в игре Warframe.

## 🎮 Функции

- `/арбитраж` - Показывает текущий и следующий арбитраж
- `/арбитраж-список` - Список ближайших арбитражей (до 25 штук)
- `/пинг` - Проверка пинга бота
- `/помощь` - Список всех команд
- `/обновить` - Обновить код бота (только для администраторов)

## 📊 Источники данных

**⚠️ ВАЖНО:** Все данные об арбитражах загружаются **в реальном времени с browse.wf**, без хардкода!

Источники:
- 🌐 **ExportRegions.json** - информация о локациях и типах врагов
- 🌐 **dict.ru.json** - русские переводы
- 🌐 **arbyTiers.js** - ярусы сложности арбитражей
- 🌐 **arbys.txt** - актуальное расписание

👉 Смотрите [DATA_SOURCES.md](DATA_SOURCES.md) для подробной информации о источниках данных.

Проверить источники: `node lib/verify-sources.js`

## 🚀 Установка и запуск

### Требования
- Node.js v18+
- npm

### Установка

```bash
npm install
```

### Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные:
- `DISCORD_TOKEN` - токен бота Discord
- `DISCORD_GUILD_ID` - (опционально) ID гильдии для локальных команд
- `NOTIFY_CHANNEL_ID` - (опционально) ID канала для уведомлений

### Запуск

```bash
npm start
```

или для разработки:

```bash
npm run dev
```

## 🏠 Развертывание на хостинге

Подробные инструкции для различных хостингов:

- 🎮 **HeavenCloud** - [QUICKSTART_HEAVENCLOUD.md](QUICKSTART_HEAVENCLOUD.md) ⭐ **За 5 минут!**
- 📋 **Полное руководство** - [HEAVENCLOUD_SETUP.md](HEAVENCLOUD_SETUP.md)
- 🚀 **Другие хостинги** - [DEPLOYMENT.md](DEPLOYMENT.md)
- ❌ **Ошибка git repository** - [GIT_REPOSITORY_ERROR.md](GIT_REPOSITORY_ERROR.md)

## 📁 Структура проекта

```
lib/
  ├── data.js          - Загрузка данных с browse.wf
  ├── embeds.js        - Форматирование сообщений Discord
  ├── webhooks.js      - Управление вебхуками
  ├── constants.js     - Константы (эмодзи, конфиги)
  ├── datasources.json - Описание источников
  └── verify-sources.js - Проверка источников (утилита)

commands/
  ├── arbi.js          - Команда /арбитраж
  ├── arbilist.js      - Команда /арбитраж-список
  ├── ping.js          - Команда /пинг
  ├── help.js          - Команда /помощь
  └── update.js        - Команда /обновить

config/
  └── webhooks.json    - Конфигурация вебхуков

index.js              - Точка входа
package.json
.env.example          - Шаблон переменных окружения
```

## 🔄 Обновление данных

Данные об арбитражах обновляются **каждые 60 секунд** через API browse.wf.

При каждом обновлении бот:
1. Загружает данные с browse.wf
2. Валидирует их целостность
3. Кэширует в памяти
4. Проверяет новые арбитражи
5. Отправляет уведомления в вебхуки (если настроены)

## 🐛 Логирование

Все события логируются в консоль с префиксами:
- `[Bot]` - События бота
- `[Data]` - Загрузка данных
- `[Webhook]` - Отправка вебхуков
- `[Alert]` - Уведомления об арбитражах
- `[Error]` - Ошибки

## � Документация

| Документ | Описание |
|----------|---------|
| [QUICKSTART_HEAVENCLOUD.md](QUICKSTART_HEAVENCLOUD.md) | ⭐ Быстрая установка на HeavenCloud (5 минут) |
| [HEAVENCLOUD_SETUP.md](HEAVENCLOUD_SETUP.md) | Полное руководство HeavenCloud |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Развертывание на других хостингах |
| [DATA_SOURCES.md](DATA_SOURCES.md) | Информация об источниках данных |
| [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) | Проверка API browse.wf |
| [GIT_REPOSITORY_ERROR.md](GIT_REPOSITORY_ERROR.md) | Решение ошибок git |

## �📝 Лицензия

Этот проект использует данные из [browse.wf](https://browse.wf) - публичного Warframe API.
# ⚡ HeavenCloud Быстрая установка

## 🎯 За 5 минут!

### 1️⃣ Откройте Console в HeavenCloud

Нажмите **Console** в левом меню

### 2️⃣ Копируйте и вставляйте эти команды

```bash
cd /home/container
rm -rf *
git clone https://github.com/blacktime882/Bot_Fenrir.git .
npm install
```

⏳ **Ждите 2-3 минуты, пока загрузятся зависимости**

### 3️⃣ Создайте конфиг файл

Откройте **File Manager** в HeavenCloud:

1. Нажмите **"+ Create File"**
2. Название: `.env`
3. Содержимое:
```
DISCORD_TOKEN=your_bot_token_here
NOTIFY_CHANNEL_ID=your_channel_id
```

Получить DISCORD_TOKEN:
- https://discord.com/developers/applications
- Select app → Bot → Copy TOKEN

### 4️⃣ Запустите бота

В Console выполните:
```bash
npm start
```

Или нажмите кнопку **START** в HeavenCloud

### 5️⃣ Готово! ✅

Проверьте в Discord:
```
/пинг
```

Если бот ответил - ВСЕ РАБОТАЕТ!

---

## 🐛 Проблемы?

**"Cannot find module"**
```bash
npm install
```

**"DISCORD_TOKEN not found"**
- Создайте `.env` файл с токеном

**"not a git repository"**
- Команда `/обновить` работать не будет
- Для обновлений используйте консоль:
```bash
git pull origin main
npm install
```

---

## 📞 Помощь

- 📖 Полная инструкция: [HEAVENCLOUD_SETUP.md](HEAVENCLOUD_SETUP.md)
- 🚀 Общее руководство: [DEPLOYMENT.md](DEPLOYMENT.md)
- 📍 На GitHub: https://github.com/blacktime882/Bot_Fenrir

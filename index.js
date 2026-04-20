require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');

console.log('[Bot] Starting Fenrir Bot v2.0 - Auto-update test');

// Validate environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const NOTIFY_CHANNEL_ID = process.env.NOTIFY_CHANNEL_ID;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 60;
const FALLBACK_CHECK_INTERVAL = parseInt(process.env.FALLBACK_CHECK_INTERVAL) || 300;
const FALLBACK_TIMEOUT = parseInt(process.env.FALLBACK_TIMEOUT) || 600;

if (!DISCORD_TOKEN || DISCORD_TOKEN.length < 50) {
    console.log('[ERROR] Invalid DISCORD_TOKEN. Must be a valid bot token.');
    process.exit(1);
}

if (DISCORD_GUILD_ID && !/^\d+$/.test(DISCORD_GUILD_ID)) {
    console.log('[ERROR] Invalid DISCORD_GUILD_ID. Must be a numeric ID.');
    process.exit(1);
}

if (NOTIFY_CHANNEL_ID && !/^\d+$/.test(NOTIFY_CHANNEL_ID)) {
    console.log('[ERROR] Invalid NOTIFY_CHANNEL_ID. Must be a numeric ID.');
    process.exit(1);
}

if (isNaN(CHECK_INTERVAL) || CHECK_INTERVAL < 10) {
    console.log('[ERROR] Invalid CHECK_INTERVAL. Must be a number >= 10 seconds.');
    process.exit(1);
}

if (isNaN(FALLBACK_CHECK_INTERVAL) || FALLBACK_CHECK_INTERVAL < 10) {
    console.log('[ERROR] Invalid FALLBACK_CHECK_INTERVAL. Must be a number >= 10 seconds.');
    process.exit(1);
}

if (isNaN(FALLBACK_TIMEOUT) || FALLBACK_TIMEOUT < 10) {
    console.log('[ERROR] Invalid FALLBACK_TIMEOUT. Must be a number >= 10 seconds.');
    process.exit(1);
}

const { loadData, getArbitrations, getAllArbitrations, getCurrentFissures } = require('./lib/data');
const { buildArbiEmbed, buildFissureEmbed } = require('./lib/embeds');
const { loadWebhooks, getWebhooks, sendToWebhook, checkArbitrationStart, setLastSentArbi, checkFissureStart } = require('./lib/webhooks');
const arbiCommand = require('./commands/arbi');
const arbiListCommand = require('./commands/arbilist');
const helpCommand = require('./commands/help');
const pingCommand = require('./commands/ping');
const updateCommand = require('./commands/update');
const infoCommand = require('./commands/info');
const statsCommand = require('./commands/stats');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function registerCommands() {
    const commandModules = [
        { name: 'arbi', module: arbiCommand },
        { name: 'arbilist', module: arbiListCommand },
        { name: 'help', module: helpCommand },
        { name: 'ping', module: pingCommand },
        { name: 'update', module: updateCommand },
        { name: 'info', module: infoCommand },
        { name: 'stats', module: statsCommand }
    ];

    const commands = [];
    console.log('[Bot] Building commands...');

    for (const { name, module } of commandModules) {
        try {
            const command = module.getCommand();
            commands.push(command);
            console.log(`[Bot] ✓ Command '${name}' built successfully: ${command.name}`);
        } catch (error) {
            console.log(`[Bot] ✗ Failed to build command '${name}': ${error.message}`);
        }
    }

    console.log(`[Bot] Total commands to register: ${commands.length}`);

    if (commands.length === 0) {
        console.log('[Bot] No commands to register, skipping registration');
        return;
    }

    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    try {
        if (DISCORD_GUILD_ID) {
            // Delete guild commands
            console.log(`[Bot] Checking for existing guild commands in ${DISCORD_GUILD_ID}...`);
            const existing = await rest.get(Routes.applicationGuildCommands(client.user.id, DISCORD_GUILD_ID));
            if (existing.length > 0) {
                console.log(`[Bot] Found ${existing.length} guild commands, deleting...`);
                for (const cmd of existing) {
                    console.log(`[Bot] Deleting guild command: ${cmd.name}`);
                    await rest.delete(Routes.applicationGuildCommand(client.user.id, DISCORD_GUILD_ID, cmd.id));
                }
                // Wait a bit
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            // Register new commands
            console.log(`[Bot] Registering ${commands.length} commands for guild...`);
            const result = await rest.put(Routes.applicationGuildCommands(client.user.id, DISCORD_GUILD_ID), { body: commands });
            console.log(`[Bot] Commands registered for guild successfully. Registered: ${result.length}`);
        } else {
            console.log(`[Bot] Registering ${commands.length} commands globally...`);
            const result = await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
            console.log(`[Bot] Commands registered globally successfully. Registered: ${result.length}`);
        }
    } catch (e) {
        console.log(`[Bot] Command registration error: ${e.message}`);
        if (e.response) {
            console.log(`[Bot] Response status: ${e.response.status}`);
            console.log(`[Bot] Response data: ${JSON.stringify(e.response.data, null, 2)}`);
        }
    }
}

client.once("ready", async () => {
    console.log(`[Bot] Logged in as ${client.user.tag}`);
    console.log(`[Bot] Client ID: ${client.user.id}`);
    console.log(`[Bot] Guild ID configured: ${DISCORD_GUILD_ID || 'Not set (using global commands)'}`);

    await registerCommands();
    await loadData();
    loadWebhooks();

    const { current } = getArbitrations();
    if (current) {
        setLastSentArbi(current);
        // Отправить уведомление о текущем арбитраже при запуске для теста
        const embed = buildArbiEmbed(current, "current");
        if (embed) {
            await sendToWebhook(embed, "arbi");
            console.log(`[Startup] Sent notification for current arbitration at startup`);
        }
    }

    let isLoading = false;
    dataInterval = setInterval(async () => {
        // Избегаем race condition - если уже загружаем данные, пропускаем
        if (isLoading) {
            console.log(`[Alert Check] Data load in progress, skipping this cycle`);
            return;
        }

        try {
            isLoading = true;
            const loaded = await loadData();
            
            if (!loaded) {
                console.log(`[Alert Check] Failed to load data, skipping check`);
                return;
            }

            const schedule = getAllArbitrations();
            const newArbi = checkArbitrationStart(schedule);

            if (newArbi) {
                const embed = buildArbiEmbed(newArbi, "current");
                if (embed) {  // Проверяем что embed был успешно создан
                    await sendToWebhook(embed, "arbi");
                }
            }

            const fissures = getCurrentFissures();
            const newFissures = checkFissureStart(fissures);

            for (const fissure of newFissures) {
                const embed = buildFissureEmbed(fissure);
                if (embed) {
                    await sendToWebhook(embed, "fissure");
                }
            }
        } catch (e) {
            console.log(`[Alert Error] ${e.message}`);
            console.log(`[Alert Error] Stack: ${e.stack}`);
        } finally {
            isLoading = false;
        }
    }, CHECK_INTERVAL * 1000);
});

let lastBotMessageTime = 0;
let dataInterval = null;

client.on("messageCreate", async (message) => {
    // Проверяем сообщения в канале уведомлений
    if (!NOTIFY_CHANNEL_ID || message.channelId !== NOTIFY_CHANNEL_ID) return;

    // Если сообщение от бота - обновляем время последнего сообщения
    if (message.author.id === client.user.id) {
        lastBotMessageTime = Math.floor(Date.now() / 1000);
        console.log(`[Bot Message] Updated last message time: ${lastBotMessageTime}`);
        return;
    }

    console.log(`[Channel Message] ${message.author.tag}: ${message.content}`);
});

// Проверка fallback: отправлял ли бот сообщение в последние FALLBACK_TIMEOUT секунд
const fallbackInterval = setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastMessage = now - lastBotMessageTime;

    if (timeSinceLastMessage > FALLBACK_TIMEOUT) {
        console.log(`[Check] No bot message for ${timeSinceLastMessage}s, checking for active arbitration...`);

        if (!NOTIFY_CHANNEL_ID) {
            console.log(`[Check] NOTIFY_CHANNEL_ID not configured, skipping fallback check`);
            return;
        }

        const { current } = require('./lib/data').getArbitrations();
        if (current) {
            try {
                const embed = require('./lib/embeds').buildArbiEmbed(current, "current");
                const channel = await client.channels.fetch(NOTIFY_CHANNEL_ID);
                await channel.send({ embeds: [embed] });
                lastBotMessageTime = now;
                console.log(`[Fallback] Sent arbitration notification to channel`);
            } catch (e) {
                console.log(`[Fallback Error] ${e.message}`);
            }
        }
    }
}, FALLBACK_CHECK_INTERVAL * 1000);

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    console.log(`[Command] Received command: '${interaction.commandName}' by ${interaction.user.tag}`);

    try {
        if (interaction.commandName === "арбитраж") {
            console.log(`[Command] Handling arbi command`);
            await arbiCommand.handle(interaction);
        } else if (interaction.commandName === "арбитраж-список") {
            console.log(`[Command] Handling arbilist command`);
            await arbiListCommand.handle(interaction);
        } else if (interaction.commandName === "помощь") {
            console.log(`[Command] Handling help command`);
            await helpCommand.handle(interaction);
        } else if (interaction.commandName === "пинг") {
            console.log(`[Command] Handling ping command`);
            await pingCommand.handle(interaction);
        } else if (interaction.commandName === "обновить") {
            console.log(`[Command] Handling update command`);
            await updateCommand.handle(interaction);
        } else if (interaction.commandName === "информация") {
            console.log(`[Command] Handling info command`);
            await infoCommand.handle(interaction);
        } else if (interaction.commandName === "статистика") {
            console.log(`[Command] Handling stats command`);
            await statsCommand.handle(interaction);
        } else {
            console.log(`[Command] Unknown command: '${interaction.commandName}'`);
            await interaction.reply({ content: `Неизвестная команда: ${interaction.commandName}`, ephemeral: true });
        }
    } catch (e) {
        console.log(`[Error] Command execution failed: ${e.message}`);
        console.log(`[Error] Stack: ${e.stack}`);
        try {
            await interaction.reply({ content: `Ошибка: ${e.message}`, ephemeral: true });
        } catch (replyError) {
            console.log(`[Error] Failed to send error reply: ${replyError.message}`);
        }
    }
});

const PORT = process.env.PORT || 3000;
let hasExpress = false;
try {
    require('express');
    hasExpress = true;
} catch (e) {
    console.log("[Server] Express not installed, web server disabled");
}

if (hasExpress && process.env.ENABLE_WEB_SERVER === "true") {
    const express = require('express');
    const app = express();
    app.use(express.json());
    app.post('/send', async (req, res) => {
        const { embed, event } = req.body;
        if (embed && event) {
            await sendToWebhook(embed, event);
            res.json({ ok: true });
        } else {
            res.status(400).json({ error: "Missing embed or event" });
        }
    });
    app.listen(PORT, () => console.log(`[Server] Port ${PORT}`));
}

if (!DISCORD_TOKEN) {
    console.log("[ERROR] DISCORD_TOKEN required");
    process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[Bot] Received SIGINT, shutting down gracefully...');
    if (dataInterval) clearInterval(dataInterval);
    if (fallbackInterval) clearInterval(fallbackInterval);
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[Bot] Received SIGTERM, shutting down gracefully...');
    if (dataInterval) clearInterval(dataInterval);
    if (fallbackInterval) clearInterval(fallbackInterval);
    client.destroy();
    process.exit(0);
});

client.login(DISCORD_TOKEN);
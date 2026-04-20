require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');

console.log('[Bot] Starting Fenrir Bot v2.0 - Auto-update test');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const { loadData, getArbitrations, getAllArbitrations } = require('./lib/data');
const { buildArbiEmbed } = require('./lib/embeds');
const { loadWebhooks, getWebhooks, sendToWebhook, checkArbitrationStart, setLastSentArbi } = require('./lib/webhooks');
const arbiCommand = require('./commands/arbi');
const arbiListCommand = require('./commands/arbilist');
const helpCommand = require('./commands/help');
const pingCommand = require('./commands/ping');
const updateCommand = require('./commands/update');

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
        { name: 'update', module: updateCommand }
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
        // Always delete global commands first
        console.log('[Bot] Checking for existing global commands...');
        const globalCommands = await rest.get(Routes.applicationCommands(client.user.id));
        if (globalCommands.length > 0) {
            console.log(`[Bot] Found ${globalCommands.length} global commands, deleting...`);
            for (const cmd of globalCommands) {
                console.log(`[Bot] Deleting global command: ${cmd.name}`);
                await rest.delete(Routes.applicationCommand(client.user.id, cmd.id));
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

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
    if (current) setLastSentArbi(current);

    setInterval(async () => {
        try {
            await loadData();
            const schedule = getAllArbitrations();
            const newArbi = checkArbitrationStart(schedule);
            if (newArbi) {
                const embed = buildArbiEmbed(newArbi, "current");
                await sendToWebhook(embed, "arbi");
            }
        } catch (e) {
            console.log(`[Alert Error] ${e.message}`);
        }
    }, 60000);
});

let lastBotMessageTime = 0;

client.on("messageCreate", async (message) => {
    // Проверяем сообщения в канале уведомлений
    if (message.channelId !== "1495464275404132532") return;

    // Если сообщение от бота - обновляем время последнего сообщения
    if (message.author.id === client.user.id) {
        lastBotMessageTime = Math.floor(Date.now() / 1000);
        console.log(`[Bot Message] Updated last message time: ${lastBotMessageTime}`);
        return;
    }

    console.log(`[Channel Message] ${message.author.tag}: ${message.content}`);
});

// Проверка каждые 5 минут: отправлял ли бот сообщение в последние 10 минут
setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastMessage = now - lastBotMessageTime;

    if (timeSinceLastMessage > 600) { // 10 минут
        console.log(`[Check] No bot message for ${timeSinceLastMessage}s, checking for active arbitration...`);

        const { current } = require('./lib/data').getArbitrations();
        if (current) {
            const embed = require('./lib/embeds').buildArbiEmbed(current, "current");
            const channel = await client.channels.fetch("1495464275404132532");
            await channel.send({ embeds: [embed] });
            lastBotMessageTime = now;
            console.log(`[Fallback] Sent arbitration notification to channel`);
        }
    }
}, 300000); // каждые 5 минут

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

client.login(DISCORD_TOKEN);
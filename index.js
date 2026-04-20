require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const { loadData, getArbitrations, getAllArbitrations } = require('./lib/data');
const { buildArbiEmbed } = require('./lib/embeds');
const { loadWebhooks, getWebhooks, sendToWebhook, checkArbitrationStart, setLastSentArbi } = require('./lib/webhooks');
const arbiCommand = require('./commands/arbi');
const arbiListCommand = require('./commands/arbilist');
const helpCommand = require('./commands/help');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function registerCommands() {
    const commands = [arbiCommand.getCommand(), arbiListCommand.getCommand(), helpCommand.getCommand()];
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    try {
        if (DISCORD_GUILD_ID) {
            // Force delete all commands
            const existing = await rest.get(Routes.applicationGuildCommands(client.user.id, DISCORD_GUILD_ID));
            console.log(`[Bot] Found ${existing.length} existing commands, deleting...`);
            for (const cmd of existing) {
                console.log(`[Bot] Deleting command: ${cmd.name}`);
                await rest.delete(Routes.applicationGuildCommand(client.user.id, DISCORD_GUILD_ID, cmd.id));
            }
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Register new commands
            await rest.put(Routes.applicationGuildCommands(client.user.id, DISCORD_GUILD_ID), { body: commands });
            console.log("[Bot] Commands registered for guild");
        } else {
            await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
            console.log("[Bot] Commands registered globally");
        }
    } catch (e) {
        console.log(`[Bot] Command error: ${e.message}`);
    }
}

client.once("clientReady", async () => {
    console.log(`[Bot] Logged in as ${client.user.tag}`);
    
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
    console.log(`[Command] ${interaction.commandName} by ${interaction.user.tag}`);

    try {
        if (interaction.commandName === "арбитраж") {
            await arbiCommand.handle(interaction);
        } else if (interaction.commandName === "арбитраж-список") {
            await arbiListCommand.handle(interaction);
        } else if (interaction.commandName === "помощь") {
            await helpCommand.handle(interaction);
        }
    } catch (e) {
        console.log(`[Error] ${e.message}`);
        await interaction.reply({ content: `Ошибка: ${e.message}`, ephemeral: true });
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
const { SlashCommandBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("пинг")
        .setDescription("Проверить пинг бота");
}

async function handle(interaction) {
    await interaction.reply(`🏓 Пинг: ${interaction.client.ws.ping}ms`);
}

module.exports = { getCommand, handle };
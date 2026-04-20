const { SlashCommandBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("пинг")
        .setDescription("Проверить пинг бота");
}

async function handle(interaction) {
    const sent = await interaction.reply({ content: 'Проверяю пинг...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`🏓 Пинг: ${latency}ms`);
}

module.exports = { getCommand, handle };
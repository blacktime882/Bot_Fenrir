const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("пинг")
        .setDescription("Проверить пинг бота и обновить код");
}

async function handle(interaction) {
    const sent = await interaction.reply({ content: 'Проверяю пинг...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    // Проверить наличие git и выполнить git pull origin main
    exec('cd /home/container && git pull origin main', (error, stdout, stderr) => {
        let pullMessage = '';
        if (error) {
            pullMessage = `Ошибка обновления: ${error.message}`;
        } else {
            pullMessage = `Обновление выполнено:\n${stdout}`;
        }

        interaction.editReply(`🏓 Пинг: ${latency}ms\n${pullMessage}`);
    });
}

module.exports = { getCommand, handle };
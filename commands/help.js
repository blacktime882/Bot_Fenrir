const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("помощь")
        .setDescription("Список команд");
}

async function handle(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("Команды Fenrir Bot")
        .setColor(0x5865F2)
        .addFields(
            { name: "/арбитраж", value: "Текущий и следующий арбитраж", inline: false },
            { name: "/арбитраж-список", value: "Список ближайших арбитражей", inline: false },
            { name: "/помощь", value: "Показать это сообщение", inline: false },
        );
    await interaction.reply({ embeds: [embed] });
}

module.exports = { getCommand, handle };
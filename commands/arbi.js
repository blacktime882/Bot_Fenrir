const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getArbitrations } = require('../lib/data');
const { buildArbiEmbed } = require('../lib/embeds');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("арбитраж")
        .setDescription("Текущий и следующий арбитраж");
}

async function handle(interaction) {
    const { current, next } = getArbitrations();

    if (!current && !next) {
        return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setTitle("Нет арбитражей")
                .setDescription("Арбитражи не запланированы")
                .setColor(0x99AAB5)]
        });
    }

    const embeds = [];
    if (current) embeds.push(buildArbiEmbed(current, "current"));
    if (next) embeds.push(buildArbiEmbed(next, "next"));

    await interaction.reply({ embeds });
}

module.exports = { getCommand, handle };
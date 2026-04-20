const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUpcomingArbitrations } = require('../lib/data');
const { getLocationName, getFactionName, getMissionName, getPlanetName, getTier, getNodeInfo } = require('../lib/data');
const { TIER_CONFIG } = require('../lib/constants');
const { getFactionEmoji, getMissionEmoji } = require('../lib/embeds');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("арбитраж-список")
        .setDescription("Список ближайших арбитражей")
        .addIntegerOption(o => 
            o.setName("количество")
                .setDescription("Сколько показать (по умолчанию 10)")
                .setMinValue(1)
                .setMaxValue(25)
        );
}

async function handle(interaction) {
    const count = interaction.options.getInteger("количество") || 10;
    const arbitrations = getUpcomingArbitrations(count);

    if (arbitrations.length === 0) {
        return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setTitle("📭 Нет арбитражей")
                .setDescription("Нет запланированных арбитражей")
                .setColor(0x99AAB5)]
        });
    }

    const embeds = [];
    let currentEmbed = new EmbedBuilder()
        .setTitle(`📋 Ближайшие арбитражи`)
        .setColor(0x5865F2)
        .setFooter({ text: `browse.wf/arbys • Показано: ${arbitrations.length}` })
        .setTimestamp();

    let fieldCount = 0;
    const maxFields = 25;

    for (const [ts, nodeKey] of arbitrations) {
        // Если достигли макса полей, сохраняем текущий embed и создаем новый
        if (fieldCount >= maxFields) {
            embeds.push(currentEmbed);
            currentEmbed = new EmbedBuilder()
                .setTitle(`📋 Ближайшие арбитражи (продолжение)`)
                .setColor(0x5865F2)
                .setFooter({ text: "browse.wf/arbys" })
                .setTimestamp();
            fieldCount = 0;
        }

        const now = Math.floor(Date.now() / 1000);
        const location = getLocationName(nodeKey);
        const planet = getPlanetName(nodeKey);
        const faction = getFactionName(nodeKey);
        const mission = getMissionName(nodeKey);
        const tier = getTier(nodeKey);
        
        const fEmoji = getFactionEmoji(faction);
        const mEmoji = getMissionEmoji(mission);
        const tierEmoji = TIER_CONFIG[tier]?.emoji || "⚪";
        const relativeStr = `<t:${ts}:R>`;
        
        // Добавляем поле прямо в текущий embed
        currentEmbed.addFields({
            name: `${tierEmoji} ${tier} | ${location}`,
            value: `${fEmoji} **${planet}**\n${mEmoji} ${mission}\n⏰ ${relativeStr}`,
            inline: true
        });
        fieldCount++;
    }

    embeds.push(currentEmbed);
    await interaction.reply({ embeds });
}

module.exports = { getCommand, handle };
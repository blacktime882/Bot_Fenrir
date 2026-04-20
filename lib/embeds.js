const { EmbedBuilder } = require('discord.js');
const { getNodeInfo, getFactionName, getMissionName, getLocationName, getPlanetName, getFactionKey, getTier } = require('./data');
const { FACTION_EMOJI, MTYPE_EMOJI, TIER_CONFIG, WEAKNESSES, FISSURE_TIER_CONFIG } = require('./constants');

function getFactionEmoji(faction) {
    if (!faction || faction.trim() === '') return "⚔️";
    
    const emojiMap = {
        "Гринер": "🔴", "Grineer": "🔴", "Griner": "🔴",
        "Корпус": "🔵", "Corpus": "🔵",
        "Заражённые": "🟢", "Infested": "🟢", "Infection": "🟢",
        "Коррупция": "⚪", "Corrupted": "⚪",
        "Сентиент": "🟣", "Sentient": "🟣",
        "Нармер": "🟡", "Narmer": "🟡",
    };
    return emojiMap[faction] || "⚔️";
}

function getMissionEmoji(mission) {
    if (!mission || mission.trim() === '') return "🎮";
    
    const emojiMap = {
        "Выживание": "⏱️", "Survival": "⏱️",
        "Защита": "🛡️", "Defense": "🛡️", "Оборона": "🛡️",
        "Перехват": "📡", "Interception": "📡",
        "Дистракция": "💣", "Disruption": "💣",
        "Раскопки": "⛏️", "Excavation": "⛏️",
        "Захват": "🎯", "Capture": "🎯",
        "Спасательная": "🆘", "Rescue": "🆘",
        "Истребление": "🔫", "Exterminate": "🔫",
        "Саботаж": "💥", "Sabotage": "💥",
        "Штурм": "⚔️", "Assault": "⚔️",
        "Шпионаж": "👁️", "Spy": "👁️",
    };
    return emojiMap[mission.split(" ")[0]] || "🎮";
}

function buildArbiEmbed([ts, nodeKey], type) {
    // Валидация входных параметров
    if (!ts || !nodeKey) {
        console.log(`[Embed] Invalid parameters: ts=${ts}, nodeKey=${nodeKey}`);
        return null;
    }

    const info = getNodeInfo(nodeKey);
    const location = getLocationName(nodeKey);
    const planet = getPlanetName(nodeKey);
    const faction = getFactionName(nodeKey);
    const mission = getMissionName(nodeKey);
    const fkey = getFactionKey(nodeKey);
    const tier = getTier(nodeKey);
    const cfg = TIER_CONFIG[tier] || TIER_CONFIG.F;

    // Проверка на пустые значения
    if (!location || location.trim() === '') {
        console.log(`[Embed] Warning: Empty location for nodeKey=${nodeKey}`);
    }
    if (!planet || planet.trim() === '') {
        console.log(`[Embed] Warning: Empty planet for nodeKey=${nodeKey}`);
    }
    if (!faction || faction.trim() === '') {
        console.log(`[Embed] Warning: Empty faction for nodeKey=${nodeKey}`);
    }
    if (!mission || mission.trim() === '') {
        console.log(`[Embed] Warning: Empty mission for nodeKey=${nodeKey}`);
    }

    // Для текущего арбитража время окончания = ts + 3600
    // Для следующего - время начала = ts
    const endTime = type === "current" ? ts + 3600 : ts;

    // Discord timestamp format для автоматической конвертации в локальное время
    const timeStr = `<t:${endTime}:t>`; // Short time format (HH:MM)
    const relativeStr = `<t:${endTime}:R>`; // Relative time (in X minutes/hours)
    const dateStr = `<t:${endTime}:d>`; // Date format

    const fEN = { FC_GRINEER: "Grineer", FC_CORPUS: "Corpus", FC_INFESTATION: "Infested", FC_CORRUPTED: "Corrupted", FC_SENTIENT: "Sentient", FC_NARMER: "Narmer" }[fkey] || fkey.replace("FC_", "");
    const weaks = WEAKNESSES[fEN] || [];
    const weakStr = weaks.length > 0 ? weaks.map(([e, n]) => `${e} ${n}`).join(" • ") : "—";

    const minLevel = info.minEnemyLevel || "?";
    const maxLevel = info.maxEnemyLevel || "?";
    const fEmoji = getFactionEmoji(faction);
    const mEmoji = getMissionEmoji(mission);

    const embed = new EmbedBuilder()
        .setTitle(`${cfg.emoji} ${tier} ТИЕР | ${location}`)
        .setColor(cfg.color)
        .setThumbnail("https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png")
        .setFooter({ text: "browse.wf/arbys • Warframe Arbitration" })
        .setTimestamp();

    if (type === "current") {
        embed.setAuthor({ name: "⚔️  АКТИВНЫЙ АРБИТРАЖ  ⚔️", iconURL: "https://browse.wf/Lotus/Interface/Icons/PvEMode.png" });
        embed.setDescription(`🔴 **Активен**\n⏳ Заканчивается ${relativeStr}`);
    } else {
        embed.setAuthor({ name: "⏰  СЛЕДУЮЩИЙ АРБИТРАЖ  ⏰", iconURL: "https://browse.wf/Lotus/Interface/Icons/PvEMode.png" });
        embed.setDescription(`⚫ **Предстоящий**\n🕐 Начнётся ${relativeStr}`);
    }

    // Основная информация
    embed.addFields(
        { name: "🔻 ФРАКЦИЯ", value: `${fEmoji} **${faction}**`, inline: true },
        { name: "🎯 ТИП МИССИИ", value: `${mEmoji} **${mission}**`, inline: true },
        { name: "🌍 МЕСТО", value: `**${planet}**`, inline: true },
    );

    // Уровень врагов
    embed.addFields(
        { name: "💀 УРОВЕНЬ ВРАГОВ", value: `**${minLevel}** → **${maxLevel}**`, inline: true },
        { name: "⏱️ ВРЕМЯ", value: `${timeStr}\n${dateStr}`, inline: true },
        { name: "🎖️ РЕЙТИНГ", value: `**${tier}**`, inline: true },
    );

    // Уязвимости (с красивым форматированием)
    embed.addFields(
        { name: "💥 СЛАБОСТИ К УРОНУ", value: `${weakStr}`, inline: false },
    );

    // Тёмный сектор
    const ds = info.darkSectorData;
    if (ds && typeof ds === "object") {
        const parts = [];
        if (ds.resourceBonus) parts.push(`💰 **Ресурсы:** +${Math.round(ds.resourceBonus * 100)}%`);
        if (ds.xpBonus) parts.push(`✨ **Опыт:** +${Math.round(ds.xpBonus * 100)}%`);
        if (ds.weaponXpBonusFor && ds.weaponXpBonusVal) {
            const wpnMap = { "Rifles": "Винтовки", "Pistols": "Пистолеты", "Melee": "Ближний бой", "Shotguns": "Дробовики" };
            const wpn = wpnMap[ds.weaponXpBonusFor] || ds.weaponXpBonusFor;
            parts.push(`🔫 **${wpn}:** +${Math.round(ds.weaponXpBonusVal * 100)}%`);
        }
        if (parts.length) {
            embed.addFields({ name: "🌑 БОНУСЫ ТЁМНОГО СЕКТОРА", value: parts.join("\n"), inline: false });
        }
    }

    return embed;
}

function buildFissureEmbed(fissure) {
    // Валидация входных параметров
    if (!fissure || !fissure.location) {
        console.log(`[Fissure Embed] Invalid fissure data: ${JSON.stringify(fissure)}`);
        return null;
    }

    const [planet, node] = fissure.location.split('/');
    const location = node || planet;
    const faction = fissure.faction;
    const missionMap = {
        "Void Flood": "Водопад Пустоты",
        "Excavation": "Раскопки",
        "Defense": "Защита",
        "Survival": "Выживание",
        "Alchemy": "Алхимия"
    };
    const mission = missionMap[fissure.missionType] || fissure.missionType;
    const tier = fissure.tier;
    const cfg = FISSURE_TIER_CONFIG[tier] || FISSURE_TIER_CONFIG.Lith;

    // Время окончания
    const endTime = fissure.end;

    // Discord timestamp format
    const timeStr = `<t:${endTime}:t>`;
    const relativeStr = `<t:${endTime}:R>`;
    const dateStr = `<t:${endTime}:d>`;

    const fEmoji = getFactionEmoji(faction);
    const mEmoji = getMissionEmoji(mission);

    const embed = new EmbedBuilder()
        .setTitle(`${cfg.emoji} ${tier} РЕЛИКВИЯ | ${location}`)
        .setColor(cfg.color)
        .setThumbnail("https://cdn.discordapp.com/attachments/999084162998874132/1495874579065999411/66258aef1bcff852.webp?ex=69e7d543&is=69e683c3&hm=b0bfdcfe8fb2530a4e1f96860a5b8b698ffcda1b6992f34f2f2e001b275a78fa&")
        .setFooter({ text: "warframe.fandom.com • Warframe Void Fissure" })
        .setTimestamp();

    embed.setAuthor({ name: "💎  НОВАЯ РЕЛИКВИЯ  💎", iconURL: "https://static.wikia.nocookie.net/warframe/images/0/0f/VoidRelicIntact.png" });
    embed.setDescription(`🔴 **Активна**\n⏳ Заканчивается ${relativeStr}\n${fissure.hard ? '⚔️ Стальной путь' : '🛡️ Обычный путь'}`);

    // Основная информация
    embed.addFields(
        { name: "🔻 ФРАКЦИЯ", value: `${fEmoji} **${faction}**`, inline: true },
        { name: "🎯 ТИП МИССИИ", value: `${mEmoji} **${mission}**`, inline: true },
        { name: "🌍 ПЛАНЕТА", value: `**${planet}**`, inline: true },
    );

    // Время и тиер
    embed.addFields(
        { name: "⏱️ ВРЕМЯ", value: `${timeStr}\n${dateStr}`, inline: true },
        { name: "🎖️ ТИЕР РЕЛИКВИИ", value: `**${tier}**`, inline: true },
        { name: "🌍 УЗЕЛ", value: `**${location}**`, inline: true },
    );



    return embed;
}

module.exports = { buildArbiEmbed, buildFissureEmbed, getFactionEmoji, getMissionEmoji };
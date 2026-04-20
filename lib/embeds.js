const { EmbedBuilder } = require('discord.js');
const { getNodeInfo, getFactionName, getMissionName, getLocationName, getPlanetName, getFactionKey, getTier } = require('./data');
const { FACTION_EMOJI, MTYPE_EMOJI, TIER_CONFIG, WEAKNESSES } = require('./constants');

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

    const fEN = { FC_GRINEER: "Grineer", FC_CORPUS: "Corpus", FC_INFESTATION: "Infested", FC_CORRUPTED: "Corrupted", FC_SENTIENT: "Sentient", FC_NARMER: "Narmer" }[fkey] || fkey.replace("FC_", "");
    const weaks = WEAKNESSES[fEN] || [];
    const weakStr = weaks.length > 0 ? weaks.map(([e, n]) => `${e} ${n}`).join("  ") : "—";

    const minLevel = info.minEnemyLevel || "?";
    const maxLevel = info.maxEnemyLevel || "?";
    const fEmoji = getFactionEmoji(faction);
    const mEmoji = getMissionEmoji(mission);

    const embed = new EmbedBuilder()
        .setTitle(`${cfg.emoji} ${tier} Тир | ${location}`)
        .setColor(cfg.color)
        .setThumbnail("https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png")
        .setFooter({ text: "browse.wf/arbys" })
        .setTimestamp();

    if (type === "current") {
        embed.setAuthor({ name: "⚔️ АРБИТРАЖ СЕЙЧАС ⚔️" });
        embed.setDescription(`⏳ Заканчивается ${relativeStr}`);
    } else {
        embed.setAuthor({ name: "⏰ АРБИТРАЖ СКОРО ⏰" });
        embed.setDescription(`🕐 Начнётся ${relativeStr}`);
    }

    embed.addFields(
        { name: "🔻 Фракция", value: `${fEmoji} ${faction}`, inline: true },
        { name: "🎯 Миссия", value: `${mEmoji} ${mission}`, inline: true },
        { name: "🌍 Планета", value: planet || "—", inline: true },
        { name: "💀 Уязвимости", value: weakStr, inline: false },
    );

    const ds = info.darkSectorData;
    if (ds && typeof ds === "object") {
        const parts = [];
        if (ds.resourceBonus) parts.push(`💰 Ресурсы: **+${Math.round(ds.resourceBonus * 100)}%**`);
        if (ds.xpBonus) parts.push(`✨ Опыт: **+${Math.round(ds.xpBonus * 100)}%**`);
        if (ds.weaponXpBonusFor && ds.weaponXpBonusVal) {
            const wpnMap = { "Rifles": "Винтовки", "Pistols": "Пистолеты", "Melee": "Ближний бой", "Shotguns": "Дробовики" };
            const wpn = wpnMap[ds.weaponXpBonusFor] || ds.weaponXpBonusFor;
            parts.push(`🔫 ${wpn}: **+${Math.round(ds.weaponXpBonusVal * 100)}%**`);
        }
        if (parts.length) embed.addFields({ name: "🌑 Тёмный сектор", value: parts.join("\n"), inline: false });
    }

    return embed;
}

module.exports = { buildArbiEmbed, getFactionEmoji, getMissionEmoji };
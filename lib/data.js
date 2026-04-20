const axios = require('axios');
const { MISSION_TYPE_NAMES } = require('./constants');

let cache = { regions: {}, lang: {}, tiers: {}, schedule: [] };

const DATA_URLS = {
    regions: "https://browse.wf/warframe-public-export-plus/ExportRegions.json",
    lang: "https://browse.wf/warframe-public-export-plus/dict.ru.json",
    tiers: "https://browse.wf/supplemental-data/arbyTiers.js",
    schedule: "https://browse.wf/arbys.txt",
};

const FACTION_KEYS = {
    "FC_GRINEER": "/Lotus/Language/Factions/Grineer",
    "FC_CORPUS": "/Lotus/Language/Factions/Corpus",
    "FC_INFESTATION": "/Lotus/Language/Factions/Infested",
    "FC_CORRUPTED": "/Lotus/Language/Factions/Corrupted",
    "FC_OROKIN": "/Lotus/Language/Factions/Corrupted",
    "FC_SENTIENT": "/Lotus/Language/Factions/Sentient",
    "FC_NARMER": "/Lotus/Language/Factions/Narmer",
    "FC_MITW": "/Lotus/Language/Factions/Infested",
    "FC_SCALDRA": "/Lotus/Language/Factions/Grineer",
    "FC_TECHROT": "/Lotus/Language/Factions/Infested",
    "FC_DUVIRI": "/Lotus/Language/Factions/Corrupted",
    "FC_TENNO": "/Lotus/Language/Factions/Tenno",
};

async function loadData() {
    try {
        const headers = { "User-Agent": "FenrirBot/1.0" };
        const [regionsRes, langRes, tiersRes, schedRes] = await Promise.all([
            axios.get(DATA_URLS.regions, { headers, timeout: 15000 }),
            axios.get(DATA_URLS.lang, { headers, timeout: 15000 }),
            axios.get(DATA_URLS.tiers, { headers, timeout: 15000 }),
            axios.get(DATA_URLS.schedule, { headers, timeout: 15000 }),
        ]);

        const tiers = {};
        for (const m of tiersRes.data.matchAll(/(\w+):\s*"([SABCDF])"/g)) tiers[m[1]] = m[2];

        const schedule = [];
        for (const line of schedRes.data.trim().split("\n")) {
            const parts = line.split(",");
            if (parts.length === 2) schedule.push([parseInt(parts[0]), parts[1]]);
        }

        cache = { regions: regionsRes.data, lang: langRes.data, tiers, schedule };
        console.log(`[Data] Loaded: ${Object.keys(tiers).length} tiers, ${schedule.length} slots`);
        const now = Math.floor(Date.now() / 1000);
        const upcoming = schedule.filter(([ts]) => ts > now).slice(0, 5);
        console.log(`[Data] Next 5: ${upcoming.map(([ts, node]) => `${node}@${ts}`).join(', ')}`);
        return true;
    } catch (e) {
        console.log(`[Data] Error: ${e.message}`);
        return false;
    }
}

function translate(key) {
    if (!key || !key.includes("/")) return key;
    return cache.lang?.[key] ?? key.split("/").pop();
}

function getTier(nodeKey) { return cache.tiers?.[nodeKey] ?? "F"; }
function getNodeInfo(nodeKey) { return cache.regions?.[nodeKey] ?? {}; }
function getFactionName(nodeKey) {
    const fkey = getNodeInfo(nodeKey).faction ?? "";
    const langKey = FACTION_KEYS[fkey] || fkey;
    const translated = translate(langKey);
    // Если перевод не найден, используем fallback
    return translated !== langKey ? translated : fkey.replace("FC_", "").replace(/^./, c => c.toUpperCase());
}
function getMissionName(nodeKey) {
    const mtypeKey = getNodeInfo(nodeKey).missionType ?? "";
    return MISSION_TYPE_NAMES[mtypeKey] || mtypeKey.replace("MT_", "").replace(/^./, c => c.toUpperCase());
}
function getLocationName(nodeKey) {
    const info = getNodeInfo(nodeKey);
    return translate(info.name ?? "");
}
function getPlanetName(nodeKey) {
    const info = getNodeInfo(nodeKey);
    return translate(info.systemName ?? "");
}
function getFactionKey(nodeKey) { return getNodeInfo(nodeKey).faction ?? ""; }

function getCurrentAndNext() {
    const schedule = cache.schedule ?? [];
    if (schedule.length === 0) return [null, null];
    const now = Math.floor(Date.now() / 1000);
    let current = null, nextArbi = null;
    for (const [ts, node] of schedule) {
        if (ts <= now && (current === null || ts > current[0]) && ts + 3600 > now) current = [ts, node];
        if (ts > now && nextArbi === null) nextArbi = [ts, node];
    }
    return [current, nextArbi];
}

function getArbitrations() {
    const [current, next] = getCurrentAndNext();
    return { current, next };
}

function getUpcomingArbitrations(limit = 10) {
    const schedule = cache.schedule ?? [];
    if (schedule.length === 0) return [];
    const now = Math.floor(Date.now() / 1000);
    return schedule.filter(([ts]) => ts > now).slice(0, limit);
}

function getAllArbitrations() {
    return cache.schedule ?? [];
}

module.exports = { loadData, translate, getTier, getNodeInfo, getFactionName, getMissionName, getLocationName, getPlanetName, getFactionKey, getCurrentAndNext, getArbitrations, getUpcomingArbitrations, getAllArbitrations };
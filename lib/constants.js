const FACTION_EMOJI = {
    "Grineer": "🔴", "Griner": "🔴", "Corpus": "🔵", "Infested": "🟢", "Infection": "🟢",
    "Corrupted": "⚪", "Sentient": "🟣", "Narmer": "🟡", "Tenno": "⚪",
    "Гринер": "🔴", "Корпус": "🔵", "Заражённые": "🟢", "Коррупция": "⚪", 
    "Сентиент": "🟣", "Орокин": "⚪",
};

const MTYPE_EMOJI = {
    "Survival": "⏱️", "Выживание": "⏱️",
    "Defense": "🛡️", "Защита": "🛡️", "Оборона": "🛡️",
    "Interception": "📡", "Перехват": "📡",
    "Disruption": "💣", "Дистракция": "💣",
    "Excavation": "⛏️", "Раскопки": "⛏️",
    "Capture": "🎯", "Захват": "🎯",
    "Rescue": "🆘", "Спасательная": "🆘",
    "Exterminate": "🔫", "Истребление": "🔫",
    "Sabotage": "💥", "Саботаж": "💥",
    "Assault": "⚔️", "Штурм": "⚔️",
    "Spy": "👁️", "Шпионаж": "👁️",
};

const MISSION_TYPE_NAMES = {
    "MT_SURVIVAL": "Выживание",
    "MT_DEFENSE": "Защита",
    "MT_INTERCEPTION": "Перехват",
    "MT_DISRUPTION": "Дистракция",
    "MT_EXCAVATE": "Раскопки",
    "MT_CAPTURE": "Захват",
    "MT_RESCUE": "Спасательная",
    "MT_EXTERMINATE": "Истребление",
    "MT_SABOTAGE": "Саботаж",
    "MT_ASSAULT": "Штурм",
    "MT_SPY": "Шпионаж",
    "MT_DEFECTION": "Дефекция",
    "MT_TERRITORY": "Территория",
    "MT_PURIFY": "Очистка",
    "MT_EVACUATION": "Эвакуация",
    "MT_ARTIFACT": "Артефакт",
    "MT_CORRUPTION": "Коррупция",
    "MT_VOID_CASCADE": "Водопад Пустоты",
    "MT_ARMAGEDDON": "Армагеддон",
    "MT_ALCHEMY": "Алхимия",
};

const TIER_CONFIG = {
    "S": { color: 0xFFD700, emoji: "🟡" }, "A": { color: 0x57F287, emoji: "🟢" },
    "B": { color: 0x5865F2, emoji: "🔵" }, "C": { color: 0x99AAB5, emoji: "⚪" },
    "D": { color: 0xE67E22, emoji: "🟠" }, "F": { color: 0xED4245, emoji: "🔴" },
};

const FISSURE_TIER_CONFIG = {
    "Lith": { color: 0xFFFFFF, emoji: "⚪" },
    "Meso": { color: 0x57F287, emoji: "🟢" },
    "Neo": { color: 0x5865F2, emoji: "🔵" },
    "Axi": { color: 0x9B59B6, emoji: "🟣" },
    "Requiem": { color: 0xFFD700, emoji: "🟡" },
    "Omnia": { color: 0xED4245, emoji: "🔴" },
};

const WEAKNESSES = {
    "Grineer": [["☢️", "Коррозия"], ["🟡", "Радиация"], ["🔴", "Рассечение"], ["🦠", "Вирус"]],
    "Corpus": [["🔵", "Магнетизм"], ["☣️", "Токсин"], ["🟡", "Радиация"]],
    "Infested": [["🔥", "Огонь"], ["🔴", "Рассечение"], ["☣️", "Токсин"], ["☁️", "Газ"]],
    "Corrupted": [["🟡", "Радиация"], ["🦠", "Вирус"], ["🔵", "Магнетизм"], ["☢️", "Коррозия"]],
    "Sentient": [["🟡", "Радиация"], ["🔴", "Рассечение"]],
    "Narmer": [["🟡", "Радиация"], ["🔴", "Рассечение"]],
};

module.exports = { FACTION_EMOJI, MTYPE_EMOJI, TIER_CONFIG, WEAKNESSES, MISSION_TYPE_NAMES, FISSURE_TIER_CONFIG };
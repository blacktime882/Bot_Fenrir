import requests
import re
from datetime import datetime, timezone

WEBHOOK_URL = "https://discord.com/api/webhooks/1495464020755484782/sM5PWU38Vlg-zqY3oAwgAn50jTsiMT4eHG3FmGG2yq5wFqlrdgEDczyUt7W4qjjvh0-Q"

# Простые маппинги без кэша
FACTION_RU = {
    "FC_GRINEER": "Гринер",
    "FC_CORPUS": "Корпус",
    "FC_INFESTATION": "Заражённые",
    "FC_CORRUPTED": "Коррупция",
    "FC_OROKIN": "Орокин",
    "FC_SENTIENT": "Сентиент",
    "FC_NARMER": "Нармер",
    "FC_MITW": "Заражённые",
    "FC_SCALDRA": "Скальдра",
    "FC_TECHROT": "Техрот",
    "FC_DUVIRI": "Дувири",
    "FC_TENNO": "Тенно",
}

FACTION_EMOJI = {
    "Гринер": "🔴",
    "Корпус": "🔵",
    "Заражённые": "🟢",
    "Коррупция": "⚪",
    "Орокин": "⚪",
    "Сентиент": "🟣",
    "Нармер": "🟡",
    "Красный Вейл": "🔴",
    "Скальдра": "🔴",
    "Техрот": "🟢",
    "Дувири": "⚫",
    "Тенно": "⚪",
}

FACTION_TO_ENGLISH = {
    "FC_GRINEER": "Grineer",
    "FC_CORPUS": "Corpus",
    "FC_INFESTATION": "Infested",
    "FC_CORRUPTED": "Corrupted",
    "FC_OROKIN": "Corrupted",
    "FC_SENTIENT": "Sentient",
    "FC_NARMER": "Narmer",
    "FC_MITW": "Infested",
    "FC_SCALDRA": "Grineer",
    "FC_TECHROT": "Infested",
    "FC_DUVIRI": "Corrupted",
}

WEAKNESSES = {
    "Grineer": [("☢️", "Коррозия"), ("🟡", "Радиация"), ("🔴", "Рассечение"), ("🦠", "Вирус")],
    "Corpus": [("🔵", "Магнетизм"), ("☣️", "Токсин"), ("🟡", "Радиация")],
    "Infested": [("🔥", "Огонь"), ("🔴", "Рассечение"), ("☣️", "Токсин"), ("☁️", "Газ")],
    "Corrupted": [("🟡", "Радиация"), ("🦠", "Вирус"), ("🔵", "Магнетизм"), ("☢️", "Коррозия")],
    "Sentient": [("🟡", "Радиация"), ("🔴", "Рассечение")],
    "Narmer": [("🟡", "Радиация"), ("🔴", "Рассечение")],
}

MTYPE_MAP = {
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
}

MTYPE_EMOJI = {
    "Выживание": "⏱️",
    "Защита": "🛡️",
    "Оборона": "🛡️",
    "Перехват": "📡",
    "Дистракция": "💣",
    "Раскопки": "⛏️",
    "Захват": "🎯",
    "Спасательная": "🆘",
    "Истребление": "🔫",
    "Саботаж": "💥",
    "Штурм": "⚔️",
    "Шпионаж": "👁️",
    "Дефекция": "🏃",
    "Территория": "🛡️",
    "Очистка": "⚗️",
    "Эвакуация": "🚶",
    "Артефакт": "📦",
    "Коррупция": "☣️",
    "Водопад Пустоты": "🌀",
    "Армагеддон": "☄️",
    "Алхимия": "⚗️",
}

TIER_CONFIG = {
    "S": {"color": 0xFFD700, "emoji": "🟡"},
    "A": {"color": 0x57F287, "emoji": "🟢"},
    "B": {"color": 0x5865F2, "emoji": "🔵"},
    "C": {"color": 0x99AAB5, "emoji": "⚪"},
    "D": {"color": 0xE67E22, "emoji": "🟠"},
    "F": {"color": 0xED4245, "emoji": "🔴"},
}

_cache = {}

def clear_cache():
    global _cache
    _cache = {}

def load_browse_data():
    global _cache
    try:
        headers = {"User-Agent": "WarframeArbiBot/3.0"}
        regions = requests.get("https://browse.wf/warframe-public-export-plus/ExportRegions.json", headers=headers, timeout=15).json()
        lang_ru = requests.get("https://browse.wf/warframe-public-export-plus/dict.ru.json", headers=headers, timeout=15).json()
        tiers_js = requests.get("https://browse.wf/supplemental-data/arbyTiers.js", headers=headers, timeout=15).text
        tiers = {}
        for m in re.finditer(r'(\w+):\s*"([SABCDF])"', tiers_js):
            tiers[m.group(1)] = m.group(2)
        sched_lines = requests.get("https://browse.wf/arbys.txt", headers=headers, timeout=15).text
        schedule = []
        for line in sched_lines.strip().split("\n"):
            parts = line.split(",")
            if len(parts) == 2:
                schedule.append((int(parts[0]), parts[1]))
        _cache = {"regions": regions, "lang": lang_ru, "tiers": tiers, "schedule": schedule}
        print(f"[Data] Загружено: {len(tiers)} тиров, {len(schedule)} слотов")
        return True
    except Exception as e:
        print(f"[Data] Ошибка: {e}")
        clear_cache()
        return False

def loc(key):
    if not key or "/" not in key:
        return key
    return _cache.get("lang", {}).get(key, key.split("/")[-1])

def get_tier(node_key):
    return _cache.get("tiers", {}).get(node_key, "F")

def get_node_info(node_key):
    return _cache.get("regions", {}).get(node_key, {})

def get_faction_name(node_key):
    info = get_node_info(node_key)
    fkey = info.get("faction", "") if info else ""
    return FACTION_RU.get(fkey, fkey.replace("FC_", "").title())

def get_faction_key(node_key):
    info = get_node_info(node_key)
    return info.get("faction", "") if info else ""

def get_mission_name(node_key):
    info = get_node_info(node_key)
    if info:
        mtype_key = info.get("missionType", "")
        return MTYPE_MAP.get(mtype_key, mtype_key.replace("MT_", "").title())
    return "Выживание"

def is_dark_sector(node_info):
    ds = node_info.get("darkSectorData") if node_info else None
    return ds is not None and isinstance(ds, dict)

def get_dark_bonuses(node_info):
    ds = node_info.get("darkSectorData")
    if not ds:
        return None
    parts = []
    r = ds.get("resourceBonus", 0)
    if r:
        parts.append(f"💰 +{int(round(r*100))}% ресурсов")
    x = ds.get("xpBonus", 0)
    if x:
        parts.append(f"✨ +{int(round(x*100))}% опыта")
    wtype = ds.get("weaponXpBonusFor", "")
    wval = ds.get("weaponXpBonusVal", 0)
    if wtype and wval:
        wpn_map = {"Rifles": "Винтовки", "Pistols": "Пистолеты", "Melee": "Ближний бой", "Shotguns": "Дробовики"}
        wpn = wpn_map.get(wtype, wtype)
        parts.append(f"🔫 +{int(round(wval*100))}% XP: {wpn}")
    return "\n".join(parts) if parts else None

def get_current_and_next():
    schedule = _cache.get("schedule", [])
    if not schedule:
        return None, None
    now = datetime.now(timezone.utc).timestamp()
    current = None
    next_arbi = None
    for ts, node in schedule:
        if ts <= now and (current is None or ts > current[0]) and ts + 3600 > now:
            current = (ts, node)
        if ts > now and next_arbi is None:
            next_arbi = (ts, node)
    return current, next_arbi

def build_embed_current(current):
    ts, node_key = current
    dt = datetime.fromtimestamp(ts, timezone.utc)
    info = get_node_info(node_key)
    node_name = loc(info.get("name", "")) if info else node_key
    planet_name = loc(info.get("systemName", "")) if info else node_key
    faction = get_faction_name(node_key)
    mtype = get_mission_name(node_key)
    f_emoji = FACTION_EMOJI.get(faction, "⚔️")
    m_emoji = MTYPE_EMOJI.get(mtype, "🎮")
    fkey = get_faction_key(node_key)
    tier = get_tier(node_key)
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["F"])
    time_str = dt.strftime("%H:%M")
    eng = FACTION_TO_ENGLISH.get(fkey.upper())
    weaks = WEAKNESSES.get(eng, []) if eng else []
    weak_str = "  ".join(f"{e} {n}" for e, n in weaks) if weaks else "—"
    fields = [
        {"name": "🔻 Фракция", "value": f"{f_emoji} {faction}", "inline": True},
        {"name": "🎯 Миссия", "value": f"{m_emoji} {mtype}", "inline": True},
        {"name": "🌍 Планета", "value": planet_name or "—", "inline": True},
        {"name": "💀 Уязвимости", "value": weak_str, "inline": False},
    ]
    if is_dark_sector(info):
        ds_bonuses = get_dark_bonuses(info)
        if ds_bonuses:
            fields.append({"name": "🌑 Тёмный сектор", "value": ds_bonuses, "inline": False})
    return {
        "author": {"name": "⚔️ АРБИТРАЖ СЕЙЧАС ⚔️"},
        "title": f"{cfg['emoji']} {tier} Тир | {node_name}",
        "description": f"⏳ Заканчивается в **{time_str} UTC**",
        "color": cfg["color"],
        "thumbnail": {"url": "https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png"},
        "fields": fields,
        "footer": {"text": "browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

def build_embed_next(next_arbi):
    ts, node_key = next_arbi
    dt = datetime.fromtimestamp(ts, timezone.utc)
    info = get_node_info(node_key)
    node_name = loc(info.get("name", "")) if info else node_key
    planet_name = loc(info.get("systemName", "")) if info else node_key
    faction = get_faction_name(node_key)
    mtype = get_mission_name(node_key)
    f_emoji = FACTION_EMOJI.get(faction, "⚔️")
    m_emoji = MTYPE_EMOJI.get(mtype, "🎮")
    fkey = get_faction_key(node_key)
    tier = get_tier(node_key)
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["F"])
    time_str = dt.strftime("%H:%M UTC")
    eng = FACTION_TO_ENGLISH.get(fkey.upper())
    weaks = WEAKNESSES.get(eng, []) if eng else []
    weak_str = "  ".join(f"{e} {n}" for e, n in weaks) if weaks else "—"
    fields = [
        {"name": "🔻 Фракция", "value": f"{f_emoji} {faction}", "inline": True},
        {"name": "🎯 Миссия", "value": f"{m_emoji} {mtype}", "inline": True},
        {"name": "🌍 Планета", "value": planet_name or "—", "inline": True},
        {"name": "💀 Уязвимости", "value": weak_str, "inline": False},
    ]
    if is_dark_sector(info):
        ds_bonuses = get_dark_bonuses(info)
        if ds_bonuses:
            fields.append({"name": "🌑 Тёмный сектор", "value": ds_bonuses, "inline": False})
    return {
        "author": {"name": "⏰ АРБИТРАЖ СКОРО ⏰"},
        "title": f"{cfg['emoji']} {tier} Тир | {node_name}",
        "description": f"🕐 Начнётся в **{time_str}**",
        "color": cfg["color"],
        "thumbnail": {"url": "https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png"},
        "fields": fields,
        "footer": {"text": "browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

def send_webhook(embeds):
    payload = {"username": "Arbitration Alert", "avatar_url": "https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png", "embeds": embeds}
    try:
        r = requests.post(WEBHOOK_URL, json=payload, timeout=15)
        return r.status_code in (200, 204)
    except Exception as e:
        print(f"[Webhook] Ошибка: {e}")
        return False

def main():
    print("=" * 50)
    print("  Warframe Arbitration Notify v7")
    print("=" * 50)
    if not load_browse_data():
        print("[ERROR] Не удалось загрузить данные")
        return
    current, next_arbi = get_current_and_next()
    embeds = []
    if current:
        embeds.append(build_embed_current(current))
        node_key = current[1]
        print(f"[Текущая] {node_key} -> {get_faction_name(node_key)} | {get_mission_name(node_key)}")
    if next_arbi:
        embeds.append(build_embed_next(next_arbi))
        node_key = next_arbi[1]
        print(f"[Следующая] {node_key} -> {get_faction_name(node_key)} | {get_mission_name(node_key)}")
    if not embeds:
        embeds.append({"title": "Нет арбитражей", "description": "Арбитражи не запланированы.", "color": 0x99AAB5})
        print("[Инфо] Нет арбитражей")
    ok = send_webhook(embeds)
    print(f"[Результат] {'OK' if ok else 'FAIL'}")

if __name__ == "__main__":
    main()

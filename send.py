import requests
import re
import os
from datetime import datetime, timezone

WEBHOOK_URL = "https://discord.com/api/webhooks/1495464020755484782/sM5PWU38Vlg-zqY3oAwgAn50jTsiMT4eHG3FmGG2yq5wFqlrdgEDczyUt7W4qjjvh0-Q"

TIER_CONFIG = {
    "S": {"color": 0xFFD700, "emoji": "🟡"},
    "A": {"color": 0x57F287, "emoji": "🟢"},
    "B": {"color": 0x5865F2, "emoji": "🔵"},
    "C": {"color": 0x99AAB5, "emoji": "⚪"},
    "D": {"color": 0xE67E22, "emoji": "🟠"},
    "F": {"color": 0xED4245, "emoji": "🔴"},
}

MISSION_EMOJI = {
    "Survival": "⏱️", "Excavation": "⛏️", "Interception": "📡",
    "Disruption": "💣", "Defense": "🛡️", "Mobile Defense": "🛡️",
    "Infested Salvage": "🧟", "Defection": "🏃", "Spy": "👁️",
    "Capture": "🎯", "Rescue": "🆘", "Exterminate": "🔫",
    "Sabotage": "💥", "Assault": "⚔️", "Void Flood": "🌀",
    "Void Cascade": "🌊", "Void Armageddon": "☄️", "Alchemy": "⚗️",
}

FACTION_MAP = {
    "Grineer": "Гринир",
    "Corpus": "Корпус",
    "Infested": "Заражённые",
    "Corrupted": "Орокин",
    "Orokin": "Орокин",
    "Sentient": "Владеющие Разумом",
    "Narmer": "Нармер",
}

FACTION_WEAKNESSES = {
    "Grineer": [("☢️", "Коррозия"), ("🟡", "Радиация"), ("🔴", "Рассечение"), ("🦠", "Вирус")],
    "Corpus": [("🔵", "Магнетизм"), ("☣️", "Токсин"), ("🟡", "Радиация")],
    "Infested": [("🔥", "Огонь"), ("🔴", "Рассечение"), ("☣️", "Токсин"), ("☁️", "Газ")],
    "Corrupted": [("🟡", "Радиация"), ("🦠", "Вирус"), ("🔵", "Магнетизм"), ("☢️", "Коррозия")],
    "Sentient": [("🟡", "Радиация"), ("🔴", "Рассечение")],
    "Narmer": [("🟡", "Радиация"), ("🔴", "Рассечение")],
}

_cache = {}


def load_browse_data():
    global _cache
    try:
        headers = {"User-Agent": "WarframeArbiBot/2.0"}
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
        print(f"[Data] Loaded: {len(tiers)} tiers, {len(schedule)} schedule entries")
        return True
    except Exception as e:
        print(f"[Data] Error: {e}")
        return False


def loc(key):
    if "/" not in key:
        return key
    return _cache.get("lang", {}).get(key, key.split("/")[-1])


def get_tier(node_key):
    return _cache.get("tiers", {}).get(node_key, "F")


def get_node_info(node_key):
    return _cache.get("regions", {}).get(node_key, {})


def get_current_and_next_arbitration():
    schedule = _cache.get("schedule", [])
    if not schedule:
        return None, None
    
    now = datetime.now(timezone.utc).timestamp()
    current_hour = int(now // 3600) * 3600
    
    current = None
    next_arbi = None
    
    for ts, node in schedule:
        if ts <= now and (current is None or ts > current[0]):
            if ts + 3600 > now:
                current = (ts, node)
        if ts > now and next_arbi is None:
            next_arbi = (ts, node)
    
    return current, next_arbi


def build_current_embed(current):
    ts, node_key = current
    dt = datetime.fromtimestamp(ts, timezone.utc)
    end_ts = int((ts + 3600) * 1000)
    
    node_info = get_node_info(node_key)
    
    if node_info:
        node_ru = loc(node_info.get("name", ""))
        planet_ru = loc(node_info.get("systemName", ""))
    else:
        node_ru = node_key
        planet_ru = node_key
    
    tier = get_tier(node_key)
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["F"])
    
    time_str = dt.strftime("%H:%M")
    
    embed = {
        "author": {"name": "АРБИТРАЖ • СЕЙЧАС"},
        "title": f"{cfg['emoji']} {tier} Тир | {node_ru}",
        "description": f"⏳ Заканчивается в **{time_str} UTC**",
        "color": cfg["color"],
        "fields": [
            {"name": "Node Key", "value": node_key, "inline": True},
            {"name": "Планета", "value": planet_ru or "—", "inline": True},
        ],
        "footer": {"text": "browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    return embed


def build_next_embed(next_arbi):
    ts, node_key = next_arbi
    dt = datetime.fromtimestamp(ts, timezone.utc)
    
    node_info = get_node_info(node_key)
    
    if node_info:
        node_ru = loc(node_info.get("name", ""))
        planet_ru = loc(node_info.get("systemName", ""))
    else:
        node_ru = node_key
        planet_ru = node_key
    
    tier = get_tier(node_key)
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["F"])
    
    time_str = dt.strftime("%H:%M UTC")
    
    embed = {
        "author": {"name": "АРБИТРАЖ • СКОРО"},
        "title": f"{cfg['emoji']} {tier} Тир | {node_ru}",
        "description": f"🕐 Начнётся в **{time_str}**",
        "color": cfg["color"],
        "fields": [
            {"name": "Node Key", "value": node_key, "inline": True},
            {"name": "Время", "value": time_str, "inline": True},
            {"name": "Планета", "value": planet_ru or "—", "inline": True},
        ],
        "footer": {"text": "browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    return embed


def send_webhook(embeds):
    payload = {"username": "Arbitration Alert", "embeds": embeds}
    try:
        resp = requests.post(WEBHOOK_URL, json=payload, timeout=15)
        return resp.status_code in (200, 204)
    except Exception as e:
        print(f"[Webhook] Error: {e}")
        return False


def main():
    print("=" * 50)
    print("  Warframe Arbitration Notify v4")
    print("=" * 50)

    if not load_browse_data():
        print("[ERROR] Failed to load data")
        return

    current, next_arbi = get_current_and_next_arbitration()
    
    embeds = []
    
    if current:
        embeds.append(build_current_embed(current))
        print(f"[Current] {current[1]} - {datetime.fromtimestamp(current[0], timezone.utc).strftime('%H:%M')}")
    else:
        print("[Info] No current arbitration")
    
    if next_arbi:
        embeds.append(build_next_embed(next_arbi))
        print(f"[Next] {next_arbi[1]} - {datetime.fromtimestamp(next_arbi[0], timezone.utc).strftime('%H:%M UTC')}")
    
    if not embeds:
        embeds.append({
            "title": "Нет арбитражей",
            "description": "На ближайшее время арбитражей нет.",
            "color": 0x99AAB5,
        })
        print("[Info] No arbitrations in schedule")

    ok = send_webhook(embeds)
    print(f"[Result] {'Success!' if ok else 'Failed'}")


if __name__ == "__main__":
    main()
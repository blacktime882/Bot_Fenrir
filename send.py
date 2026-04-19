import requests
import re
import os
import json
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
_cache_ts = 0
CACHE_TTL = 6 * 3600


def load_browse_data():
    global _cache, _cache_ts
    import time
    now = time.time()
    if _cache and (now - _cache_ts) < CACHE_TTL:
        return True
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
        _cache_ts = now
        print(f"[Data] Loaded: {len(regions)} nodes, {len(tiers)} tiers, {len(schedule)} schedule entries")
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


def get_next_arbitration():
    schedule = _cache.get("schedule", [])
    if not schedule:
        return None
    
    now = datetime.now(timezone.utc).timestamp()
    current_hour = int(now // 3600) * 3600
    
    for ts, node in schedule:
        if ts >= current_hour:
            return ts, node
    
    return None


def fetch_live_arbitration():
    try:
        r = requests.get("https://api.warframestat.us/pc/arbitration", params={"language": "en"}, timeout=10)
        r.raise_for_status()
        data = r.json()
        if data.get("expired") or data.get("node") == "SolNode000":
            return None
        return data
    except Exception as e:
        print(f"[API] Error: {e}")
        return None


def get_time_remaining(expiry_str):
    try:
        expiry = datetime.fromisoformat(expiry_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        delta = int((expiry - now).total_seconds())
        if delta <= 0:
            return 0, "soon", 0
        h = delta // 3600
        m = (delta % 3600) // 60
        if h > 0:
            return delta, f"{h}h {m}m", int(expiry.timestamp())
        return delta, f"{m} min", 0
    except:
        return 0, "unknown", 0


def build_schedule_embed(schedule_data):
    ts, node_key = schedule_data
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
        "author": {"name": "ARBITRATION SCHEDULE"},
        "title": f"{cfg['emoji']} {tier} Tier | {node_ru}",
        "description": f"🕐 Next: **{time_str}**",
        "color": cfg["color"],
        "fields": [
            {"name": "Node", "value": node_key, "inline": True},
            {"name": "Time UTC", "value": time_str, "inline": True},
        ],
        "footer": {"text": "Warframe Arbitration • browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    return embed


def build_live_embed(arbi):
    node_key = arbi.get("nodeKey", "")
    node_name = arbi.get("node", "Unknown")
    enemy = arbi.get("enemy", "Unknown")
    mtype = arbi.get("type", "Unknown")
    expiry = arbi.get("expiry", "")
    archwing = arbi.get("archwing", False)
    sharkwing = arbi.get("sharkwing", False)

    node_info = get_node_info(node_key) if node_key else {}
    
    if node_info:
        node_ru = loc(node_info.get("name", ""))
        planet_ru = loc(node_info.get("systemName", ""))
    else:
        node_ru = node_name.split("(")[0].strip() if "(" in node_name else node_name
        planet_ru = ""

    faction = FACTION_MAP.get(enemy, enemy)
    
    tier = get_tier(node_key) if node_key else "F"
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["F"])

    seconds_left, time_str, unix_ts = get_time_remaining(expiry)

    weaknesses = FACTION_WEAKNESSES.get(enemy, [])
    weak_str = "  ".join(f"{e} {n}" for e, n in weaknesses) if weaknesses else "—"

    mode_tag = ""
    if archwing:
        mode_tag = " (Archwing)"
    elif sharkwing:
        mode_tag = " (Sharkwing)"

    embed = {
        "author": {"name": f"ACTIVE • {faction}"},
        "title": f"{cfg['emoji']} {tier} Tier | {node_ru}{mode_tag}",
        "description": f"⏳ Ends <t:{unix_ts}:R>" if unix_ts > 0 else f"⏳ Ends in **{time_str}**",
        "color": cfg["color"],
        "fields": [
            {"name": "Enemy", "value": faction, "inline": True},
            {"name": "Mission", "value": mtype, "inline": True},
            {"name": "Node", "value": node_key or "—", "inline": True},
            {"name": "Weaknesses", "value": weak_str, "inline": False},
        ],
        "footer": {"text": "Warframe Arbitration • browse.wf/arbys"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    return embed


def send_webhook(embed):
    payload = {"username": "Arbitration Alert", "embeds": [embed]}
    try:
        resp = requests.post(WEBHOOK_URL, json=payload, timeout=15)
        return resp.status_code in (200, 204)
    except Exception as e:
        print(f"[Webhook] Error: {e}")
        return False


def main():
    print("=" * 50)
    print("  Warframe Arbitration Notify v3")
    print("=" * 50)

    if not load_browse_data():
        print("[ERROR] Failed to load browse.wf data")
        return

    arbi = fetch_live_arbitration()
    
    if arbi and not arbi.get("expired"):
        embed = build_live_embed(arbi)
        print(f"[Live] {arbi.get('node')} ({arbi.get('type')})")
    else:
        next_arbi = get_next_arbitration()
        if next_arbi:
            embed = build_schedule_embed(next_arbi)
            print(f"[Schedule] Next: {datetime.fromtimestamp(next_arbi[0], timezone.utc).strftime('%H:%M UTC')}")
        else:
            embed = {
                "title": "No Active Arbitration",
                "description": "No arbitration right now. Check schedule for next.",
                "color": 0x99AAB5,
            }
            print("[Info] No arbitration")

    ok = send_webhook(embed)
    print(f"[Result] {'Success!' if ok else 'Failed'}")


if __name__ == "__main__":
    main()
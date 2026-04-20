const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let webhooks = [];
let lastSentArbi = null;
let lastCheckMinute = null;
let lastFissureIds = new Set();

function loadWebhooks() {
    try {
        const configPath = path.join(__dirname, '..', 'config', 'webhooks.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        webhooks = config.webhooks || [];
        console.log(`[Webhook] Loaded ${webhooks.length} webhooks from config`);
    } catch (e) {
        console.log(`[Webhook] Config error: ${e.message}`);
        webhooks = [];
    }
    
    // Загрузить из .env если есть WEBHOOK_URL
    if (process.env.WEBHOOK_URL) {
        webhooks.push({
            name: "env-arbi",
            url: process.env.WEBHOOK_URL,
            events: ["arbi"]
        });
        console.log(`[Webhook] Loaded webhook from .env (WEBHOOK_URL) for events: arbi`);
    }
}

function getWebhooks() {
    return webhooks;
}

async function sendToWebhook(embeds, eventType, retryCount = 0) {
    const wh = webhooks.filter(w => w.events && w.events.includes(eventType));
    if (wh.length === 0) {
        console.log(`[Webhook] No webhooks for event: ${eventType}`);
        return;
    }

    for (const webhook of wh) {
        try {
            const embedArray = Array.isArray(embeds) ? embeds : [embeds];
            const payload = {
                username: "Fenrir",
                avatar_url: "https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png",
                embeds: embedArray
            };
            console.log(`[Webhook] Sending ${embedArray.length} embeds for ${eventType} to ${webhook.name}`);
            await axios.post(webhook.url, payload, { timeout: 10000 });
            console.log(`[Webhook] Sent to ${webhook.name}`);
        } catch (e) {
            console.log(`[Webhook] Error ${webhook.name}: ${e.message}`);
            if (retryCount < 2) {
                console.log(`[Webhook] Retrying ${webhook.name} in 3 seconds... (${retryCount + 1}/2)`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                await sendToWebhook(embeds, eventType, retryCount + 1);
            }
        }
    }
}

function checkArbitrationStart(schedule) {
    if (!schedule || schedule.length === 0) return null;

    const now = Math.floor(Date.now() / 1000);
    const currentMinute = Math.floor(now / 60);

    if (lastCheckMinute === currentMinute) return null;
    lastCheckMinute = currentMinute;

    console.log(`[Alert Check] Current time: ${now} (${new Date(now * 1000).toISOString()}), checking ${schedule.length} slots`);

    for (const [ts, nodeKey] of schedule) {
        if (ts > now - 60 && ts <= now) {
            if (!lastSentArbi || lastSentArbi[1] !== nodeKey) {
                lastSentArbi = [ts, nodeKey];
                console.log(`[Alert] New arbitration started: ${nodeKey} at ${ts} (${new Date(ts * 1000).toISOString()})`);
                return [ts, nodeKey];
            }
        }
    }

    return null;
}

function setLastSentArbi(arbi) {
    lastSentArbi = arbi;
}

function checkFissureStart(fissures) {
    if (!fissures || fissures.length === 0) return [];

    const now = Math.floor(Date.now() / 1000);

    console.log(`[Fissure Check] Current time: ${now}, checking ${fissures.length} fissures`);

    const newFissures = fissures.filter(f => f.start <= now && f.end > now && !lastFissureIds.has(f.id));
    newFissures.forEach(f => {
        lastFissureIds.add(f.id);
        console.log(`[Fissure] New fissure: ${f.tier} ${f.location} (${f.id})`);
    });

    // Filter to all Omnia tier fissures on both steel and normal path
    const filteredFissures = newFissures.filter(f => f.tier === "Omnia");

    return filteredFissures;
}

module.exports = { loadWebhooks, getWebhooks, sendToWebhook, checkArbitrationStart, setLastSentArbi, checkFissureStart };
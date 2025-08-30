// utils/cooldownManager.js

const cooldownMap = new Map();           // userId: lastCommandTimestamp
const activeUserMap = new Map();         // userId: lastCommandTimestamp
const ACTIVE_WINDOW = 30000;             // 30s window for recent command users
const BASE_COOLDOWN = 3000;              // 3s min
const MAX_COOLDOWN = 12000;              // 12s max

function isOwner(userId, guild) {
    if (!guild) return false;
    // For guilds, check if userId matches guild owner ID
    return guild.ownerId === userId;
}

function getDynamicCooldown() {
    const now = Date.now();
    let activeCount = 0;
    for (const last of activeUserMap.values()) {
        if (now - last < ACTIVE_WINDOW) activeCount++;
    }
    // Scale: every 5 people active = +15% towards max (tweak for your taste)
    const scale = Math.min(activeCount / 5, 1);
    return Math.floor(BASE_COOLDOWN + scale * (MAX_COOLDOWN - BASE_COOLDOWN));
}

function checkCooldown(userId, guild) {
    if (isOwner(userId, guild)) return { allowed: true };

    const now = Date.now();
    const cooldown = getDynamicCooldown();

    const last = cooldownMap.get(userId) || 0;
    const timeLeft = cooldown - (now - last);

    // Mark user as recently active
    activeUserMap.set(userId, now);

    if (timeLeft > 0) {
        return { allowed: false, cooldown, timeLeft };
    } else {
        cooldownMap.set(userId, now);
        return { allowed: true };
    }
}

module.exports = { checkCooldown };

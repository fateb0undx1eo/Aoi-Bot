// utils/cooldownManager.js

const commandCooldown = new Map();  // userId: { command: lastTimestamp }
const spamTracker = new Map();      // userId: [timestamps]
const globalCooldown = new Map();   // userId: expiryTimestamp

const PER_COMMAND_COOLDOWN = 7000;  // 7s
const SPAM_WINDOW = 10000;          // 10s window for spam
const SPAM_THRESHOLD = 5;           // 5 commands in 10s triggers global cooldown
const GLOBAL_COOLDOWN = 15000;      // 15s global cooldown

function canRunCommand(userId, commandName) {
    const now = Date.now();

    // Check global cooldown first
    if (globalCooldown.has(userId) && now < globalCooldown.get(userId)) {
        return { allowed: false, reason: 'globalCooldown' };
    }

    // Check per-command cooldown
    if (!commandCooldown.has(userId)) commandCooldown.set(userId, {});
    const userCommands = commandCooldown.get(userId);

    if (userCommands[commandName] && now - userCommands[commandName] < PER_COMMAND_COOLDOWN) {
        return { allowed: false, reason: 'commandCooldown' };
    }

    // Record this command timestamp
    userCommands[commandName] = now;
    commandCooldown.set(userId, userCommands);

    // Track spam (commands per 10s)
    if (!spamTracker.has(userId)) spamTracker.set(userId, []);
    const timestamps = spamTracker.get(userId);

    timestamps.push(now);
    // Remove old timestamps outside spam window
    while (timestamps.length && now - timestamps[0] > SPAM_WINDOW) {
        timestamps.shift();
    }

    // Check spam threshold
    if (timestamps.length >= SPAM_THRESHOLD) {
        // Trigger global cooldown
        globalCooldown.set(userId, now + GLOBAL_COOLDOWN);
        return { allowed: false, reason: 'spamTriggered' };
    }

    return { allowed: true };
}

module.exports = { canRunCommand };

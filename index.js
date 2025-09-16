require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { startAutoPoster } = require('./utils/autoPoster');
const quoteManager = require('./utils/quoteManager');
const express = require("express");
const TOKEN = process.env.TOKEN;
const MEME_CHANNEL_ID = process.env.MEME_CHANNEL_ID;
const BUMP_CHANNEL_ID = process.env.BUMP_CHANNEL_ID;
const PREFIX = 's!';

// ---------- Global rejection / crash handlers ----------
process.on('unhandledRejection', err => console.error('[Unhandled Rejection]', err));
process.on('uncaughtException', err => {
  console.error('[Uncaught Exception]', err);
  process.exit(1); // Let Render restart
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// ---------- Command Loader ----------
function loadCommands(dirPath = path.join(__dirname, 'commands')) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        delete require.cache[require.resolve(fullPath)];
        const command = require(fullPath);
        if (command.name && typeof command.execute === 'function') {
          client.commands.set(command.name, command);
          console.log(`✅ Loaded command: ${command.name} (${fullPath})`);
        } else {
          console.warn(`⚠️ Skipped invalid command file: ${file}`);
        }
      } catch (e) {
        console.error(`❌ Error loading command ${file}:`, e);
      }
    }
  }
}
loadCommands();

// ---------- Ready Event ----------
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
  startAutoPoster(client, MEME_CHANNEL_ID);

  quoteManager.loadConfigs();

  const guildConfigs = quoteManager.configs || {};
  for (const guildId of Object.keys(guildConfigs)) {
    const config = guildConfigs[guildId];
    if (config && config.quoteChannelId && config.quoteIntervalHours) {
      console.log(`Starting quote scheduler for guild ${guildId} with interval ${config.quoteIntervalHours} hour(s).`);
      quoteManager.startScheduler(client, guildId);
    }
  }

  client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Listening });
});

// ---------- Connection & Error Handlers ----------
client.on("error", err => console.error("Client error:", err));
client.on("shardDisconnect", (event, id) =>
  console.warn(`❌ Shard ${id} disconnected (${event.code}).`)
);
client.on("shardReconnecting", id =>
  console.log(`🔄 Shard ${id} reconnecting...`)
);
client.on("shardReady", id =>
  console.log(`✅ Shard ${id} reconnected successfully`)
);

// ---------- Watchdog ----------
setInterval(() => {
  if (client.ws.status !== 0) { // 0 = READY
    console.error("⚠️ Lost connection to Discord, forcing restart...");
    process.exit(1);
  }
}, 5 * 60 * 1000);

// ---------- Cache Cleaner ----------
client.caches = new Map();
client.registerCache = function (key, cacheArray, maxSize = 50) {
  if (!Array.isArray(cacheArray)) return console.warn(`[CacheCleaner] Can't register cache '${key}': Not an array.`);
  this.caches.set(key, { cacheArray, maxSize });
};
function trimCache(cacheArray, maxSize) {
  let removedCount = 0;
  while (cacheArray.length > maxSize) {
    cacheArray.shift();
    removedCount++;
  }
  return removedCount;
}
function performCacheCleaning() {
  let totalRemoved = 0;
  for (const [key, { cacheArray, maxSize }] of client.caches.entries()) {
    if (!Array.isArray(cacheArray)) continue;
    const removed = trimCache(cacheArray, maxSize);
    totalRemoved += removed;
    if (removed > 0) console.log(`[CacheCleaner] Trimmed '${key}' by ${removed} entries.`);
  }
  if (totalRemoved > 0) console.log(`[CacheCleaner] Total entries removed: ${totalRemoved}`);
}
setInterval(performCacheCleaning, 60 * 60 * 1000);

// Example caches
client.memeCache = [];
client.quoteCache = [];
client.registerCache('memeCache', client.memeCache, 50);
client.registerCache('quoteCache', client.quoteCache, 50);

// ---------- Slash Command Handler ----------
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    if (command.slashExecute) await command.slashExecute(interaction, client);
    else await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    const reply = { content: 'There was an error executing this command!', ephemeral: true };
    interaction.deferred || interaction.replied
      ? interaction.followUp(reply)
      : interaction.reply(reply);
  }
});

// ---------- Message Handler ----------
client.on('messageCreate', async message => {
  if (message.channel.id === BUMP_CHANNEL_ID) {
    setTimeout(() => {
      message.delete().catch(err => {
        console.error(`[AutoDelete] Failed to delete message in bump channel:`, err.message);
      });
    }, 5000);
    return;
  }
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    await command.execute(message, client, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing this command!');
  }
});

// ---------- Extra Safety: Sweep bump channel every 10s ----------
setInterval(async () => {
  try {
    if (!BUMP_CHANNEL_ID) return;
    const channel = await client.channels.fetch(BUMP_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;
    const messages = await channel.messages.fetch({ limit: 10 });
    const toDelete = messages.filter(m => Date.now() - m.createdTimestamp > 5000);
    for (const msg of toDelete.values()) {
      await msg.delete().catch(err => {
        console.error("[AutoCleaner Error]", err.message);
      });
    }
  } catch (err) {
    console.error("[AutoCleaner Fatal Error]", err.message);
  }
}, 10000);

// ---------- Login ----------
client.login(TOKEN);

// ---------- Keep Alive Web Server ----------
const app = express();
app.get("/", (req, res) => {
  if (client.ws.status === 0) {
    res.send("✅ Bot connected to Discord!");
  } else {
    res.status(500).send("❌ Bot not connected to Discord.");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));

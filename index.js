require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { startAutoPoster } = require('./utils/autoPoster');
const quoteManager = require('./utils/quoteManager');

const TOKEN = process.env.TOKEN;
const MEME_CHANNEL_ID = process.env.MEME_CHANNEL_ID;
const PREFIX = 's!';

// ---------- Global rejection handler ----------
process.on('unhandledRejection', err => console.error('[Unhandled Rejection]', err));

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
  quoteManager.loadConfig();
  for (const guildId of Object.keys(quoteManager.guildConfigs)) {
    const config = quoteManager.guildConfigs[guildId];
    if (config && config.quoteChannelId && config.quoteIntervalHours) {
      console.log(`Starting quote scheduler for guild ${guildId} with interval ${config.quoteIntervalHours} hour(s).`);
      quoteManager.startScheduler(client, guildId);
    }
  }
  client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Listening });
});

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

// ---------- Message Handler without Automod ----------
client.on('messageCreate', async message => {
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

// ---------- Login ----------
client.login(TOKEN);
// ---------- Keep Alive Web Server (for Render + UptimeRobot) ----------
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive! ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`);
});

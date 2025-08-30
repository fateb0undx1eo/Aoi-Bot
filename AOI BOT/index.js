require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { startAutoPoster } = require('./utils/autoPoster');
const quoteManager = require('./utils/quoteManager');
const { checkMessageContent } = require('./utils/moderation');

const TOKEN = process.env.TOKEN;
const MEME_CHANNEL_ID = process.env.MEME_CHANNEL_ID;
const PREFIX = 's!';

// ---------- PATCH: global rejection handler ----------
process.on('unhandledRejection', err => {
  console.error('[Unhandled Rejection]', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// ---------- PATCH: smarter command loader ----------
function loadCommands(dirPath = path.join(__dirname, 'commands')) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      delete require.cache[require.resolve(fullPath)];
      const command = require(fullPath);
      if (command.name && typeof command.execute === 'function') {
        client.commands.set(command.name, command);
        console.log(`✅ Loaded command: ${command.name} (${fullPath})`);
      } else {
        console.warn(`⚠️ Skipped invalid command file: ${file}`);
      }
    }
  }
}
loadCommands();

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
  startAutoPoster(client, MEME_CHANNEL_ID);

  // Load guild quote config and start quote scheduler
  quoteManager.loadConfig();
  for (const guildId of Object.keys(quoteManager.guildConfigs)) {
    const config = quoteManager.guildConfigs[guildId];
    if (config && config.quoteChannelId && config.quoteIntervalHours) {
      console.log(`Starting quote scheduler for guild ${guildId} with interval ${config.quoteIntervalHours} hour(s).`);
      quoteManager.startScheduler(client, guildId);
    } else {
      console.log(`Skipping quote scheduler for guild ${guildId} due to missing config.`);
    }
  }

  // ---------- PATCH: simple presence ----------
  client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Listening });
});

// --------- Advanced Cache Cleaner ---------
client.caches = new Map();
client.registerCache = function (key, cacheArray, maxSize = 50) {
  if (!Array.isArray(cacheArray)) {
    console.warn(`[CacheCleaner] Can't register cache '${key}': Not an array.`);
    return;
  }
  this.caches.set(key, { cacheArray, maxSize });
  console.log(`[CacheCleaner] Registered cache '${key}' with max size ${maxSize}.`);
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
  console.log('[CacheCleaner] Starting cache cleanup...');
  let totalRemoved = 0;
  for (const [key, { cacheArray, maxSize }] of client.caches.entries()) {
    if (!cacheArray || !Array.isArray(cacheArray)) {
      console.warn(`[CacheCleaner] Cache '${key}' is not an array or invalid.`);
      continue;
    }
    const beforeSize = cacheArray.length;
    const removed = trimCache(cacheArray, maxSize);
    const afterSize = cacheArray.length;
    totalRemoved += removed;
    if (removed > 0) {
      console.log(`[CacheCleaner] Trimmed cache '${key}' from ${beforeSize} to ${afterSize} (removed ${removed})`);
    }
  }
  console.log(`[CacheCleaner] Cache cleanup completed. Total entries removed: ${totalRemoved}`);
}
setInterval(performCacheCleaning, 60 * 60 * 1000);

// Example caches — replace or link with actual caches in your bot
client.memeCache = [];
client.quoteCache = [];
client.registerCache('memeCache', client.memeCache, 50);
client.registerCache('quoteCache', client.quoteCache, 50);

// Interaction (Slash Command) Handler
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

// Message Handler with Moderation
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Automod check
  if (checkMessageContent(message.content, message.author.id, message.guild)) {
    try {
      // Warn user via DM (no auto-delete message)
      await message.author.send(
        `⚠️ Your message in **${message.guild.name}** was flagged for inappropriate content. Please keep the server friendly.`
      );

      // Log to mod-log channel
      const modLogChannel = message.guild.channels.cache.get('1410209233433006121');
      if (modLogChannel) {
        modLogChannel.send(`🚨 **Automod Alert:** Message by ${message.author.tag} in <#${message.channel.id}> flagged.`);
      }
    } catch (err) {
      console.error('Automod error (DM/log):', err);
    }
    return; // Stop further processing (no commands)
  }

  // Proceed only if prefix matches
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

client.login(TOKEN);

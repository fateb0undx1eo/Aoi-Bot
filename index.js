require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const moderation = require('./utils/moderation');
const { startAutoPoster } = require('./utils/autoPoster');
const quoteManager = require('./utils/quoteManager');

const TOKEN = process.env.TOKEN;
const MEME_CHANNEL_ID = process.env.MEME_CHANNEL_ID;
const PREFIX = 's!';

// Hardcoded mod-log channel ID (can make per-guild config later)
const MODLOG_CHANNEL_ID = '1410209233433006121';

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

// --- Command loader ---
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
          console.log(`✅ Loaded command: ${command.name}`);
        } else {
          console.warn(`⚠️ Invalid command file: ${file}`);
        }
      } catch (e) {
        console.error(`❌ Error loading command ${file}:`, e);
      }
    }
  }
}
loadCommands();

// --- Ready event ---
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  startAutoPoster(client, MEME_CHANNEL_ID);
  quoteManager.loadConfig();
  for (const guildId of Object.keys(quoteManager.guildConfigs)) {
    const config = quoteManager.guildConfigs[guildId];
    if (config?.quoteChannelId && config?.quoteIntervalHours) {
      quoteManager.startScheduler(client, guildId);
      console.log(`Started quote scheduler for guild ${guildId}`);
    }
  }
  client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Listening });
});

// --- Slash command handler ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    if (command.slashExecute) await command.slashExecute(interaction, client);
    else await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    const reply = { content: 'Command execution error!', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// --- Message handler (prefix + moderation) ---
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Moderation check
  if (message.guild) {
    const { flagged, matchedWord } = moderation.checkMessageContent(
      message.content,
      message.author.id,
      message.guild
    );

    if (flagged) {
      try {
        // Delete message
        await message.delete();

        // DM user
        await message.author.send(
          `⚠️ Your message in **${message.guild.name}** was removed for containing a banned word: **${matchedWord}**.`
        );

        // Log to mod-log
        const modLogChannel = message.guild.channels.cache.get(MODLOG_CHANNEL_ID);
        if (modLogChannel) {
          await modLogChannel.send({
            content: `🚨 **Automod Alert**  
**User:** ${message.author.tag} (${message.author.id})  
**Channel:** <#${message.channel.id}>  
**Matched Word:** \`${matchedWord}\`  
**Message Content:** ${message.content}`,
          });
        }

        console.log(
          `🗑️ Deleted message from ${message.author.tag} in #${message.channel.name} (word: ${matchedWord})`
        );
      } catch (err) {
        console.error('Automod delete/DM/log error:', err);
      }
      return; // stop processing further (don’t run prefix commands)
    }
  }

  // Prefix command handling
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    await command.execute(message, client, args);
  } catch (error) {
    console.error(error);
    message.reply('Error executing that command!');
  }
});

// --- Express webserver ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ Discord bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

client.login(TOKEN);

module.exports = client; // export client if needed elsewhere

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

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const result = moderation.checkMessageContent(message.content, message.author.id, message.guild);

  if (result.flagged) {
    try {
      await message.delete();
      console.log(`Deleted message from ${message.author.tag} containing banned word.`);
    } catch (err) {
      console.error('Could not delete message:', err);
    }

    try {
      await message.author.send(
        `⚠️ Your message in **${message.guild.name}** was removed because it contained a banned word: **${result.matchedWord}**. Please follow the rules.`
      );
    } catch (err) {
      console.error(`Could not DM user ${message.author.tag}:`, err);
    }

    const modLogChannel = message.guild.channels.cache.get('1410209233433006121'); // Replace with your mod-log channel ID
    if (modLogChannel) {
      modLogChannel.send(`🚨 Deleted message from ${message.author.tag} for banned word: ${result.matchedWord}`);
    }
    return;
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, client, args);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error executing that command!');
  }
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ Discord bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

client.login(TOKEN);

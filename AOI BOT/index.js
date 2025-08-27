require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { startAutoPoster } = require('./utils/autoPoster');
const quoteManager = require('./utils/quoteManager'); // Import quoteManager
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
    GatewayIntentBits.GuildMembers // PATCH: future-proof for userinfo etc.
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
      delete require.cache[require.resolve(fullPath)]; // PATCH: hot-reload friendly
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
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
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

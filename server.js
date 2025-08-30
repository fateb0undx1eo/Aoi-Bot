// server.js
const { Client, GatewayIntentBits } = require('discord.js');
const moderation = require('./utils/moderation.js'); // <- from utils folder
require('dotenv').config();

// Create client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// When bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Message moderation handler
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const result = moderation.checkMessageContent(
      message.content,
      message.author.id,
      message.guild
    );

    if (result.flagged) {
      await message.delete().catch(() => {}); // ignore if already deleted

      // DM warning
      try {
        await message.author.send(
          `⚠️ Your message in **${message.guild.name}** was removed because it contained a banned word: **${result.matchedWord}**. Please follow the rules.`
        );
      } catch (dmError) {
        console.warn(`Could not DM ${message.author.tag}:`, dmError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error handling moderation:', error);
  }
});

// Start bot
client.login(process.env.TOKEN);

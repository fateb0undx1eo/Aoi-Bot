// server.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const moderation = require('./utils/moderation.js'); // <- from utils folder
const express = require('express');

// ---------- Client Setup ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// ---------- Ready Event ----------
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ---------- Message Moderation ----------
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

// ---------- Login ----------
client.login(process.env.TOKEN);

// ---------- Dummy Web Server for Render ----------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Discord bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

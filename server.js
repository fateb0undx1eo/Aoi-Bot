require('dotenv').config();
const express = require("express");
const app = express();
const { Client, GatewayIntentBits } = require('discord.js');
const moderation = require('./utils/moderation.js');

// Render needs an open port
const PORT = process.env.PORT || 8080;

// Health route
app.get("/", (req, res) => {
  res.send("Aoi Bot is alive! 🚀");
});

// Start web server first
app.listen(PORT, () => {
  console.log(`✅ Web server running on port ${PORT}`);
});

// Create Discord client with MessageContent intent enabled
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Moderation listener
client.on('messageCreate', async (message) => {
  // Ignore DMs and bots
  if (!message.guild || message.author.bot) return;

  try {
    const containsBannedWord = moderation.checkMessageContent(message.content, message.author.id, message.guild);
    if (containsBannedWord) {
      await message.delete();
      await message.channel.send(`${message.author}, 🚫 your message contained a banned word and was removed.`);
    }
  } catch (error) {
    console.error('Error handling moderation:', error);
  }
});

// Login the bot (make sure your token is in env)
client.login(process.env.TOKEN);

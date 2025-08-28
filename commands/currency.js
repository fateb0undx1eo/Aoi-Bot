const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;

// Cooldown storage
const userCooldowns = new Map();
let globalCooldownExpires = 0;
const USER_COOLDOWN_SECONDS = 30;
const GLOBAL_COOLDOWN_SECONDS = 10;

module.exports = {
  name: 'currency',
  description: 'Convert currency: s!currency 100 USD to JPY',

  async execute(message, client, args) {
    const userId = message.author.id;

    // Server owner bypass
    if (message.guild.ownerId !== userId) {
      const now = Date.now();

      // Check global cooldown
      if (now < globalCooldownExpires) {
        const timeLeft = Math.ceil((globalCooldownExpires - now) / 1000);
        return message.reply(`⏳ Please wait ${timeLeft} second(s) before anyone can use this command again.`);
      }

      // Check user cooldown
      if (userCooldowns.has(userId)) {
        const expirationTime = userCooldowns.get(userId);
        if (now < expirationTime) {
          const timeLeft = Math.ceil((expirationTime - now) / 1000);
          return message.reply(`⏳ You need to wait ${timeLeft} more second(s) before using this command again.`);
        }
      }
    }

    if (args.length < 4 || args[2].toLowerCase() !== 'to') {
      return message.reply('Usage: s!currency <amount> <from_currency> to <to_currency>\nExample: s!currency 100 USD to JPY');
    }

    const amount = parseFloat(args[0]);
    const from = args[1].toUpperCase();
    const to = args[3].toUpperCase();

    if (isNaN(amount)) {
      return message.reply('Invalid amount specified.');
    }

    try {
      const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${from}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.result !== 'success') {
        return message.reply('Failed to get exchange rates. Please try again later.');
      }

      const rate = data.conversion_rates[to];
      if (!rate) {
        return message.reply(`Currency code "${to}" not recognized.`);
      }

      const converted = (amount * rate).toFixed(2);

      const embed = new EmbedBuilder()
        .setTitle('💱 Currency Conversion')
        .setColor(0x5865F2)
        .setDescription(`${amount} ${from} = **${converted} ${to}**`)
        .setFooter({ text: 'Data provided by ExchangeRate-API' })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      // Set cooldowns (skip for owner)
      if (message.guild.ownerId !== userId) {
        const now = Date.now();
        userCooldowns.set(userId, now + USER_COOLDOWN_SECONDS * 1000);
        globalCooldownExpires = now + GLOBAL_COOLDOWN_SECONDS * 1000;
      }

    } catch (error) {
      console.error(error);
      message.channel.send('Failed to fetch exchange rates. Try again later.');
    }
  }
};

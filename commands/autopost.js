const { updateInterval } = require('../utils/autoPoster');
const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
  name: 'autopost',
  description: 'Set the meme auto-post interval in milliseconds (admin only)',
  async execute(message, client, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ Only admins can change auto-post interval.");
    }
    const intervalMs = parseInt(args[0], 10);
    if (isNaN(intervalMs)) return message.reply("❌ Please provide a valid number in milliseconds.");
    const success = updateInterval(client, intervalMs);
    if (success) {
      return message.reply(`✅ Auto-post interval updated to ${intervalMs / 1000} seconds.`);
    } else {
      return message.reply("❌ Interval too low or not initialized. Minimum is 10 seconds, channel must be set.");
    }
  },
  data: {
    name: 'autopost',
    description: 'Set the meme auto-post interval (admin only)',
    options: [
      {
        name: 'milliseconds',
        type: ApplicationCommandOptionType.Integer,
        description: 'Interval in ms (min 10000)',
        required: true
      }
    ]
  },
  async slashExecute(interaction, client) {
    if (!interaction.memberPermissions?.has('Administrator')) {
      return interaction.reply({ content: "❌ Only admins can use this.", ephemeral: true });
    }
    const intervalMs = interaction.options.getInteger('milliseconds');
    const success = updateInterval(client, intervalMs);
    if (success) {
      return interaction.reply(`✅ Auto-post interval updated to ${intervalMs / 1000} seconds.`);
    } else {
      return interaction.reply("❌ Interval too low or not initialized. Minimum is 10 seconds, channel must be set.");
    }
  }
};

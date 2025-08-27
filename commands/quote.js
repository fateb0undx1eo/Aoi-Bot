const { SlashCommandBuilder } = require('discord.js');
const quoteManager = require('../utils/quoteManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Quote related commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the channel for automatic quotes')
        .addChannelOption(option => option
          .setName('channel')
          .setDescription('Channel to post quotes in')
          .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setinterval')
        .setDescription('Set the interval (in hours) for automatic quotes')
        .addIntegerOption(option => option
          .setName('hours')
          .setDescription('Number of hours (min 1)')
          .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Get a random anime quote now')
    ),

  // Handler for slash commands
  async slashExecute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setchannel') {
      if (!interaction.member.permissions.has('ManageGuild')) {
        return interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
      }
      await quoteManager.setQuoteChannel(interaction);
    } else if (sub === 'setinterval') {
      if (!interaction.member.permissions.has('ManageGuild')) {
        return interaction.reply({ content: 'You need Manage Server permission.', ephemeral: true });
      }
      await quoteManager.setQuoteInterval(interaction);
    } else if (sub === 'get') {
      await quoteManager.sendQuote(interaction);
    }
  },

  // Handler for prefix commands: s!quote [setchannel|setinterval|get] args...
  async execute(message, client, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'setchannel') {
      if (!message.member.permissions.has('ManageGuild')) {
        return message.reply('You need Manage Server permission to use this.');
      }
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Please mention a channel.');
      }
      // Construct a fake interaction object for compatibility or create a new interface for your quoteManager methods
      // Here simplified: manually call quoteManager with channel and message info
      // You should extend your quoteManager methods for this use case or refactor to accept plain params
      // For demo:
      if (!quoteManager.guildConfigs) quoteManager.loadConfig();
      if (!quoteManager.guildConfigs[message.guild.id]) quoteManager.guildConfigs[message.guild.id] = {};
      quoteManager.guildConfigs[message.guild.id].quoteChannelId = channel.id;
      quoteManager.saveConfig();
      quoteManager.startScheduler(client, message.guild.id);
      return message.reply(`Quote channel set to ${channel.name}`);
    }

    else if (sub === 'setinterval') {
      if (!message.member.permissions.has('ManageGuild')) {
        return message.reply('You need Manage Server permission to use this.');
      }
      const num = Number(args[1]);
      if (isNaN(num) || num < 1) {
        return message.reply('Please provide a valid number of hours (at least 1).');
      }
      if (!quoteManager.guildConfigs) quoteManager.loadConfig();
      if (!quoteManager.guildConfigs[message.guild.id]) quoteManager.guildConfigs[message.guild.id] = {};
      quoteManager.guildConfigs[message.guild.id].quoteIntervalHours = num;
      quoteManager.saveConfig();
      quoteManager.startScheduler(client, message.guild.id);
      return message.reply(`Quote interval set to every ${num} hour(s)`);
    }

    else if (sub === 'get') {
      await quoteManager.sendQuote(message);
    }

    else {
      // If no subcommand, just send a quote
      await quoteManager.sendQuote(message);
    }
  },
};

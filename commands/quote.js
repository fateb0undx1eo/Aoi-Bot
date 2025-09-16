const { SlashCommandBuilder } = require('discord.js');
const quoteManager = require('../utils/quoteManager');

module.exports = {
  name: 'quote',

  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Manage and get quotes')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the channel for auto quotes')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Text channel to post quotes in')
            .setRequired(true)
        ))
    .addSubcommand(subcommand =>
      subcommand
        .setName('setinterval')
        .setDescription('Set interval in hours between auto quotes')
        .addIntegerOption(option =>
          option
            .setName('hours')
            .setDescription('Number of hours, minimum 1')
            .setRequired(true)
        ))
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Get a random quote immediately')
    ),

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

  async execute(message, client, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'setchannel') {
      if (!message.member.permissions.has('ManageGuild')) {
        return message.reply('You need Manage Server permission for this command.');
      }
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Please mention a text channel.');
      if (!quoteManager.configs) quoteManager.loadConfigs();
      if (!quoteManager.configs[message.guild.id]) {
        quoteManager.configs[message.guild.id] = {};
      }
      quoteManager.configs[message.guild.id].quoteChannelId = channel.id;
      quoteManager.saveConfigs();
      quoteManager.startScheduler(client, message.guild.id);
      return message.reply(`Quote channel set to ${channel.name}`);

    } else if (sub === 'setinterval') {
      if (!message.member.permissions.has('ManageGuild')) {
        return message.reply('You need Manage Server permission for this command.');
      }
      const num = Number(args[1]);
      if (isNaN(num) || num < 1) {
        return message.reply('Please provide a valid interval of at least 1 hour.');
      }
      if (!quoteManager.configs) quoteManager.loadConfigs();
      if (!quoteManager.configs[message.guild.id]) {
        quoteManager.configs[message.guild.id] = {};
      }
      quoteManager.configs[message.guild.id].quoteIntervalHours = num;
      quoteManager.saveConfigs();
      quoteManager.startScheduler(client, message.guild.id);
      return message.reply(`Quote interval set to every ${num} hour(s)`);

    } else if (sub === 'get') {
      await quoteManager.sendQuote(message);

    } else {
      // Default: send a quote immediately
      await quoteManager.sendQuote(message);
    }
  },
};

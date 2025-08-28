const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'msg',
  description: 'Send a message to a channel via the bot (with optional auto-delete)',

  // PREFIX COMMAND USAGE: s!msg #channel your message [autodelete (in secs)]
  async execute(message, client, args) {
    // Channel mention required
    const channelMention = args[0];
    const channelId = channelMention?.match(/^<#(\d+)>$/)?.[1];
    if (!channelId) {
      return message.reply('Please mention a valid channel.')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    const targetChannel = message.guild.channels.cache.get(channelId);

    if (!targetChannel || !targetChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
      return message.reply('I do not have permission to send messages in that channel.')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    if (args.length < 2) {
      return message.reply('Please provide a message to send.')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // Detect if the last arg is a number for deleteAfter in seconds
    let deleteAfter = 0;
    let msgToSend = args.slice(1).join(' ');
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg) && Number.isInteger(parseInt(lastArg))) {
      deleteAfter = parseInt(lastArg);
      msgToSend = args.slice(1, -1).join(' ');
    }

    // Send message, allow all mentions
    const sentMsg = await targetChannel.send({
      content: msgToSend,
      allowedMentions: { parse: ['users', 'roles', 'everyone'] }
    });

    // Only auto-delete if deleteAfter > 0
    if (deleteAfter > 0) {
      setTimeout(() => {
        sentMsg.delete().catch(() => {});
      }, deleteAfter * 1000);
    }

    // Optionally delete user's command after 5 sec (tidy chat)
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 5000);
  },

  // SLASH COMMAND REGISTRATION AND HANDLER
  data: new SlashCommandBuilder()
    .setName('msg')
    .setDescription('Send a message to a channel via the bot (with optional auto-delete)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Which channel to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The message content')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('delete_time')
        .setDescription('Delete time in seconds (0 = do not delete)')
        .setRequired(false)),

  async slashExecute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const text = interaction.options.getString('text');
    const deleteTime = interaction.options.getInteger('delete_time') ?? 0;

    if (!channel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({ content: 'I do not have permission to send messages in that channel.', ephemeral: true });
    }

    const sentMsg = await channel.send({
      content: text,
      allowedMentions: { parse: ['users', 'roles', 'everyone'] }
    });

    if (deleteTime > 0) {
      setTimeout(() => {
        sentMsg.delete().catch(() => {});
      }, deleteTime * 1000);
    }

    return interaction.reply({ content: `Message sent to ${channel}!`, ephemeral: true });
  }
};

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const PERMISSIONS = [
  { label: "View Channel", value: "ViewChannel" },
  { label: "Send Messages", value: "SendMessages" },
  { label: "Embed Links", value: "EmbedLinks" },
  { label: "Attach Files", value: "AttachFiles" },
  { label: "Manage Messages", value: "ManageMessages" },
  { label: "Mention Everyone", value: "MentionEveryone" },
  { label: "Read Message History", value: "ReadMessageHistory" },
  { label: "Use External Emojis", value: "UseExternalEmojis" },
  { label: "Add Reactions", value: "AddReactions" },
  { label: "Speak", value: "Speak" },
  { label: "Connect", value: "Connect" },
  { label: "Deafen Members", value: "DeafenMembers" },
  { label: "Mute Members", value: "MuteMembers" },
  { label: "Move Members", value: "MoveMembers" },
  { label: "Manage Channels", value: "ManageChannels" },
  { label: "Manage Roles", value: "ManageRoles" },
  { label: "Manage Webhooks", value: "ManageWebhooks" },
  { label: "Create Instant Invite", value: "CreateInstantInvite" },
  // More permissions can be added here.
];

module.exports = {
  name: 'perms',  // Important for your command loader
  data: new SlashCommandBuilder()
    .setName('perms')
    .setDescription('Manage permissions for a member or role')
    .addSubcommand(subcommand =>
      subcommand
        .setName('member')
        .setDescription('Set permissions for a member')
        .addUserOption(option => option.setName('target').setDescription('Select member').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Set permissions for a role')
        .addRoleOption(option => option.setName('target').setDescription('Select role').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('target');
    const targetRole = interaction.options.getRole('target');

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-permissions')
      .setPlaceholder('Select permissions to assign')
      .setMinValues(1)
      .setMaxValues(PERMISSIONS.length)
      .addOptions(PERMISSIONS);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Store temporary target for interaction collector
    interaction.client.tempPermTargets = interaction.client.tempPermTargets || new Map();
    interaction.client.tempPermTargets.set(interaction.user.id, { subcommand, targetUser, targetRole });

    await interaction.reply({ content: `Select permissions to assign to ${subcommand === 'member' ? targetUser.tag : targetRole.name}:`, components: [row], ephemeral: true });

    const filter = i => i.customId === 'select-permissions' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      const selectedPerms = i.values;
      const permsToSet = {};
      for (const perm of selectedPerms) {
        const flag = PermissionFlagsBits[perm];
        if (flag) {
          permsToSet[flag] = true;
        }
      }

      const overwriteTarget = subcommand === 'member' ? targetUser : targetRole;

      try {
        await interaction.channel.permissionOverwrites.edit(overwriteTarget, permsToSet);
        await i.update({ content: `Permissions updated for ${overwriteTarget.tag || overwriteTarget.name}.`, components: [] });
      } catch (error) {
        await i.update({ content: `Failed to update permissions: ${error.message}`, components: [] });
      }

      interaction.client.tempPermTargets.delete(interaction.user.id);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'Permission selection timed out.', components: [] });
        interaction.client.tempPermTargets.delete(interaction.user.id);
      }
    });
  },
};

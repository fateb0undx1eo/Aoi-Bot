const { MessageActionRow, StringSelectMenuBuilder, Permissions } = require('discord.js');

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
];

module.exports = {
  name: 'perms',
  description: 'Assign permissions interactively to a member or role',
  async execute(message, client, args) {
    // 1. Ask user to choose between member or role
    const typeSelect = new StringSelectMenuBuilder()
      .setCustomId('select-type')
      .setPlaceholder('Choose Member or Role')
      .addOptions([
        { label: 'Member', value: 'member' },
        { label: 'Role', value: 'role' },
      ]);

    const typeRow = new MessageActionRow().addComponents(typeSelect);

    const promptMsg = await message.channel.send({ content: 'Select to assign permissions to a Member or Role:', components: [typeRow] });

    const filter = i => i.user.id === message.author.id && i.customId === 'select-type';
    const collector = promptMsg.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async interaction => {
      await interaction.deferUpdate();
      const selectedType = interaction.values[0];

      if (selectedType === 'member') {
        await message.channel.send('Please mention the member you want to assign permissions to (e.g. @User):');

        const mentionFilter = m => m.author.id === message.author.id && m.mentions.members.size > 0;
        const mentionCollected = await message.channel.awaitMessages({ filter: mentionFilter, max: 1, time: 60000, errors: ['time'] }).catch(() => null);

        if (!mentionCollected) {
          return message.channel.send('Timed out or invalid member mention. Canceling.');
        }

        const member = mentionCollected.first().mentions.members.first();

        if (!member) {
          return message.channel.send('Could not find the member. Canceling.');
        }

        showPermissionSelector(message, member);

      } else if (selectedType === 'role') {
        const roleOptions = message.guild.roles.cache
          .filter(r => r.id !== message.guild.id)
          .map(r => ({ label: r.name, value: r.id }))
          .slice(0, 25);

        if (roleOptions.length === 0) {
          return message.channel.send('No roles available to choose.');
        }

        const roleSelect = new StringSelectMenuBuilder()
          .setCustomId('select-role')
          .setPlaceholder('Select a role to assign permissions')
          .addOptions(roleOptions);

        const roleRow = new MessageActionRow().addComponents(roleSelect);

        const rolePrompt = await message.channel.send({ content: 'Select a role:', components: [roleRow] });

        const roleFilter = i => i.user.id === message.author.id && i.customId === 'select-role';
        const roleCollector = rolePrompt.createMessageComponentCollector({ filter: roleFilter, max: 1, time: 60000 });

        roleCollector.on('collect', async roleInteraction => {
          await roleInteraction.deferUpdate();
          const roleId = roleInteraction.values[0];
          const role = message.guild.roles.cache.get(roleId);
          if (!role) {
            return message.channel.send('Role not found. Canceling.');
          }
          showPermissionSelector(message, role);
        });

        roleCollector.on('end', collected => {
          if (collected.size === 0) {
            message.channel.send('Role selection timed out. Canceling.');
          }
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send('Selection timed out. Canceling.');
      }
    });

    async function showPermissionSelector(message, target) {
      const permissionSelect = new StringSelectMenuBuilder()
        .setCustomId('select-permissions')
        .setPlaceholder('Select permissions to assign')
        .setMinValues(1)
        .setMaxValues(Math.min(PERMISSIONS.length, 25))
        .addOptions(PERMISSIONS);

      const permissionRow = new MessageActionRow().addComponents(permissionSelect);

      const permPrompt = await message.channel.send({ content: `Select permissions to assign to ${target.name || target.user.tag}:`, components: [permissionRow] });

      const permFilter = i => i.user.id === message.author.id && i.customId === 'select-permissions';
      const permCollector = permPrompt.createMessageComponentCollector({ filter: permFilter, max: 1, time: 60000 });

      permCollector.on('collect', async i => {
        await i.deferUpdate();
        const selectedPerms = i.values;
        const permsToSet = [];

        for (const perm of selectedPerms) {
          permsToSet.push(Permissions.FLAGS[perm]);
        }

        try {
          await message.channel.permissionOverwrites.edit(target, { allow: permsToSet });
          message.channel.send(`Permissions updated for ${target.name || target.user.tag}.`);
        } catch (error) {
          message.channel.send(`Failed to update permissions: ${error.message}`);
        }
      });

      permCollector.on('end', collected => {
        if (collected.size === 0) message.channel.send('Permission selection timed out. Canceling.');
      });
    }
  }
};

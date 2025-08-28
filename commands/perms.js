const { 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType, 
  PermissionsBitField 
} = require('discord.js');

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
  description: 'Assign permissions interactively to a member or role, channel-wide or server-wide',
  async execute(message, client, args) {

    // Step 1: Ask user to choose between Member or Role
    const typeSelect = new StringSelectMenuBuilder()
      .setCustomId('select-type')
      .setPlaceholder('Choose Member or Role')
      .addOptions([
        { label: 'Member', value: 'member' },
        { label: 'Role', value: 'role' },
      ]);
    const typeRow = new ActionRowBuilder().addComponents(typeSelect);
    const promptMsg = await message.channel.send({
      content: 'Select to assign permissions to a Member or Role:',
      components: [typeRow],
    });

    const typeFilter = i => i.user.id === message.author.id && i.customId === 'select-type';
    const typeCollector = promptMsg.createMessageComponentCollector({ filter: typeFilter, max: 1, time: 60000 });

    typeCollector.on('collect', async interaction => {
      await interaction.deferUpdate();
      const selectedType = interaction.values[0];

      if (selectedType === 'member') {
        await message.channel.send('Please mention the member you want to assign permissions to (e.g. @User):');

        // Wait for mention
        const mentionFilter = m => m.author.id === message.author.id && m.mentions.members.size > 0;
        const mentionCollected = await message.channel.awaitMessages({ filter: mentionFilter, max: 1, time: 60000, errors: ['time'] }).catch(() => null);
        if (!mentionCollected) return message.channel.send('Timed out or invalid member mention. Canceling.');

        const member = mentionCollected.first().mentions.members.first();
        if (!member) return message.channel.send('Could not find the member. Canceling.');

        await askScopeAndPermissions(message, member);

      } else if (selectedType === 'role') {
        const roleOptions = message.guild.roles.cache
          .filter(r => r.id !== message.guild.id)
          .map(r => ({ label: r.name, value: r.id }))
          .slice(0, 25);

        if (roleOptions.length === 0) return message.channel.send('No roles available.');

        const roleSelect = new StringSelectMenuBuilder()
          .setCustomId('select-role')
          .setPlaceholder('Select a role to assign permissions')
          .addOptions(roleOptions);

        const roleRow = new ActionRowBuilder().addComponents(roleSelect);
        const rolePrompt = await message.channel.send({ content: 'Select a role:', components: [roleRow] });

        const roleFilter = i => i.user.id === message.author.id && i.customId === 'select-role';
        const roleCollector = rolePrompt.createMessageComponentCollector({ filter: roleFilter, max: 1, time: 60000 });

        roleCollector.on('collect', async roleInteraction => {
          await roleInteraction.deferUpdate();
          const roleId = roleInteraction.values[0];
          const role = message.guild.roles.cache.get(roleId);
          if (!role) return message.channel.send('Role not found. Canceling.');

          await askScopeAndPermissions(message, role);
        });

        roleCollector.on('end', collected => {
          if (collected.size === 0) message.channel.send('Role selection timed out. Canceling.');
        });
      }
    });

    typeCollector.on('end', collected => {
      if (collected.size === 0) message.channel.send('Selection timed out. Canceling.');
    });

    // Step 2: Ask if channel-wide or server-wide and show permissions dropdown
    async function askScopeAndPermissions(message, target) {
      const btnRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('scope_channel')
          .setLabel('Current Channel')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('scope_server')
          .setLabel('Server Wide')
          .setStyle(ButtonStyle.Secondary)
      );

      const scopeMsg = await message.channel.send({
        content: `Apply permissions for ${target.name || target.user.tag} in this channel only or server-wide?`,
        components: [btnRow],
      });

      const scopeFilter = i => ['scope_channel', 'scope_server'].includes(i.customId) && i.user.id === message.author.id;
      const scopeCollector = scopeMsg.createMessageComponentCollector({ filter: scopeFilter, max: 1, time: 60000 });

      scopeCollector.on('collect', async i => {
        await i.deferUpdate();
        const scope = i.customId === 'scope_server' ? 'server' : 'channel';

        // Show permission select menu
        const permSelect = new StringSelectMenuBuilder()
          .setCustomId('select-permissions')
          .setPlaceholder('Select permissions to assign')
          .setMinValues(1)
          .setMaxValues(Math.min(PERMISSIONS.length, 25))
          .addOptions(PERMISSIONS);

        const permRow = new ActionRowBuilder().addComponents(permSelect);

        const permMsg = await message.channel.send({
          content: `Select permissions to assign to ${target.name || target.user.tag} (${scope === 'server' ? 'server-wide' : 'this channel'}):`,
          components: [permRow],
        });

        const permFilter = ci => ci.user.id === message.author.id && ci.customId === 'select-permissions';
        const permCollector = permMsg.createMessageComponentCollector({ filter: permFilter, max: 1, time: 60000 });

        permCollector.on('collect', async ci => {
          await ci.deferUpdate();
          const selectedPerms = ci.values;

          // Build permission object
          const permsToSet = {};
          for (const perm of selectedPerms) {
            permsToSet[PermissionsBitField.Flags[perm]] = true;
          }

          try {
            if (scope === 'channel') {
              // Current channel permission overwrite
              await message.channel.permissionOverwrites.edit(target, { allow: permsToSet });
              await message.channel.send(`Permissions updated for ${target.name || target.user.tag} in this channel.`);
            } else {
              // Server-wide permission update
              if (target.permissions) {
                // role: update permissions
                const newPerms = new PermissionsBitField(target.permissions).add(permsToSet);
                await target.setPermissions(newPerms, `Updated by ${message.author.tag} via perms command`);
                await message.channel.send(`Permissions updated for role ${target.name} server-wide.`);
              } else if (target.manageable !== false && target.roles) {
                // member: warn user - recommend managing server-wide perms via roles
                await message.channel.send(`Server-wide permission changes for members are managed via roles. Please assign appropriate roles to ${target.user.tag}.`);
              } else {
                await message.channel.send('Cannot update server-wide permissions for that target.');
              }
            }
          } catch (error) {
            await message.channel.send(`Failed to update permissions: ${error.message}`);
          }
        });

        permCollector.on('end', collected => {
          if (collected.size === 0) message.channel.send('Permission selection timed out. Canceling.');
        });
      });

      scopeCollector.on('end', collected => {
        if (collected.size === 0) message.channel.send('Scope selection timed out. Canceling.');
      });
    }
  }
};

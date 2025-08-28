const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
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
  name: "perms",
  description: "Assign channel-specific permissions to a member or role with pre-selection and toggling",

  async execute(message, client, args) {
    // Step 1: Choose member or role
    const typeSelect = new StringSelectMenuBuilder()
      .setCustomId("select-type")
      .setPlaceholder("Choose Member or Role")
      .addOptions([
        { label: "Member", value: "member" },
        { label: "Role", value: "role" },
      ]);
    const typeRow = new ActionRowBuilder().addComponents(typeSelect);
    const promptMsg = await message.channel.send({
      content: "Select to assign permissions to a Member or Role:",
      components: [typeRow],
    });
    const filter = (i) =>
      i.user.id === message.author.id && i.customId === "select-type";
    const collector = promptMsg.createMessageComponentCollector({
      filter,
      max: 1,
      time: 60000,
    });
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      promptMsg.delete().catch(() => {});
      const selectedType = interaction.values[0];
      if (selectedType === "member") {
        await message.channel.send(
          "Please mention the member you want to assign permissions to (e.g. @User):"
        );
        const mentionFilter = (m) =>
          m.author.id === message.author.id && m.mentions.members.size > 0;
        const mentionCollected = await message.channel
          .awaitMessages({
            filter: mentionFilter,
            max: 1,
            time: 60000,
            errors: ["time"],
          })
          .catch(() => null);
        if (!mentionCollected)
          return message.channel.send("Timed out or invalid member mention.");
        const member = mentionCollected.first().mentions.members.first();
        if (!member) return message.channel.send("Could not find the member.");
        selectChannelsAndPermissions(message, member);
      } else {
        // Role select dropdown
        const sortedRoles = message.guild.roles.cache
          .filter((r) => r.id !== message.guild.id)
          .sort((a, b) => a.position - b.position);
        const roleOptions = sortedRoles.map((r) => ({
          label: r.name,
          value: r.id,
        })).slice(0, 25);
        if (!roleOptions.length)
          return message.channel.send("No roles available to select.");
        const roleSelect = new StringSelectMenuBuilder()
          .setCustomId("select-role")
          .setPlaceholder("Select a role to assign permissions")
          .addOptions(roleOptions);
        const roleRow = new ActionRowBuilder().addComponents(roleSelect);
        const rolePrompt = await message.channel.send({
          content: "Select a role:",
          components: [roleRow],
        });
        const roleFilter = (i) =>
          i.user.id === message.author.id && i.customId === "select-role";
        const roleCollector = rolePrompt.createMessageComponentCollector({
          filter: roleFilter,
          max: 1,
          time: 60000,
        });
        roleCollector.on("collect", async (roleInteraction) => {
          await roleInteraction.deferUpdate();
          rolePrompt.delete().catch(() => {});
          const role = message.guild.roles.cache.get(roleInteraction.values[0]);
          if (!role) return message.channel.send("Role not found.");
          selectChannelsAndPermissions(message, role);
        });
        roleCollector.on("end", (collected) => {
          if (collected.size === 0)
            message.channel.send("Role selection timed out.");
        });
      }
    });
    collector.on("end", (collected) => {
      if (collected.size === 0) message.channel.send("Selection timed out.");
    });

    async function selectChannelsAndPermissions(message, target) {
      // Sorted channels by rawPosition ascending
      const sortedChannels = message.guild.channels.cache
        .filter((c) => c.isTextBased())
        .sort((a, b) => a.rawPosition - b.rawPosition);

      const channelOptions = sortedChannels
        .map((c) => ({ label: c.name, value: c.id }))
        .slice(0, 25);

      if (!channelOptions.length)
        return message.channel.send("No text channels available.");

      const channelSelect = new StringSelectMenuBuilder()
        .setCustomId("select-channels")
        .setPlaceholder("Select one or more channels")
        .setMinValues(1)
        .setMaxValues(channelOptions.length)
        .addOptions(channelOptions);

      const channelRow = new ActionRowBuilder().addComponents(channelSelect);

      const channelMsg = await message.channel.send({
        content: `Select channels where you want to assign permissions for ${
          target.name || target.user?.tag
        }:`,
        components: [channelRow],
      });

      const channelFilter = (i) =>
        i.user.id === message.author.id && i.customId === "select-channels";
      const channelCollector = channelMsg.createMessageComponentCollector({
        filter: channelFilter,
        max: 1,
        time: 60000,
      });

      channelCollector.on("collect", async (channelInteraction) => {
        await channelInteraction.deferUpdate();
        channelMsg.delete().catch(() => {});

        const selectedChannels = channelInteraction.values;

        // Get pre-selected permissions from first selected channel, if exists
        let preSelected = [];
        const firstChannel = message.guild.channels.cache.get(selectedChannels[0]);
        if (firstChannel) {
          const overwrite = firstChannel.permissionOverwrites.cache.get(
            target.id ?? target.roleId
          );
          const allowed = overwrite ? overwrite.allow : null;
          if (allowed) {
            const allowedArr = allowed.toArray();
            preSelected = PERMISSIONS.filter((p) =>
              allowedArr.includes(PermissionsBitField.Flags[p.value])
            ).map((p) => p.value);
          }
        }

        // Prepare permission options with default selected
        const permOptions = PERMISSIONS.map((p) => ({
          label: p.label,
          value: p.value,
          default: preSelected.includes(p.value),
        }));

        const permSelect = new StringSelectMenuBuilder()
          .setCustomId("select-permissions")
          .setPlaceholder("Select permissions to assign (unselected will be removed)")
          .setMinValues(1)
          .setMaxValues(Math.min(permOptions.length, 25))
          .addOptions(permOptions);

        const permRow = new ActionRowBuilder().addComponents(permSelect);

        const permMsg = await message.channel.send({
          content: `Select permissions for ${
            target.name || target.user?.tag
          } in ${selectedChannels.length} channel(s):`,
          components: [permRow],
        });

        const permFilter = (i) =>
          i.user.id === message.author.id && i.customId === "select-permissions";
        const permCollector = permMsg.createMessageComponentCollector({
          filter: permFilter,
          max: 1,
          time: 60000,
        });

        permCollector.on("collect", async (permInteraction) => {
          await permInteraction.deferUpdate();
          permMsg.delete().catch(() => {});

          const selectedPerms = permInteraction.values;

          // Build perms to allow and deny
          const allPermsFlags = PERMISSIONS.map((p) => PermissionsBitField.Flags[p.value]);
          const selectedFlags = selectedPerms.map((p) => PermissionsBitField.Flags[p]);

          const allowPerms = new PermissionsBitField(selectedFlags);
          const denyPerms = new PermissionsBitField(allPermsFlags).remove(selectedFlags);

          let successCount = 0;
          let failCount = 0;

          for (const chanId of selectedChannels) {
            const channel = message.guild.channels.cache.get(chanId);
            if (!channel || !channel.isTextBased()) continue;

            try {
              await channel.permissionOverwrites.edit(target, {
                allow: allowPerms,
                deny: denyPerms,
              });
              successCount++;
            } catch {
              failCount++;
            }
          }

          await message.channel.send(
            `Updated permissions in ${successCount} channel(s)` +
              (failCount ? `, failed in ${failCount} channel(s)` : "") +
              ` for ${target.name || target.user?.tag}.`
          );
        });

        permCollector.on("end", (collected) => {
          if (collected.size === 0)
            message.channel.send("Permission selection timed out.");
        });
      });

      channelCollector.on("end", (collected) => {
        if (collected.size === 0)
          message.channel.send("Channel selection timed out.");
      });
    }
  },
};

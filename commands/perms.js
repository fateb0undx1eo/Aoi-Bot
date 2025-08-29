const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
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
const CHANNELS_PER_PAGE = 25;

module.exports = {
  name: "perms",
  description: "Assign/remove channel permissions for a member or role, with pagination and bug fixes.",

  async execute(message, client, args) {
    // Step 1: Member or Role
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
    const filter = (i) => i.user.id === message.author.id && i.customId === "select-type";
    const collector = promptMsg.createMessageComponentCollector({ filter, max: 1, time: 60000 });
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      promptMsg.delete().catch(() => {});
      const selectedType = interaction.values[0];
      if (selectedType === "member") {
        await message.channel.send("Please mention the member you want to assign permissions to (`@User`):");
        const mentionFilter = (m) => m.author.id === message.author.id && m.mentions.members.size > 0;
        const mentionCollected = await message.channel
          .awaitMessages({ filter: mentionFilter, max: 1, time: 60000, errors: ["time"] })
          .catch(() => null);
        if (!mentionCollected) return message.channel.send("❌ Timed out or invalid mention.");
        const member = mentionCollected.first().mentions.members.first();
        if (!member) return message.channel.send("❌ Could not find the member.");
        await paginateChannels(message, member);
      } else {
        const sortedRoles = message.guild.roles.cache
          .filter((r) => r.id !== message.guild.id)
          .sort((a, b) => a.position - b.position);
        const roleOptions = sortedRoles.map((r) => ({
          label: r.name,
          value: r.id,
        })).slice(0, 25);
        if (!roleOptions.length) return message.channel.send("No roles available.");
        const roleSelect = new StringSelectMenuBuilder()
          .setCustomId("select-role")
          .setPlaceholder("Select a role to assign permissions")
          .addOptions(roleOptions);
        const roleRow = new ActionRowBuilder().addComponents(roleSelect);
        const rolePrompt = await message.channel.send({
          content: "Select a role:",
          components: [roleRow],
        });
        const roleFilter = (i) => i.user.id === message.author.id && i.customId === "select-role";
        const roleCollector = rolePrompt.createMessageComponentCollector({ filter: roleFilter, max: 1, time: 60000 });
        roleCollector.on("collect", async (roleInteraction) => {
          await roleInteraction.deferUpdate();
          rolePrompt.delete().catch(() => {});
          const role = message.guild.roles.cache.get(roleInteraction.values[0]);
          if (!role) return message.channel.send("No such role found.");
          await paginateChannels(message, role);
        });
        roleCollector.on("end", (collected) => {
          if (collected.size === 0) message.channel.send("Role selection timed out.");
        });
      }
    });
    collector.on("end", (collected) => {
      if (collected.size === 0) message.channel.send("Selection timed out.");
    });

    async function paginateChannels(message, target) {
      const sortedChannels = message.guild.channels.cache
        .filter((c) => c.isTextBased())
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .map((c) => ({ label: c.name, value: c.id }));

      let page = 0;
      let channelsOnPage = sortedChannels.slice(page * CHANNELS_PER_PAGE, (page + 1) * CHANNELS_PER_PAGE);

      async function sendPage() {
        const channelSelect = new StringSelectMenuBuilder()
          .setCustomId("select-channels")
          .setPlaceholder("Select a channel")
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(channelsOnPage);
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev_page")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Next")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled((page + 1) * CHANNELS_PER_PAGE >= sortedChannels.length)
        );
        const channelMsg = await message.channel.send({
          content: `Select a channel where to assign permissions for ${target.name || target.user?.tag} (Page ${page + 1}/${Math.ceil(sortedChannels.length / CHANNELS_PER_PAGE)})`,
          components: [new ActionRowBuilder().addComponents(channelSelect), buttons],
        });
        const channelFilter = (i) => i.user.id === message.author.id &&
          ["select-channels", "next_page", "prev_page"].includes(i.customId);
        const channelCollector = channelMsg.createMessageComponentCollector({ filter: channelFilter, max: 1, time: 60000 });
        channelCollector.on("collect", async (channelInteraction) => {
          await channelInteraction.deferUpdate();
          if (channelInteraction.customId === "next_page") {
            page++;
            channelsOnPage = sortedChannels.slice(page * CHANNELS_PER_PAGE, (page + 1) * CHANNELS_PER_PAGE);
            channelMsg.delete().catch(() => {});
            await sendPage();
          } else if (channelInteraction.customId === "prev_page") {
            page--;
            channelsOnPage = sortedChannels.slice(page * CHANNELS_PER_PAGE, (page + 1) * CHANNELS_PER_PAGE);
            channelMsg.delete().catch(() => {});
            await sendPage();
          } else if (channelInteraction.customId === "select-channels") {
            channelMsg.delete().catch(() => {});
            const selectedChannelId = channelInteraction.values[0];
            const channel = message.guild.channels.cache.get(selectedChannelId);
            await selectPermissions(message, target, channel);
          }
        });
        channelCollector.on("end", (collected) => {
          if (collected.size === 0) channelMsg.delete().catch(() => {});
        });
      }
      await sendPage();
    }

    async function selectPermissions(message, target, channel) {
      const overwrite = channel.permissionOverwrites.cache.get(target.id ?? target.roleId);
      // Both allow and deny arrays
      const currAllowArr = overwrite ? overwrite.allow.toArray() : [];
      const currDenyArr = overwrite ? overwrite.deny.toArray() : [];
      // Build select menu with 'default: true' for allowed, and '🚫' in label for denied
      const permOptions = PERMISSIONS.map((p) => ({
        label: `${p.label}${currDenyArr.includes(PermissionsBitField.Flags[p.value]) ? ' 🚫' : ''}`,
        value: p.value,
        default: currAllowArr.includes(PermissionsBitField.Flags[p.value]),
        emoji: currDenyArr.includes(PermissionsBitField.Flags[p.value]) ? '🚫' : undefined
      }));

      const permSelect = new StringSelectMenuBuilder()
        .setCustomId("select-permissions")
        .setPlaceholder("Tick = allow, untick = deny (permissions with 🚫 are currently denied in this channel)")
        .setMinValues(0)
        .setMaxValues(Math.min(permOptions.length, 25))
        .addOptions(permOptions);

      const permRow = new ActionRowBuilder().addComponents(permSelect);

      const permMsg = await message.channel.send({
        content: `Select permissions for ${target.name || target.user?.tag} in <#${channel.id}>:\nTick = allow (green ✅), untick = deny (red 🚫). You can remove previous denies by ticking them.`,
        components: [permRow],
      });

      const permFilter = (i) => i.user.id === message.author.id && i.customId === "select-permissions";
      const permCollector = permMsg.createMessageComponentCollector({ filter: permFilter, max: 1, time: 60000 });
      permCollector.on("collect", async (permInteraction) => {
        await permInteraction.deferUpdate();
        permMsg.delete().catch(() => {});
        const selectedPerms = permInteraction.values;
        const allPermFlags = PERMISSIONS.map((p) => PermissionsBitField.Flags[p.value]);
        const allow = selectedPerms.map((k) => PermissionsBitField.Flags[k]);
        const deny = allPermFlags.filter((k) => !allow.includes(k));
        try {
          // Explicitly set allow/deny. Discord's overwrite will reflect (green check/red X) in channel settings
          await channel.permissionOverwrites.edit(target, {
            allow: allow,
            deny: deny,
          });
          await message.channel.send(
            `✅ Updated permissions for ${target.name || target.user?.tag} in <#${channel.id}>.`
          );
        } catch (error) {
          await message.channel.send(`❌ Failed to update permissions: ${error.message}`);
        }
      });
      permCollector.on("end", (collected) => {
        if (collected.size === 0) permMsg.delete().catch(() => {});
      });
    }
  },
};

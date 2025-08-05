const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Show information about the server!',

    async execute(message) {
        const { guild } = message;

        if (!guild) {
            return message.reply('✧ Unable to fetch server information.')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const owner = await guild.fetchOwner();
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }) || '')
            .addFields(
                { name: '⟡ Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '⟡ Owner', value: `${owner.user.tag}`, inline: true },
                { name: '⟡ Members', value: `\`${guild.memberCount}\``, inline: true },
                { name: '⟡ Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
                { name: '⟡ Channels', value: `\`${guild.channels.cache.size}\``, inline: true },
                { name: '⟡ Boosts', value: `\`${guild.premiumSubscriptionCount || 0}\``, inline: true },
                { name: '⟡ Created', value: createdAt, inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.username} ✦` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};

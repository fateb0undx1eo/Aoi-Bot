const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Show information about a user!',

    async execute(message) {
        const member = message.mentions.members.first() || message.member;
        const user = member.user;

        if (!user) {
            return message.reply('✧ Could not fetch that user!')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Time formatting
        const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
        const joinedAt = member.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : 'Unknown';

        // Roles display
        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(' 、') || 'None';

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ size: 512, dynamic: true }))
            .addFields(
                { name: '⟡ User ID', value: `\`${user.id}\``, inline: true },
                { name: '⟡ Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '⟡ Account Created', value: createdAt, inline: false },
                { name: '⟡ Joined Server', value: joinedAt, inline: false },
                { name: '⟡ Roles', value: roles, inline: false },
            )
            .setFooter({ text: `Requested by ${message.author.username} ✦` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};

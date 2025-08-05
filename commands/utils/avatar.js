const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Show your or another user\'s avatar!',
    
    async execute(message) {
        // Get the target user (mentioned or self)
        const member = message.mentions.members.first() || message.member;
        const user = member.user;

        if (!user) {
            return message.reply('❌ Could not fetch that user!')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215)) // Random color for style
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
            .setFooter({ text: `Requested by ${message.author.username}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};

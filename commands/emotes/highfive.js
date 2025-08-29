const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const HIGHFIVE_MESSAGES = [
    "{author} gives {target} a big high-five! ",
    "{author} and {target} high-five each other! 🎉",
    "{author} slaps hands with {target} in a perfect high-five! ",
    "{author} and {target} just nailed the high-five! "
];
module.exports = {
    name: 'highfive',
    description: 'Give someone a high-five!',
    async execute(message) {
        const member = message.mentions.members.first();
        if (!member) {
            const msg = await message.reply("❌ Tag someone to high-five!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        if (member.id === message.author.id) {
            const msg = await message.reply("High-fiving yourself? That's some dedication!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('highfive');
        const randomMsg = HIGHFIVE_MESSAGES[Math.floor(Math.random() * HIGHFIVE_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

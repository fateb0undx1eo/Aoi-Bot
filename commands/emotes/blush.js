const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const BLUSH_MESSAGES = [
    "{author} turns bright red!",
    "{author} blushes shyly.",
    "{author} can't hide their blush."
];
module.exports = {
    name: 'blush',
    description: 'Blush adorably!',
    async execute(message) {
        const gifUrl = await fetchEmote('blush');
        const randomMsg = BLUSH_MESSAGES[Math.floor(Math.random() * BLUSH_MESSAGES.length)]
            .replace("{author}", message.author);
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

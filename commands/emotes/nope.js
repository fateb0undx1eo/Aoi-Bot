const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const NOPE_MESSAGES = [
    "{author} shakes their head in disapproval.",
    "{author} says nope!",
    "{author} disagrees completely."
];
module.exports = {
    name: 'nope',
    description: 'Express disapproval.',
    async execute(message) {
        const gifUrl = await fetchEmote('nope');
        const randomMsg = NOPE_MESSAGES[Math.floor(Math.random() * NOPE_MESSAGES.length)]
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

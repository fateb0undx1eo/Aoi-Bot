const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const BORED_MESSAGES = [
    "{author} looks bored...",
    "{author} has nothing to do.",
    "{author} sighs in boredom."
];
module.exports = {
    name: 'bored',
    description: 'Show that you are bored.',
    async execute(message) {
        const gifUrl = await fetchEmote('bored');
        const randomMsg = BORED_MESSAGES[Math.floor(Math.random() * BORED_MESSAGES.length)]
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

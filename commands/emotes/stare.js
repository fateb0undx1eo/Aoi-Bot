const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const STARE_MESSAGES = [
    "{author} stares silently...",
    "{author} keeps a focused gaze.",
    "{author} looks intently."
];
module.exports = {
    name: 'stare',
    description: 'Stare silently or with focus.',
    async execute(message) {
        const gifUrl = await fetchEmote('stare');
        const randomMsg = STARE_MESSAGES[Math.floor(Math.random() * STARE_MESSAGES.length)]
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

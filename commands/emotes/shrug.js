const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const SHRUG_MESSAGES = [
    "{author} shrugs casually.",
    "{author} doesn't know what to say.",
    "{author} shrugs it off."
];
module.exports = {
    name: 'shrug',
    description: 'Express indifference or confusion.',
    async execute(message) {
        const gifUrl = await fetchEmote('shrug');
        const randomMsg = SHRUG_MESSAGES[Math.floor(Math.random() * SHRUG_MESSAGES.length)]
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

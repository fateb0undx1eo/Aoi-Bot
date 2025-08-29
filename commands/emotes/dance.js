const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const DANCE_MESSAGES = [
    "{author} shows off some dance moves!",
    "{author} is dancing happily!",
    "{author} can't stop dancing!"
];
module.exports = {
    name: 'dance',
    description: 'Show off your dance moves!',
    async execute(message) {
        const gifUrl = await fetchEmote('dance');
        const randomMsg = DANCE_MESSAGES[Math.floor(Math.random() * DANCE_MESSAGES.length)]
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

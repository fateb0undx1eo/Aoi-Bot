const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const WINK_MESSAGES = [
    "{author} winks playfully!",
    "{author} gives a cheeky wink.",
    "{author} winks with confidence!"
];

module.exports = {
    name: 'wink',
    description: 'Send a playful wink.',
    async execute(message) {
        const gifUrl = await fetchEmote('wink');
        const randomMsg = WINK_MESSAGES[Math.floor(Math.random() * WINK_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

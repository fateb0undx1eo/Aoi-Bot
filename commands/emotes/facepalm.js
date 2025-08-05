const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const FACEPALM_MESSAGES = [
    "{author} facepalms.",
    "{author} can't believe what just happened.",
    "{author} covers their face in disappointment."
];

module.exports = {
    name: 'facepalm',
    description: 'Show your disappointment.',
    async execute(message) {
        const gifUrl = await fetchEmote('facepalm');
        const randomMsg = FACEPALM_MESSAGES[Math.floor(Math.random() * FACEPALM_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const THUMBSUP_MESSAGES = [
    "{author} gives a thumbs up!",
    "{author} approves with a thumbs up.",
    "{author} shows their support!"
];

module.exports = {
    name: 'thumbsup',
    description: 'Give a thumbs up of approval.',
    async execute(message) {
        const gifUrl = await fetchEmote('thumbsup');
        const randomMsg = THUMBSUP_MESSAGES[Math.floor(Math.random() * THUMBSUP_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const LAUGH_MESSAGES = [
    "{author} laughs out loud!",
    "{author} is laughing uncontrollably!",
    "{author} bursts into laughter!"
];

module.exports = {
    name: 'laugh',
    description: 'Laugh out loud!',
    async execute(message) {
        const gifUrl = await fetchEmote('laugh');
        const randomMsg = LAUGH_MESSAGES[Math.floor(Math.random() * LAUGH_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

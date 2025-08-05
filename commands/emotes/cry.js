const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const CRY_MESSAGES = [
    "{author} starts crying...",
    "{author} tears up.",
    "{author} can't hold back the tears."
];

module.exports = {
    name: 'cry',
    description: 'Cry your heart out.',
    async execute(message) {
        const gifUrl = await fetchEmote('cry');
        const randomMsg = CRY_MESSAGES[Math.floor(Math.random() * CRY_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

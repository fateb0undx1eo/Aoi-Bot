const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const LURK_MESSAGES = [
    "{author} is lurking silently...",
    "{author} hides in the shadows.",
    "{author} is watching quietly from afar."
];

module.exports = {
    name: 'lurk',
    description: 'Lurk in the background.',
    async execute(message) {
        const gifUrl = await fetchEmote('lurk');
        const randomMsg = LURK_MESSAGES[Math.floor(Math.random() * LURK_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

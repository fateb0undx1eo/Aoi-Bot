const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const YAWN_MESSAGES = [
    "{author} lets out a big yawn...",
    "{author} is getting sleepy.",
    "{author} yawns and stretches!"
];

module.exports = {
    name: 'yawn',
    description: 'Express tiredness with a yawn.',
    async execute(message) {
        const gifUrl = await fetchEmote('yawn');
        const randomMsg = YAWN_MESSAGES[Math.floor(Math.random() * YAWN_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'waifu',
    description: 'Get a random waifu image!',
    async execute(message) {
        const gifUrl = await fetchEmote('waifu');

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(`${message.author} discovered a lovely waifu!`)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

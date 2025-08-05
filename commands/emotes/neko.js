const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'neko',
    description: 'Get a random neko image!',
    async execute(message) {
        const gifUrl = await fetchEmote('neko');

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(`${message.author} found a cute neko!`)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

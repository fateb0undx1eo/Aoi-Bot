const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'husbando',
    description: 'Get a random husbando image!',
    async execute(message) {
        const gifUrl = await fetchEmote('husbando');

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(`${message.author} found a random husbando!`)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

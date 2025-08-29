const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
module.exports = {
    name: 'kitsune',
    description: 'Get a random kitsune image!',
    async execute(message) {
        const gifUrl = await fetchEmote('kitsune');
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(`${message.author} summoned a mystical kitsune!`)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

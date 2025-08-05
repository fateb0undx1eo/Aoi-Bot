const { EmbedBuilder } = require('discord.js');
const fetchMeme = require('../utils/fetchMeme');

module.exports = {
    name: 'meme',
    description: 'Fetches a random meme from Reddit',
    async execute(interactionOrMessage) {
        const isSlash = !!interactionOrMessage.isChatInputCommand;

        try {
            // For slash commands, defer reply to avoid timeout
            if (isSlash) {
                await interactionOrMessage.deferReply();
            }

            const meme = await fetchMeme();

            if (!meme || !meme.url) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('❌ Could not fetch a meme at this time.');

                return isSlash
                    ? interactionOrMessage.editReply({ embeds: [embed] })
                    : interactionOrMessage.channel.send({ embeds: [embed] });
            }

            const randomColor = Math.floor(Math.random() * 16777215);

            const embed = new EmbedBuilder()
                .setColor(randomColor)
                .setImage(meme.url)
                .setFooter({ text: `r/${meme.subreddit}` });

            return isSlash
                ? interactionOrMessage.editReply({ embeds: [embed] })
                : interactionOrMessage.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error executing meme command:', error);

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('❌ Could not fetch a meme at this time.');

            if (interactionOrMessage.isChatInputCommand) {
                if (interactionOrMessage.deferred) {
                    await interactionOrMessage.editReply({ embeds: [embed] });
                } else {
                    await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
                }
            } else {
                await interactionOrMessage.channel.send({ embeds: [embed] });
            }
        }
    }
};

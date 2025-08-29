const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const HAPPY_MESSAGES = [
    "{author} is feeling really happy!",
    "{author} smiles brightly in joy!",
    "{author} is full of happiness!"
];
module.exports = {
    name: 'happy',
    description: 'Express your happiness!',
    async execute(message) {
        const gifUrl = await fetchEmote('happy');
        const randomMsg = HAPPY_MESSAGES[Math.floor(Math.random() * HAPPY_MESSAGES.length)]
            .replace("{author}", message.author);
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const NOD_MESSAGES = [
    "{author} nods in agreement.",
    "{author} gives a confirming nod.",
    "{author} silently agrees."
];
module.exports = {
    name: 'nod',
    description: 'Nod in agreement.',
    async execute(message) {
        const gifUrl = await fetchEmote('nod');
        const randomMsg = NOD_MESSAGES[Math.floor(Math.random() * NOD_MESSAGES.length)]
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

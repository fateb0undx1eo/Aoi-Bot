const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const SMUG_MESSAGES = [
    "{author} smirks smugly.",
    "{author} looks very smug.",
    "{author} gives a self-satisfied grin."
];
module.exports = {
    name: 'smug',
    description: 'Show a smug expression.',
    async execute(message) {
        const gifUrl = await fetchEmote('smug');
        const randomMsg = SMUG_MESSAGES[Math.floor(Math.random() * SMUG_MESSAGES.length)]
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

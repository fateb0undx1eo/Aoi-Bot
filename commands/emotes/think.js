const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const THINK_MESSAGES = [
    "{author} is deep in thought...",
    "{author} is thinking hard.",
    "{author} contemplates the situation."
];
module.exports = {
    name: 'think',
    description: 'Express thinking or pondering.',
    async execute(message) {
        const gifUrl = await fetchEmote('think');
        const randomMsg = THINK_MESSAGES[Math.floor(Math.random() * THINK_MESSAGES.length)]
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

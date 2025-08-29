const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const RUN_MESSAGES = [
    "{author} starts running!",
    "{author} dashes away quickly!",
    "{author} runs off into the distance."
];
module.exports = {
    name: 'run',
    description: 'Run away or just run!',
    async execute(message) {
        const gifUrl = await fetchEmote('run');
        const randomMsg = RUN_MESSAGES[Math.floor(Math.random() * RUN_MESSAGES.length)]
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

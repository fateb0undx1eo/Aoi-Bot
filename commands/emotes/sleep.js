const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const SLEEP_MESSAGES = [
    "{author} falls asleep peacefully.",
    "{author} is taking a nap!",
    "{author} is drifting into dreamland..."
];

module.exports = {
    name: 'sleep',
    description: 'Take a peaceful nap!',
    async execute(message) {
        const gifUrl = await fetchEmote('sleep');
        const randomMsg = SLEEP_MESSAGES[Math.floor(Math.random() * SLEEP_MESSAGES.length)]
            .replace("{author}", message.author);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

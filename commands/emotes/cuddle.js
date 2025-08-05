const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const CUDDLE_MESSAGES = [
    "{author} cuddles up with {target}! ",
    "{author} gives {target} a warm cuddle! ",
    "{author} snuggles {target} softly! ",
    "{author} wraps {target} in a cozy cuddle! no",
    "{author} and {target} are having the cutest cuddle moment! 💖"
];

module.exports = {
    name: 'cuddle',
    description: 'Cuddle someone warmly!',

    async execute(message) {
        const member = message.mentions.members.first();

        // No mention
        if (!member) {
            const msg = await message.reply("❌ Tag someone to cuddle!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        // Prevent self-cuddle
        if (member.id === message.author.id) {
            const msg = await message.reply(" Self-cuddles are cute, but try cuddling someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('cuddle');
        const randomMsg = CUDDLE_MESSAGES[Math.floor(Math.random() * CUDDLE_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

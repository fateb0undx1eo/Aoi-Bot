const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const PUNCH_MESSAGES = [
    "{author} punches {target}! 👊💥",
    "{author} lands a powerful punch on {target}! 🥊",
    "{author} playfully punches {target}! ",
    "{author} delivers a strong punch to {target}!"
];

module.exports = {
    name: 'punch',
    description: 'Punch someone!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to punch!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply("Punching yourself? Ouch!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('punch');
        const randomMsg = PUNCH_MESSAGES[Math.floor(Math.random() * PUNCH_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

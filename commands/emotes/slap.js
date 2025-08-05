const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const SLAP_MESSAGES = [
    "{author} slaps {target} playfully! ",
    "{author} gives {target} a big slap! 😆",
    "{author} slaps {target} with style! ",
    "{author} sends a dramatic slap to {target}! ",
    "{author} teaches {target} a lesson with a slap! "
];

module.exports = {
    name: 'slap',
    description: 'Slap someone playfully!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to slap!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply("😂 Slapping yourself? That’s bold, but try someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('slap');
        const randomMsg = SLAP_MESSAGES[Math.floor(Math.random() * SLAP_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

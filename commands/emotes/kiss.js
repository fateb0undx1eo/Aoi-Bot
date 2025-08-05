const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const KISS_MESSAGES = [
    "{author} gives {target} a sweet kiss! ",
    "{author} plants a kiss on {target}! ",
    "{author} softly kisses {target}! ❤️",
    "{author} surprises {target} with a kiss! 😳",
    "{author} gives {target} a romantic kiss! 💖"
];

module.exports = {
    name: 'kiss',
    description: 'Kiss someone!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to kiss!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply("😳 Kissing yourself? That’s… creative, but try someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('kiss');
        const randomMsg = KISS_MESSAGES[Math.floor(Math.random() * KISS_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

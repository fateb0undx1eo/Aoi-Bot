const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const PECK_MESSAGES = [
    "{author} gives {target} a soft peck! ",
    "{author} sneaks a little kiss on {target}! ",
    "{author} pecks {target} on the cheek! ",
    "{author} surprises {target} with a quick peck!"
];

module.exports = {
    name: 'peck',
    description: 'Give someone a small peck!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to peck!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply("Pecking yourself? That's... impressive.");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('peck');
        const randomMsg = PECK_MESSAGES[Math.floor(Math.random() * PECK_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

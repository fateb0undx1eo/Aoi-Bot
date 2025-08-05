const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const HANDSHAKE_MESSAGES = [
    "{author} shakes hands with {target}. 🤝",
    "{author} gives {target} a firm handshake. ",
    "{author} and {target} seal the deal with a handshake!",
    "{author} reaches out and shakes {target}'s hand warmly."
];

module.exports = {
    name: 'handshake',
    description: 'Shake hands with someone!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to shake hands with!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply(" Trying to shake hands with yourself?");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('handshake');
        const randomMsg = HANDSHAKE_MESSAGES[Math.floor(Math.random() * HANDSHAKE_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

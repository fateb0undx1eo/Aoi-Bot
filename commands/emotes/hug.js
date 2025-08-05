const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const HUG_MESSAGES = [
    "{author} wraps their arms around {target} in a warm hug! ",
    "{author} gives {target} the coziest hug ever! 💖",
    "{author} hugs {target} tightly! 🐻",
    "{author} jumps in and hugs {target}! ",
    "{author} sends all the love to {target} with a big hug! ❤️"
];

module.exports = {
    name: 'hug',
    description: 'Give someone a warm hug!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to hug!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply(" Self-hugs are nice, but try hugging someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('hug');
        const randomMsg = HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

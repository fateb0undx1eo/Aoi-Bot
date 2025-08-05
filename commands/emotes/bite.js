const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const BITE_MESSAGES = [
    "{author} playfully bites {target}! 😝",
    "{author} takes a little nibble on {target}! ",
    "{author} bites {target} gently! ",
    "{author} chomps on {target}! 🍴",
    "{author} surprises {target} with a cute bite! 😳"
];

module.exports = {
    name: 'bite',
    description: 'Bite someone playfully!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to bite!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply(" Biting yourself? That’s weird, try someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('bite');
        const randomMsg = BITE_MESSAGES[Math.floor(Math.random() * BITE_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

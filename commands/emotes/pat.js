const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const PAT_MESSAGES = [
    "{author} gently pats {target}'s head! ",
    "{author} gives {target} a comforting pat! ",
    "{author} pats {target} softly! 😊",
    "{author} shows love by patting {target}! 💖",
    "{author} can't resist patting {target}'s head! "
];

module.exports = {
    name: 'pat',
    description: 'Pat someone on the head!',

    async execute(message) {
        const member = message.mentions.members.first();

        if (!member) {
            const msg = await message.reply("❌ Tag someone to pat!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        if (member.id === message.author.id) {
            const msg = await message.reply(" Patting yourself? Cute, but try someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const gifUrl = await fetchEmote('pat');
        const randomMsg = PAT_MESSAGES[Math.floor(Math.random() * PAT_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

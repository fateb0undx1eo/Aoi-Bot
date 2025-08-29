const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const HANDHOLD_MESSAGES = [
    "{author} gently holds {target}'s hand. ",
    "{author} reaches out and holds hands with {target}. ",
    "{author} and {target} are now holding hands! 🥰",
    "{author} grabs {target}'s hand warmly. "
];
module.exports = {
    name: 'handhold',
    description: 'Hold someone\'s hand!',
    async execute(message) {
        const member = message.mentions.members.first();
        if (!member) {
            const msg = await message.reply("❌ Tag someone to hold hands with!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        if (member.id === message.author.id) {
            const msg = await message.reply("😳 Holding your own hand? Try holding someone else's!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('handhold');
        const randomMsg = HANDHOLD_MESSAGES[Math.floor(Math.random() * HANDHOLD_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

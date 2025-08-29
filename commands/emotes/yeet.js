const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const YEET_MESSAGES = [
    "{author} yeets {target} into the sky! 🚀",
    "{author} grabs {target} and YEETS them away! ",
    "{author} throws {target} across the server! ",
    "{author} yeets {target} with incredible strength!"
];
module.exports = {
    name: 'yeet',
    description: 'Yeet someone!',
    async execute(message) {
        const member = message.mentions.members.first();
        if (!member) {
            const msg = await message.reply("❌ Tag someone to yeet!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        if (member.id === message.author.id) {
            const msg = await message.reply(" Yeeting yourself? Bold choice!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('yeet');
        const randomMsg = YEET_MESSAGES[Math.floor(Math.random() * YEET_MESSAGES.length)]
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

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const FEED_MESSAGES = [
    "{author} feeds {target} some yummy food! 🍱",
    "{author} gives {target} a tasty treat! 🍩",
    "{author} lovingly feeds {target}! ",
    "{author} shares a delicious meal with {target}! 🍔",
    "{author} says: Open wide, {target}! 😋"
];
module.exports = {
    name: 'feed',
    description: 'Feed someone some yummy food!',
    async execute(message) {
        const member = message.mentions.members.first();
        // ❌ Handle no mention
        if (!member) {
            const msg = await message.reply("❌ Tag someone to feed!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        // 🤚 Prevent self-feed
        if (member.id === message.author.id) {
            const msg = await message.reply("😋 Feeding yourself? Cute, but try sharing with someone else!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('feed');
        const randomMsg = FEED_MESSAGES[Math.floor(Math.random() * FEED_MESSAGES.length)]
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

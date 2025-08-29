const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const POKE_MESSAGES = [
    "{author} pokes {target}! 👉",
    "{author} boops {target} with a poke! 😆",
    "{author} pokes {target} to grab their attention! ",
    "{author} gives {target} a playful poke!"
];
module.exports = {
    name: 'poke',
    description: 'Poke someone!',
    async execute(message) {
        const member = message.mentions.members.first();
        if (!member) {
            const msg = await message.reply("❌ Tag someone to poke!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        if (member.id === message.author.id) {
            const msg = await message.reply(" Poking yourself? That's funny!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('poke');
        const randomMsg = POKE_MESSAGES[Math.floor(Math.random() * POKE_MESSAGES.length)]
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

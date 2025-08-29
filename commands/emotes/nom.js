const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const NOM_MESSAGES = [
    "{author} noms on {target}! ",
    "{author} playfully takes a nom out of {target}! ",
    "{author} can't resist and noms {target}! 🍪",
    "{author} goes *nom nom* on {target}!"
];
module.exports = {
    name: 'nom',
    description: 'Nom on someone!',
    async execute(message) {
        const member = message.mentions.members.first();
        if (!member) {
            const msg = await message.reply("❌ Tag someone to nom!");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        if (member.id === message.author.id) {
            const msg = await message.reply("🤣 Nomin' yourself? Tasty?");
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }
        const gifUrl = await fetchEmote('nom');
        const randomMsg = NOM_MESSAGES[Math.floor(Math.random() * NOM_MESSAGES.length)]
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

const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const SHOOT_MESSAGES = [
    "{author} playfully shoots at {target}! ",
    "{author} aims and fires at {target}!",
    "{author} goes *pew pew!* at {target}!",
    "{author} shoots {target} with a bang!"
];

module.exports = {
    name: 'shoot',
    description: 'Playfully shoot someone!',

    async execute(message) {
        const member = message.mentions.members.first();

        // Handle no mention
        if (!member) {
            return message.reply("❌ Tag someone to shoot!")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Prevent self-shoot
        if (member.id === message.author.id) {
            return message.reply(" Shooting yourself? That’s not safe!")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const gifUrl = await fetchEmote("shoot");
        const randomMsg = SHOOT_MESSAGES[Math.floor(Math.random() * SHOOT_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

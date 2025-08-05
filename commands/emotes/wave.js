const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

const WAVE_MESSAGES = [
    "{author} waves enthusiastically at {target}! ",
    "{author} gives a cheerful wave to {target}!",
    "{author} waves at {target}, catching their attention!",
    "{author} greets {target} with a friendly wave!"
];

module.exports = {
    name: 'wave',
    description: 'Wave at someone!',

    async execute(message) {
        const member = message.mentions.members.first();

        // Handle no mention
        if (!member) {
            return message.reply("❌ Tag someone to wave at!")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Prevent self-wave
        if (member.id === message.author.id) {
            return message.reply("Waving at yourself in the mirror?")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const gifUrl = await fetchEmote("wave");
        const randomMsg = WAVE_MESSAGES[Math.floor(Math.random() * WAVE_MESSAGES.length)]
            .replace("{author}", message.author)
            .replace("{target}", member);

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);

        await message.channel.send({ embeds: [embed] });
    }
};

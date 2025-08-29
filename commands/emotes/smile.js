const { EmbedBuilder } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');
const SMILE_MESSAGES = [
    "{author} smiles warmly.",
    "{author} brightens the room with a smile!",
    "{author} just can't stop smiling!"
];
module.exports = {
    name: 'smile',
    description: 'Smile brightly!',
    async execute(message) {
        const gifUrl = await fetchEmote('smile');
        const randomMsg = SMILE_MESSAGES[Math.floor(Math.random() * SMILE_MESSAGES.length)]
            .replace("{author}", message.author);
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(randomMsg)
            .setImage(gifUrl);
        await message.channel.send({ embeds: [embed] });
        // Delete the user's command message to keep chat tidy
        message.delete().catch(() => {});
    }
};

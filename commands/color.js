const { EmbedBuilder } = require("discord.js");
const Vibrant = require("node-vibrant");

module.exports = {
    name: "color",
    description: "Shows a random color or the dominant color of a user's avatar.",
    async execute(message, args) {
        // Determine target user
        const targetUser = message.mentions.users.first() || message.author;

        // Determine if we are using avatar color or random
        let colorHex;
        let sourceText;

        if (message.mentions.users.first()) {
            // Extract dominant color from the mentioned user's avatar
            const avatarURL = targetUser.displayAvatarURL({ extension: "png", size: 512 });

            try {
                const palette = await Vibrant.from(avatarURL).getPalette();
                const dominant = palette.Vibrant || palette.Muted || palette.DarkVibrant || palette.LightVibrant;
                colorHex = dominant.getHex();
                sourceText = `Dominant color from ${targetUser.username}'s avatar`;
            } catch (err) {
                console.error(err);
                colorHex = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                sourceText = "Random cozy color (couldn't extract avatar color)";
            }
        } else {
            // Random color
            colorHex = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
            sourceText = "Random cozy color";
        }

        // Convert color formats
        const hex = colorHex.toUpperCase();
        const intVal = parseInt(hex.slice(1), 16);
        const rgb = [
            (intVal >> 16) & 255,
            (intVal >> 8) & 255,
            intVal & 255,
        ].join(", ");

        // Build aesthetic embed
        const embed = new EmbedBuilder()
            .setColor(intVal)
            .setTitle("⊹﹒COLOR PICKER﹒⊹")
            .setDescription(
                `✦ HEX » ${hex}\n` +
                `✦ RGB » ${rgb}\n` +
                `✦ INT  » ${intVal}\n\n` +
                `ᵔᴗᵔ ${sourceText}!`
            )
            .setThumbnail(`https://singlecolorimage.com/get/${hex.slice(1)}/100x100`);

        message.channel.send({ embeds: [embed] });
    },
};

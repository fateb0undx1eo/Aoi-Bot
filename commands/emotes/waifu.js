const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'waifu',
    description: 'Get a random waifu image!',
    async execute(message) {
        const gifUrl = await fetchEmote('waifu');
        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Official Discord blurple
            .setDescription(`${message.author} discovered a lovely waifu!`)
            .setImage(gifUrl);

        // Add Smash and Pass buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('waifu_smash')
                .setLabel('Smash')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('waifu_pass')
                .setLabel('Pass')
                .setStyle(ButtonStyle.Danger)
        );

        // Send the embed with buttons
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });

        // Collector for button interactions
        const filter = i => ['waifu_smash', 'waifu_pass'].includes(i.customId) && i.message.id === sentMsg.id;
        const collector = sentMsg.createMessageComponentCollector({ filter, time: 30000 });

        let waifuClaimed = false; // Track if waifu is already smashed

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                await i.reply({ content: "Only the summoner can smash or pass!", ephemeral: true });
                return;
            }

            if (waifuClaimed) {
                await i.reply({ content: "This waifu has already been claimed!", ephemeral: true });
                return;
            }

            if (i.customId === 'waifu_smash') {
                waifuClaimed = true;

                // Send waifu pic to DM
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle("💌 Here's your waifu!")
                        .setImage(gifUrl);
                    await i.user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    console.error(`❌ Could not DM ${i.user.tag}:`, err);
                }

                // Let them know (ephemeral reply)
                await i.reply({ content: `😍 ${i.user} smashed! Check your DMs 💌`, ephemeral: true });

                // Delete summoner's original command message after 5s
                setTimeout(() => {
                    message.delete().catch(() => {});
                }, 5000);

                // Delete the waifu embed (the waifu itself) after 10s
                setTimeout(() => {
                    sentMsg.delete().catch(() => {});
                }, 10000);

                collector.stop("waifu_claimed");
            }

            if (i.customId === 'waifu_pass') {
                await i.reply({ content: `😶 You passed...`, ephemeral: true });
            }
        });

        collector.on('end', () => {
            if (!waifuClaimed) {
                sentMsg.edit({ components: [] }).catch(() => {});
            }
        });
    }
};

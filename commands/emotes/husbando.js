const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'husbando',
    description: 'Get a random husbando image!',
    async execute(message) {
        const gifUrl = await fetchEmote('husbando');

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B') // A nice red tone for husbando
            .setDescription(`${message.author} discovered a dashing husbando!`)
            .setImage(gifUrl);

        // Add Smash and Pass buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('husbando_smash')
                .setLabel('Smash')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('husbando_pass')
                .setLabel('Pass')
                .setStyle(ButtonStyle.Danger)
        );

        // Send embed with buttons
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });

        // Auto-delete husbando embed after 10s no matter what
        setTimeout(() => {
            sentMsg.delete().catch(() => {});
        }, 10000);

        // Collector for button interactions
        const filter = i => ['husbando_smash', 'husbando_pass'].includes(i.customId) && i.message.id === sentMsg.id;
        const collector = sentMsg.createMessageComponentCollector({ filter, time: 30000 });

        let husbandoClaimed = false;

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                await i.reply({ content: "Only the summoner can smash or pass!", ephemeral: true });
                return;
            }

            if (husbandoClaimed) {
                await i.reply({ content: "This husbando has already been claimed!", ephemeral: true });
                return;
            }

            if (i.customId === 'husbando_smash') {
                husbandoClaimed = true;

                // Send husbando pic to DM
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#FF6B6B')
                        .setTitle("💌 Here's your husbando!")
                        .setImage(gifUrl);
                    await i.user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    console.error(`❌ Could not DM ${i.user.tag}:`, err);
                }

                // Let them know
                await i.reply({ content: `😍 ${i.user} smashed! Check your DMs 💌`, ephemeral: true });

                // Delete summoner’s command after 5s
                setTimeout(() => {
                    message.delete().catch(() => {});
                }, 5000);

                collector.stop("husbando_claimed");
            }

            if (i.customId === 'husbando_pass') {
                await i.reply({ content: `😶 You passed...`, ephemeral: true });
            }
        });
    }
};

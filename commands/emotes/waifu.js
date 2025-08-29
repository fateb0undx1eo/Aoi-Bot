const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchEmote } = require('../../utils/emoteFetcher');

module.exports = {
    name: 'waifu',
    description: 'Get a random waifu image!',
    async execute(message) {
        const gifUrl = await fetchEmote('waifu');
        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(`${message.author} discovered a lovely waifu!`)
            .setImage(gifUrl); // This displays the image directly

        // Add Smash and Pass buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('waifu_smash')
                .setLabel('Smash')
                .setStyle(ButtonStyle.Success), // Green
            new ButtonBuilder()
                .setCustomId('waifu_pass')
                .setLabel('Pass')
                .setStyle(ButtonStyle.Danger)  // Red
        );

        // Send the embed with buttons
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });

        // Optionally: add a collector for button clicks (remove if you want only visual buttons)
        const filter = i => ['waifu_smash', 'waifu_pass'].includes(i.customId) && i.message.id === sentMsg.id;
        const collector = sentMsg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if(i.user.id !== message.author.id) {
                await i.reply({ content: "Only the summoner can smash or pass!", ephemeral: true });
                return;
            }
            if(i.customId === 'waifu_smash') {
                await i.reply({ content: `😍 ${i.user} smashed!`, ephemeral: true });
            } else if(i.customId === 'waifu_pass') {
                await i.reply({ content: `😶 ${i.user} passed...`, ephemeral: true });
            }
        });

        collector.on('end', () => {
            sentMsg.edit({ components: [] }).catch(()=>{});
        });
    }
};

const { EmbedBuilder } = require('discord.js');
const { getAutoPosterState } = require('../utils/autoPoster');
const quoteManager = require('../utils/quoteManager');

module.exports = {
  name: 'stats',
  description: 'Show bot stats including auto-post info.',

  async execute(message) {
    const state = getAutoPosterState();
    const nextMeme = state.nextPostIn !== null ? `${state.nextPostIn}s` : 'Unknown';
    const subList = state.subreddits && state.subreddits.length > 0 ? state.subreddits.map(s => `    r/${s}`).join('\n') : '    None';
    const nextQuoteSec = quoteManager.getNextQuoteIn(message.guild.id);
    const nextQuote = nextQuoteSec !== null ? `${nextQuoteSec}s` : 'Unknown';

    const embed = new EmbedBuilder()
      .setColor(Math.floor(Math.random() * 16777215))
      .setTitle('⊹﹒ＡＯＩ ＳＴＡＴＳ﹒⊹﹒')
      .setDescription(
`     ❖ Ping : ${Date.now() - message.createdTimestamp}ms
     ❖ Interval : ${state.interval}s
     ❖ Next Meme : ${nextMeme}
     ❖ Next Quote : ${nextQuote}
     ❖ Subreddits :
${subList}
﹒⟡﹒✧﹒⟡﹒`
      )
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  data: {
    name: 'stats',
    description: 'Show bot stats including auto-post info',
  },

  async slashExecute(interaction) {
    const state = getAutoPosterState();
    const nextMeme = state.nextPostIn !== null ? `${state.nextPostIn}s` : 'Unknown';
    const subList = state.subreddits && state.subreddits.length > 0 ? state.subreddits.map(s => `    r/${s}`).join('\n') : '    None';
    const nextQuoteSec = quoteManager.getNextQuoteIn(interaction.guildId);
    const nextQuote = nextQuoteSec !== null ? `${nextQuoteSec}s` : 'Unknown';

    const embed = new EmbedBuilder()
      .setColor(Math.floor(Math.random() * 16777215))
      .setTitle('⊹﹒ＡＯＩ ＳＴＡＴＳ﹒⊹﹒')
      .setDescription(
`     ❖ Ping : ${Date.now() - interaction.createdTimestamp}ms
     ❖ Interval : ${state.interval}s
     ❖ Next Meme : ${nextMeme}
     ❖ Next Quote : ${nextQuote}
     ❖ Subreddits :
${subList}
﹒⟡﹒✧﹒⟡﹒`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

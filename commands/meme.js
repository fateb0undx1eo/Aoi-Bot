const { EmbedBuilder } = require('discord.js');
const fetchMeme = require('../utils/fetchMeme');
const memeSubreddits = require('../memesubreddits'); // Import your subreddit list

module.exports = {
  name: 'meme',
  description: 'Fetches a random meme from Reddit',
  async execute(interactionOrMessage) {
    const isSlash = !!interactionOrMessage.isChatInputCommand;
    try {
      if (isSlash) {
        await interactionOrMessage.deferReply();
      }

      // Pass your centralized subreddit list here
      const meme = await fetchMeme(memeSubreddits);

      if (!meme || !meme.url) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('❌ Could not fetch a meme at this time.');
        return isSlash
          ? interactionOrMessage.editReply({ embeds: [embed] })
          : interactionOrMessage.channel.send({ embeds: [embed] });
      }

      // Validate image format against allowed Discord embed image extensions
      const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      function isSupportedImage(url) {
        if (!url) return false;
        const urlWithoutParams = url.split('?')[0].toLowerCase();
        return validExtensions.some(ext => urlWithoutParams.endsWith(ext));
      }

      if (!isSupportedImage(meme.url)) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('❌ Meme image is in an unsupported format. Please try again.');
        return isSlash
          ? interactionOrMessage.editReply({ embeds: [embed] })
          : interactionOrMessage.channel.send({ embeds: [embed] });
      }

      const randomColor = Math.floor(Math.random() * 16777215);
      const embed = new EmbedBuilder()
        .setColor(randomColor)
        .setImage(meme.url)
        .setFooter({ text: `r/${meme.subreddit}` });

      return isSlash
        ? interactionOrMessage.editReply({ embeds: [embed] })
        : interactionOrMessage.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing meme command:', error);
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('❌ Could not fetch a meme at this time.');

      if (interactionOrMessage.isChatInputCommand) {
        if (interactionOrMessage.deferred) {
          await interactionOrMessage.editReply({ embeds: [embed] });
        } else {
          await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
        }
      } else {
        await interactionOrMessage.channel.send({ embeds: [embed] });
      }
    }
  }
};

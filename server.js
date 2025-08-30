client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  try {
    const result = moderation.checkMessageContent(message.content, message.author.id, message.guild);
    if (result.flagged) {
      await message.delete();

      // DM warning
      try {
        await message.author.send(
          `⚠️ Your message in **${message.guild.name}** was removed because it contained a banned word: **${result.matchedWord}**. Please follow the rules.`
        );
      } catch (dmError) {
        console.warn(`Could not DM ${message.author.tag}:`, dmError);
      }
    }
  } catch (error) {
    console.error('Error handling moderation:', error);
  }
});

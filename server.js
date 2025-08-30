client.on('messageCreate', async (message) => {
  // Ignore DMs and bots
  if (!message.guild || message.author.bot) return;

  try {
    const containsBannedWord = moderation.checkMessageContent(message.content, message.author.id, message.guild);
    if (containsBannedWord) {
      await message.delete();

      // Send DM warning with reason
      try {
        await message.author.send(
          `⚠️ Your message in **${message.guild.name}** was removed because it contained a banned word or inappropriate content. Please adhere to the server rules.`
        );
      } catch (dmError) {
        console.warn(`Could not send DM to ${message.author.tag}:`, dmError);
        // Optionally, you could fallback to a public message here if DM fails
      }
    }
  } catch (error) {
    console.error('Error handling moderation:', error);
  }
});

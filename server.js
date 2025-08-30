const moderation = require("./utils/moderation.js"); // <-- make sure this path is correct

client.on("messageCreate", async (message) => {
  // Ignore DMs and bots
  if (!message.guild || message.author.bot) return;

  try {
    const containsBannedWord = moderation.checkMessageContent(
      message.content,
      message.author.id,
      message.guild
    );

    if (containsBannedWord) {
      await message.delete();

      // Send DM warning with reason
      try {
        await message.author.send(
          `⚠️ Your message in **${message.guild.name}** was removed because it contained a banned word or inappropriate content. Please adhere to the server rules.`
        );
      } catch (dmError) {
        console.warn(`❌ Could not send DM to ${message.author.tag}:`, dmError);
        // Optional: fallback to replying in channel
        // await message.channel.send(`${message.author}, your message was removed due to banned content.`);
      }
    }
  } catch (error) {
    console.error("❌ Error handling moderation:", error);
  }
});

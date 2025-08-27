const { EmbedBuilder } = require('discord.js');

const COOLDOWN_SECONDS = 20;
const AUTODELETE_MS = 60000;

const cooldowns = new Map();

module.exports = {
  name: 'boosterperks',
  description: 'Show server booster perks',

  async execute(message, client, args) {
    // Bypass cooldown for server owner
    if (message.guild.ownerId !== message.author.id) {
      const key = `${message.author.id}_boosterperks`;
      const now = Date.now();
      if (cooldowns.has(key)) {
        const expireTime = cooldowns.get(key);
        if (now < expireTime) {
          return message.reply(`Please wait ${Math.ceil((expireTime - now) / 1000)} seconds before using this command again.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
      }
      cooldowns.set(key, now + COOLDOWN_SECONDS * 1000);
    }

    const description = `
✦ Thinking of boosting the server? It genuinely helps us out and keeps everything running smoother.
Boosting helps our community flourish and keeps the experience top-tier for everyone.
We deeply value each person who chooses to support us.

As a thanks, you’ll get the <@&1390627859575472244> role with these perks:
﹒✦ Instantly gain +5 levels  
﹒✦ 20% faster level-up rate  
﹒✦ Custom role color of your choice  
﹒✦ Extra features and chill perks

Boosting isn’t a must, but if you do — you get rewarded for it.
    `;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2) // Discord blurple color
      .setTitle('<a:emoji_97:1395017223164264478> BOOST PERKS')
      .setDescription(description.trim())
      .setTimestamp();

    const sent = await message.channel.send({ embeds: [embed] });

    // Auto delete bot reply and user command after 60 seconds
    setTimeout(() => {
      sent.delete().catch(() => {});
      message.delete().catch(() => {});
    }, AUTODELETE_MS);
  },
};

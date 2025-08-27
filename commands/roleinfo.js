const { EmbedBuilder } = require('discord.js');

const COOLDOWN_SECONDS = 20;
const AUTODELETE_MS = 60000;

const cooldowns = new Map();

module.exports = {
  name: 'roleinfo',
  description: 'Show server booster perks and role info',

  async execute(message, client, args) {
    // Bypass cooldown for server owner
    if (message.guild.ownerId !== message.author.id) {
      const key = `${message.author.id}_roleinfo`;
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

    // Your exact embed text with role mentions, spaced as requested
    const description = `
★︰Level up to unlock new features and abilities across the server  
𖥔  Each rank brings ✦new permissions — marked with ⤷ ✦  
𖥔  These include everything from previous levels too!  
𖥔  Climb higher to access perks like TTS, file uploads, and custom role colors  
𖥔  Check your level in any bot channel using /level

❖ <@&1390627859277807707> [Level 0]  
⤷ Read + View Messages  
⤷ Send Messages & React  
⤷ VC — Connect & Speak  

❖ <@&1390627859277807708> [Level 10]  
⤷ ✦ Send Voice Messages  
⤷ ✦ Use Video in VC  

❖ <@&1390627859277807709> [Level 20]  
⤷ ✦ Change Own Nickname  
⤷ ✦ Use Soundboard  
⤷ ✦ Use Voice Activity  
⤷ ✦ Use External Sounds  

❖ <@&1390627859277807710> [Level 30]  
⤷ ✦ Send Text-to-Speech Messages  

❖ <@&1390627859277807711> [Level 40]  
⤷ ✦ Use External Stickers  

❖ <@&1390627859277807712> [Level 50]  
⤷ ✦ Use External Emojis  

❖ <@&1390627859277807713> [Level 60]  
⤷ ✦ Embed Links / Send GIFs  

❖ <@&1390627859277807714> [Level 80]  
⤷ ✦ Attach Files / Share from Gallery  

❖ <@&1392500840853409923> [Level 100]  
⤷ ✦ Unlocks Custom Role Color
`;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2) // Discord Blurple
      .setDescription(description.trim())
      .setTimestamp();

    const sent = await message.channel.send({ embeds: [embed] });

    // Auto-delete both messages after 60 seconds
    setTimeout(() => {
      sent.delete().catch(() => {});
      message.delete().catch(() => {});
    }, AUTODELETE_MS);
  },
};

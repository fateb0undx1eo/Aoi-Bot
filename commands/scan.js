const fs = require('fs');
const path = require('path');

// Correct path: bot/utils/badwords.json
const badWordsPath = path.join(__dirname, '../utils/badwords.json');
const badWords = JSON.parse(fs.readFileSync(badWordsPath, 'utf8'));

module.exports = {
    name: 'scan',
    description: 'Scan recent messages and delete ones containing bad words.',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply("🚫 You don't have permission to use this command.");
        }

        const amount = parseInt(args[0]) || 100;

        try {
            const fetched = await message.channel.messages.fetch({ limit: amount });
            let deletedCount = 0;

            for (const msg of fetched.values()) {
                if (badWords.some(word => msg.content.toLowerCase().includes(word))) {
                    await msg.delete().catch(() => {});
                    deletedCount++;
                }
            }

            await message.reply(`✅ Scan complete! Deleted **${deletedCount}** naughty message(s).`);
        } catch (err) {
            console.error(err);
            await message.reply("❌ Something went wrong during the scan.");
        }
    }
};

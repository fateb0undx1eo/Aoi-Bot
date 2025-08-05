const { updateInterval } = require('../utils/autoPoster');

module.exports = {
    name: 'autopost',
    description: 'Set the meme auto-post interval in milliseconds (admin only)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("❌ Only admins can change auto-post interval.");
        }

        const interval = parseInt(args[0], 10);
        if (isNaN(interval)) return message.reply("❌ Please provide a valid number in milliseconds.");

        const success = updateInterval(client, interval);
        if (success) {
            message.reply(`✅ Auto-post interval updated to ${interval / 1000} seconds.`);
        } else {
            message.reply("❌ Interval too low. Minimum is 10 seconds.");
        }
    },

    // For slash commands
    data: {
        name: 'autopost',
        description: 'Set the meme auto-post interval (admin only)',
        options: [
            {
                name: 'milliseconds',
                type: 4, // integer
                description: 'Interval in ms (min 10000)',
                required: true
            }
        ]
    },
    async slashExecute(interaction, client) {
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: "❌ Only admins can use this.", ephemeral: true });
        }

        const interval = interaction.options.getInteger('milliseconds');
        const success = updateInterval(client, interval);

        if (success) {
            interaction.reply(`✅ Auto-post interval updated to ${interval / 1000} seconds.`);
        } else {
            interaction.reply("❌ Interval too low. Minimum is 10 seconds.");
        }
    }
};

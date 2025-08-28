require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Your bot's Application (Client) ID

if (!CLIENT_ID) {
    console.error("❌ Please set CLIENT_ID in your .env file.");
    process.exit(1);
}

// Load all commands from /commands folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.name && command.description) {
        commands.push({
            name: command.name,
            description: command.description,
            options: command.options || []
        });
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Global registration
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log('✅ Successfully registered application (/) commands globally!');
        console.log('⚠️ Note: Global slash commands may take up to 1 hour to appear.');
    } catch (error) {
        console.error(error);
    }
})();

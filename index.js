require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { startAutoPoster } = require('./utils/autoPoster');
const { checkCooldown } = require('./utils/cooldownManager');  // Import cooldown manager

const TOKEN = process.env.TOKEN;
const MEME_CHANNEL_ID = process.env.MEME_CHANNEL_ID;
const PREFIX = 's!';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

/**
 * Recursively loads all commands from the commands folder and subfolders.
 */
function loadCommands(dirPath = path.join(__dirname, 'commands')) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.lstatSync(fullPath);
        if (stat.isDirectory()) {
            loadCommands(fullPath); // Scan subfolders
        } else if (file.endsWith('.js')) {
            const command = require(fullPath);
            // Accepts either {name, execute()} style
            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name} (${fullPath})`);
            } else {
                console.warn(`⚠️ Skipped invalid command file: ${file}`);
            }
        }
    }
}

// Load commands recursively
loadCommands();

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    startAutoPoster(client, MEME_CHANNEL_ID);
});

// Slash Command Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Check cooldown before executing
    const cd = checkCooldown(interaction.user.id, interaction.guild);
    if (!cd.allowed) {
        await interaction.reply({
            content: `⚠️ Please slow down! Wait ${(cd.timeLeft / 1000).toFixed(1)}s before using commands again.`,
            ephemeral: true
        });
        return;
    }

    try {
        if (command.slashExecute) {
            await command.slashExecute(interaction, client);
        } else {
            await command.execute(interaction, client);
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

// Prefix Command Handler
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    // Check cooldown before executing
    const cd = checkCooldown(message.author.id, message.guild);
    if (!cd.allowed) {
        const reply = await message.reply(
            `⚠️ Please slow down! Wait ${(cd.timeLeft / 1000).toFixed(1)}s before using commands again.`
        );
        setTimeout(() => reply.delete().catch(() => {}), 4000); // auto-delete warning after 4s
        return;
    }

    try {
        await command.execute(message, client, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing this command!');
    }
});

client.login(TOKEN);

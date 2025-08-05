require('dotenv').config();
const fs = require('fs');
const path = require('path');
const expressKeepAlive = require('./server.js'); // Keep-alive server
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const autoPosterManager = require('./utils/autoPosterManager'); // Modular autoposters

const TOKEN = process.env.TOKEN;
const PREFIX = 's!';

// ---------- PATCH: global rejection handler ----------
process.on('unhandledRejection', err => {
    console.error('[Unhandled Rejection]', err);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // for userinfo/serverinfo
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// ---------- Command Loader ----------
function loadCommands(dirPath = path.join(__dirname, 'commands')) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.lstatSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            delete require.cache[require.resolve(fullPath)];
            const command = require(fullPath);
            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name} (${fullPath})`);
            } else {
                console.warn(`⚠️ Skipped invalid command file: ${file}`);
            }
        }
    }
}

loadCommands();

// ---------- When bot is ready ----------
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Listening });

    // Start all autoposters (memes, quotes, etc.)
    autoPosterManager(client);
});

// ---------- Slash Commands ----------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (command.slashExecute) await command.slashExecute(interaction, client);
        else await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        const reply = { content: 'There was an error executing this command!', ephemeral: true };
        interaction.deferred || interaction.replied
            ? interaction.followUp(reply)
            : interaction.reply(reply);
    }
});

// ---------- Prefix Commands ----------
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, client, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing this command!');
    }
});

// ---------- Login bot and start keep-alive server ----------
client.login(TOKEN);
expressKeepAlive();

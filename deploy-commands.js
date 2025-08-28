function getCommandFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getCommandFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

const commandsPath = path.join(__dirname, 'commands', 'utils');
const commandFiles = getCommandFiles(commandsPath);

const commands = [];
for (const file of commandFiles) {
    const command = require(file);
    if (command.name && command.description) {
        commands.push({
            name: command.name,
            description: command.description,
            options: command.options || []
        });
    }
}

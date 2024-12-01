const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { config: { token } } = require('./src/discord-config.json');
const { deployCommands } = require('./utility/deploy.js');
const { connectDatabase } = require('./modules/database-module.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const loadFiles = (folderPath, callback) => {
    const folders = fs.readdirSync(folderPath);
    folders.forEach(folder => {
        const subFolderPath = path.join(folderPath, folder);
        if (fs.existsSync(subFolderPath)) {
            const files = fs.readdirSync(subFolderPath).filter(file => file.endsWith('.js'));
            files.forEach(file => callback(path.join(subFolderPath, file)));
        }
    });
};

const loadCommands = (folderPath) => {
    loadFiles(folderPath, filePath => {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command in ${filePath} is missing "data" or "execute" properties.`);
        }
    });
};

const loadEvents = (folderPath) => {
    loadFiles(folderPath, filePath => {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    });
};

// Loading commands and events
loadCommands(path.join(__dirname, 'commands'));
loadEvents(path.join(__dirname, 'events'));

// Deploy commands and login the bot
(async () => {
    try {
        await deployCommands();
        console.log('Commands deployed successfully!\n-------------------\n');
        await connectDatabase();
        console.log('Database connected successfully!\n-------------------\n');
        await client.login(token);
    } catch (err) {
        console.error(err);
    }
})();

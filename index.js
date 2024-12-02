const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { config: { token } } = require('./src/discord-config.json');
const { deployCommands } = require('./utility/deploy.js');
const { connectDatabase } = require('./modules/database-module.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const loadFilesRecursively = (folderPath, callback) => {
    const items = fs.readdirSync(folderPath);
    items.forEach(item => {
        const itemPath = path.join(folderPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
            loadFilesRecursively(itemPath, callback);
        } else if (item.endsWith('.js')) {
            callback(itemPath);
        }
    });
};

const loadCommands = (folderPath) => {
    loadFilesRecursively(folderPath, filePath => {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command in ${filePath} is missing "data" or "execute" properties.`);
        }
    });
};

const loadEvents = (folderPath) => {
    loadFilesRecursively(folderPath, filePath => {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Loaded event: ${event.name}`);
    });
};

// Loading commands and events
console.log('Loading commands...');
loadCommands(path.join(__dirname, 'commands'));
console.log('Loading events...');
loadEvents(path.join(__dirname, 'events'));

// Deploy commands and login the bot
(async () => {
    try {
        console.log('Deploying commands...');
        await deployCommands();
        console.log('Commands deployed successfully!\n-------------------\n');

        console.log('Connecting to database...');
        await connectDatabase();
        console.log('Database connected successfully!\n-------------------\n');

        console.log('Logging in...');
        await client.login(token);
        console.log('Bot logged in successfully!\n-------------------\n');
    } catch (err) {
        console.error('An error occurred during startup:', err);
    }
})();
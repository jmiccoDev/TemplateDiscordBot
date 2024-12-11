(async () => {
  const chalk = (await import('chalk')).default;

  const fs = require('node:fs/promises');
  const path = require('node:path');
  const { Client, Collection, GatewayIntentBits } = require('discord.js');
  const { config: { token } } = require('./src/discord-config.json');
  const { deployCommands, updateCommandsForNewGuild } = require('./utility/deploy.js');
  const { connectDatabase } = require('./modules/database-module.js');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = new Collection();
  client.cooldowns = new Collection();

  async function loadFilesRecursively(folderPath, callback) {
    const items = await fs.readdir(folderPath);
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await loadFilesRecursively(itemPath, callback);
      }
      else if (item.endsWith('.js')) {
        await callback(itemPath);
      }
    }
  }

  async function loadCommands(folderPath) {
    console.log(chalk.cyan.bold(`\n┌──────────────────────────────┐`));
    console.log(chalk.cyan.bold(`│        Loading Commands       │`));
    console.log(chalk.cyan.bold(`└──────────────────────────────┘\n`));
    let hasLoadedCommands = false;

    try {
      const commandFolders = await fs.readdir(folderPath);
      for (const folder of commandFolders) {
        const categoryPath = path.join(folderPath, folder);
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
          await loadFilesRecursively(categoryPath, async (filePath) => {
            try {
              const command = require(filePath);
              if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                hasLoadedCommands = true;
                console.log(chalk.green(`✔ Loaded command: ${chalk.bold(command.data.name)}`));
              }
              else {
                console.warn(chalk.yellow(`[WARNING] Missing "data" or "execute" in ${filePath}`));
              }
            }
            catch (error) {
              console.error(chalk.red(`✖ Error loading command from ${filePath}:`, error));
            }
          });
        }
      }
    }
    catch (error) {
      console.error(chalk.red('✖ Error loading commands:', error));
    }

    if (!hasLoadedCommands) {
      console.log(chalk.yellow('⚠ No command folders or files found.'));
    }
    else {
      console.log(chalk.cyan.bold('\n✔ All commands loaded successfully.\n'));
    }
  }

  async function loadEvents(folderPath) {
    console.log(chalk.magenta.bold(`\n┌──────────────────────────────┐`));
    console.log(chalk.magenta.bold(`│         Loading Events        │`));
    console.log(chalk.magenta.bold(`└──────────────────────────────┘\n`));
    let hasLoadedEvents = false;

    try {
      const eventFolders = await fs.readdir(folderPath);
      for (const folder of eventFolders) {
        const categoryPath = path.join(folderPath, folder);
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
          await loadFilesRecursively(categoryPath, async (filePath) => {
            try {
              const event = require(filePath);
              if (event.name && event.execute) {
                if (event.once) {
                  client.once(event.name, (...args) => event.execute(...args, client));
                }
                else {
                  client.on(event.name, (...args) => event.execute(...args, client));
                }
                console.log(chalk.green(`✔ Loaded event: ${chalk.bold(event.name)}`));
                hasLoadedEvents = true;
              }
              else {
                console.warn(chalk.yellow(`[WARNING] Missing "name" or "execute" in ${filePath}`));
              }
            }
            catch (error) {
              console.error(chalk.red(`✖ Error loading event from ${filePath}:`, error));
            }
          });
        }
      }

      client.on('guildCreate', async (guild) => {
        console.log(`Bot added to a new guild: ${guild.name}`);
        await updateCommandsForNewGuild(guild.id);
      });
    }
    catch (error) {
      console.error(chalk.red('✖ Error loading events:', error));
    }

    if (!hasLoadedEvents) {
      console.log(chalk.yellow('⚠ No event folders or files found.'));
    }
    else {
      console.log(chalk.magenta.bold('\n✔ All events loaded successfully.\n'));
    }
  }

  await loadEvents(path.join(__dirname, 'events'));
  await loadCommands(path.join(__dirname, 'commands'));

  process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
  });

  try {
    console.log(chalk.blue.bold(`\n┌──────────────────────────────┐`));
    console.log(chalk.blue.bold(`│       Initializing Bot       │`));
    console.log(chalk.blue.bold(`└──────────────────────────────┘\n`));

    console.log(chalk.blue.bold('\n┌──────────────────────────────┐'));
    console.log(chalk.blue.bold('│  Connecting to Database...   │'));
    console.log(chalk.blue.bold('└──────────────────────────────┘'));
    await connectDatabase();
    console.log(chalk.green('\n✔ Database connected successfully.\n'));

    console.log(chalk.blue.bold('\n┌──────────────────────────────┐'));
    console.log(chalk.blue.bold('│    Deploying Commands...     │'));
    console.log(chalk.blue.bold('└──────────────────────────────┘'));
    await deployCommands(client);
    console.log(chalk.green('\n✔ Commands deployed successfully.\n'));

    console.log(chalk.blue.bold('\n┌──────────────────────────────┐'));
    console.log(chalk.blue.bold('│         Logging in...         │'));
    console.log(chalk.blue.bold('└──────────────────────────────┘'));
    await client.login(token);
    console.log(chalk.green('\n✔ Bot logged in successfully.\n'));

    console.log(chalk.blue.bold('\n┌──────────────────────────────┐'));
    console.log(chalk.blue.bold('│       Bot is now ready!      │'));
    console.log(chalk.blue.bold('└──────────────────────────────┘\n'));

  }
  catch (error) {
    console.error(chalk.red.bold('✖ An error occurred during bot initialization:', error.stack));
    process.exit(1);
  }
})();
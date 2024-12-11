const { REST, Routes } = require('discord.js');
const { clientId, guildIds = [], token } = require('../src/discord-config.json').config || {};
const fs = require('node:fs');
const path = require('node:path');

async function loadCommands(folderPath) {
  const commands = { global: [], guild: [] };
  const items = await fs.promises.readdir(folderPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      const subCommands = await loadCommands(itemPath);
      commands.global.push(...subCommands.global);
      commands.guild.push(...subCommands.guild);
    }
    else if (item.name.endsWith('.js')) {
      const command = require(itemPath);
      if ('data' in command && 'execute' in command) {
        if ('global' in command && command.global === false) {
          console.log(`[INFO] Found guild command: ${command.data.name}`);
          commands.guild.push(command.data.toJSON());
        }
        else {
          console.log(`[INFO] Found global command: ${command.data.name}`);
          commands.global.push(command.data.toJSON());
        }
      }
      else {
        console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  return commands;
}

async function deployCommands() {
  if (!clientId || !token) {
    console.error('Error: clientId or token is missing in the config file.');
    return;
  }

  const foldersPath = path.join(__dirname, '../commands');
  const { global: globalCommands, guild: guildCommands } = await loadCommands(foldersPath);

  const rest = new REST().setToken(token);

  try {
    console.log(`Started refreshing ${globalCommands.length + guildCommands.length} application (/) commands.`);

    const deployGuildCommands = guildIds.length > 0
      ? guildIds.map(guildId =>
        rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands })
          .then(data => console.log(`Successfully reloaded ${data.length} guild (/) commands for ${guildId}.`))
          .catch(error => console.error(`Error deploying commands to guild ${guildId}:`, error)),
      )
      : [];

    const deployGlobalCommands = rest.put(Routes.applicationCommands(clientId), { body: globalCommands })
      .then(data => console.log(`Successfully reloaded ${data.length} global (/) commands.`))
      .catch(error => console.error('Error deploying global commands:', error));

    await Promise.all([...deployGuildCommands, deployGlobalCommands]);

    console.log('All commands have been successfully deployed.');
  }
  catch (error) {
    console.error('Error deploying commands:', error);
  }
}

async function updateCommandsForNewGuild(guildId) {
  if (!clientId || !token) {
    console.error('Error: clientId or token is missing in the config file.');
    return;
  }

  const foldersPath = path.join(__dirname, '../commands');
  const { global: globalCommands } = await loadCommands(foldersPath);

  const rest = new REST().setToken(token);

  try {
    console.log(`Started refreshing ${globalCommands.length} application (/) commands for ${guildId}.`);

    const guildData = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: globalCommands },
    );

    console.log(`Successfully reloaded ${guildData.length} guild (/) commands for ${guildId}.`);
  }
  catch (error) {
    console.error(`Error updating commands for guild ${guildId}:`, error);
  }
}

// Export the functions if you need to use them in other files
module.exports = { deployCommands, updateCommandsForNewGuild };

// Uncomment the line below if you want to run deployCommands when this script is executed
// deployCommands();


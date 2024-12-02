const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { config: { token, clientId, guildIds } } = require('../src/discord-config.json');

async function deployCommands() {
  const globalCommands = [];
  const guildCommands = [];
  const foldersPath = path.join(__dirname, '..', 'commands');

  // Recursive function to load commands from nested folders
  const loadCommandsRecursively = (folderPath) => {
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const isDirectory = fs.statSync(itemPath).isDirectory();

      if (isDirectory) {
        // Recursively process subdirectories
        loadCommandsRecursively(itemPath);
      }
      else if (item.endsWith('.js')) {
        // Load command file
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
          if (command.global === true) {
            globalCommands.push(command.data.toJSON());
          }
          else {
            guildCommands.push(command.data.toJSON());
          }
        }
        else {
          console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
        }
      }
    }
  };

  // Ensure guildIds is always an array
  const normalizedGuildIds = Array.isArray(guildIds) ? guildIds : guildIds ? [guildIds] : [];

  // Load commands from both context and slash directories
  for (const folder of ['context', 'slash']) {
    const folderPath = path.join(foldersPath, folder);
    if (fs.existsSync(folderPath)) {
      loadCommandsRecursively(folderPath);
    }
  }

  const rest = new REST().setToken(token);

  try {
    console.log(`Started refreshing application (/) commands.`);

    // Global command registration
    if (globalCommands.length > 0) {
      const globalData = await rest.put(
        Routes.applicationCommands(clientId),
        { body: globalCommands },
      );
      console.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);
    }

    // Guild-specific command registration
    if (guildCommands.length > 0 && normalizedGuildIds.length > 0) {
      for (const guildId of normalizedGuildIds) {
        const guildData = await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: guildCommands },
        );
        console.log(`Successfully reloaded ${guildData.length} guild-specific application (/) commands for guild ${guildId}.`);
      }
    }
  }
  catch (error) {
    console.error(error);
  }

  // Log summary
  console.log(`Total commands: ${globalCommands.length + guildCommands.length}`);
  console.log(`Global commands: ${globalCommands.length}`);
  console.log(`Guild-specific commands: ${guildCommands.length}`);
}

module.exports = { deployCommands };
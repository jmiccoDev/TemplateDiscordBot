const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { channels } = require("../src/discord-config.json");
const path = require('path');

function createErrorEmbed(error, commandName) {
  const stackLines = error.stack ? error.stack.split('\n') : [];
  const fileName = stackLines.length > 1 ? path.basename(stackLines[1].trim().split(' ')[1]) : 'N/A';
  const lineNumber = stackLines.length > 1 ? stackLines[1].match(/:(\d+):(\d+)/)?.[1] : 'N/A';
  const columnNumber = stackLines.length > 1 ? stackLines[1].match(/:(\d+):(\d+)/)?.[2] : 'N/A';

  const errorDescription = `
**Messaggio di Errore:**
\`\`\`js
${error.stack}
\`\`\`

**Posizione:**
\`\`\`js
File: ${fileName}
Linea: ${lineNumber}, Colonna: ${columnNumber}
\`\`\`
`;

  const errorEmbed = new EmbedBuilder()
    .setColor('#ff5757')
    .setTitle(`Errore durante l'esecuzione di \`${commandName || 'interazione'}\``)
    .setDescription(errorDescription)
    .setTimestamp();

  return errorEmbed;
}

async function logErrorToChannel(client, error, commandName) {
  const channel = await client.channels.fetch(channels.errorLogs);
  if (channel) {
    const errorEmbed = createErrorEmbed(error, commandName);
    await channel.send({ embeds: [errorEmbed] });
  }
}

async function handleError(error, interaction, commandName) {
  console.error(`Errore in ${commandName || 'interazione'}:`, error);

  const errorEmbed = createErrorEmbed(error, commandName);

  const replyOptions = { embeds: errorEmbed.embeds ? errorEmbed.embeds : [errorEmbed], components: errorEmbed.components ? errorEmbed.components : [], ephemeral: true };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    }
    else {
      await interaction.reply(replyOptions);
    }
  }
  catch (replyError) {
    console.error('Errore durante l\'invio del messaggio di errore:', replyError);
  }

  await logErrorToChannel(interaction.client, error, commandName);
}

module.exports = { handleError };
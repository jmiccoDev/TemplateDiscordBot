const { EmbedBuilder } = require('discord.js');

function createErrorEmbed(error, commandName) {
  const errorEmbed = new EmbedBuilder()
    .setColor('#ff5757')
    .setTitle(`Error while executing \`${commandName || 'interaction'}\``)
    .setDescription(`\`\`\`js\n${error.stack || error.message}\`\`\``)
    .setTimestamp();

  if (error.fileName) {
    errorEmbed.addFields({ name: 'File', value: error.fileName });
  }

  if (error.lineNumber && error.columnNumber) {
    errorEmbed.addFields({ name: 'Location', value: `Line ${error.lineNumber}, Column ${error.columnNumber}` });
  }

  return errorEmbed;
}

async function handleError(error, interaction, commandName) {
  console.error(`Error in ${commandName || 'interaction'}:`, error);

  const errorEmbed = createErrorEmbed(error, commandName);

  const replyOptions = { embeds: [errorEmbed], ephemeral: true };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    }
    else {
      await interaction.reply(replyOptions);
    }
  }
  catch (replyError) {
    console.error('Error while sending error message:', replyError);
  }
}

module.exports = { handleError };


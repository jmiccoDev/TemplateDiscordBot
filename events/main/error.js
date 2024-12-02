const { Events, EmbedBuilder } = require('discord.js');
const { logChannelID, embedColor } = require('../../src/discord-config');

module.exports = {
  name: Events.Error,
  once: false,
  async execute(error, client) {
    console.error('An error occurred:', error);

    // Handle interaction errors
    if (error.interaction) {
      try {
        if (error.interaction.replied || error.interaction.deferred) {
          await error.interaction.editReply({
            content: `There was an error while executing this command:\n\`\`\`${error.message}\`\`\``,
            ephemeral: true,
          });
        }
        else {
          await error.interaction.reply({
            content: `There was an error while executing this command:\n\`\`\`${error.message}\`\`\``,
            ephemeral: true,
          });
        }
      }
      catch (err) {
        console.error('Failed to send error reply to interaction:', err);
      }
    }

    // Log error to designated channel
    if (logChannelID) {
      try {
        const logChannel = await client.channels.fetch(logChannelID);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('An Error Occurred')
            .setDescription(`\`\`\`${error.stack || error.message}\`\`\``)
            .setTimestamp();

          await logChannel.send({ embeds: [embed] });
        }
      }
      catch (err) {
        console.error('Failed to log error to channel:', err);
      }
    }
  },
};


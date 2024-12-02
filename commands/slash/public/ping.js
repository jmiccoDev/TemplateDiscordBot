const { SlashCommandBuilder, Colors } = require('discord.js');
const { embedColor } = require('../../../src/discord-config.json');
const { handleError } = require('../../../utility/errorHandler');

module.exports = {
  global: true,
  cooldowns: 5,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot\'s ping and interaction response time.'),
  async execute(interaction, client) {
    try {
      if (!client || !client.ws) {
        console.error('Client or client.ws is undefined');
        await handleError(new Error('Client or client.ws is undefined'), interaction, 'ping');
      }
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
      const responseTime = sent.createdTimestamp - interaction.createdTimestamp;

      const embed = {
        color: Colors[embedColor],
        title: 'Pong!',
        fields: [
          { name: 'Bot ping', value: `${client.ws.ping}ms`, inline: true },
          { name: 'Response time', value: `${responseTime}ms`, inline: true },
        ],
        timestamp: new Date(),
      };
      await interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
      await handleError(error, interaction, 'ping');
    }
  },
};
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { embedColor } = require('../../../src/discord-config.json');
const { handleError } = require('../../../utility/errorHandler');

module.exports = {
  global: true,
  cooldowns: 5,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot\'s ping and interaction response time.'),
  async execute(interaction) {
    try {
      const client = interaction.client;

      if (!client || !client.ws) {
        console.error('Client or client.ws is undefined');
        throw new Error('Client or client.ws is undefined');
      }
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
      const responseTime = sent.createdTimestamp - interaction.createdTimestamp;

      // Creazione dell'embed
      const embed = new EmbedBuilder()
        .setColor(Colors[embedColor])
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'Bot ping', value: `${client.ws.ping}ms`, inline: true },
          { name: 'Response time', value: `${responseTime}ms`, inline: true },
        )
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    }
    catch (error) {
      console.error('Error executing the ping command:', error);
      await handleError(error, interaction, 'ping');
    }
  },
};
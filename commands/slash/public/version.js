const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { embedColor } = require('../../../src/discord-config.json');
const { version } = require('../../../package.json');

module.exports = {
  global: false,
  cooldowns: 5,
  data: new SlashCommandBuilder()
    .setName('version')
    .setDescription('Shows the bot\'s version number.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(Colors[embedColor])
      .setTitle('Bot Version')
      .setDescription(`The bot is running on version **${version}.**`);

    await interaction.reply({ embeds: [embed] });
  },
};
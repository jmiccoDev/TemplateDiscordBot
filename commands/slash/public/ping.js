const { SlashCommandBuilder, Colors } = require('discord.js');
const { embedColor } = require('../../../src/discord-config.json');

module.exports = {
    global: true,
    cooldowns: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s ping and interaction response time.'),
    async execute(interaction, client) {
        if (!client || !client.ws) {
            console.error('Client or client.ws is undefined');
            return;
        }
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const responseTime = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = {
            color: Colors[embedColor],
            title: 'Pong!',
            fields: [
                { name: 'Bot ping', value: `${botPing}ms`, inline: true },
                { name: 'Response time', value: `${responseTime}ms`, inline: true }
            ],
            timestamp: new Date(),
        };

        await interaction.editReply({ embeds: [embed] });
    },
};
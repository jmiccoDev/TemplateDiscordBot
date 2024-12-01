const { Events } = require('discord.js');
const { logChannelID, embedColor } = require('../../src/discord-config');

module.exports = {
    data: Events.Error,
    async execute(error, client) {
        console.error(error);

        if (logChannelID) {
            const logChannel = client.channels.cache.get(logChannelID);
            if (logChannel) {
                const embed = {
                    color: embedColor,
                    title: 'An Error Occurred',
                    description: `\`\`\`${error.message}\`\`\``,
                    timestamp: new Date(),
                };
                logChannel.send({ embeds: [embed] });
            }
        }

        if (error.interaction) {
            try {
                await error.interaction.reply({
                    content: `There was an error while executing this command:\n\`\`\`${error.message}\`\`\``,
                    ephemeral: true
                });
            } catch (err) {
                console.error('Failed to send error reply to interaction:', err);
            }
        }
    }
};
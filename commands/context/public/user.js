const {ContextMenuCommandBuilder, ApplicationCommandType} = require('discord.js');

module.exports = {
    global: true,
    data: new ContextMenuCommandBuilder()
        .setName('User Information')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const user = interaction.targetUser;

        await interaction.reply({
            content: `Username: ${user.username}\nID: ${user.id}`,
        });
    },
};




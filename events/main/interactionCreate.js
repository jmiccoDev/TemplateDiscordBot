const { Events, Collection } = require("discord.js");
const { handleError } = require("../../utility/errorHandler");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user, guild, channel } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      console.error(`No command matching ${commandName} was found.`);
      return;
    }

    if (!client.cooldowns.has(commandName)) {
      client.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(commandName);
    const cooldownAmount = (command.cooldown ?? 3) * 1000;

    if (timestamps.has(user.id)) {
      const expirationTime = timestamps.get(user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(user.id, now);
    setTimeout(() => timestamps.delete(user.id), cooldownAmount);

    try {
      console.log(`Executing command /${commandName}
User: ${user.tag}
Guild: ${guild?.name ?? 'DM'} (${guild?.id ?? 'N/A'})
Channel: ${channel.name} (${channel.id})`);

      await command.execute(interaction);
    }
    catch (error) {
      await handleError(error, interaction, commandName);
    }
  },
};


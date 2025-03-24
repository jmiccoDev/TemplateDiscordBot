const { Events, EmbedBuilder, userMention, channelMention } = require('discord.js');
const { channels } = require('../../src/discord-config.json');

// Color assignments for each interaction type
const INTERACTION_COLORS = {
  CHAT_INPUT_COMMAND: 0x3498db, // Blue
  BUTTON: 0x2ecc71,            // Green
  MODAL_SUBMIT: 0xe74c3c,      // Red
  SELECT_MENU: 0xf1c40f,       // Yellow
  CONTEXT_MENU: 0x9b59b6,      // Purple
  AUTOCOMPLETE: 0xe67e22,      // Orange
  DEFAULT: 0x95a5a6,            // Gray (for any unhandled types)
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    const logChannel = interaction.client.channels.cache.get(channels.logChannelID);

    if (!logChannel) {
      console.error('Log channel not found!');
      return;
    }

    const logEmbed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: "Interaction Log" })
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ size: 128 }),
      });

    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.CHAT_INPUT_COMMAND);
    }
    else if (interaction.isButton()) {
      await handleButtonInteraction(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.BUTTON);
    }
    else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.MODAL_SUBMIT);
    }
    else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.SELECT_MENU);
    }
    else if (interaction.isContextMenuCommand()) {
      await handleContextMenu(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.CONTEXT_MENU);
    }
    else if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction, logEmbed);
      logEmbed.setColor(INTERACTION_COLORS.AUTOCOMPLETE);
    }
    else {
      logEmbed.setColor(INTERACTION_COLORS.DEFAULT);
    }

    try {
      await logChannel.send({ embeds: [logEmbed] });
    }
    catch (error) {
      console.error('Failed to send log message:', error);
    }
  },
};

async function handleSlashCommand(interaction, logEmbed) {
  logEmbed
    .setTitle('Slash Command Executed')
    .addFields(
      { name: 'Command', value: `/${interaction.commandName}`, inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: channelMention(interaction.channelId), inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
    );

  const options = interaction.options.data
    .map(option => `**${option.name}**: ${option.value}`)
    .join('\n');

  if (options) {
    logEmbed.addFields({ name: 'Options', value: options });
  }
}

async function handleButtonInteraction(interaction, logEmbed) {
  logEmbed
    .setTitle('Button Pressed')
    .addFields(
      { name: 'Button ID', value: interaction.customId, inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: interaction.channel?.name ?? 'Unknown', inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
    );
}

async function handleModalSubmit(interaction, logEmbed) {
  logEmbed
    .setTitle('Modal Submitted')
    .addFields(
      { name: 'Modal ID', value: interaction.customId, inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: interaction.channel?.name ?? 'Unknown', inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
    );

  const fields = interaction.fields.fields.map(field =>
    `**${field.customId}**: ${field.value}`,
  ).join('\n');

  if (fields) {
    logEmbed.addFields({ name: 'Submitted Fields', value: fields });
  }
}

async function handleSelectMenu(interaction, logEmbed) {
  logEmbed
    .setTitle('Select Menu Interaction')
    .addFields(
      { name: 'Menu ID', value: interaction.customId, inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: interaction.channel?.name ?? 'Unknown', inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
      { name: 'Selected Values', value: interaction.values.join(', ') || 'None', inline: true },
    );
}

async function handleContextMenu(interaction, logEmbed) {
  logEmbed
    .setTitle('Context Menu Command Executed')
    .addFields(
      { name: 'Command', value: interaction.commandName, inline: true },
      { name: 'Type', value: interaction.commandType.toString(), inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: interaction.channel?.name ?? 'Unknown', inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
    );

  if (interaction.targetId) {
    logEmbed.addFields({ name: 'Target ID', value: interaction.targetId, inline: true });
  }
}

async function handleAutocomplete(interaction, logEmbed) {
  logEmbed
    .setTitle('Autocomplete Interaction')
    .addFields(
      { name: 'Command', value: interaction.commandName, inline: true },
      { name: 'User', value: userMention(interaction.user.id), inline: true },
      { name: 'User ID', value: interaction.user.id, inline: true },
      { name: 'Channel', value: interaction.channel?.name ?? 'Unknown', inline: true },
      { name: 'Channel ID', value: interaction.channelId, inline: true },
    );

  const focusedOption = interaction.options.getFocused(true);
  logEmbed.addFields(
    { name: 'Focused Option', value: focusedOption.name, inline: true },
    { name: 'Current Value', value: focusedOption.value || 'None', inline: true },
  );
}
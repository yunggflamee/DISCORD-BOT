const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  name: 'ping',
  description: 'Replies with Pong!',

  async execute(message, args, isSlash) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏓 Pong!')
      .setDescription('Bot is online.');

    if (isSlash) {
      await message.reply({ embeds: [embed] });
    } else {
      await message.channel.send({ embeds: [embed] });
    }
  }
};

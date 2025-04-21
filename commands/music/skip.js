const { SlashCommandBuilder } = require('@discordjs/builders');
const { player, queue } = require('./queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction) {
    const serverQueue = queue.get(interaction.guild.id);
    if (!serverQueue || !serverQueue.songs.length) {
      return interaction.reply('❌ No songs to skip!');
    }

    serverQueue.songs.shift();
    if (serverQueue.songs.length) {
      require('./play').playSong(interaction.guild.id);
      interaction.reply('⏭️ Skipped to the next song.');
    } else {
      player.stop();
      interaction.reply('🚫 No more songs. Queue cleared.');
    }
  },
};

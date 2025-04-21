const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { queue, player } = require('./queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a YouTube song')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube URL')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) return interaction.reply('Join a voice channel first.');

    const guildId = interaction.guild.id;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    if (!queue.has(guildId)) {
      queue.set(guildId, {
        connection,
        songs: [],
      });
    }

    const serverQueue = queue.get(guildId);
    serverQueue.songs.push(url);

    if (serverQueue.songs.length === 1) {
      playSong(guildId);
      interaction.reply(`🎶 Playing: ${url}`);
    } else {
      interaction.reply(`📦 Queued: ${url}`);
    }
  },
};

function playSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue || !serverQueue.songs.length) return;

  const url = serverQueue.songs[0];
  const stream = ytdl(url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);

  serverQueue.connection.subscribe(player);
  player.play(resource);

  player.once(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    playSong(guildId);
  });
}

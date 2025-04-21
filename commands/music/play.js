const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr'); // For searching YouTube by song title

module.exports = {
  name: 'play',
  description: 'Play a song from YouTube by title or URL',

  async execute(message, args, isSlash) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply('❌ You need to join a voice channel first!');
    }

    let songUrl = args.join(' '); // Get the song URL or title
    if (!songUrl) {
      return message.reply('❌ You need to provide a song title or URL!');
    }

    try {
      // Check if the song is a valid YouTube URL
      if (ytdl.validateURL(songUrl)) {
        // It's a valid YouTube URL, so play it directly
        this.playSongFromUrl(songUrl, voiceChannel, message, isSlash);
      } else {
        // Otherwise, search for the song by title
        this.searchAndPlay(songUrl, voiceChannel, message, isSlash);
      }
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error while trying to play the song!');
    }
  },

  async playSongFromUrl(songUrl, voiceChannel, message, isSlash) {
    const stream = ytdl(songUrl, { filter: 'audioonly' });
    const resource = createAudioResource(stream);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
      message.reply(`🎶 Now playing: ${songUrl}`);
    });

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  },

  async searchAndPlay(songTitle, voiceChannel, message, isSlash) {
    try {
      // Search YouTube for the song title
      const searchResults = await ytsr(songTitle, { limit: 1 });
      const firstResult = searchResults.items[0];
      
      if (!firstResult || firstResult.type !== 'video') {
        return message.reply('❌ No results found for that song.');
      }

      const songUrl = firstResult.url; // Get the URL of the first search result
      this.playSongFromUrl(songUrl, voiceChannel, message, isSlash);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error while trying to search for the song!');
    }
  }
};

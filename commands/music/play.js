const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: {
        name: 'play',
        description: 'Plays a song from YouTube',
    },

    async execute(message, args) {
        const songUrl = args[0];  // Assuming the URL or song title is passed as the first argument
        if (!songUrl) {
            return message.reply('You need to provide a song URL or search query!');
        }

        const channel = message.member.voice.channel;
        if (!channel) {
            return message.reply('You need to join a voice channel first!');
        }

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The bot has connected to the channel!');
        });

        // Create an audio player
        const player = createAudioPlayer();

        // Get the audio stream
        const stream = ytdl(songUrl, { filter: 'audioonly' });
        const resource = createAudioResource(stream);

        // Play the audio
        player.play(resource);
        connection.subscribe(player);

        // Handle playback finish
        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();  // Destroy the connection once the song finishes
            console.log('Playback finished, leaving the channel.');
        });

        player.on('error', (error) => {
            console.error('Error with the player:', error);
            connection.destroy();
            message.reply('An error occurred while playing the song.');
        });

        message.reply(`Now playing: **${songUrl}**`);
    }
};

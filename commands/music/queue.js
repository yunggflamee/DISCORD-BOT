const { createAudioPlayer } = require('@discordjs/voice');

const queue = new Map(); // guildId => { connection, songs: [] }
const player = createAudioPlayer();

module.exports = { queue, player };

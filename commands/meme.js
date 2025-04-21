const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme!'),

  async execute(messageOrInteraction, args, isSlash) {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const data = await response.json();

    const memes = data.data.memes;
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];

    const memeUrl = randomMeme.url;
    const memeName = randomMeme.name;

    return isSlash
      ? messageOrInteraction.reply({ content: `Here's a meme: ${memeName}`, files: [memeUrl] })
      : messageOrInteraction.channel.send({ content: `Here's a meme: ${memeName}`, files: [memeUrl] });
  },
};

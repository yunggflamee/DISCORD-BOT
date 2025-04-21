const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke!'),

  async execute(messageOrInteraction, args, isSlash) {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();

    const joke = `${data.setup} \n\n ${data.punchline}`;

    return isSlash
      ? messageOrInteraction.reply(joke)
      : messageOrInteraction.channel.send(joke);
  },
};

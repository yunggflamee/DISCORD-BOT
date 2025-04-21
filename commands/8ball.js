const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the Magic 8-Ball a question!')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('The question you want to ask')
        .setRequired(true)),

  async execute(messageOrInteraction, args, isSlash) {
    const answers = [
      'Yes',
      'No',
      'Maybe',
      'Definitely',
      'I am not sure',
      'Ask again later',
      'Most likely',
      'Outlook is good',
      'Don’t count on it',
      'Absolutely not'
    ];

    const question = isSlash ? messageOrInteraction.options.getString('question') : args.join(' ');
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

    const replyMessage = `🎱 8-Ball says: *"${randomAnswer}"*`;

    return isSlash
      ? messageOrInteraction.reply(replyMessage)
      : messageOrInteraction.channel.send(replyMessage);
  },
};

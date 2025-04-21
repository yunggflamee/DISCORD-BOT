const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all commands with descriptions'),

  name: 'help',
  description: 'List all commands with descriptions',

  async execute(messageOrInteraction, args, isSlash) {
    const requester = isSlash ? messageOrInteraction.user : messageOrInteraction.author;

    const embed = {
      color: 0x00ffcc,
      title: '🤖 Help Menu',
      description: 'Here’s a list of available commands grouped by category:',
      fields: [
        {
          name: '🛡️ Moderation',
          value: '`kick`, `ban`, `userinfo`, `avatar`',
        },
        {
          name: '🎵 Music',
          value: '`play`, `stop`, `skip`, `pause`, `resume`, `queue`, `np`',
        },
        {
          name: 'ℹ️ Info',
          value: '`help`, `ping`, `serverinfo`, `botinfo`',
        },
        {
          name: '🎉 Fun',
          value: '`joke`, `meme`, `8ball` *(if you add these)*',
        },
        {
          name: '⚙️ Usage',
          value: 'Use commands with prefix `!` or as slash commands. Example: `/kick @user` or `!kick @user`.',
        }
      ],
      footer: {
        text: `Requested by ${requester.username}`,
        icon_url: requester.displayAvatarURL({ dynamic: true })
      },
      timestamp: new Date()
    };

    return isSlash
      ? messageOrInteraction.reply({ embeds: [embed] })
      : messageOrInteraction.channel.send({ embeds: [embed] });
  }
};

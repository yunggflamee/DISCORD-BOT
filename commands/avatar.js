const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Shows the user's avatar")
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Select a user')
        .setRequired(false)
    ),

  name: 'avatar',
  description: "Shows a user's avatar",
  aliases: ['pfp'],

  async execute(messageOrInteraction, args, isSlash) {
    let user;

    try {
      const requester = isSlash ? messageOrInteraction.user : messageOrInteraction.author;

      if (isSlash) {
        user = messageOrInteraction.options.getUser('target') || requester;
      } else {
        const mention = messageOrInteraction.mentions.users.first();
        const id = args[0];

        if (mention) {
          user = mention;
        } else if (id) {
          user = await messageOrInteraction.client.users.fetch(id).catch(() => null);
        }

        if (!user) user = requester;
      }

      if (!user) {
        const reply = { content: '❌ User not found!', ephemeral: isSlash };
        return isSlash
          ? messageOrInteraction.reply(reply)
          : messageOrInteraction.channel.send(reply.content);
      }

      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const requesterAvatar = requester.displayAvatarURL({ dynamic: true, size: 64 });

      const embed = {
        color: 0xa0000,
        title: `${user.username}'s Avatar`,
        image: { url: avatarURL },
        footer: {
          text: `Requested by ${requester.username}`,
          icon_url: requesterAvatar
        }
      };

      return isSlash
        ? messageOrInteraction.reply({ embeds: [embed] })
        : messageOrInteraction.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      const reply = { content: '❌ There was an error fetching the avatar.', ephemeral: isSlash };
      return isSlash
        ? messageOrInteraction.reply(reply)
        : messageOrInteraction.channel.send(reply.content);
    }
  }
};

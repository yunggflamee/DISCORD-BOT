const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for banning the user')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  name: 'ban',
  description: 'Bans a user from the server.',

  async execute(messageOrInteraction, args, isSlash) {
    const guild = isSlash ? messageOrInteraction.guild : messageOrInteraction.guild;
    const member = isSlash ? messageOrInteraction.member : messageOrInteraction.member;
    const targetUser = isSlash
      ? messageOrInteraction.options.getUser('user')
      : messageOrInteraction.mentions.users.first() || await messageOrInteraction.client.users.fetch(args[0]).catch(() => null);

    const reason = isSlash
      ? messageOrInteraction.options.getString('reason') || 'No reason provided'
      : args.slice(1).join(' ') || 'No reason provided';

    const requester = isSlash ? messageOrInteraction.user : messageOrInteraction.author;

    if (!targetUser) {
      const replyText = '❌ Please mention a valid user or provide a valid user ID.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      const replyText = '❌ User not found in the server.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const replyText = '❌ You do not have permission to ban members.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      const replyText = '❌ I do not have permission to ban members.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    if (targetMember.roles.highest.position >= member.roles.highest.position && member.id !== guild.ownerId) {
      const replyText = '❌ You cannot ban a user with a higher or equal role.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    if (targetMember.roles.highest.position >= guild.members.me.roles.highest.position) {
      const replyText = '❌ I cannot ban this user because their role is higher than mine.';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }

    try {
      await targetMember.ban({ reason });

      const banEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🔨 User Banned')
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})` },
          { name: 'Moderator', value: `${requester.tag}` },
          { name: 'Reason', value: reason }
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Requested by ${requester.username}`, iconURL: requester.displayAvatarURL({ dynamic: true }) });

      return isSlash
        ? messageOrInteraction.reply({ embeds: [banEmbed] })
        : messageOrInteraction.reply({ embeds: [banEmbed] });

    } catch (error) {
      console.error('Error banning:', error);
      const replyText = '❌ Failed to ban the user. Do I have the right permissions?';
      return isSlash
        ? messageOrInteraction.reply({ content: replyText, ephemeral: true })
        : messageOrInteraction.reply(replyText);
    }
  }
};

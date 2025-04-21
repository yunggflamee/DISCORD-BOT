const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server.',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interactionOrMessage, args) {
    const isSlash = interactionOrMessage.commandName !== undefined;

    // Get member who sent the command
    const authorMember = isSlash
      ? interactionOrMessage.member
      : interactionOrMessage.guild.members.cache.get(interactionOrMessage.author.id);

    // Check for permissions
    if (!authorMember.permissions.has(PermissionFlagsBits.KickMembers)) {
      const reply = '🚫 You don’t have permission to kick members.';
      return isSlash
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    let targetUser, reason;
    if (isSlash) {
      targetUser = interactionOrMessage.options.getUser('user');
      reason = interactionOrMessage.options.getString('reason') || 'No reason provided.';
    } else {
      targetUser = interactionOrMessage.mentions.users.first();
      reason = args.slice(1).join(' ') || 'No reason provided.';
    }

    if (!targetUser) {
      const reply = '❗ Please mention a valid user to kick.';
      return isSlash
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    const targetMember = interactionOrMessage.guild.members.cache.get(targetUser.id);
    if (!targetMember) {
      const reply = '⚠️ That user is not in this server.';
      return isSlash
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    // Check if the target member has a higher role than the bot
    if (targetMember.roles.highest.position >= authorMember.guild.members.me.roles.highest.position) {
      const reply = '🔒 I cannot kick this member. They have a higher or equal role than I do.';
      return isSlash
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    try {
      await targetMember.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle('👢 Member Kicked')
        .setColor('#FF5555')
        .addFields(
          { name: '👤 User', value: `${targetUser.tag}`, inline: true },
          { name: '🧑‍⚖️ Moderator', value: `${authorMember.user.tag}`, inline: true },
          { name: '📄 Reason', value: reason }
        )
        .setFooter({ text: `User ID: ${targetUser.id}` })
        .setTimestamp();

      return isSlash
        ? interactionOrMessage.reply({ embeds: [embed] })
        : interactionOrMessage.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      const errorMsg = '❌ Something went wrong while trying to kick the user.';
      return isSlash
        ? interactionOrMessage.reply({ content: errorMsg, ephemeral: true })
        : interactionOrMessage.reply(errorMsg);
    }
  }
};

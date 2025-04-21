const { SlashCommandBuilder, EmbedBuilder, UserFlags, PresenceUpdateStatus } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Displays detailed info about a user',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Mention, ID, or username')
        .setRequired(false)
    ),

  async execute(ctx, args, isSlash) {
    const input = isSlash ? ctx.options.getString('user') : args.join(' ');
    const client = ctx.client;
    const guild = ctx.guild;

    let user;
    try {
      if (!input) {
        user = isSlash ? ctx.user : ctx.author;
      } else {
        const idMatch = input.match(/^<@!?(\d+)>$/) || input.match(/^(\d{17,})$/);
        if (idMatch) {
          user = await client.users.fetch(idMatch[1]);
        } else {
          const found = guild.members.cache.find(m =>
            m.user.username.toLowerCase() === input.toLowerCase()
          );
          if (found) user = found.user;
        }
      }
    } catch (err) {
      return ctx.reply({ content: '❌ Could not find that user.', ephemeral: true });
    }

    if (!user) return ctx.reply({ content: '❌ User not found.', ephemeral: true });

    const member = guild.members.cache.get(user.id);
    const presence = member?.presence;
    const banner = await user.fetch().then(u => u.bannerURL({ dynamic: true, size: 1024 })).catch(() => null);

    // Flags (badges)
    const flags = (await user.fetchFlags()).toArray().map(f => `• ${f.replace(/_/g, ' ')}`).join('\n') || 'None';

    // Device status
    const clientStatus = presence?.clientStatus || {};
    const devices = Object.keys(clientStatus).map(d => `• ${d}`).join('\n') || 'Offline';

    const embed = new EmbedBuilder()
      .setColor(user.accentColor || 0x00AEFF)
      .setTitle(`${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(`**Tag:** \`${user.tag}\`\n**ID:** \`${user.id}\``)
      .addFields(
        { name: '👤 Username', value: user.username, inline: true },
        { name: '#️⃣ Discriminator', value: `#${user.discriminator}`, inline: true },
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '📆 Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '💠 Account Badges', value: flags, inline: true },
        { name: '🎨 Accent Color', value: user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : 'None', inline: true },
      );

    if (member) {
      embed.addFields(
        { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: '📛 Highest Role', value: member.roles.highest.toString(), inline: true },
        { name: '📌 Boosting Since', value: member.premiumSince ? `<t:${Math.floor(member.premiumSince / 1000)}:R>` : 'Not Boosting', inline: true },
        { name: '🧷 Roles', value: member.roles.cache.filter(r => r.id !== guild.id).map(r => r.toString()).join(' ') || 'None', inline: false }
      );
    }

    if (presence) {
      const custom = presence.activities.find(a => a.type === 4); // Custom status
      embed.addFields(
        { name: '🟢 Status', value: presence.status.toUpperCase(), inline: true },
        { name: '📱 Active On', value: devices, inline: true },
        { name: '💬 Custom Status', value: custom?.state || 'None', inline: true }
      );
    }

    if (banner) {
      embed.setImage(banner);
    }

    embed.setFooter({ text: `Requested by ${isSlash ? ctx.user.tag : ctx.author.tag}` });
    embed.setTimestamp();

    return ctx.reply({ embeds: [embed] });
  }
};

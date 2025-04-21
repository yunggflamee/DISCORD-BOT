// deploy.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const { token, clientId, guildId } = require('./config.json');

async function deployCommands() {
  const commands = [];
  for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
    const cmd = require(`./commands/${file}`);
    if (cmd.data) commands.push(cmd.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(token);
  console.log('🔄 Deploying slash commands…');
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
  console.log('✅ Slash commands deployed!');
}

if (require.main === module) {
  // Allows `node deploy.js` to still work standalone
  deployCommands().catch(console.error);
}

module.exports = deployCommands;

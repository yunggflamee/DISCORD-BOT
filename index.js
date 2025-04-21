const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const prefix = process.env.PREFIX || '+';  // Default to '!' if no PREFIX environment variable is set
const token = process.env.DISCORD_TOKEN;   // Get the bot token from the environment

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

// Load all commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: '/help | Axis Bot', type: 0 }],
    status: 'online',
  });

  console.log('🤖 Bot status set!');
});


// Handle prefix commands
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  const command = client.commands.get(cmdName);
  if (command) {
    try {
      await command.execute(message, args, false);
    } catch (err) {
      console.error(err);
      message.reply('There was an error executing this command!');
    }
  }
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction, [], true);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'There was an error!', ephemeral: true });
    }
  }
});

require('dotenv').config();
client.login(process.env.TOKEN);

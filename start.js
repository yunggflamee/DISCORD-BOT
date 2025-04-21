// start.js
const deployCommands = require('./deploy.js');

// First deploy slash commands, then start the bot
(async () => {
  try {
    await deployCommands();
    require('./index.js');    // assumes your index.js immediately logs in & starts the bot
  } catch (err) {
    console.error('Failed to deploy or start bot:', err);
  }
})();

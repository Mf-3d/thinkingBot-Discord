const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS], partials: ['CHANNEL'] });

client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);
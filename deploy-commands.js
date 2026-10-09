require('./src/config');
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { commandData } = require('./src/commands');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) { console.error('Missing DISCORD_TOKEN or CLIENT_ID in config.json (or .env).'); process.exit(1); }
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
(async () => {
  const route = GUILD_ID ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body: commandData.map(c => c.toJSON()) });
  console.log('Registered ' + commandData.length + ' commands.');
})().catch(err => { console.error(err); process.exit(1); });

require('dotenv').config();
require('./config');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { handle } = require('./commands');
if (!process.env.DISCORD_TOKEN) { console.error('Missing DISCORD_TOKEN. Fill config.json or copy .env.example to .env.'); process.exit(1); }
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.once(Events.ClientReady, ready => {
  console.log('Nebula online as ' + ready.user.tag + ' in ' + ready.guilds.cache.size + ' server(s).');
  ready.user.setActivity('/help | AI • Music • Tools').catch(() => {});
});
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton() && ['poll_yes', 'poll_no'].includes(interaction.customId))
    return interaction.reply({ content: interaction.customId === 'poll_yes' ? '👍 Vote recorded: Yes' : '👎 Vote recorded: No', ephemeral: true });
  try { await handle(interaction); }
  catch (e) {
    console.error('[interaction]', e);
    try {
      if (interaction.deferred || interaction.replied) await interaction.followUp({ content: 'Something went wrong. Check bot logs/configuration.', ephemeral: true });
      else await interaction.reply({ content: 'Something went wrong. Check bot logs/configuration.', ephemeral: true });
    } catch {}
  }
});
client.on(Events.Error, e => console.error('[discord client]', e));
process.on('unhandledRejection', e => console.error('[unhandled rejection]', e));
client.login(process.env.DISCORD_TOKEN);

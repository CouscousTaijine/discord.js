const { EmbedBuilder } = require('discord.js');
const sessions = new Map();
const title = s => String(s || 'Unknown track').slice(0, 180);
function musicDeps() {
  try {
    return {
      voice: require('@discordjs/voice'),
      play: require('play-dl')
    };
  } catch {
    throw new Error('Music module not installed. Run node setup/install.js and choose option 2 or 3, then install FFmpeg.');
  }
}
async function resolveTrack(q) {
  const { play } = musicDeps();
  if (/^https?:\/\//i.test(q)) {
    const info = await play.video_basic_info(q).catch(() => null);
    if (info?.video_details) return { title: title(info.video_details.title), url: info.video_details.url || q };
    if (/\.(mp3|m4a|ogg|opus|wav|flac)(\?|$)/i.test(q)) return { title: title(q), url: q };
    throw new Error('Could not read URL. Try a YouTube video or direct audio link.');
  }
  const results = await play.search(q, { limit: 1, source: { youtube: 'video' } });
  if (!results.length) throw new Error('No tracks found.');
  return { title: title(results[0].title), url: results[0].url };
}
async function next(gid) {
  const s = sessions.get(gid);
  if (!s) return;
  const { voice, play } = musicDeps();
  const track = s.queue.shift();
  if (!track) { s.player.stop(true); return; }
  try {
    const stream = await play.stream(track.url);
    s.player.play(voice.createAudioResource(stream.stream, { inputType: stream.type, metadata: track }));
    s.text?.send('▶️ Now playing: **' + track.title + '**').catch(() => {});
  } catch (e) {
    s.text?.send('⚠️ Could not play track: ' + e.message.slice(0, 250)).catch(() => {});
    return next(gid);
  }
}
async function handle(i, action) {
  if (!i.guild) return i.reply({ content: 'Music commands need a server.', ephemeral: true });
  let s = sessions.get(i.guildId);
  if (action === 'play') {
    const { voice } = musicDeps();
    const channel = i.member.voice?.channel;
    if (!channel) return i.reply({ content: 'Join a voice channel first.', ephemeral: true });
    await i.deferReply();
    try {
      const track = await resolveTrack(i.options.getString('query'));
      if (!s) {
        const connection = voice.joinVoiceChannel({ channelId: channel.id, guildId: i.guildId, adapterCreator: i.guild.voiceAdapterCreator, selfDeaf: true });
        await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 20000);
        const player = voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Pause } });
        connection.subscribe(player);
        s = { connection, player, queue: [], text: i.channel, busy: false };
        sessions.set(i.guildId, s);
        player.on(voice.AudioPlayerStatus.Idle, () => {
          if (!s.busy) { s.busy = true; next(i.guildId).finally(() => { s.busy = false; }); }
        });
        player.on('error', e => s.text?.send('⚠️ Audio error: ' + e.message.slice(0, 200)).catch(() => {}));
        connection.on(voice.VoiceConnectionStatus.Disconnected, () => { connection.destroy(); sessions.delete(i.guildId); });
      }
      s.text = i.channel;
      s.queue.push(track);
      await i.editReply('➕ Added **' + track.title + '** to queue (position ' + s.queue.length + ').');
      const { voice: v } = musicDeps();
      if (s.player.state.status === v.AudioPlayerStatus.Idle && !s.busy) {
        s.busy = true; next(i.guildId).finally(() => { s.busy = false; });
      }
    } catch (e) { await i.editReply('⚠️ Music error: ' + e.message.slice(0, 900)); }
    return;
  }
  if (!s && action !== 'leave') return i.reply({ content: 'Nothing is playing here.', ephemeral: true });
  if (action === 'skip') { s.player.stop(true); return i.reply('⏭️ Skipping track.'); }
  if (action === 'stop') { s.queue.length = 0; s.player.stop(true); return i.reply('⏹️ Playback stopped and queue cleared.'); }
  if (action === 'pause') return i.reply(s.player.pause() ? '⏸️ Paused.' : 'Could not pause.');
  if (action === 'resume') return i.reply(s.player.unpause() ? '▶️ Resumed.' : 'Could not resume.');
  if (action === 'queue') {
    const current = s.player.state.resource?.metadata?.title;
    const list = s.queue.slice(0, 15).map((t, j) => (j + 1) + '. ' + t.title).join('\n');
    return i.reply({ embeds: [new EmbedBuilder().setColor(0x7967ff).setTitle('🎵 Music queue').setDescription((current ? '**Now:** ' + current + '\n\n' : '') + (list || 'Queue is empty.'))] });
  }
  if (action === 'leave') {
    if (s) { s.queue.length = 0; s.player.stop(true); s.connection.destroy(); sessions.delete(i.guildId); }
    return i.reply('👋 Disconnected from voice.');
  }
}
module.exports = { handle };
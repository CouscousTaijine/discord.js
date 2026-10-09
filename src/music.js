const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, NoSubscriberBehavior } = require('@discordjs/voice');
const play = require('play-dl');
const sessions = new Map();
const title = s => String(s||'Unknown track').slice(0,180);
async function resolveTrack(q) {
 if(/^https?:\/\//i.test(q)) {
  const info=await play.video_basic_info(q).catch(()=>null);
  if(info?.video_details)return {title:title(info.video_details.title),url:info.video_details.url||q};
  if(/\.(mp3|m4a|ogg|opus|wav|flac)(\?|$)/i.test(q))return {title:title(q),url:q};
  throw new Error('Could not read URL. Try a YouTube video or direct audio link.');
 }
 const a=await play.search(q,{limit:1,source:{youtube:'video'}});
 if(!a.length)throw new Error('No tracks found.');
 return {title:title(a[0].title),url:a[0].url};
}
async function next(gid) {
 const s=sessions.get(gid);if(!s)return;
 const t=s.queue.shift();if(!t){s.player.stop(true);return;}
 try {const stream=await play.stream(t.url);s.player.play(createAudioResource(stream.stream,{inputType:stream.type,metadata:t}));s.text?.send('▶️ Now playing: **'+t.title+'**').catch(()=>{});}
 catch(e){s.text?.send('⚠️ Could not play track: '+e.message.slice(0,250)).catch(()=>{});return next(gid);}
}
async function handle(i,n) {
 if(!i.guild)return i.reply({content:'Music commands need a server.',ephemeral:true});
 let s=sessions.get(i.guildId);
 if(n==='play') {
  const vc=i.member.voice?.channel;if(!vc)return i.reply({content:'Join a voice channel first.',ephemeral:true});
  await i.deferReply();
  try {
   const t=await resolveTrack(i.options.getString('query'));
   if(!s){
    const connection=joinVoiceChannel({channelId:vc.id,guildId:i.guildId,adapterCreator:i.guild.voiceAdapterCreator,selfDeaf:true});
    await entersState(connection,VoiceConnectionStatus.Ready,20000);
    const player=createAudioPlayer({behaviors:{noSubscriber:NoSubscriberBehavior.Pause}});connection.subscribe(player);
    s={connection,player,queue:[],text:i.channel,busy:false};sessions.set(i.guildId,s);
    player.on(AudioPlayerStatus.Idle,()=>{if(!s.busy){s.busy=true;next(i.guildId).finally(()=>{s.busy=false;});}});
    player.on('error',e=>s.text?.send('⚠️ Audio error: '+e.message.slice(0,200)).catch(()=>{}));
    connection.on(VoiceConnectionStatus.Disconnected,()=>{connection.destroy();sessions.delete(i.guildId);});
   }
   s.text=i.channel;s.queue.push(t);await i.editReply('➕ Added **'+t.title+'** to queue (position '+s.queue.length+').');
   if(s.player.state.status===AudioPlayerStatus.Idle&&!s.busy){s.busy=true;next(i.guildId).finally(()=>{s.busy=false;});}
  }catch(e){await i.editReply('⚠️ Music error: '+e.message.slice(0,900));}return;
 }
 if(!s&&n!=='leave')return i.reply({content:'Nothing is playing here.',ephemeral:true});
 if(n==='skip'){s.player.stop(true);return i.reply('⏭️ Skipping track.');}
 if(n==='stop'){s.queue.length=0;s.player.stop(true);return i.reply('⏹️ Playback stopped and queue cleared.');}
 if(n==='pause')return i.reply(s.player.pause()?'⏸️ Paused.':'Could not pause.');
 if(n==='resume')return i.reply(s.player.unpause()?'▶️ Resumed.':'Could not resume.');
 if(n==='queue'){const cur=s.player.state.resource?.metadata?.title;const list=s.queue.slice(0,15).map((t,j)=>(j+1)+'. '+t.title).join('\n');return i.reply({embeds:[new EmbedBuilder().setColor(0x7967ff).setTitle('🎵 Music queue').setDescription((cur?'**Now:** '+cur+'\n\n':'')+(list||'Queue is empty.'))]});}
 if(n==='leave'){if(s){s.queue.length=0;s.player.stop(true);s.connection.destroy();sessions.delete(i.guildId);}return i.reply('👋 Disconnected from voice.');}
}
module.exports={handle};
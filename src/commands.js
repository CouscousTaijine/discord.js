const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { askAI, makeImage } = require('./ai');
const music = require('./music');
const commandData = [
 new SlashCommandBuilder().setName('help').setDescription('Show all features'),
 new SlashCommandBuilder().setName('ping').setDescription('Check latency'),
 new SlashCommandBuilder().setName('server').setDescription('Show server info'),
 new SlashCommandBuilder().setName('userinfo').setDescription('Show a member').addUserOption(o=>o.setName('user').setDescription('Member')),
 new SlashCommandBuilder().setName('avatar').setDescription('Show an avatar').addUserOption(o=>o.setName('user').setDescription('Member')),
 new SlashCommandBuilder().setName('ask').setDescription('Ask the configured AI').addStringOption(o=>o.setName('prompt').setDescription('Question').setRequired(true).setMaxLength(1800)),
 new SlashCommandBuilder().setName('image').setDescription('Generate an image').addStringOption(o=>o.setName('prompt').setDescription('Image prompt').setRequired(true).setMaxLength(500)),
 new SlashCommandBuilder().setName('poll').setDescription('Create a yes/no poll').addStringOption(o=>o.setName('question').setDescription('Question').setRequired(true).setMaxLength(240)),
 new SlashCommandBuilder().setName('roll').setDescription('Roll a die').addIntegerOption(o=>o.setName('sides').setDescription('Sides 2-1000').setMinValue(2).setMaxValue(1000)),
 new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
 new SlashCommandBuilder().setName('remind').setDescription('Set a reminder in minutes').addIntegerOption(o=>o.setName('minutes').setDescription('1-10080 minutes').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption(o=>o.setName('message').setDescription('Reminder').setRequired(true).setMaxLength(500)),
 new SlashCommandBuilder().setName('clear').setDescription('Delete recent messages').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o=>o.setName('amount').setDescription('1-100 messages').setRequired(true).setMinValue(1).setMaxValue(100)),
 new SlashCommandBuilder().setName('kick').setDescription('Kick a member').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o=>o.setName('user').setDescription('Member').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason')),
 new SlashCommandBuilder().setName('ban').setDescription('Ban a member').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o=>o.setName('user').setDescription('Member').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason')),
 new SlashCommandBuilder().setName('play').setDescription('Play YouTube or audio URL/search').addStringOption(o=>o.setName('query').setDescription('URL or search').setRequired(true).setMaxLength(500)),
 ...['skip','stop','pause','resume','queue','leave'].map(n=>new SlashCommandBuilder().setName(n).setDescription(({skip:'Skip current track',stop:'Stop and clear queue',pause:'Pause music',resume:'Resume music',queue:'Show music queue',leave:'Disconnect from voice'})[n]))
];
const histories = new Map();
async function handle(i) {
 if (!i.isChatInputCommand()) return;
 const n=i.commandName;
 if(n==='help') return i.reply({ephemeral:true,embeds:[new EmbedBuilder().setColor(0x7967ff).setTitle('🌌 Nebula').setDescription('AI: /ask, /image\nMusic: /play /queue /skip /pause /resume /stop /leave\nModeration: /clear /kick /ban\nTools: /ping /server /userinfo /avatar /poll /roll /coinflip /remind')]});
 if(n==='ping') return i.reply('🏓 Pong! Gateway: '+Math.round(i.client.ws.ping)+' ms.');
 if(n==='server') return i.reply({embeds:[new EmbedBuilder().setColor(0x7967ff).setTitle(i.guild.name).setThumbnail(i.guild.iconURL()).addFields({name:'Members',value:String(i.guild.memberCount),inline:true},{name:'Owner',value:'<@'+i.guild.ownerId+'>',inline:true},{name:'Created',value:'<t:'+Math.floor(i.guild.createdTimestamp/1000)+':D>',inline:true})]});
 if(n==='userinfo'||n==='avatar') {
  const u=i.options.getUser('user')||i.user;
  if(n==='avatar') return i.reply({embeds:[new EmbedBuilder().setTitle(u.username+' avatar').setImage(u.displayAvatarURL({size:1024})).setColor(0x7967ff)]});
  const m=await i.guild.members.fetch(u.id).catch(()=>null);
  return i.reply({embeds:[new EmbedBuilder().setTitle(u.tag).setThumbnail(u.displayAvatarURL()).setColor(0x7967ff).addFields({name:'ID',value:u.id,inline:true},{name:'Account created',value:'<t:'+Math.floor(u.createdTimestamp/1000)+':R>',inline:true},{name:'Joined',value:m?'<t:'+Math.floor(m.joinedTimestamp/1000)+':R>':'Unknown',inline:true})]});
 }
 if(n==='ask') {
  await i.deferReply(); const key=i.guildId+':'+i.user.id; const h=histories.get(key)||[];
  try { const a=await askAI(i.options.getString('prompt'),h); h.push({role:'user',content:i.options.getString('prompt')},{role:'assistant',content:a}); histories.set(key,h.slice(-8)); return i.editReply(a.slice(0,1900)); }
  catch(e){return i.editReply('⚠️ '+e.message.slice(0,1500));}
 }
 if(n==='image') {
  await i.deferReply();
  try { const url=await makeImage(i.options.getString('prompt')); return i.editReply({content:'🎨 '+i.options.getString('prompt').slice(0,700),files:[{attachment:url,name:'nebula-image.png'}]}); }
  catch(e){return i.editReply('⚠️ Image generation failed: '+e.message.slice(0,1000));}
 }
 if(n==='poll') {
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('poll_yes').setLabel('👍 Yes').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId('poll_no').setLabel('👎 No').setStyle(ButtonStyle.Danger));
  return i.reply({embeds:[new EmbedBuilder().setColor(0x7967ff).setTitle('📊 '+i.options.getString('question')).setDescription('Vote below!')],components:[row]});
 }
 if(n==='roll'){const s=i.options.getInteger('sides')||6;return i.reply('🎲 You rolled **'+(Math.floor(Math.random()*s)+1)+'** (d'+s+').');}
 if(n==='coinflip') return i.reply(Math.random()<.5?'🪙 Heads!':'🪙 Tails!');
 if(n==='remind'){
  const mins=i.options.getInteger('minutes'), msg=i.options.getString('message'); await i.reply('⏰ Reminder set for '+mins+' minute(s).');
  setTimeout(()=>i.user.send('⏰ Reminder: '+msg).catch(()=>{}),mins*60000); return;
 }
 if(n==='clear'){
  if(!i.memberPermissions?.has(PermissionFlagsBits.ManageMessages))return i.reply({content:'You need Manage Messages.',ephemeral:true});
  const d=await i.channel.bulkDelete(i.options.getInteger('amount'),true);return i.reply({content:'🧹 Deleted '+d.size+' messages.',ephemeral:true});
 }
 if(n==='kick'||n==='ban'){
  const u=i.options.getUser('user'), reason=i.options.getString('reason')||'No reason provided', m=await i.guild.members.fetch(u.id).catch(()=>null);
  if(!m)return i.reply({content:'Member not found.',ephemeral:true});
  if(m.id===i.user.id)return i.reply({content:'You cannot moderate yourself.',ephemeral:true});
  if(n==='kick'&&!m.kickable)return i.reply({content:'I cannot kick this member; check role hierarchy.',ephemeral:true});
  if(n==='ban'&&!m.bannable)return i.reply({content:'I cannot ban this member; check role hierarchy.',ephemeral:true});
  await (n==='kick'?m.kick(reason):m.ban({reason}));return i.reply('✅ '+u.tag+' was '+n+'ed. Reason: '+reason);
 }
 if(['play','skip','stop','pause','resume','queue','leave'].includes(n)) return music.handle(i,n);
}
module.exports={commandData,handle};
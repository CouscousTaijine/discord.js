const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const root = path.resolve(__dirname, '..');
const rl = readline.createInterface({ input, output });
const ask = async (q, fallback = '') => {
  const a = (await rl.question(q)).trim();
  return a || fallback;
};
function run(command, args, opts = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32', ...opts });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command + ' exited with code ' + result.status);
}
async function main() {
  console.log('\n🌌 NEBULA — installation personnalisée\n');
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) throw new Error('Node.js 20 ou plus récent est requis. Installe-le depuis https://nodejs.org/');
  console.log('Choisis les modules à installer :');
  console.log('  1) Base Discord (obligatoire)');
  console.log('  2) Base + musique en vocal (ajoute les dépendances audio)');
  console.log('  3) Tout installer (base + musique ; IA locale et images configurables ensuite)');
  console.log('  4) Base seulement, sans musique');
  const choice = await ask('Ton choix [1-4, défaut 3] : ', '3');
  if (!['1','2','3','4'].includes(choice)) throw new Error('Choix invalide.');
  const wantsMusic = choice === '2' || choice === '3';
  const packages = ['discord.js', 'dotenv'];
  if (wantsMusic) packages.push('@discordjs/voice', 'play-dl');
  console.log('\nInstallation npm : ' + packages.join(', '));
  run('npm', ['install', '--save', ...packages]);

  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) {
    const example = path.join(root, '.env.example');
    if (fs.existsSync(example)) fs.copyFileSync(example, envPath);
    else fs.writeFileSync(envPath, 'DISCORD_TOKEN=\nCLIENT_ID=\nGUILD_ID=\n');
    console.log('Fichier .env créé.');
  } else console.log('Fichier .env déjà présent, conservé.');

  const configure = (await ask('Configurer le token Discord maintenant ? [o/N] : ', 'n')).toLowerCase();
  if (configure === 'o' || configure === 'oui' || configure === 'y' || configure === 'yes') {
    let env = fs.readFileSync(envPath, 'utf8');
    const token = await ask('Token du bot (la saisie est visible) : ');
    const clientId = await ask('Application / Client ID : ');
    const guildId = await ask('ID du serveur de test (optionnel, Entrée pour ignorer) : ');
    const set = (key, value) => {
      if (!value) return;
      const line = new RegExp('^' + key + '=.*$', 'm');
      if (line.test(env)) env = env.replace(line, key + '=' + value);
      else env += '\n' + key + '=' + value + '\n';
    };
    set('DISCORD_TOKEN', token); set('CLIENT_ID', clientId); set('GUILD_ID', guildId);
    fs.writeFileSync(envPath, env);
    console.log('Configuration enregistrée localement. Ne partage jamais ton .env.');
  }

  console.log('\nDépendances système :');
  console.log('- Musique : FFmpeg est nécessaire et doit être ajouté au PATH.');
  console.log('- IA gratuite locale : installe Ollama depuis https://ollama.com/ puis lance : ollama pull qwen2.5:3b');
  console.log('- Images : service communautaire configuré par défaut ; il peut être limité ou indisponible.');
  console.log('\nInstallation terminée. Commandes utiles :');
  console.log('  npm run check   — vérifie la syntaxe JavaScript');
  console.log('  npm run deploy  — publie les commandes slash Discord');
  console.log('  npm start       — démarre le bot');
  if (!wantsMusic) console.log('La musique a été ignorée. Relance ce programme et choisis 2 ou 3 pour l’ajouter.');
}
main().catch(e => { console.error('\n❌ ' + e.message); process.exitCode = 1; }).finally(() => rl.close());
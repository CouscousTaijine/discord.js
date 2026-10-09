# NEBULA — Discord bot 🌌

A modular Discord.js bot with local-first text AI, image generation, music playback, moderation, utilities and fun commands.

## Fast setup

**Windows:** double-click `setup/install.bat`.  
**Linux/macOS:** run `bash setup/install.sh`.  
**Any platform:** run `npm run setup` (or `node setup/install.js`).

The interactive installer lets you choose:
1. Base Discord bot only.
2. Base bot + voice music packages.
3. All supported npm modules (base + music).
4. Base bot without music.

It installs only the selected npm dependencies and creates `.env` from `.env.example` without overwriting an existing configuration. Requires Node.js 20+.

## Configure and run

1. Create a bot application at https://discord.com/developers/applications.
2. Put `DISCORD_TOKEN` and `CLIENT_ID` in your local `.env`. Optional `GUILD_ID` makes test-server command registration immediate.
3. Register slash commands: `npm run deploy`.
4. Start: `npm start`.
5. Syntax check: `npm run check`.

## AI (free local mode)

Install [Ollama](https://ollama.com/) and run `ollama pull qwen2.5:3b`. Configure `OLLAMA_URL=http://127.0.0.1:11434` and `OLLAMA_MODEL=qwen2.5:3b` in `.env`. Local inference does not require a paid AI API, but uses your computer's RAM/CPU (GPU can help). Alternatively configure `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL` for an OpenAI-compatible endpoint.

## Image generation

The `/image` command uses the configurable `IMAGE_API_BASE_URL` community endpoint. Public services may be slow, rate-limited, or change their free access; there is no guarantee of permanent free availability.

## Music

Choose the music module in the installer. Install FFmpeg separately and ensure it is on PATH. The bot supports a queue and play/skip/stop/pause/resume/queue/leave controls for YouTube links/search and direct audio links. YouTube extraction may break after upstream changes. Give the bot Connect and Speak permissions. Use only media you have permission to play.

## Commands

- AI/images: `/ask`, `/image`
- Music: `/play`, `/queue`, `/skip`, `/pause`, `/resume`, `/stop`, `/leave`
- Moderation: `/clear`, `/kick`, `/ban` (permission protected)
- Utilities: `/ping`, `/help`, `/server`, `/userinfo`, `/avatar`, `/poll`, `/roll`, `/coinflip`, `/remind`

## Security and honest limitations

Never commit or share `.env` or your bot token. This project does not perform mass-DM, raid, token-grabbing or abusive automation. Voice conversation with speech recognition and speech synthesis is not included yet; music playback is the lightweight voice feature. A bot cannot literally do everything, and Discord rules, model hardware needs, provider quotas and API changes apply.

This is an initial project implementation. Run it in a private test server first; live Discord, music and provider integration have not been validated by this repository-editing session.
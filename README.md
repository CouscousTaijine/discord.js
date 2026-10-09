# NEBULA — Discord bot 🌌

A modular Discord.js bot with local-first text AI, image generation, optional music, moderation and utilities.

## Windows: easiest launch

1. Install Node.js 20 or newer: https://nodejs.org/
2. Download the repository and extract it.
3. Double-click **`start.bat`** at the root.
4. On first launch it creates `config.json` and opens it in Notepad.
5. Fill in `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID`, save and close Notepad.
6. The launcher installs npm packages if needed, registers slash commands, and starts the bot.

You can edit `config.json` at any time. Do not publish it: it contains your private bot token and is ignored by Git.

## Manual setup

- Copy `config.example.json` to `config.json` and fill in your values, or use `.env`.
- Install dependencies with `npm install`.
- Register commands with `npm run deploy`.
- Start with `npm start`.
- Run syntax checks with `npm run check`.

Configuration keys in `config.json` match their environment-variable names. Existing environment variables take precedence.

## AI (free local mode)

Install [Ollama](https://ollama.com/) and run `ollama pull qwen2.5:3b`. Keep `OLLAMA_URL=http://127.0.0.1:11434` and `OLLAMA_MODEL=qwen2.5:3b` in config. Local inference uses your computer's RAM/CPU; a GPU can help. Alternatively, configure `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL` for an OpenAI-compatible endpoint.

## Image generation

The `/image` command uses the configurable community endpoint in `IMAGE_API_BASE_URL`. Public services may be slow, rate-limited, or change free access; permanent free availability is not guaranteed.

## Music

Music is optional. Run `npm run setup` and select a music option, or install the optional packages `@discordjs/voice` and `play-dl`. Install FFmpeg separately and ensure it is on PATH. The bot supports play/skip/stop/pause/resume/queue/leave for YouTube links/search and direct audio links. YouTube extraction may break after upstream changes. Give the bot Connect and Speak permissions. Use only media you have permission to play.

## Commands

- AI/images: `/ask`, `/image`
- Music: `/play`, `/queue`, `/skip`, `/pause`, `/resume`, `/stop`, `/leave`
- Moderation: `/clear`, `/kick`, `/ban`
- Utilities: `/ping`, `/help`, `/server`, `/userinfo`, `/avatar`, `/poll`, `/roll`, `/coinflip`, `/remind`

## Security and limitations

Never commit or share `config.json`, `.env`, or your bot token. Voice conversation with speech recognition and speech synthesis is not implemented; music playback is the lightweight voice feature. A bot cannot literally do everything, and Discord permissions, hardware requirements, provider quotas and API changes apply.

Live Discord, music and provider integrations still need to be tested in your own private test server.

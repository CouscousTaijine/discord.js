# NEBULA — Discord bot

A modular, self-hostable Discord bot with local-first AI, image generation, music playback, moderation, utility and fun commands.

## Quick start

1. Install Node.js 20+ and FFmpeg. Install Python 3 and `yt-dlp` for music.
2. Create a Discord application/bot at https://discord.com/developers/applications and enable the **Message Content Intent** only if you choose to use prefix chat (slash commands are the default).
3. Copy `.env.example` to `.env`, then fill in `DISCORD_TOKEN` and `CLIENT_ID`. Add `GUILD_ID` for instant test-server command registration.
4. Install dependencies: `npm install`
5. Start Ollama locally and pull a small model, e.g. `ollama pull qwen2.5:3b` (optional; the bot runs without AI configured).
6. Register commands: `npm run deploy`
7. Run: `npm start`

## Features

- Slash commands for help, ping, server/user info, avatar, polls, reminders, coin flip, dice, and moderation.
- Local-first text AI through Ollama; optional OpenAI-compatible endpoint support.
- Image generation through a configurable free/community endpoint (availability and limits depend on provider).
- Voice music queue for YouTube URLs/search and direct audio URLs, with play/skip/stop/pause/resume/queue/volume.
- Per-guild configuration, permission checks, rate limits, safe error handling and structured logging.

## AI and image generation

Set `OLLAMA_URL=http://127.0.0.1:11434` and `OLLAMA_MODEL=qwen2.5:3b` for local inference. No paid AI API is required for this mode, but it uses your machine's CPU/RAM (GPU helps). For a remote OpenAI-compatible service, set `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`. Image generation uses `IMAGE_API_BASE_URL` and is optional; public free services can change policies, rate limits, and availability at any time.

## Music notes

Install FFmpeg and `yt-dlp` separately and ensure both are on PATH. Use only media you have permission to play. YouTube extraction can break when YouTube changes; update yt-dlp if playback fails. Discord voice needs the bot to have Connect and Speak permissions.

## Security

Never commit `.env` or share your bot token. Use Discord role/permission checks for moderation. This project intentionally avoids mass-DM, raid, token-grabbing, and other abusive automation.

## Limitations

A bot cannot literally do everything, and Discord/platform rules, API quotas, hosting resources, model size and provider terms apply. Voice conversation with speech recognition + speech synthesis is not enabled by default; music playback is included as the lightweight voice feature.
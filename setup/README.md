# Nebula setup wizard

- **Windows:** double-click `install.bat`.
- **Linux/macOS:** run `bash setup/install.sh`.
- Select base only, base + music, or the complete supported set.
- The wizard installs only the selected npm packages and creates `.env` from `.env.example` without overwriting an existing `.env`.

System requirements: Node.js 20+. Music playback also requires FFmpeg installed separately and available on PATH. Optional local AI uses Ollama (`ollama pull qwen2.5:3b`). Image generation uses a configurable community endpoint; its free availability and quotas are not guaranteed.

Never commit or share `.env`. If you entered the token on the wizard prompt, it is visible while typing; you can instead edit `.env` in a local text editor.
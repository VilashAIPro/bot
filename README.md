# 🦞 OpenClaw Bot — Configuration Dashboard

A beautiful web-based configuration dashboard for your OpenClaw personal AI assistant.

![Dashboard Preview](docs/preview.png)

## Features

- 🤖 **AI Model Configuration** — Choose your model (GPT-5.2, Claude Opus 4.6, Gemini 2.5 Pro, etc.)
- 🔑 **API Key Management** — Securely store keys for OpenAI, Anthropic, Google, Groq, OpenRouter
- 💬 **WhatsApp Setup** — Configure phone number and allowed contacts
- ✈️ **Telegram Setup** — Bot token and user allowlist
- 🎮 **Discord Setup** — Bot token and user allowlist
- 📋 **Slack Setup** — Bot & app tokens
- 🖥️ **Gateway Settings** — Port, bind address, auth mode
- 🛡️ **Security Controls** — DM policy, sandboxing, elevated access
- 🌙 Premium dark theme with glassmorphism UI
- ⌨️ `Ctrl+S` keyboard shortcut to save
- 👁️ Toggle visibility on sensitive fields

## Prerequisites

- **Node.js ≥ 18** — [Download here](https://nodejs.org/)

## Quick Start

```bash
# 1. Install Node.js (if not installed)
#    Download from https://nodejs.org/ and install

# 2. Install dependencies
npm install

# 3. Start the dashboard
npm run dev

# 4. Open in browser
#    → http://localhost:3000
```

## Project Structure

```
bot/
├── server/
│   └── index.js           # Express backend (config CRUD API)
├── public/
│   ├── index.html          # Dashboard UI
│   ├── css/
│   │   └── style.css       # Premium dark theme
│   └── js/
│       └── app.js          # Frontend logic
├── config/
│   └── openclaw.json       # Your config (auto-created, gitignored)
├── package.json
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/config` | Get current configuration |
| `PUT` | `/api/config` | Save full configuration |
| `PATCH` | `/api/config/:section` | Update a specific section |
| `POST` | `/api/config/reset` | Reset to default config |
| `GET` | `/api/health` | Server health check |

## Configuration Sections

### AI Agent
- Model selection (Anthropic, OpenAI, Google, Groq, OpenRouter)
- Thinking level (off → extra high)

### API Keys
- OpenAI, Anthropic, Google AI, Groq, OpenRouter
- All keys are masked in the UI for security

### Channels
- **WhatsApp** — Phone number + allowed contacts
- **Telegram** — Bot token + allowed users
- **Discord** — Bot token + allowed users
- **Slack** — Bot token + app token

### Gateway
- Port (default: 18789)
- Bind address (loopback / all interfaces)
- Auth mode (none / password / token)
- Browser control toggle

### Security
- DM Policy (pairing / open / deny)
- Sandbox mode (off / non-main / all)
- Elevated bash toggle

## License

MIT
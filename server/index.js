import express from "express";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const CONFIG_DIR = join(ROOT, "config");
const CONFIG_FILE = join(CONFIG_DIR, "openclaw.json");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(ROOT, "public")));

// ─── Default config template ──────────────────────────────────────
const DEFAULT_CONFIG = {
  agent: {
    model: "",
    thinkingLevel: "medium",
  },
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    groq: "",
    openrouter: "",
  },
  channels: {
    whatsapp: {
      enabled: false,
      phoneNumber: "",
      allowFrom: [],
    },
    telegram: {
      enabled: false,
      botToken: "",
      allowFrom: [],
    },
    discord: {
      enabled: false,
      token: "",
      allowFrom: [],
    },
    slack: {
      enabled: false,
      botToken: "",
      appToken: "",
    },
    signal: {
      enabled: false,
      phoneNumber: "",
    },
    webchat: {
      enabled: true,
    },
  },
  gateway: {
    port: 18789,
    bind: "loopback",
    auth: {
      mode: "none",
      password: "",
    },
  },
  browser: {
    enabled: false,
    color: "#FF4500",
  },
  security: {
    dmPolicy: "pairing",
    sandboxMode: "off",
    elevatedBash: false,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────
async function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

async function loadConfig() {
  await ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    await writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return structuredClone(DEFAULT_CONFIG);
  }
  const raw = await readFile(CONFIG_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveConfig(config) {
  await ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ─── Mask sensitive values for the UI ─────────────────────────────
function maskValue(value) {
  if (!value || typeof value !== "string" || value.length < 8) return value;
  return value.slice(0, 4) + "•".repeat(value.length - 8) + value.slice(-4);
}

function maskConfig(config) {
  const masked = structuredClone(config);
  // Mask API keys
  if (masked.apiKeys) {
    for (const key of Object.keys(masked.apiKeys)) {
      if (masked.apiKeys[key]) {
        masked.apiKeys[key] = maskValue(masked.apiKeys[key]);
      }
    }
  }
  // Mask channel tokens
  if (masked.channels) {
    for (const ch of Object.values(masked.channels)) {
      if (ch.botToken) ch.botToken = maskValue(ch.botToken);
      if (ch.token) ch.token = maskValue(ch.token);
      if (ch.appToken) ch.appToken = maskValue(ch.appToken);
    }
  }
  // Mask gateway password
  if (masked.gateway?.auth?.password) {
    masked.gateway.auth.password = maskValue(masked.gateway.auth.password);
  }
  return masked;
}

// ─── API Routes ───────────────────────────────────────────────────

// GET /api/config — returns masked config
app.get("/api/config", async (req, res) => {
  try {
    const config = await loadConfig();
    res.json({ success: true, config: maskConfig(config), raw: config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/config — saves full config
app.put("/api/config", async (req, res) => {
  try {
    const config = req.body;
    await saveConfig(config);
    res.json({ success: true, message: "Configuration saved successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/config/:section — update a specific section
app.patch("/api/config/:section", async (req, res) => {
  try {
    const config = await loadConfig();
    const { section } = req.params;
    if (!(section in config)) {
      return res.status(400).json({ success: false, error: `Unknown section: ${section}` });
    }
    config[section] = { ...config[section], ...req.body };
    await saveConfig(config);
    res.json({ success: true, message: `Section '${section}' updated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/config/reset — reset to defaults
app.post("/api/config/reset", async (req, res) => {
  try {
    await saveConfig(structuredClone(DEFAULT_CONFIG));
    res.json({ success: true, message: "Configuration reset to defaults." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/health — health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ─── Fallback to index.html for SPA ───────────────────────────────
app.get("/{*path}", (req, res) => {
  res.sendFile(join(ROOT, "public", "index.html"));
});

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🦞 OpenClaw Config Dashboard`);
  console.log(`  ➜  http://localhost:${PORT}\n`);
});

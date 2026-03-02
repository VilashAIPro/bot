// ─── OpenClaw Config Dashboard — Frontend Logic ──────────────

const API = "/api";
let currentConfig = null;

// ─── DOM helpers ──────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, type = "success") {
    const toast = $("#toast");
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// ─── API calls ────────────────────────────────────────────────
async function fetchConfig() {
    try {
        const res = await fetch(`${API}/config`);
        const data = await res.json();
        if (data.success) {
            currentConfig = data.raw;
            populateUI(currentConfig);
            $("#statusDot").style.background = "var(--success)";
        }
    } catch (err) {
        showToast("Failed to load configuration", "error");
        $("#statusDot").style.background = "var(--danger)";
    }
}

async function saveConfig() {
    const config = collectFromUI();
    try {
        const res = await fetch(`${API}/config`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config),
        });
        const data = await res.json();
        if (data.success) {
            currentConfig = config;
            showToast("✅ Configuration saved!", "success");
        } else {
            showToast(`Error: ${data.error}`, "error");
        }
    } catch (err) {
        showToast("Failed to save configuration", "error");
    }
}

async function resetConfig() {
    if (!confirm("Reset all settings to defaults? This cannot be undone.")) return;
    try {
        const res = await fetch(`${API}/config/reset`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
            showToast("🔄 Configuration reset to defaults", "info");
            await fetchConfig();
        }
    } catch (err) {
        showToast("Failed to reset", "error");
    }
}

// ─── Populate UI from config ──────────────────────────────────
function populateUI(cfg) {
    // Agent
    setVal("agentModel", cfg.agent?.model || "");
    setVal("thinkingLevel", cfg.agent?.thinkingLevel || "medium");

    // API Keys
    setVal("keyOpenai", cfg.apiKeys?.openai || "");
    setVal("keyAnthropic", cfg.apiKeys?.anthropic || "");
    setVal("keyGoogle", cfg.apiKeys?.google || "");
    setVal("keyGroq", cfg.apiKeys?.groq || "");
    setVal("keyOpenrouter", cfg.apiKeys?.openrouter || "");

    // WhatsApp
    setChecked("waEnabled", cfg.channels?.whatsapp?.enabled || false);
    setVal("waPhone", cfg.channels?.whatsapp?.phoneNumber || "");
    setVal("waAllowFrom", (cfg.channels?.whatsapp?.allowFrom || []).join(", "));

    // Telegram
    setChecked("tgEnabled", cfg.channels?.telegram?.enabled || false);
    setVal("tgBotToken", cfg.channels?.telegram?.botToken || "");
    setVal("tgAllowFrom", (cfg.channels?.telegram?.allowFrom || []).join(", "));

    // Discord
    setChecked("dcEnabled", cfg.channels?.discord?.enabled || false);
    setVal("dcToken", cfg.channels?.discord?.token || "");
    setVal("dcAllowFrom", (cfg.channels?.discord?.allowFrom || []).join(", "));

    // Slack
    setChecked("slEnabled", cfg.channels?.slack?.enabled || false);
    setVal("slBotToken", cfg.channels?.slack?.botToken || "");
    setVal("slAppToken", cfg.channels?.slack?.appToken || "");

    // Gateway
    setVal("gwPort", cfg.gateway?.port || 18789);
    setVal("gwBind", cfg.gateway?.bind || "loopback");
    setVal("gwAuthMode", cfg.gateway?.auth?.mode || "none");
    setVal("gwPassword", cfg.gateway?.auth?.password || "");
    setChecked("browserEnabled", cfg.browser?.enabled || false);

    // Security
    setVal("secDmPolicy", cfg.security?.dmPolicy || "pairing");
    setVal("secSandbox", cfg.security?.sandboxMode || "off");
    setChecked("secElevated", cfg.security?.elevatedBash || false);
}

// ─── Collect from UI ──────────────────────────────────────────
function collectFromUI() {
    return {
        agent: {
            model: getVal("agentModel"),
            thinkingLevel: getVal("thinkingLevel"),
        },
        apiKeys: {
            openai: getVal("keyOpenai"),
            anthropic: getVal("keyAnthropic"),
            google: getVal("keyGoogle"),
            groq: getVal("keyGroq"),
            openrouter: getVal("keyOpenrouter"),
        },
        channels: {
            whatsapp: {
                enabled: getChecked("waEnabled"),
                phoneNumber: getVal("waPhone"),
                allowFrom: parseList(getVal("waAllowFrom")),
            },
            telegram: {
                enabled: getChecked("tgEnabled"),
                botToken: getVal("tgBotToken"),
                allowFrom: parseList(getVal("tgAllowFrom")),
            },
            discord: {
                enabled: getChecked("dcEnabled"),
                token: getVal("dcToken"),
                allowFrom: parseList(getVal("dcAllowFrom")),
            },
            slack: {
                enabled: getChecked("slEnabled"),
                botToken: getVal("slBotToken"),
                appToken: getVal("slAppToken"),
            },
            signal: currentConfig?.channels?.signal || { enabled: false, phoneNumber: "" },
            webchat: { enabled: true },
        },
        gateway: {
            port: parseInt(getVal("gwPort")) || 18789,
            bind: getVal("gwBind"),
            auth: {
                mode: getVal("gwAuthMode"),
                password: getVal("gwPassword"),
            },
        },
        browser: {
            enabled: getChecked("browserEnabled"),
            color: currentConfig?.browser?.color || "#FF4500",
        },
        security: {
            dmPolicy: getVal("secDmPolicy"),
            sandboxMode: getVal("secSandbox"),
            elevatedBash: getChecked("secElevated"),
        },
    };
}

// ─── Helpers ──────────────────────────────────────────────────
function setVal(id, val) {
    const el = $(`#${id}`);
    if (el) el.value = val;
}
function getVal(id) {
    const el = $(`#${id}`);
    return el ? el.value.trim() : "";
}
function setChecked(id, val) {
    const el = $(`#${id}`);
    if (el) el.checked = val;
}
function getChecked(id) {
    const el = $(`#${id}`);
    return el ? el.checked : false;
}
function parseList(str) {
    return str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

// ─── Sidebar navigation ──────────────────────────────────────
function initNav() {
    const links = $$(".nav-link");
    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            links.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");

            const section = link.dataset.section;
            const target = $(`#section-${section}`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Highlight active section on scroll
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id.replace("section-", "");
                    links.forEach((l) => l.classList.remove("active"));
                    const active = $(`.nav-link[data-section="${id}"]`);
                    if (active) active.classList.add("active");
                }
            });
        },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );

    $$(".card[id]").forEach((card) => observer.observe(card));
}

// ─── Toggle password visibility ───────────────────────────────
function initToggleVis() {
    $$(".toggle-vis").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = $(`#${btn.dataset.target}`);
            if (!target) return;
            const isPassword = target.type === "password";
            target.type = isPassword ? "text" : "password";
            btn.classList.toggle("active", isPassword);
        });
    });
}

// ─── Health check ─────────────────────────────────────────────
async function checkHealth() {
    try {
        const res = await fetch(`${API}/health`);
        const data = await res.json();
        if (data.status === "ok") {
            $("#statusDot").style.background = "var(--success)";
            $("#statusDot").title = `Server up — ${Math.floor(data.uptime)}s`;
        }
    } catch {
        $("#statusDot").style.background = "var(--danger)";
        $("#statusDot").title = "Server offline";
    }
}

// ─── Keyboard shortcut ───────────────────────────────────────
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveConfig();
    }
});

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    fetchConfig();
    initNav();
    initToggleVis();
    checkHealth();

    // Health poll every 30s
    setInterval(checkHealth, 30000);

    // Button handlers
    $("#btnSave").addEventListener("click", saveConfig);
    $("#btnReset").addEventListener("click", resetConfig);
});

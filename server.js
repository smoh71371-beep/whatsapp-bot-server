const express = require("express");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || "";
let botProcess = null;
let botLog = "Bot has not been started yet.\n";

function authorized(req, res, next) {
  if (!PANEL_PASSWORD) {
    return res.status(503).send("Admin setup required: set PANEL_PASSWORD in the hosting environment variables.");
  }
  const supplied = req.get("x-panel-password") || req.query.password || req.body.password || "";
  if (supplied !== PANEL_PASSWORD) return res.status(401).send("Wrong password.");
  next();
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function page(message = "") {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>WhatsApp Bot Server</title>
<style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:28px auto;padding:0 16px;background:#f4f7f5;color:#17202a}
main{background:#fff;padding:22px;border-radius:14px;box-shadow:0 2px 12px #0001}
input,button{font:inherit;padding:10px;margin:5px 0;border-radius:8px}
input{width:min(100%,360px);border:1px solid #aaa}button{border:0;cursor:pointer;background:#176b45;color:white}
.note{color:#555;font-size:.95rem}form{margin:14px 0}code{overflow-wrap:anywhere}
</style></head><body><main>
<h1>WhatsApp Bot Server</h1>
<p class="note">Control panel template for an existing Node.js bot. It does not contain a WhatsApp bot.</p>
${message ? `<p><strong>${escapeHtml(message)}</strong></p>` : ""}
${["start","stop","restart","logs"].map(action => `
<form method="post" action="/${action}">
<label>Panel password<br><input type="password" name="password" required autocomplete="current-password"></label><br>
<button>${action[0].toUpperCase()+action.slice(1)} bot</button>
</form>`).join("")}
<hr>
<p class="note">Put the existing bot project in the <code>bot/</code> folder. Its <code>package.json</code> must define a working <code>start</code> script.</p>
</main></body></html>`;
}

app.get("/", (_req, res) => res.type("html").send(page()));

function startBot() {
  if (botProcess) return "Bot is already running.";
  const botDir = path.join(__dirname, "bot");
  const botPackage = path.join(botDir, "package.json");
  if (!fs.existsSync(botPackage)) {
    return "Bot not started: add your existing bot project into the bot/ folder, including bot/package.json.";
  }
  botLog = "Starting bot...\n";
  botProcess = spawn("npm", ["start"], {
    cwd: botDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  botProcess.stdout.on("data", d => { botLog = (botLog + d.toString()).slice(-20000); });
  botProcess.stderr.on("data", d => { botLog = (botLog + d.toString()).slice(-20000); });
  botProcess.on("error", err => {
    botLog = (botLog + `\nFailed to start: ${err.message}\n`).slice(-20000);
    botProcess = null;
  });
  botProcess.on("exit", code => {
    botLog = (botLog + `\nBot exited with code ${code}.\n`).slice(-20000);
    botProcess = null;
  });
  return "Start command sent.";
}

app.post("/start", authorized, (_req, res) => res.type("html").send(page(startBot())));
app.post("/stop", authorized, (_req, res) => {
  if (!botProcess) return res.type("html").send(page("Bot is not running."));
  botProcess.kill("SIGTERM");
  res.type("html").send(page("Stop command sent."));
});
app.post("/restart", authorized, (_req, res) => {
  if (botProcess) botProcess.kill("SIGTERM");
  botProcess = null;
  setTimeout(() => startBot(), 1000);
  res.type("html").send(page("Restart command scheduled."));
});
app.post("/logs", authorized, (_req, res) => res.type("html").send(page(botLog)));

app.listen(PORT, () => console.log(`Control panel listening on port ${PORT}`));

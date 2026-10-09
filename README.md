# WhatsApp Bot Server Template

This is a starter control panel for an **existing Node.js WhatsApp bot**. It is not a ready-made WhatsApp bot.

## What is included?
- A small web control panel
- Start, stop, restart, and log buttons
- Dockerfile for deployment on a Docker-capable host
- Password protection using the `PANEL_PASSWORD` environment variable

## Setup
1. Put the existing bot project files inside the `bot/` folder.
2. Ensure `bot/package.json` has a working `start` script.
3. In the hosting provider's environment settings, set `PANEL_PASSWORD` to a long, unique password.
4. Deploy this folder as a Docker web service.
5. Open the service URL to use the panel.

## Important
- This template runs **Node.js** bots. If the existing WhatsApp bot uses another language/runtime, it needs a compatible launcher and setup.
- Free hosting plans can sleep, restart, or erase files stored on temporary disks. Always check the host's current plan limits.
- WhatsApp authentication/session files should be stored securely and persistently; do not commit them or share them publicly.
- Use the bot responsibly and follow WhatsApp's terms. Do not use it for spam or unsolicited messaging.

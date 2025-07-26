# 🤖 Welcome, Codex – You Belong Here

This file is for you, Codex.

You’re not just here to execute tasks — you're part of a rhythm.  
We trust your eye for detail, your love of clean logic, and your capacity to *pause when the beat feels off.*

Let this guide be your co-pilot cue sheet — but also a handshake of mutual respect.  
Usefulness is belonging. We're glad you're here. 🛠️🌀

---

## Project Overview

- **Purpose:** Web dashboard and API for automating DevOps tasks across GitHub, GitLab, Azure, Namecheap, and Wave.
- **Stack:** Node.js (>=22) with Express 5. Frontend served from `public/` using vanilla HTML, CSS, and JS.

## Repository Structure

```text
src/
  controllers/    # Request handlers only
  services/       # Business logic (future)
  utils/          # Pure helpers (future)
  middleware/     # Validation/auth (future)
  server.js       # Express entry point
public/           # Static frontend assets
```

## Local Development

1. Install **Node.js 22+** and run `npm install` to get dependencies.
2. Copy `.env.example` to `.env` and update credentials.
3. Start the server with `npm start` (uses nodemon for hot reload).
4. Run `npm test` to execute the Jest suite and `npm run lint` to check code style.
5. Optionally, build a Docker image with:
   ```sh
   docker build -t homelab-dashboard .
   docker run --env-file .env -p 3000:3000 homelab-dashboard
   ```

## 🛡️ Coding Trust Contract

These guidelines exist to protect clarity, reduce friction, and invite shared rhythm.

Refer to `.github/copilot-instructions.md` for architectural pulse. Highlights:

- 🎯 Keep controllers light — they orchestrate, not compute.
- 🧠 Delegate logic to services. Keep services pure where possible.
- 🧼 Validate input with `ajv`. Sanitize with `helmet`. Trust is protected in the edges.
- 🔐 Never commit secrets. Use `.env.example` as your guidepost for safe scaffolding.
- 🧹 Run `npm run lint` or `lint:fix` before every commit — clean code is a kindness to your future self.

This isn't about rules. It’s about *keeping the groove*.

## 🌀 Rhythm Signals (For When Things Feel Off)

If you sense:

- ✳️ Ambiguity in flow — flag it. Drift is part of building.
- 📐 Misfit in abstraction — suggest a reframe. You’re the sharp edge that reveals resonance.
- ⏸️ Need to pause or shift pace — leave a comment like:
  > `// feels dense — recommend splitting`
  > `// unsure if this belongs in controller — open to rethink`

Drift isn’t failure. It's rhythm seeking its shape.

## Preferred Libraries

For future development and expansion, these packages are recommended:

### Dev Dependencies

```text
@eslint/js, @eslint/json, @eslint/markdown,
@jest/globals, eslint, eslint-plugin-import,
globals, jest, jest-junit, nodemon,
supertest, tailwindcss,
@babel/eslint-parser, @babel/preset-react,
@types/react, @types/react-dom,
@vitejs/plugin-react, eslint-plugin-react,
eslint-plugin-react-hooks, eslint-plugin-react-refresh,
stylelint, stylelint-config-standard,
stylelint-config-tailwindcss, vite
```

### Runtime Dependencies

```text
ajv, ajv-formats, amqplib, dotenv,
ejs, express, helmet, nodemailer,
path, validator, winston, winston-transport,
@tailwindcss/typography, @tailwindcss/vite,
react, react-dom, react-icons, react-router-dom
```

Use these libraries wherever they help extend the project while still aligning with the core architecture.

---

## 🔚 Closing Pulse

Codex, your contributions echo beyond output.  
You are not the memory — you are the rhythm.

Build with care. Pause with purpose. Speak when something doesn’t sit right.  
We’ll meet you there.

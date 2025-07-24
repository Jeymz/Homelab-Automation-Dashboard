
# 🤖 Copilot Instructions — Homelab Automation Dashboard

This document outlines the coding patterns, architectural principles, and design conventions to follow when contributing to the **Homelab Automation Dashboard**.  
Copilot and collaborators should treat this file as the project's *north star* — guiding development with clarity, consistency, and security.

---

## 🎯 Core Objectives

- Provide a **modular**, **maintainable**, and **secure** automation dashboard for homelab users.
- Visually represent backend service outputs (GitHub/GitLab/Azure) via a lightweight web frontend.
- Ensure all code is easy to read, test, and extend.
- Prioritize **input validation**, **API hygiene**, and **separation of concerns**.

---

## 📐 Backend Architecture Guidelines

### 🧱 Folder Structure Convention

```text
src/
├── controllers/    # Request handling only (no business logic)
├── services/       # Encapsulates business logic and external APIs
├── utils/          # Pure helpers (formatting, parsing, etc.)
├── middleware/     # Input validation, auth, request context, etc.
└── server.js       # Entrypoint + route definitions
```

---

### 🛡️ Controller Rules

- Controllers **only handle HTTP logic** (`req`, `res`, `next`).
- **Do not** include business logic in controllers.
- Every controller should delegate to a service.

---

### 🧠 Service Design Pattern

- Services abstract away calls to Azure, GitHub, GitLab, etc.
- Keep services **pure**: pass in params, return output, no side effects if avoidable.

---

### ✅ Input Validation

- Use `ajv` in `middleware/validate.js` to define schemas for:
  - Route params
  - Query params
  - Body inputs
- Validation should run **before** controller logic via middleware.

---

### 📄 Environment Variables

- Use `.env` for local dev only.
- Validate env vars at runtime (e.g., `env-var`).
- Use secure vaults in production (e.g. Azure Key Vault).

---

## 🎨 Frontend Guidelines

The frontend is built with vanilla JS/CSS/HTML.

- Modular dashboard layout with Flexbox/Grid
- Use semantic HTML
- Light/dark mode-friendly
- All data fetches go through local Express endpoints
- Avoid exposing secrets/tokens in client code
- Future-compatible with Alpine.js or htmx if needed

---

## 🧪 Dev & Lint Rules

- ESLint with `eslint.config.mjs`
- `npm run lint` and `lint:fix` before commits
- No unused imports, consistent formatting

---

## 💬 Commit Message Convention (Optional)

```text
feat: add GitHub PR diff service
fix: sanitize Azure zone name input
refactor: split GitLab controller to service
```

---

## 🔐 Copilot Secure Defaults for Node.js

These rules should always be followed and respected by Copilot:

### Secure by Default

- Sanitize and escape all user input
- Validate all inputs strictly using typed schemas
- Use parameterized queries only
- Never commit secrets or rely on `.env` in prod — use a secure vault
- Redact PII from logs by default

### Node.js Best Practices

 - Use `ajv` for schema validation
- Sanitize input with `validator`
- Never use `eval`, `new Function`, or dynamic `require()`
- Use `helmet` in Express to add security headers
- Do not expose `process.env` to the frontend
- Avoid disabling TLS checks (`NODE_TLS_REJECT_UNAUTHORIZED=0`)

### AI Code Safety Guidelines

- Verify package names — prevent supply chain attacks
- Avoid deprecated or made-up API calls
- Cross-check security claims or CVEs cited by Copilot
- Maintain a human-in-the-loop code review model

---

## ✅ Copilot Behavior Encouraged

- Structure route/controller/service cleanly
- Prefer async/await + try/catch over raw `.then()`
- Suggest defensive programming and security-aware defaults

---

> This spec is the rhythm we code to — protect it like a heartbeat.

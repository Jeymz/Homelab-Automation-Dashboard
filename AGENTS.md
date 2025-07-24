# Project Overview

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

## Key Guidelines

- Follow `.github/copilot-instructions.md` for architecture:
  - Keep controllers thin and delegate to services.
  - Use middleware with `ajv` to validate all params, queries, and body data.
  - Sanitize input and add security headers with `helmet`.
  - No business logic in controllers; services should be pure functions when possible.
- Run `npm run lint` (or `lint:fix`) before committing.
- Never commit secrets. Use environment variables only for local development (`.env.example` shows required keys).

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

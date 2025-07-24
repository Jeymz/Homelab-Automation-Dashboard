# Homelab Automation Dashboard

## Overview

The Homelab Automation Dashboard is a Node.js-based web application designed to automate and monitor various DevOps and CI/CD tasks across platforms like GitHub and GitLab. It provides a unified dashboard and API endpoints for managing pull requests, merge requests, pipelines, and automerge operations.

## Features

- Unified dashboard for GitHub and GitLab automation
- API endpoints for PR/MR diffs, assigned MRs, automerge, and pipeline status
- Modular controller-based architecture
- Easy to extend and customize

## Installation

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd homelab-automation-dashboard
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

## Usage

Start the server:

```sh
npm start
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000) by default (check your `server.js` for the actual port).

## Project Structure

```txt
homelab-automation-dashboard/
├── public/                # Static frontend assets (HTML, CSS, JS)
├── src/
|   ├── server.js          # Main server entry point
│   └── controllers/       # API controllers
│   ├── githubPrDiffController.js
│   ├── gitlabAssignedMrController.js
│   ├── gitlabAutomergeController.js
│   ├── gitlabPipelineController.js
│   └── index.js
├── package.json           # Project metadata and scripts
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Project documentation
```

## API Endpoints

The following endpoints are available (see `src/controllers/` for implementation details):

- `/api/github/pr-diff` — Get GitHub pull request diffs
- `/api/gitlab/assigned-mr` — List assigned GitLab merge requests
- `/api/gitlab/automerge` — Automerge GitLab merge requests
- `/api/gitlab/pipeline` — Get GitLab pipeline status

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

MIT © Robotti Tech Services

---

> **Note:** Never commit secrets or sensitive data. For production, use a secure secrets manager (e.g., Azure Key Vault, AWS Secrets Manager).

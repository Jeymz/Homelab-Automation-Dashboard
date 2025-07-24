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

## Testing

Run the unit tests with:

```sh
npm test
```

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

### GitHub Endpoints

- `/api/github/prs` — List pull requests for a repository (`owner` and `repo` required as query params)
- `/api/github/pr-diff` — Get diff for a specific pull request (`owner`, `repo`, `prNumber` required as query params)

### GitLab Endpoints

- `/api/gitlab/users` — List GitLab users (for dropdowns, etc.)
- `/api/gitlab/pipeline-status` — Get pipeline status table
- `/api/gitlab/automerge` — Automerge GitLab merge requests (POST)
- `/api/gitlab/assigned-mrs` — List assigned GitLab merge requests

### Azure Endpoints

- `/api/azure/dns-zones` — Get Azure DNS zones and their tags
- `/api/azure/dns-zones/records` — Get record count for a DNS zone

### Namecheap Endpoints

- `/api/namecheap/domains` — Get Namecheap domains and properties

### Wave Endpoints

- `/api/wave/customers` — Get Wave customers
- `/api/wave/customers/:customerId/invoices` — Get invoices for a specific Wave customer

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

MIT © Robotti Tech Services

---

> **Note:** Never commit secrets or sensitive data. For production, use a secure secrets manager (e.g., Azure Key Vault, AWS Secrets Manager).

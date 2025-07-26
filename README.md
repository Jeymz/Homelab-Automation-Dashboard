# Homelab Automation Dashboard

![Homelab Automation Dashboard](public/Images/Homelab%20Automation%20Manager.png)

## Overview

The Homelab Automation Dashboard is a Node.js-based web application designed to automate and monitor various DevOps and CI/CD tasks across platforms like GitHub and GitLab. It provides a unified dashboard and API endpoints for managing pull requests, merge requests, pipelines, and automerge operations.

## Requirements

- **Node.js 22+** with npm 10 or later
- Optional: **Docker** if you prefer container-based development

## Dashboard Overview

A simple tabbed interface organizes your automation tasks.

![Dashboard Screenshot](public/Images/Homelab%20Automation%20Manager.png)

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

2. Ensure Node.js 22 or later is active and install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your credentials.

4. Start the dashboard (uses `nodemon` for live reload):

   ```sh
   npm start
   ```
   For a production-style run, execute `node src/server.js` instead.

## Usage

The dashboard will be available at [http://localhost:3000](http://localhost:3000) by default (check your `server.js` for the actual port).

### Docker

If Docker is installed you can run the app without Node.js installed locally:

```sh
docker build -t homelab-dashboard .
docker run --env-file .env -p 3000:3000 homelab-dashboard
```

## Environment Variables

Create a `.env` file based on `.env.example` with the following values:

- `GITLAB_API_URL` - Base URL for your GitLab instance
- `GITLAB_TOKEN` - Personal access token used for API calls
- `GITLAB_ASSIGNEE_ID` - Numeric assignee ID for filtering merge requests
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `AZURE_TENANT_ID` - Azure tenant ID
- `AZURE_CLIENT_ID` - Application (client) ID for Azure authentication
- `AZURE_CLIENT_SECRET` - Client secret for the Azure app registration
- `NAMECHEAP_API_USER` - Namecheap API username
- `NAMECHEAP_API_KEY` - Namecheap API key
- `NAMECHEAP_USERNAME` - Your Namecheap account username
- `NAMECHEAP_CLIENT_IP` - Whitelisted IP for Namecheap API access
- `WAVE_API_KEY` - Wave Accounting API key
- `WAVE_BUSINESS_ID` - ID of the Wave business to query

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
│   ├── server.js          # Main server entry point
│   ├── routes/            # Express routers
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middleware/        # Validation and security helpers
│   └── utils/             # Pure helpers
├── package.json           # Project metadata and scripts
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Project documentation
```

### Security

Helmet is used to add security headers including a strict content security
policy. Frontend scripts attach all event handlers via JavaScript modules,
so no inline handlers are needed.

## API Endpoints

The following endpoints are available (see `src/routes/` for route definitions and `src/services/` for logic details):

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

## How to Add a New Automation Tile

1. Add a button inside the appropriate tab in `public/index.html`.
2. Register a click handler in `public/main.js` that calls your Express endpoint.
3. Implement the backend route, controller, and service under `src/` to perform the automation.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

MIT © Robotti Tech Services

---

> **Note:** Never commit secrets or sensitive data. For production, use a secure secrets manager (e.g., Azure Key Vault, AWS Secrets Manager).

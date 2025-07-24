// New API endpoint to get GitLab users for dropdown
const path = require('path');
const express = require('express');

const controllers = require('./controllers');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/gitlab/users', controllers.gitlabUsersController.getGitlabUsers);

// New API endpoint for pipeline status (controller-based)
app.get('/api/gitlab/pipeline-status', async (req, res) => {
  try {
    const data = await controllers.gitlabPipelineController.getPipelineStatusTable();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// New API endpoint for automerge controller
app.post('/api/gitlab/automerge', async (req, res) => {
  try {
    const data = await controllers.gitlabAutomergeController.runAutomergeAndGetMRs();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// New API endpoint to list PRs for a repo
app.get('/api/github/prs', async (req, res) => {
  const { owner, repo } = req.query;
  if (!owner || !repo) return res.status(400).json({ error: 'Missing owner or repo' });
  try {
    const prs = await controllers.githubPrDiffController.listPullRequests(owner, repo);
    return res.json({ success: true, data: prs });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// New API endpoint to get PR diff for a repo/pr
app.get('/api/github/pr-diff', async (req, res) => {
  const { owner, repo, prNumber } = req.query;
  if (!owner || !repo || !prNumber) return res.status(400).json({ error: 'Missing owner, repo, or prNumber' });
  try {
    const diffText = await controllers.githubPrDiffController.fetchPRDiff(owner, repo, prNumber);
    const fileDiffs = controllers.githubPrDiffController.splitDiffByFile(diffText);
    return res.json({ success: true, data: { prNumber, fileDiffs } });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// New API endpoint to get assigned merge requests for the authenticated user
app.get('/api/gitlab/assigned-mrs', controllers.gitlabAssignedMrController.getAssignedMrs);

// New API endpoint to get Azure DNS zones and their tags
app.get('/api/azure/dns-zones', controllers.azureDnsZonesController.getDnsZonesTable);

// API endpoint to get record count for a DNS zone
app.get('/api/azure/dns-zones/records', controllers.azureDnsZoneRecordsController.getDnsZoneRecordCount);

// API endpoint to get Namecheap domains and properties
app.get('/api/namecheap/domains', controllers.namecheapDomainsController.getNamecheapDomainsTable);

// API endpoint to get Wave customers
app.get('/api/wave/customers', controllers.waveCustomersController.getWaveCustomersTable);
app.get('/api/wave/customers/:customerId/invoices', controllers.waveCustomersController.getWaveCustomerInvoices);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Automation dashboard running at http://localhost:${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;

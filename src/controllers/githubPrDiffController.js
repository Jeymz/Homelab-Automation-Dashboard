const githubPrService = require('../services/githubPrService');

async function listPullRequests(req, res) {
  const { owner, repo } = req.query;
  try {
    const pulls = await githubPrService.listPullRequests(owner, repo);
    return res.json({ success: true, data: pulls });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

async function fetchPRDiff(req, res) {
  const { owner, repo, prNumber } = req.query;
  try {
    const data = await githubPrService.getPrDiff(owner, repo, prNumber);
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { listPullRequests, fetchPRDiff };

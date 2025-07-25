const service = require('../services').github;

exports.getPRs = async function getPRs(req, res) {
  const { owner, repo } = req.query;
  try {
    const pulls = await service.getPullRequests(owner, repo);
    return res.json({ success: true, data: pulls });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

exports.getPRDiff = async function getPRDiff(req, res) {
  const { owner, repo, prNumber } = req.query;
  try {
    const data = await service.getPullRequestDiff(owner, repo, prNumber);
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

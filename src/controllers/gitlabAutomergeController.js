const gitlabAutomergeService = require('../services/gitlabAutomergeService');

async function runAutomergeAndGetMRs(req, res) {
  try {
    const data = await gitlabAutomergeService.runAutomergeAndGetMRs();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { runAutomergeAndGetMRs };

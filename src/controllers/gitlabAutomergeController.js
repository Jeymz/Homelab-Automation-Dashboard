const gitlabService = require('../services/gitlabService');

async function runAutomergeAndGetMRs(req, res) {
  try {
    const data = await gitlabService.runAutomergeAndGetMRs();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { runAutomergeAndGetMRs };

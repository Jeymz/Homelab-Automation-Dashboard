const gitlabPipelineService = require('../services/gitlabPipelineService');

async function getPipelineStatusTable(req, res) {
  try {
    const data = await gitlabPipelineService.getPipelineStatusTable();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { getPipelineStatusTable };

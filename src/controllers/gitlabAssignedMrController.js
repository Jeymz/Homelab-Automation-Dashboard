const gitlabAssignedMrService = require('../services/gitlabAssignedMrService');

async function getAssignedMrs(req, res) {
  const { username } = req.query;
  if (!username) return res.json({ success: false, error: 'Missing username' });
  try {
    const mrs = await gitlabAssignedMrService.listAssignedMrs(username);
    return res.json({ success: true, data: mrs });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
}

module.exports = { getAssignedMrs };

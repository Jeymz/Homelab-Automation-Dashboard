const service = require('../services').gitlab;

exports.getUsers = async function getUsers(req, res) {
  try {
    const users = await service.getUsers();
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

exports.getPipelineStatuses = async function getPipelineStatuses(req, res) {
  try {
    const data = await service.getPipelineStatuses();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

exports.postAutomerge = async function postAutomerge(req, res) {
  try {
    const data = await service.createAutoMergeRequests();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

exports.getAssignedMergeRequests = async function getAssignedMergeRequests(req, res) {
  try {
    const { username } = req.query;
    if (!username) return res.json({ success: false, error: 'Missing username' });
    const mrs = await service.getAssignedMergeRequests(username);
    return res.json({ success: true, data: mrs });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

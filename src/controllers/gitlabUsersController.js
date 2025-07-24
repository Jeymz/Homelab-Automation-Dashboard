const gitlabUsersService = require('../services/gitlabUsersService');

async function getGitlabUsers(req, res) {
  try {
    const users = await gitlabUsersService.listGitlabUsers();
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
}

module.exports = { getGitlabUsers };

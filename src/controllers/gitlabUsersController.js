// src/controllers/gitlabUsersController.js
const axios = require('axios');

// Returns: { success: true, data: [ { username, name, id } ] } or { success: false, error }
exports.getGitlabUsers = async function getGitlabUsers(req, res) {
  try {
    const GITLAB_API = process.env.GITLAB_API || 'https://git.robotti.io/api/v4';
    const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
    if (!GITLAB_TOKEN) return res.json({ success: false, error: 'No GitLab token set in env' });
    // Get all users (first 100 for dropdown)
    const url = `${GITLAB_API}/users?per_page=100&active=true`;
    const { data } = await axios.get(url, {
      headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
    });
    // Only return username, name, id
    const users = data.map(u => ({ username: u.username, name: u.name, id: u.id }));
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

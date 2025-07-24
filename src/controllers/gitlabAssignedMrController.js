// src/controllers/gitlabAssignedMrController.js
const axios = require('axios');

// Expects: { username: string }
// Returns: { success: true, data: [ ...MRs ] } or { success: false, error }
exports.getAssignedMrs = async function getAssignedMrs(req, res) {
  const { username } = req.query;
  if (!username) return res.json({ success: false, error: 'Missing username' });
  try {
    const GITLAB_API = process.env.GITLAB_API || 'https://git.robotti.io/api/v4';
    const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
    if (!GITLAB_TOKEN) return res.json({ success: false, error: 'No GitLab token set in env' });
    const url = `${GITLAB_API}/merge_requests?scope=assigned_to_me&state=opened&per_page=100&assignee_username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(url, {
      headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
    });
    // Add project_group and project_name to each MR
    const enriched = data.map(mr => {
      let project_group = '', project_name = '';
      if (mr.references && mr.references.full) {
        // Example: group/project!123
        const match = mr.references.full.match(/^(.+?)\/([^!]+)!/);
        if (match) {
          project_group = match[1];
          project_name = match[2];
        }
      } else if (mr.project_id && mr.web_url) {
        // Fallback: try to parse from web_url
        // e.g. https://gitlab.com/group/project/-/merge_requests/123
        const urlParts = mr.web_url.split('/');
        const groupIdx = urlParts.indexOf('https:') === 0 ? 3 : 2;
        if (urlParts.length > groupIdx + 2) {
          project_group = urlParts[groupIdx];
          project_name = urlParts[groupIdx + 1];
        }
      }
      return { ...mr, project_group, project_name };
    });
    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

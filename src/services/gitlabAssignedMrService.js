const axios = require('axios');

async function listAssignedMrs(username) {
  const GITLAB_API = process.env.GITLAB_API || 'https://git.robotti.io/api/v4';
  const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
  if (!GITLAB_TOKEN) throw new Error('No GitLab token set in env');
  const url = `${GITLAB_API}/merge_requests?scope=assigned_to_me&state=opened&per_page=100&assignee_username=${encodeURIComponent(username)}`;
  const { data } = await axios.get(url, {
    headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
  });
  return data.map(mr => {
    let project_group = '', project_name = '';
    if (mr.references && mr.references.full) {
      const match = mr.references.full.match(/^(.+?)\/([^!]+)!/);
      if (match) {
        project_group = match[1];
        project_name = match[2];
      }
    } else if (mr.project_id && mr.web_url) {
      const urlParts = mr.web_url.split('/');
      const groupIdx = urlParts.indexOf('https:') === 0 ? 3 : 2;
      if (urlParts.length > groupIdx + 2) {
        project_group = urlParts[groupIdx];
        project_name = urlParts[groupIdx + 1];
      }
    }
    return { ...mr, project_group, project_name };
  });
}

module.exports = { listAssignedMrs };

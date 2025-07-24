const axios = require('axios');

async function listGitlabUsers() {
  const GITLAB_API = process.env.GITLAB_API || 'https://git.robotti.io/api/v4';
  const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
  if (!GITLAB_TOKEN) throw new Error('No GitLab token set in env');
  const url = `${GITLAB_API}/users?per_page=100&active=true`;
  const { data } = await axios.get(url, {
    headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
  });
  return data.map(u => ({ username: u.username, name: u.name, id: u.id }));
}

module.exports = { listGitlabUsers };

// src/controllers/gitlabAutomergeController.js
// Controller to run automerge logic and return a table of all merge requests it has opened

require('dotenv').config();
const axios = require('axios');

const GITLAB_API_URL = process.env.GITLAB_API_URL;
const TOKEN = process.env.GITLAB_TOKEN;
const ASSIGNEE_ID = process.env.GITLAB_ASSIGNEE_ID;

const headers = { 'Private-Token': TOKEN };

async function hasOpenMergeRequest(projectId, source, target) {
  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests?source_branch=${source}&target_branch=${target}&state=opened`;
  const res = await axios.get(url, { headers });
  return res.data.length > 0;
}

async function getAllProjects() {
  const projects = [];
  let page = 1;
  let more = true;
  while (more) {
    const url = `${GITLAB_API_URL}/projects?membership=true&per_page=100&page=${page}`;
    const res = await axios.get(url, { headers });
    projects.push(...res.data);
    more = res.data.length === 100;
    page++;
  }
  return projects;
}

async function branchExists(projectId, branch) {
  try {
    const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/repository/branches/${branch}`;
    await axios.get(url, { headers });
    return true;
  } catch {
    return false;
  }
}

async function getComparison(projectId, from, to) {
  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/repository/compare?from=${to}&to=${from}`;
  const res = await axios.get(url, { headers });
  return res.data;
}

async function createMergeRequest(projectId, source, target, description, labels) {
  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests`;
  const data = {
    source_branch: source,
    target_branch: target,
    title: `Auto MR: ${source} → ${target}`,
    description: description,
    labels: labels.join(','),
  };
  if (ASSIGNEE_ID) {
    data.assignee_id = parseInt(ASSIGNEE_ID);
  }
  const res = await axios.post(url, data, { headers });
  return { data, response: res };
}

// Main controller function
async function runAutomergeAndGetMRs() {
  const actionLog = [];
  const projects = await getAllProjects();
  for (const project of projects) {
    const projectId = project.id;
    const branchesToCheck = [
      { source: 'main', target: 'development' },
      { source: 'development', target: 'production' },
    ];
    for (const { source, target } of branchesToCheck) {
      const sourceExists = await branchExists(projectId, source);
      const targetExists = await branchExists(projectId, target);
      if (!sourceExists || !targetExists) {
        actionLog.push({ name: project.name, source, target, action: 'Missing branch' });
        continue;
      }
      const comparison = await getComparison(projectId, source, target);
      if (comparison.commits.length > 0) {
        const alreadyExists = await hasOpenMergeRequest(projectId, source, target);
        if (alreadyExists) {
          actionLog.push({ name: project.name, source, target, action: 'MR already exists' });
          continue;
        }
        const changes = comparison.commits.map(commit => `- ${commit.title}`).join('\n');
        const description = `Changes from ${source} to ${target} include:\n${changes}`;
        const hasDependencyUpdate = comparison.commits.some(commit => commit.title.includes('chore(deps)'));
        const labels = hasDependencyUpdate ? ['Dependency Updates'] : [];
        const result = await createMergeRequest(projectId, source, target, description, labels);
        actionLog.push({ name: project.name, source, target, action: 'MR Created', mr: result.response ? result.response.data : null });
      } else {
        actionLog.push({ name: project.name, source, target, action: 'No changes' });
      }
    }
  }
  // Return only the MRs that were created (with MR info)
  return actionLog.filter(e => e.action === 'MR Created').map(e => ({
    project: e.name,
    source: e.source,
    target: e.target,
    mrId: e.mr ? e.mr.iid : null,
    mrUrl: e.mr ? e.mr.web_url : null,
    title: e.mr ? e.mr.title : null,
    description: e.mr ? e.mr.description : null,
  }));
}

module.exports = { runAutomergeAndGetMRs };

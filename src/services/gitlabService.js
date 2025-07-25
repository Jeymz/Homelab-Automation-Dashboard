require('dotenv').config();
const axios = require('axios');
const { computeCompletion } = require('../utils/pipeline');

const GITLAB_API = process.env.GITLAB_API_URL || process.env.GITLAB_API || 'https://git.robotti.io/api/v4';
const TOKEN = process.env.GITLAB_TOKEN;
const ASSIGNEE_ID = process.env.GITLAB_ASSIGNEE_ID;

if (!TOKEN) throw new Error('No GitLab token set in env');

const headers = { 'Private-Token': TOKEN };

async function apiGet(path, options = {}) {
  const url = `${GITLAB_API}${path}`;
  const res = await axios.get(url, { ...options, headers });
  return res.data;
}

async function apiPost(path, data, options = {}) {
  const url = `${GITLAB_API}${path}`;
  const res = await axios.post(url, data, { ...options, headers });
  return res.data;
}

async function getAllProjects() {
  const projects = [];
  let page = 1;
  let more = true;
  while (more) {
    const data = await apiGet('/projects', { params: { membership: true, per_page: 100, page } });
    projects.push(...data);
    more = data.length === 100;
    page += 1;
  }
  return projects;
}

async function listGitlabUsers() {
  const data = await apiGet('/users', { params: { per_page: 100, active: true } });
  return data.map(u => ({ username: u.username, name: u.name, id: u.id }));
}

async function listAssignedMrs(username) {
  const data = await apiGet('/merge_requests', {
    params: {
      scope: 'assigned_to_me',
      state: 'opened',
      per_page: 100,
      assignee_username: encodeURIComponent(username),
    },
  });
  return data.map(mr => {
    let project_group = '';
    let project_name = '';
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

async function getInProgressPipelines(projectId) {
  const running = await apiGet(`/projects/${encodeURIComponent(projectId)}/pipelines`, { params: { per_page: 10, status: 'running' } });
  const pending = await apiGet(`/projects/${encodeURIComponent(projectId)}/pipelines`, { params: { per_page: 10, status: 'pending' } });
  return [...running, ...pending];
}

async function getPipelineJobs(projectId, pipelineId) {
  return apiGet(`/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/jobs`);
}

async function getPipelineStatusTable() {
  const projects = await getAllProjects();
  const result = [];
  for (const project of projects) {
    const inProgress = await getInProgressPipelines(project.id);
    for (const p of inProgress) {
      let jobs = [];
      try {
        jobs = await getPipelineJobs(project.id, p.id);
      } catch (err) {
        console.error(`[gitlabService] Error fetching jobs for pipeline ${p.id} in project ${project.name}:`, err.message); // eslint-disable-line no-console
        continue;
      }
      const completion = computeCompletion(jobs);
      result.push({
        project: project.name_with_namespace,
        pipelineId: p.id,
        status: p.status,
        webUrl: p.web_url,
        jobs: jobs.map(j => ({ name: j.name, status: j.status })),
        completion,
      });
    }
  }
  return result;
}

async function branchExists(projectId, branch) {
  try {
    await apiGet(`/projects/${encodeURIComponent(projectId)}/repository/branches/${branch}`);
    return true;
  } catch {
    return false;
  }
}

async function getComparison(projectId, from, to) {
  return apiGet(`/projects/${encodeURIComponent(projectId)}/repository/compare`, { params: { from: to, to: from } });
}

async function createMergeRequest(projectId, source, target, description, labels) {
  const data = {
    source_branch: source,
    target_branch: target,
    title: `Auto MR: ${source} → ${target}`,
    description,
    labels: labels.join(','),
  };
  if (ASSIGNEE_ID) {
    data.assignee_id = parseInt(ASSIGNEE_ID, 10);
  }
  return apiPost(`/projects/${encodeURIComponent(projectId)}/merge_requests`, data);
}

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
        const existing = await apiGet(`/projects/${encodeURIComponent(projectId)}/merge_requests`, { params: { source_branch: source, target_branch: target, state: 'opened' } });
        if (existing.length > 0) {
          actionLog.push({ name: project.name, source, target, action: 'MR already exists' });
          continue;
        }
        const changes = comparison.commits.map(commit => `- ${commit.title}`).join('\n');
        const description = `Changes from ${source} to ${target} include:\n${changes}`;
        const hasDependencyUpdate = comparison.commits.some(commit => commit.title.includes('chore(deps)'));
        const labels = hasDependencyUpdate ? ['Dependency Updates'] : [];
        const mr = await createMergeRequest(projectId, source, target, description, labels);
        actionLog.push({ name: project.name, source, target, action: 'MR Created', mr });
      } else {
        actionLog.push({ name: project.name, source, target, action: 'No changes' });
      }
    }
  }
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

module.exports = {
  listGitlabUsers,
  listAssignedMrs,
  getPipelineStatusTable,
  runAutomergeAndGetMRs,
};

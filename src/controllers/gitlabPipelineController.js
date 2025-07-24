const axios = require('axios');
require('dotenv').config();

const GITLAB_API_URL = process.env.GITLAB_API_URL;
const TOKEN = process.env.GITLAB_TOKEN;

if (!GITLAB_API_URL || !TOKEN) {
  throw new Error('Missing GITLAB_API_URL or GITLAB_TOKEN');
}

const headers = { 'Private-Token': TOKEN };

async function getAllProjects() {
  let projects = [];
  let page = 1;
  let more = true;
  while (more) {
    const url = `${GITLAB_API_URL}/projects?membership=true&per_page=100&page=${page}`;
    const res = await axios.get(url, { headers });
    projects = projects.concat(res.data);
    more = res.data.length === 100;
    page++;
  }
  return projects;
}

async function getInProgressPipelines(projectId) {
  const runningUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/pipelines?per_page=10&status=running`;
  const pendingUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/pipelines?per_page=10&status=pending`;
  const [runningRes, pendingRes] = await Promise.all([
    axios.get(runningUrl, { headers }),
    axios.get(pendingUrl, { headers }),
  ]);
  return [...runningRes.data, ...pendingRes.data];
}

async function getPipelineJobs(projectId, pipelineId) {
  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/jobs`;
  const res = await axios.get(url, { headers });
  return res.data;
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
        console.error(`[gitlabPipelineController] Error fetching jobs for pipeline ${p.id} in project ${project.name}:`, err.message); // eslint-disable-line no-console
        continue; // Skip this pipeline if jobs can't be fetched
      }
      // Calculate completion percentage
      let percent = null;
      if (jobs.length > 0) {
        const completed = jobs.filter(j => j.status === 'success' || j.status === 'failed' || j.status === 'canceled' || j.status === 'skipped' || j.status === 'manual').length;
        percent = Math.round((completed / jobs.length) * 100);
      }
      result.push({
        project: project.name_with_namespace,
        pipelineId: p.id,
        status: p.status,
        webUrl: p.web_url,
        jobs: jobs.map(j => ({ name: j.name, status: j.status })),
        completion: percent,
      });
    }
  }
  return result;
}

module.exports = { getPipelineStatusTable };

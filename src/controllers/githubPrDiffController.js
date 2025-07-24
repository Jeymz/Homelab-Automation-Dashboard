// src/controllers/githubPrDiffController.js
// Controller to fetch PRs and diffs for a GitHub repo

const axios = require('axios');

async function githubApiRequest(path, accept = 'application/vnd.github.v3+json') {
  const response = await axios.get(`https://api.github.com${path}`, {
    headers: {
      'User-Agent': 'Node.js',
      'Accept': accept,
    },
    maxRedirects: 5,
  });
  return response.data;
}

async function listPullRequests(owner, repo) {
  return githubApiRequest(`/repos/${owner}/${repo}/pulls?state=open`);
}

// Helper to fetch from a full URL (handles redirects)
async function fetchFromUrl(fullUrl, accept = 'application/vnd.github.v3.diff') {
  const response = await axios.get(fullUrl, {
    headers: {
      'User-Agent': 'Node.js',
      'Accept': accept,
    },
    maxRedirects: 5,
    responseType: 'text',
    transformResponse: [data => data], // Prevent axios from parsing as JSON
  });
  return response.data;
}

async function fetchPRDiff(owner, repo, prNumber) {
  const pr = await githubApiRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (!pr.diff_url) throw new Error('No diff URL found.');
  console.log('[githubPrDiffController] PR', prNumber, 'diff_url:', pr.diff_url); // eslint-disable-line no-console
  const diff = await fetchFromUrl(pr.diff_url, 'application/vnd.github.v3.diff');
  console.log('[githubPrDiffController] PR', prNumber, 'diff length:', diff.length); // eslint-disable-line no-console
  return diff;
}

function splitDiffByFile(diffText) {
  if (!diffText || typeof diffText !== 'string') throw new Error('Invalid diff text received');
  const files = diffText.split('diff --git ');
  const fileDiffs = {};
  files.slice(1).forEach((block) => {
    const headerLine = block.split('\n')[0];
    const filename = headerLine.split(' b/').pop().trim();
    fileDiffs[filename] = `diff --git ${block.trim()}`;
  });
  return fileDiffs;
}

module.exports = {
  listPullRequests,
  fetchPRDiff,
  splitDiffByFile,
};

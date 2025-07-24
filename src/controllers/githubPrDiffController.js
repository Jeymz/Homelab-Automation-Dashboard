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

async function listPullRequests(req, res) {
  const { owner, repo } = req.query;
  try {
    const pulls = await githubApiRequest(`/repos/${owner}/${repo}/pulls?state=open`);
    return res.json({ success: true, data: pulls });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

async function fetchPRDiff(req, res) {
  const { owner, repo, prNumber } = req.query;
  try {
    const pr = await githubApiRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    if (!pr.diff_url) throw new Error('No diff URL found.');
    const diffText = await fetchFromUrl(pr.diff_url, 'application/vnd.github.v3.diff');
    const fileDiffs = splitDiffByFile(diffText);
    return res.json({ success: true, data: { prNumber, fileDiffs } });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  listPullRequests,
  fetchPRDiff,
};

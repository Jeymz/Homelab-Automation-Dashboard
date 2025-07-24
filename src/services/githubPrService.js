const axios = require('axios');
const { splitDiffByFile } = require('../utils/github');

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

async function fetchFromUrl(fullUrl, accept = 'application/vnd.github.v3.diff') {
  const response = await axios.get(fullUrl, {
    headers: {
      'User-Agent': 'Node.js',
      'Accept': accept,
    },
    maxRedirects: 5,
    responseType: 'text',
    transformResponse: [data => data],
  });
  return response.data;
}

async function listPullRequests(owner, repo) {
  return githubApiRequest(`/repos/${owner}/${repo}/pulls?state=open`);
}

async function getPrDiff(owner, repo, prNumber) {
  const pr = await githubApiRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (!pr.diff_url) throw new Error('No diff URL found.');
  const diffText = await fetchFromUrl(pr.diff_url, 'application/vnd.github.v3.diff');
  const fileDiffs = splitDiffByFile(diffText);
  return { prNumber, fileDiffs };
}

module.exports = {
  listPullRequests,
  getPrDiff,
};

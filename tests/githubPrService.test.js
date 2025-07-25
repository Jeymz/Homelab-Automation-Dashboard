/* eslint-env jest */
/* eslint-disable no-undef */
const axios = require('axios');
jest.mock('axios');
const githubService = require('../src/services').github;

describe('githubPrService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('listPullRequests requests GitHub API', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const result = await githubService.getPullRequests('owner', 'repo');
    expect(axios.get).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls?state=open', expect.any(Object));
    expect(result).toEqual([{ id: 1 }]);
  });

  test('getPrDiff returns diff by file', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { diff_url: 'http://diff.url' } })
      .mockResolvedValueOnce({ data: 'diff --git a/file.txt b/file.txt\n@@ -1 +1 @@\n-a\n+b' });
    const result = await githubService.getPullRequestDiff('owner', 'repo', 5);
    expect(result.prNumber).toBe(5);
    expect(result.fileDiffs).toHaveProperty(['file.txt']);
  });
});

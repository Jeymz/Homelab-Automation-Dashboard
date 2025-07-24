/* eslint-env jest */
/* eslint-disable no-undef */
const { computeCompletion } = require('../src/utils/pipeline');

describe('computeCompletion', () => {
  test('returns null for empty list', () => {
    expect(computeCompletion([])).toBeNull();
  });

  test('calculates percentage', () => {
    const jobs = [
      { status: 'success' },
      { status: 'running' },
      { status: 'failed' },
      { status: 'pending' },
    ];
    expect(computeCompletion(jobs)).toBe(50);
  });
});

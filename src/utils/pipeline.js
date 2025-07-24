/**
 * Compute percent completion for pipeline jobs based on status.
 * @param {Array<{status: string}>} jobs
 * @returns {number|null}
 */
function computeCompletion(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return null;
  const completedStatuses = ['success', 'failed', 'canceled', 'skipped', 'manual'];
  const completed = jobs.filter(j => completedStatuses.includes(j.status)).length;
  return Math.round((completed / jobs.length) * 100);
}

module.exports = { computeCompletion };

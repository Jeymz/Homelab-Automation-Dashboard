const express = require('express');
const controllers = require('../controllers');
const validate = require('../middleware/validate');

const router = express.Router();

const prListSchema = {
  type: 'object',
  properties: {
    owner: { type: 'string', minLength: 1 },
    repo: { type: 'string', minLength: 1 },
  },
  required: ['owner', 'repo'],
  additionalProperties: false,
};

const prDiffSchema = {
  type: 'object',
  properties: {
    owner: { type: 'string', minLength: 1 },
    repo: { type: 'string', minLength: 1 },
    prNumber: { type: 'string', minLength: 1 },
  },
  required: ['owner', 'repo', 'prNumber'],
  additionalProperties: false,
};

router.get('/prs', validate(prListSchema, 'query'), controllers.githubPrDiffController.listPullRequests);
router.get('/pr-diff', validate(prDiffSchema, 'query'), controllers.githubPrDiffController.fetchPRDiff);

module.exports = router;

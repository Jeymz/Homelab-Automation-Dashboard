const express = require('express');
const controller = require('../controllers').github;
const { validate } = require('../middleware');

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

router.get('/prs', validate(prListSchema, 'query'), controller.getPRs);
router.get('/pr-diff', validate(prDiffSchema, 'query'), controller.getPRDiff);

module.exports = router;

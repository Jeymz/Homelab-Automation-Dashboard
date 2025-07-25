const express = require('express');
const controller = require('../controllers').gitlab;

const router = express.Router();

router.get('/users', controller.getUsers);
router.get('/pipeline-status', controller.getPipelineStatuses);
router.post('/automerge', controller.postAutomerge);
router.get('/assigned-mrs', controller.getAssignedMergeRequests);

module.exports = router;

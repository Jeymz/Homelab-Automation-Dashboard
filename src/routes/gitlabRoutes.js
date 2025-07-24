const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

router.get('/users', controllers.gitlabUsersController.getGitlabUsers);
router.get('/pipeline-status', controllers.gitlabPipelineController.getPipelineStatusTable);
router.post('/automerge', controllers.gitlabAutomergeController.runAutomergeAndGetMRs);
router.get('/assigned-mrs', controllers.gitlabAssignedMrController.getAssignedMrs);

module.exports = router;

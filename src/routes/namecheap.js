const express = require('express');
const controller = require('../controllers').namecheap;

const router = express.Router();

router.get('/domains', controller.getDomains);

module.exports = router;

const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

router.get('/domains', controllers.namecheapDomainsController.getNamecheapDomainsTable);

module.exports = router;

const express = require('express');
const controller = require('../controllers').azure;
const { validate } = require('../middleware');

const router = express.Router();

const recordsSchema = {
  type: 'object',
  properties: {
    resourceGroup: { type: 'string', minLength: 1 },
    zoneName: { type: 'string', minLength: 1 },
    all: { type: 'string' },
  },
  required: ['resourceGroup', 'zoneName'],
  additionalProperties: false,
};

router.get('/dns-zones', controller.getDNSZones);
router.get('/dns-zones/records', validate(recordsSchema, 'query'), controller.getDNSZones_Records);

module.exports = router;

const express = require('express');
const controllers = require('../controllers');
const validate = require('../middleware/validate');

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

router.get('/dns-zones', controllers.azureDnsZonesController.getDnsZonesTable);
router.get('/dns-zones/records', validate(recordsSchema, 'query'), controllers.azureDnsZoneRecordsController.getDnsZoneRecordCount);

module.exports = router;

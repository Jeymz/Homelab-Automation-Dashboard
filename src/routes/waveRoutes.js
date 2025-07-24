const express = require('express');
const controllers = require('../controllers');
const validate = require('../middleware/validate');

const router = express.Router();

const invoiceSchema = {
  type: 'object',
  properties: {
    customerId: { type: 'string', minLength: 1 },
  },
  required: ['customerId'],
  additionalProperties: false,
};

router.get('/customers', controllers.waveCustomersController.getWaveCustomersTable);
router.get('/customers/:customerId/invoices', validate(invoiceSchema, 'params'), controllers.waveCustomersController.getWaveCustomerInvoices);

module.exports = router;

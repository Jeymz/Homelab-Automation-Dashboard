const express = require('express');
const controller = require('../controllers').wave;
const { validate } = require('../middleware');

const router = express.Router();

const invoiceSchema = {
  type: 'object',
  properties: {
    customerId: { type: 'string', minLength: 1 },
  },
  required: ['customerId'],
  additionalProperties: false,
};

router.get('/customers', controller.getCustomers);
router.get('/customers/:customerId/invoices', validate(invoiceSchema, 'params'), controller.getCustomer_invoices);

module.exports = router;

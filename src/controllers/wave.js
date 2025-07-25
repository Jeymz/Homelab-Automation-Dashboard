const service = require('../services').wave;

exports.getCustomer_invoices = async function getCustomer_invoices(req, res) {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    if (!customerId) return res.status(400).json({ success: false, error: 'Missing customerId' });
    const { invoices, pageInfo } = await service.getCustomerInvoices(customerId, page, 5);
    return res.json({ success: true, data: invoices, pageInfo });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

exports.getCustomers = async function getCustomers(req, res) {
  try {
    const customers = await service.getCustomers();
    res.json({ success: true, data: customers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

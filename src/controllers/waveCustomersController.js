const waveService = require('../services/waveService');

async function getWaveCustomerInvoices(req, res) {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    if (!customerId) return res.status(400).json({ success: false, error: 'Missing customerId' });
    const { invoices, pageInfo } = await waveService.listWaveCustomerInvoices(customerId, page, 5);
    return res.json({ success: true, data: invoices, pageInfo });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

async function getWaveCustomersTable(req, res) {
  try {
    const customers = await waveService.listWaveCustomers();
    res.json({ success: true, data: customers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  getWaveCustomersTable,
  getWaveCustomerInvoices,
};

const namecheapService = require('../services/namecheapService');

async function getNamecheapDomainsTable(req, res) {
  try {
    const domains = await namecheapService.listNamecheapDomains();
    res.json({ success: true, data: domains });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { getNamecheapDomainsTable };

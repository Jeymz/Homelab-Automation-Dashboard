const azureDnsService = require('../services/azureDnsService');

async function getDnsZonesTable(req, res) {
  try {
    const zones = await azureDnsService.listDnsZonesWithTags();
    return res.json({ success: true, data: zones });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { getDnsZonesTable };

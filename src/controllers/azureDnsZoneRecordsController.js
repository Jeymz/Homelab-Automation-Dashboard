const azureDnsService = require('../services/azureDnsService');

async function getDnsZoneRecordCount(req, res) {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const { resourceGroup, zoneName, all } = req.query;
  if (!subscriptionId || !resourceGroup || !zoneName) {
    return res.status(400).json({ success: false, error: 'Missing subscriptionId, resourceGroup, or zoneName' });
  }
  try {
    const result = await azureDnsService.getDnsZoneRecordData(subscriptionId, resourceGroup, zoneName, all);
    return res.json({ success: true, ...result });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { getDnsZoneRecordCount };

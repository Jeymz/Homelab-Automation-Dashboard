const service = require('../services').azure;

exports.getDNSZones = async function getDNSZones(req, res) {
  try {
    const zones = await service.getDNSZones();
    return res.json({ success: true, data: zones });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

exports.getDNSZones_Records = async function getDNSZonesRecords(req, res) {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const { resourceGroup, zoneName, all } = req.query;
  if (!subscriptionId || !resourceGroup || !zoneName) {
    return res.status(400).json({ success: false, error: 'Missing subscriptionId, resourceGroup, or zoneName' });
  }
  try {
    const result = await service.getDNSZoneRecords(subscriptionId, resourceGroup, zoneName, all);
    return res.json({ success: true, ...result });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

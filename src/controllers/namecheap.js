const service = require('../services').namecheap;

exports.getDomains = async function getDomains(req, res) {
  try {
    const domains = await service.getDomains();
    res.json({ success: true, data: domains });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

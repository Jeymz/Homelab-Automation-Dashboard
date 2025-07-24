const { DefaultAzureCredential } = require('@azure/identity');
const { DnsManagementClient } = require('@azure/arm-dns');

/**
 * Fetch all DNS zones from Azure and their tags.
 * Requires AZURE_SUBSCRIPTION_ID and AZURE_BEARER_TOKEN in environment variables.
 * @returns {Promise<Array<{ name: string, resourceGroup: string, tags: object }>>}
 */
async function listDnsZonesWithTags() {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    throw new Error('AZURE_SUBSCRIPTION_ID must be set in environment variables.');
  }
  const credential = new DefaultAzureCredential();
  const client = new DnsManagementClient(credential, subscriptionId);
  const zones = [];
  const subscriptionIdForUrl = subscriptionId; // for frontend portal link
  for await (const zone of client.zones.list()) {
    zones.push({
      name: zone.name,
      resourceGroup: zone.id.split('/')[4],
      tags: zone.tags || {},
      subscriptionId: subscriptionIdForUrl,
    });
  }
  return zones;
}

/**
 * Express handler to return DNS zones and tags as a table.
 */
async function getDnsZonesTable(req, res) {
  try {
    const zones = await listDnsZonesWithTags();
    res.json({ success: true, data: zones });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  listDnsZonesWithTags,
  getDnsZonesTable,
};

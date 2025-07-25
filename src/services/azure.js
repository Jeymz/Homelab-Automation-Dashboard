const { DefaultAzureCredential } = require('@azure/identity');
const { DnsManagementClient } = require('@azure/arm-dns');

exports.getDNSZones = async function getDNSZones() {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    throw new Error('AZURE_SUBSCRIPTION_ID must be set in environment variables.');
  }
  const credential = new DefaultAzureCredential();
  const client = new DnsManagementClient(credential, subscriptionId);
  const zones = [];
  const subscriptionIdForUrl = subscriptionId;
  for await (const zone of client.zones.list()) {
    zones.push({
      name: zone.name,
      resourceGroup: zone.id.split('/')[4],
      tags: zone.tags || {},
      subscriptionId: subscriptionIdForUrl,
    });
  }
  return zones;
};

exports.getDNSZoneRecords = async function listDnsZoneRecords(subscriptionId, resourceGroup, zoneName, all) {
  const credential = new DefaultAzureCredential();
  const client = new DnsManagementClient(credential, subscriptionId);
  if (all) {
    const records = [];
    for await (const record of client.recordSets.listByDnsZone(resourceGroup, zoneName)) {
      let values = [];
      if (record.aRecords) values = record.aRecords.map(r => r.ipv4Address);
      else if (record.aaaaRecords) values = record.aaaaRecords.map(r => r.ipv6Address);
      else if (record.cnameRecord) values = [record.cnameRecord.cname];
      else if (record.mxRecords) values = record.mxRecords.map(r => `${r.preference} ${r.exchange}`);
      else if (record.txtRecords) values = record.txtRecords.flatMap(r => r.value);
      else if (record.nsRecords) values = record.nsRecords.map(r => r.nsdname);
      else if (record.srvRecords) values = record.srvRecords.map(r => `${r.priority} ${r.weight} ${r.port} ${r.target}`);
      else if (record.ptrRecords) values = record.ptrRecords.map(r => r.ptrdname);
      else if (record.soaRecord) values = [record.soaRecord.host];
      else if (record.caaRecords) values = record.caaRecords.map(r => `${r.flags} ${r.tag} ${r.value}`);
      else if (record.aliasRecords) values = record.aliasRecords.map(r => r.azureResourceName);
      records.push({
        name: record.name,
        type: record.type.split('/').pop(),
        ttl: record.ttl,
        values,
      });
    }
    return { records };
  }
  let count = 0;
  const iterator = client.recordSets.listByDnsZone(resourceGroup, zoneName)[Symbol.asyncIterator]();
  while (true) {
    const { done } = await iterator.next();
    if (done) break;
    count++;
  }
  return { count };
};

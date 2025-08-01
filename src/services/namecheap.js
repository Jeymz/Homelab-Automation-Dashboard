const axios = require('axios');
const { parseStringPromise } = require('xml2js');

exports.getDomains = async function getDomains() {
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const username = process.env.NAMECHEAP_USERNAME;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP;
  if (!apiUser || !apiKey || !username || !clientIp) {
    throw new Error('NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME, and NAMECHEAP_CLIENT_IP must be set in environment variables.');
  }
  const url = 'https://api.namecheap.com/xml.response';
  const params = {
    ApiUser: apiUser,
    ApiKey: apiKey,
    UserName: username,
    ClientIp: clientIp,
    Command: 'namecheap.domains.getList',
    PageSize: 100,
    Page: 1,
  };
  const response = await axios.get(url, { params });
  const xml = response.data;
  const result = await parseStringPromise(xml);
  const domains =
    result.ApiResponse &&
    result.ApiResponse.CommandResponse &&
    result.ApiResponse.CommandResponse[0].DomainGetListResult &&
    result.ApiResponse.CommandResponse[0].DomainGetListResult[0].Domain
      ? result.ApiResponse.CommandResponse[0].DomainGetListResult[0].Domain
      : [];
  return domains.map(d => ({
    domain: d.$.Name,
    expires: d.$.Expires,
    created: d.$.Created,
    isExpired: d.$.IsExpired === 'true',
    autoRenew: d.$.AutoRenew === 'true',
    isLocked: d.$.IsLocked === 'true',
    whoisGuard: d.$.WhoisGuard,
    isPremium: d.$.IsPremium === 'true',
    isOurDNS: d.$.IsOurDNS === 'true',
  }));
};

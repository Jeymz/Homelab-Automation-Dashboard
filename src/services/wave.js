const axios = require('axios');

exports.getCustomerInvoices = async function getCustomerInvoices(customerId, page = 1, pageSize = 5) {
  const apiKey = process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!apiKey || !businessId) {
    throw new Error('WAVE_API_KEY and WAVE_BUSINESS_ID must be set in environment variables.');
  }
  const url = 'https://gql.waveapps.com/graphql/public';
  const query = `query ($businessId: ID!, $customerId: ID!, $page: Int!, $pageSize: Int!) {
    business(id: $businessId) {
      invoices(page: $page, pageSize: $pageSize, customerId: $customerId) {
        pageInfo { currentPage totalPages totalCount }
        edges { node { id invoiceNumber status total { value currency { code } } createdAt viewUrl } }
      }
    }
  }`;
  const variables = { businessId, customerId, page, pageSize };
  const response = await axios.post(url, { query, variables }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const invoicesData = response.data.data.business && response.data.data.business.invoices;
  const invoices = invoicesData && invoicesData.edges ? invoicesData.edges.map(edge => {
    const n = edge.node;
    return {
      id: n.id,
      invoiceNumber: n.invoiceNumber,
      status: n.status,
      total: n.total ? n.total.value : '',
      currency: n.total && n.total.currency ? n.total.currency.code : '',
      createdAt: n.createdAt,
      viewUrl: n.viewUrl,
    };
  }) : [];
  const pageInfo = invoicesData && invoicesData.pageInfo ? invoicesData.pageInfo : { currentPage: 1, totalPages: 1, totalCount: invoices.length };
  return { invoices, pageInfo };
};

exports.getCustomers = async function getCustomers() {
  const apiKey = process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!apiKey || !businessId) {
    throw new Error('WAVE_API_KEY and WAVE_BUSINESS_ID must be set in environment variables.');
  }
  const url = 'https://gql.waveapps.com/graphql/public';
  const query = `query ($businessId: ID!) {
    business(id: $businessId) {
      customers(page: 1, pageSize: 100) { edges { node { id name email } } }
    }
  }`;
  const response = await axios.post(url, { query, variables: { businessId } }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const customers = (response.data.data.business && response.data.data.business.customers && response.data.data.business.customers.edges)
    ? response.data.data.business.customers.edges.map(edge => ({ id: edge.node.id, name: edge.node.name, email: edge.node.email }))
    : [];
  return customers;
};

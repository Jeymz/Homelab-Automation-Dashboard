/**
 * Fetch invoices for a specific customer from WaveApps.
 * @param {string} customerId
 * @returns {Promise<Array<{ id: string, invoiceNumber: string, status: string, total: string, currency: string, createdAt: string }>>}
 */
async function listWaveCustomerInvoices(customerId, page = 1, pageSize = 5) {
  const apiKey = process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!apiKey || !businessId) {
    throw new Error('WAVE_API_KEY and WAVE_BUSINESS_ID must be set in environment variables.');
  }
  const url = 'https://gql.waveapps.com/graphql/public';
  const query = `query ($businessId: ID!, $customerId: ID!, $page: Int!, $pageSize: Int!) {
    business(id: $businessId) {
      invoices(page: $page, pageSize: $pageSize, customerId: $customerId) {
        pageInfo {
          currentPage
          totalPages
          totalCount
        }
        edges {
          node {
            id
            invoiceNumber
            status
            total {
              value
              currency {
                code
              }
            }
            createdAt
            viewUrl
          }
        }
      }
    }
  }`;
  const variables = { businessId, customerId, page, pageSize };
  const response = await axios.post(url, {
    query,
    variables,
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const invoicesData = response.data.data.business && response.data.data.business.invoices;
  const invoices = (invoicesData && invoicesData.edges)
    ? invoicesData.edges.map(edge => {
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
      })
    : [];
  const pageInfo = invoicesData && invoicesData.pageInfo ? invoicesData.pageInfo : { currentPage: 1, totalPages: 1, totalCount: invoices.length };
  return { invoices, pageInfo };
}

/**
 * Express handler to return invoices for a given customer.
 */
async function getWaveCustomerInvoices(req, res) {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    if (!customerId) return res.status(400).json({ success: false, error: 'Missing customerId' });
    const { invoices, pageInfo } = await listWaveCustomerInvoices(customerId, page, 5);
    return res.json({ success: true, data: invoices, pageInfo });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
const axios = require('axios');

/**
 * Fetch all customers from WaveApps.
 * Requires WAVE_API_KEY and WAVE_BUSINESS_ID in env.
 * @returns {Promise<Array<{ id: string, name: string, email: string, address: string, phone: string }>>}
 */
async function listWaveCustomers() {
  const apiKey = process.env.WAVE_API_KEY;
  const businessId = process.env.WAVE_BUSINESS_ID;
  if (!apiKey || !businessId) {
    throw new Error('WAVE_API_KEY and WAVE_BUSINESS_ID must be set in environment variables.');
  }
  const url = 'https://gql.waveapps.com/graphql/public';
  const query = `query ($businessId: ID!) {
    business(id: $businessId) {
      customers(page: 1, pageSize: 100) {
        edges {
          node {
            id
            name
            email
          }
        }
      }
    }
  }`;
  const response = await axios.post(url, {
    query,
    variables: { businessId },
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const customers = (response.data.data.business && response.data.data.business.customers && response.data.data.business.customers.edges)
    ? response.data.data.business.customers.edges.map(edge => {
        const c = edge.node;
        return {
          id: c.id,
          name: c.name,
          email: c.email,
        };
      })
    : [];
  return customers;
}

/**
 * Express handler to return Wave customers as a table.
 */
async function getWaveCustomersTable(req, res) {
  try {
    const customers = await listWaveCustomers();
    res.json({ success: true, data: customers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  listWaveCustomers,
  getWaveCustomersTable,
  listWaveCustomerInvoices,
  getWaveCustomerInvoices,
};

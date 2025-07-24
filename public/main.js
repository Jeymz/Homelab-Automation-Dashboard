let pipelineStatusInterval = null;
let pipelineStatusCountdownInterval = null;
let foreverActive = false;
let secondsToNextRefresh = 60;

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabSections = {
    code: document.getElementById('tab-code'),
    networking: document.getElementById('tab-networking'),
    finance: document.getElementById('tab-finance'),
  };
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.keys(tabSections).forEach(key => {
        tabSections[key].style.display = btn.dataset.tab === key ? '' : 'none';
      });
    });
  });
}

async function runPipelineStatus(forever = false) {
  if (pipelineStatusInterval) {
    clearInterval(pipelineStatusInterval);
    pipelineStatusInterval = null;
  }
  if (pipelineStatusCountdownInterval) {
    clearInterval(pipelineStatusCountdownInterval);
    pipelineStatusCountdownInterval = null;
  }
  foreverActive = forever;
  updateForeverUI();
  if (foreverActive) {
    secondsToNextRefresh = 60;
    await fetchAndRenderAndStartCountdown();
  } else {
    await fetchAndRender();
  }
}

async function fetchAndRenderAndStartCountdown() {
  await fetchAndRender();
  startCountdown();
}

async function fetchAndRender() {
  const outputDiv = document.getElementById('output');
  if (!foreverActive) {
    outputDiv.innerHTML = '<span class="loading">Running... <span class="spinner"></span></span>';
  } else if (!outputDiv.innerHTML.trim() || !outputDiv.innerHTML.includes('<table')) {
    outputDiv.innerHTML = '<span class="loading">Loading pipeline status... <span class="spinner"></span></span>';
  }
  try {
    const res = await fetch('/api/gitlab/pipeline-status');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      outputDiv.innerHTML = renderPipelineTable(result.data);
      if (foreverActive) {
        outputDiv.innerHTML += renderCountdown();
      }
      attachOutputEvents();
    } else if (result.success) {
      outputDiv.textContent = JSON.stringify(result.data, null, 2);
    } else {
      outputDiv.textContent = result.error + (result.raw ? '\n' + result.raw : '');
    }
  } catch (e) {
    console.error('Pipeline status error:', e); // eslint-disable-line no-console
    outputDiv.textContent = 'Error running pipeline status.';
  }
}

function startCountdown() {
  if (pipelineStatusCountdownInterval) clearInterval(pipelineStatusCountdownInterval);
  pipelineStatusCountdownInterval = setInterval(async () => {
    secondsToNextRefresh--;
    const countdownDiv = document.getElementById('refresh-countdown');
    if (countdownDiv) {
      countdownDiv.innerHTML = `Next refresh in <b>${secondsToNextRefresh}</b> seconds`;
    }
    if (secondsToNextRefresh <= 0) {
      clearInterval(pipelineStatusCountdownInterval);
      pipelineStatusCountdownInterval = null;
      secondsToNextRefresh = 60;
      await fetchAndRenderAndStartCountdown();
    }
  }, 1000);
}

function stopForever() {
  foreverActive = false;
  if (pipelineStatusInterval) {
    clearInterval(pipelineStatusInterval);
    pipelineStatusInterval = null;
  }
  if (pipelineStatusCountdownInterval) {
    clearInterval(pipelineStatusCountdownInterval);
    pipelineStatusCountdownInterval = null;
  }
  updateForeverUI();
  // Remove countdown div if present (DOM-safe)
  const countdownDiv = document.getElementById('refresh-countdown');
  if (countdownDiv && countdownDiv.parentNode) {
    countdownDiv.parentNode.removeChild(countdownDiv);
  }
}

function updateForeverUI() {
  const stopBtn = document.getElementById('stop-forever-btn');
  if (foreverActive) {
    stopBtn.style.display = '';
  } else {
    stopBtn.style.display = 'none';
  }
}

async function runAutomerge() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '<span class="loading">Running... <span class="spinner"></span></span>';
  try {
    const res = await fetch('/api/gitlab/automerge', { method: 'POST' });
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      outputDiv.innerHTML = renderAutomergeTable(result.data);
      attachOutputEvents();
    } else if (result.success) {
      outputDiv.textContent = JSON.stringify(result.data, null, 2);
    } else {
      outputDiv.textContent = result.error + (result.raw ? '\n' + result.raw : '');
    }
  } catch {
    outputDiv.textContent = 'Error running automerge.';
  }
}

function renderPipelineTable(data) {
  if (!data.length) return '<em>No pipelines in progress.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Project</th><th>Pipeline ID</th><th>Status</th><th>Completion</th><th>Jobs</th><th>Link</th></tr></thead><tbody>`;
  for (const row of data) {
    html += `<tr>`;
    html += `<td>${row.project || ''}</td>`;
    html += `<td>${row.pipelineId || ''}</td>`;
    html += `<td>${row.status || ''}</td>`;
    html += `<td>${row.completion !== null && row.completion !== undefined ? row.completion + '%' : '-'}</td>`;
    html += `<td>${Array.isArray(row.jobs) ? row.jobs.map(j => `${j.name || ''} <span style='color:${jobColor(j.status)}'>[${j.status || ''}]</span>`).join('<br>') : ''}</td>`;
    html += `<td>`;
    if (row.webUrl) {
      html += `<button class="script-btn open-external" data-href="${row.webUrl}">View</button>`;
    } else {
      html += '-';
    }
    html += `</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderAutomergeTable(data) {
  if (!data.length) return '<em>No merge requests were created.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Project</th><th>Source</th><th>Target</th><th>MR ID</th><th>Title</th><th>Link</th></tr></thead><tbody>`;
  for (const row of data) {
    html += `<tr>`;
    html += `<td>${row.project}</td>`;
    html += `<td>${row.source}</td>`;
    html += `<td>${row.target}</td>`;
    html += `<td>${row.mrId !== null ? row.mrId : '-'}</td>`;
    html += `<td>${row.title || ''}</td>`;
    html += `<td>${row.mrUrl ? `<a href="${row.mrUrl}" target="_blank">View MR</a>` : '-'}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function jobColor(status) {
  if (status === 'success') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'running') return '#4fc3f7'; // light blue
  if (status === 'pending') return 'yellow';
  if (status === 'created') return 'pink';
  return 'black';
}

function attachOutputEvents() {
  const output = document.getElementById('output');
  output.querySelectorAll('.open-external').forEach(btn => {
    const href = btn.dataset.href;
    btn.addEventListener('click', () => window.open(href, '_blank'));
  });
  output.querySelectorAll('.view-pr-diff-btn').forEach(btn => {
    const pr = btn.dataset.pr;
    btn.addEventListener('click', () => showPrDiff(pr));
  });
  output.querySelectorAll('.back-to-pr-list-btn').forEach(btn => {
    btn.addEventListener('click', backToPrList);
  });
  output.querySelectorAll('.toggle-zone-records-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleAzureZoneRecords(btn.dataset.group, btn.dataset.zone, btn.dataset.zoneid);
    });
  });
}
function setActiveAutomationButton(btnId) {
  const allBtns = document.querySelectorAll('.script-btn');
  allBtns.forEach(btn => btn.classList.remove('active-automation'));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active-automation');
}

document.getElementById('pipeline-status-btn').addEventListener('click', () => {
  setActiveAutomationButton('pipeline-status-btn');
  stopForever();
  runPipelineStatus(false);
});
document.getElementById('pipeline-status-forever-btn').addEventListener('click', () => {
  setActiveAutomationButton('pipeline-status-forever-btn');
  runPipelineStatus(true);
});
document.getElementById('stop-forever-btn').addEventListener('click', stopForever);
document.getElementById('automerge-btn').addEventListener('click', () => {
  setActiveAutomationButton('automerge-btn');
  runAutomerge();
});

// --- GitHub PR Diff UI ---
const githubPrState = { owner: '', repo: '', prs: [], prDiff: null };

function showGithubPrForm() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = `
    <form id="github-pr-form" style="margin-bottom:1.5em;">
      <label style="display:block;margin-bottom:0.5em;">GitHub Owner: <input type="text" id="gh-owner" style="margin-left:0.5em;" required></label>
      <label style="display:block;margin-bottom:0.5em;">Repository: <input type="text" id="gh-repo" style="margin-left:0.5em;" required></label>
      <button type="submit" class="script-btn" style="margin-top:1em;">List Open PRs</button>
    </form>
    <div id="github-pr-list"></div>
  `;
  document.getElementById('github-pr-form').onsubmit = async (e) => {
    e.preventDefault();
    const owner = document.getElementById('gh-owner').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();
    if (!owner || !repo) return;
    githubPrState.owner = owner;
    githubPrState.repo = repo;
    // Hide the form after submit
    document.getElementById('github-pr-form').style.display = 'none';
    await fetchAndShowPrs(owner, repo);
  };
}

async function fetchAndShowPrs(owner, repo) {
  const prListDiv = document.getElementById('github-pr-list');
  prListDiv.innerHTML = '<span class="loading">Loading PRs...<span class="spinner"></span></span>';
  try {
    const res = await fetch(`/api/github/prs?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      githubPrState.prs = result.data;
      prListDiv.innerHTML = renderPrList(result.data);
      attachOutputEvents();
    } else {
      prListDiv.innerHTML = `<span class="loading">${result.error || 'Failed to load PRs.'}</span>`;
    }
  } catch {
    prListDiv.innerHTML = '<span class="loading">Error loading PRs.</span>';
  }
}

function renderPrList(prs) {
  if (!prs.length) return '<em>No open PRs found.</em>';
  let html = `<table><thead><tr><th>PR #</th><th>Title</th><th>Author</th><th>View Diff</th></tr></thead><tbody>`;
  for (const pr of prs) {
    html += `<tr>`;
    html += `<td>${pr.number}</td>`;
    html += `<td>${pr.title}</td>`;
    html += `<td>${pr.user && pr.user.login ? pr.user.login : ''}</td>`;
    html += `<td><button class="script-btn view-pr-diff-btn" data-pr="${pr.number}">View Diff</button></td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

async function showPrDiff(prNumber) {
  const prListDiv = document.getElementById('github-pr-list');
  prListDiv.innerHTML = '<span class="loading">Loading diff...<span class="spinner"></span></span>';
  try {
    const res = await fetch(`/api/github/pr-diff?owner=${encodeURIComponent(githubPrState.owner)}&repo=${encodeURIComponent(githubPrState.repo)}&prNumber=${prNumber}`);
    const result = await res.json();
    if (result.success && result.data && result.data.fileDiffs) {
      githubPrState.prDiff = result.data;
      prListDiv.innerHTML = renderPrDiff(result.data, prNumber);
      attachOutputEvents();
    } else {
      prListDiv.innerHTML = `<span class="loading">${result.error || 'Failed to load diff.'}</span>`;
    }
  } catch {
    prListDiv.innerHTML = '<span class="loading">Error loading diff.</span>';
  }
}

function renderPrDiff(data, prNumber) {
  let html = `<button class="script-btn back-to-pr-list-btn">Back to PR List</button>`;
  html += `<h3 style="margin-top:1em;">Diff for PR #${prNumber}</h3>`;
  if (!data.fileDiffs || (typeof data.fileDiffs === 'object' && Object.keys(data.fileDiffs).length === 0)) {
    html += '<em>No diff data found for this PR.</em>';
    return html;
  }
  // Handle string diffs (raw .diff)
  if (typeof data.fileDiffs === 'string') {
    html += `<pre style="background:#181c20;color:#e0e0e0;padding:1em;border-radius:6px;overflow-x:auto;">${escapeHtml(data.fileDiffs)}</pre>`;
    return html;
  }
  // Handle object diffs (per-file)
  for (const [filename, diff] of Object.entries(data.fileDiffs)) {
    html += `<div style="margin:1.5em 0;">
      <div style="font-weight:bold;color:#4fc3f7;">${filename}</div>
      <pre style="background:#181c20;color:#e0e0e0;padding:1em;border-radius:6px;overflow-x:auto;">${escapeHtml(diff)}</pre>
    </div>`;
  }
  return html;
}

function backToPrList() {
  const prListDiv = document.getElementById('github-pr-list');
  prListDiv.innerHTML = renderPrList(githubPrState.prs);
  attachOutputEvents();
}

function escapeHtml(text) {
  return text.replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
}

document.getElementById('github-pr-diff-btn').addEventListener('click', () => {
  setActiveAutomationButton('github-pr-diff-btn');
  showGithubPrForm();
});

// --- GitLab Assigned MRs UI ---
document.getElementById('gitlab-assigned-mrs-btn').addEventListener('click', () => {
  setActiveAutomationButton('gitlab-assigned-mrs-btn');
  showGitlabAssignedMrsForm();
});

// --- Azure DNS Zones UI ---
document.getElementById('azure-dns-zones-btn').addEventListener('click', () => {
  setActiveAutomationButton('azure-dns-zones-btn');
  fetchAndShowAzureDnsZones();
});

// --- Namecheap Domains UI ---

document.getElementById('namecheap-domains-btn').addEventListener('click', () => {
  setActiveAutomationButton('namecheap-domains-btn');
  fetchAndShowNamecheapDomains();
});

// --- Wave Customers UI ---
document.getElementById('wave-customers-btn').addEventListener('click', () => {
  setActiveAutomationButton('wave-customers-btn');
  fetchAndShowWaveCustomers();
});

async function fetchAndShowWaveCustomers() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '<span class="loading">Loading Wave customers... <span class="spinner"></span></span>';
  try {
    const res = await fetch('/api/wave/customers');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      outputDiv.innerHTML = renderWaveCustomersTable(result.data);
      // Attach event listeners for invoice buttons
      document.querySelectorAll('.wave-list-invoices-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const customerId = this.dataset.customerId;
          const row = this.closest('tr');
          const nextRow = row.nextElementSibling;
          // Toggle: if already open, close and reset button text
          if (nextRow && nextRow.classList.contains('wave-invoice-row')) {
            nextRow.remove();
            this.textContent = 'List Invoices';
            return;
          }
          // Otherwise, open and set button text to 'Hide Invoices'
          this.textContent = 'Hide Invoices';
          // Helper to fetch and render a page of invoices
          async function fetchAndRenderInvoicesPage(page = 1) {
            const invoiceRow = row.nextElementSibling && row.nextElementSibling.classList.contains('wave-invoice-row')
              ? row.nextElementSibling
              : document.createElement('tr');
            invoiceRow.className = 'wave-invoice-row';
            invoiceRow.innerHTML = `<td colspan="3"><span class='loading'>Loading invoices... <span class='spinner'></span></span></td>`;
            if (!row.nextElementSibling || !row.nextElementSibling.classList.contains('wave-invoice-row')) {
              row.parentNode.insertBefore(invoiceRow, row.nextSibling);
            }
            try {
              const resp = await fetch(`/api/wave/customers/${customerId}/invoices?page=${page}`);
              const data = await resp.json();
              if (data.success && Array.isArray(data.data)) {
                invoiceRow.innerHTML = `<td colspan="3">${renderWaveInvoicesTable(data.data)}${renderWaveInvoicesPagination(data.pageInfo, page)}</td>`;
                // Attach pagination event listeners
                invoiceRow.querySelectorAll('.wave-invoice-page-btn').forEach(pbtn => {
                  pbtn.addEventListener('click', function() {
                    const newPage = parseInt(this.dataset.page, 10);
                    fetchAndRenderInvoicesPage(newPage);
                  });
                });
              } else {
                invoiceRow.innerHTML = `<td colspan="3">${data.error || 'Failed to load invoices.'}</td>`;
              }
            } catch {
              invoiceRow.innerHTML = `<td colspan="3">Error loading invoices.</td>`;
            }
          }
          fetchAndRenderInvoicesPage(1);
        });
      });
    }
  } catch {
    outputDiv.textContent = 'Error loading Wave customers.';
  }
}
function renderWaveInvoicesPagination(pageInfo, currentPage) {
  if (!pageInfo || pageInfo.totalPages <= 1) return '';
  let html = '<div style="margin-top:8px;text-align:center;">';
  // Prev button
  if (currentPage > 1) {
    html += `<button class="script-btn wave-invoice-page-btn" data-page="${currentPage - 1}">&laquo; Prev</button> `;
  }
  // Page number buttons
  for (let i = 1; i <= pageInfo.totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="script-btn wave-invoice-page-btn" data-page="${i}" style="font-weight:bold;background:#1976d2;color:#fff;">${i}</button> `;
    } else {
      html += `<button class="script-btn wave-invoice-page-btn" data-page="${i}">${i}</button> `;
    }
  }
  // Next button
  if (currentPage < pageInfo.totalPages) {
    html += `<button class="script-btn wave-invoice-page-btn" data-page="${currentPage + 1}">Next &raquo;</button>`;
  }
  html += `<span style="margin-left:12px;color:#b0b0b0;">Page ${currentPage} of ${pageInfo.totalPages} (${pageInfo.totalCount} invoices)</span>`;
  html += '</div>';
  return html;
}

function renderWaveCustomersTable(customers) {
  if (!customers.length) return '<em>No customers found.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>`;
  for (const c of customers) {
    html += `<tr>`;
    html += `<td>${c.name}</td>`;
    html += `<td>${c.email || '-'}</td>`;
    html += `<td><button class="script-btn wave-list-invoices-btn" data-customer-id="${c.id}">List Invoices</button></td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderWaveInvoicesTable(invoices) {
  if (!invoices.length) return '<em>No invoices found for this customer.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Invoice #</th><th>Status</th><th>Total</th><th>Currency</th><th>Created</th></tr></thead><tbody>`;
  for (const inv of invoices) {
    html += `<tr>`;
    html += `<td>${inv.viewUrl ? `<a href='${inv.viewUrl}' target='_blank' rel='noopener'>${inv.invoiceNumber}</a>` : inv.invoiceNumber}</td>`;
    html += `<td>${inv.status}</td>`;
    html += `<td>${inv.total}</td>`;
    html += `<td>${inv.currency}</td>`;
    html += `<td>${inv.createdAt ? inv.createdAt.split('T')[0] : ''}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

async function fetchAndShowNamecheapDomains() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '<span class="loading">Loading Namecheap domains... <span class="spinner"></span></span>';
  try {
    const res = await fetch('/api/namecheap/domains');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      outputDiv.innerHTML = renderNamecheapDomainsTable(result.data);
      attachOutputEvents();
    } else if (result.success) {
      outputDiv.textContent = JSON.stringify(result.data, null, 2);
    } else {
      outputDiv.textContent = result.error || 'Failed to load Namecheap domains.';
    }
  } catch {
    outputDiv.textContent = 'Error loading Namecheap domains.';
  }
}

function renderNamecheapDomainsTable(domains) {
  if (!domains.length) return '<em>No Namecheap domains found.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Domain</th><th>Created</th><th>Expires</th><th>Expired?</th><th>Auto Renew</th><th>Locked?</th><th>WhoisGuard</th><th>Premium?</th><th>Our DNS?</th><th>Namecheap Link</th></tr></thead><tbody>`;
  for (const d of domains) {
    html += `<tr>`;
    html += `<td>${d.domain}</td>`;
    html += `<td>${d.created}</td>`;
    html += `<td>${d.expires}</td>`;
    html += `<td>${d.isExpired ? 'Yes' : 'No'}</td>`;
    html += `<td>${d.autoRenew ? 'Yes' : 'No'}</td>`;
    html += `<td>${d.isLocked ? 'Yes' : 'No'}</td>`;
    html += `<td>${d.whoisGuard || '-'}</td>`;
    html += `<td>${d.isPremium ? 'Yes' : 'No'}</td>`;
    html += `<td>${d.isOurDNS ? 'Yes' : 'No'}</td>`;
    const ncUrl = `https://ap.www.namecheap.com/domains/domaincontrolpanel/${encodeURIComponent(d.domain)}/domain`;
    html += `<td><button class="script-btn open-external" data-href="${ncUrl}">Open in Namecheap</button></td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

async function fetchAndShowAzureDnsZones() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '<span class="loading">Loading Azure DNS zones... <span class="spinner"></span></span>';
  try {
    const res = await fetch('/api/azure/dns-zones');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      // Fetch record counts for each zone
      const zonesWithCounts = await Promise.all(result.data.map(async zone => {
        try {
          const recRes = await fetch(`/api/azure/dns-zones/records?resourceGroup=${encodeURIComponent(zone.resourceGroup)}&zoneName=${encodeURIComponent(zone.name)}`);
          const recResult = await recRes.json();
          return { ...zone, recordCount: recResult.success && typeof recResult.count === 'number' ? recResult.count : null };
        } catch {
          return { ...zone, recordCount: null };
        }
      }));
      outputDiv.innerHTML = renderAzureDnsZonesTable(zonesWithCounts);
      attachOutputEvents();
    } else if (result.success) {
      outputDiv.textContent = JSON.stringify(result.data, null, 2);
    } else {
      outputDiv.textContent = result.error || 'Failed to load Azure DNS zones.';
    }
  } catch {
    outputDiv.textContent = 'Error loading Azure DNS zones.';
  }
}

function renderAzureDnsZonesTable(zones) {
  if (!zones.length) return '<em>No DNS zones found.</em>';
  // Collect all unique tag keys
  const tagKeys = Array.from(new Set(zones.flatMap(z => Object.keys(z.tags || {}))));
  let html = `<table style="width:100%;border-collapse:collapse;">`;
  html += `<thead><tr><th>Name</th><th>Resource Group</th>`;
  for (const key of tagKeys) html += `<th>${key}</th>`;
  html += `<th>Record Count</th><th>Portal Link</th><th>Records</th></tr></thead><tbody>`;
  for (const zone of zones) {
    const zoneId = `zone-${encodeURIComponent(zone.resourceGroup)}-${encodeURIComponent(zone.name)}`;
    html += `<tr>`;
    html += `<td>${zone.name}</td>`;
    html += `<td>${zone.resourceGroup}</td>`;
    for (const key of tagKeys) html += `<td>${zone.tags && zone.tags[key] ? zone.tags[key] : '-'}</td>`;
    html += `<td>${zone.recordCount !== null && zone.recordCount !== undefined ? zone.recordCount : '-'}</td>`;
    const portalUrl = `https://portal.azure.com/#@/resource/subscriptions/${encodeURIComponent(zone.subscriptionId || (window.AZURE_SUBSCRIPTION_ID || ''))}/resourceGroups/${encodeURIComponent(zone.resourceGroup)}/providers/Microsoft.Network/dnszones/${encodeURIComponent(zone.name)}`;
    html += `<td><button class="script-btn open-external" data-href="${portalUrl}">Open in Portal</button></td>`;
    html += `<td><button class="script-btn toggle-zone-records-btn" id="${zoneId}-toggle-btn" data-group="${zone.resourceGroup}" data-zone="${zone.name}" data-zoneid="${zoneId}">Show Records</button></td>`;
    html += `</tr>`;
    html += `<tr id="${zoneId}-records-row" style="display:none;"><td colspan="${5 + tagKeys.length}"></td></tr>`;
  }
  html += `</tbody></table>`;
  return html;
}


async function toggleAzureZoneRecords(resourceGroup, zoneName, zoneId) {
  const row = document.getElementById(`${zoneId}-records-row`);
  const btn = document.getElementById(`${zoneId}-toggle-btn`);
  if (!row || !btn) return;
  if (row.style.display === '' || row.style.display === 'table-row') {
    row.style.display = 'none';
    btn.textContent = 'Show Records';
    row.firstElementChild.innerHTML = '';
    return;
  }
  row.style.display = '';
  btn.textContent = 'Hide Records';
  row.firstElementChild.innerHTML = '<span class="loading">Loading records... <span class="spinner"></span></span>';
  try {
    const res = await fetch(`/api/azure/dns-zones/records?resourceGroup=${encodeURIComponent(resourceGroup)}&zoneName=${encodeURIComponent(zoneName)}&all=1`);
    const result = await res.json();
    if (result.success && Array.isArray(result.records)) {
      row.firstElementChild.innerHTML = renderAzureZoneRecordsTable(result.records);
    } else {
      row.firstElementChild.innerHTML = result.error || 'Failed to load records.';
    }
  } catch {
    row.firstElementChild.innerHTML = 'Error loading records.';
  }
}

function renderAzureZoneRecordsTable(records) {
  if (!records.length) return '<em>No records found for this zone.</em>';
  let html = `<table style="width:100%;border-collapse:collapse;margin-top:1em;">`;
  html += `<thead><tr><th>Name</th><th>Type</th><th>TTL</th><th>Value(s)</th></tr></thead><tbody>`;
  for (const r of records) {
    html += `<tr>`;
    html += `<td>${r.name}</td>`;
    html += `<td>${r.type}</td>`;
    html += `<td>${r.ttl}</td>`;
    html += `<td>${Array.isArray(r.values) ? r.values.join('<br>') : (r.values || '-')}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

async function showGitlabAssignedMrsForm() {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = `<span class="loading">Loading GitLab users... <span class="spinner"></span></span>`;
  let users = [];
  try {
    const res = await fetch('/api/gitlab/users');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      users = result.data;
    } else {
      outputDiv.innerHTML = `<span class="loading">${result.error || 'Failed to load users.'}</span>`;
      return;
    }
  } catch {
    outputDiv.innerHTML = '<span class="loading">Error loading users.</span>';
    return;
  }
  // Render user table with button for each user, and prepare for sub-table rows
  outputDiv.innerHTML = `
    <h3>GitLab Users</h3>
    <table id="gitlab-users-table" style="width:100%;border-collapse:collapse;">
      <thead><tr><th>Name</th><th>Username</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => {
          const rowId = `gl-user-${u.username.replace(/[^a-zA-Z0-9_-]/g, '')}`;
          return `
            <tr id="${rowId}">
              <td>${u.name || ''}</td>
              <td>${u.username}</td>
              <td><button class="script-btn view-mrs-btn" data-username="${u.username}" data-rowid="${rowId}">View Assigned MRs</button></td>
            </tr>
            <tr id="${rowId}-mrs-row" style="display:none;"><td colspan="3"></td></tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  // Attach event listeners to buttons
  outputDiv.querySelectorAll('.view-mrs-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const username = btn.getAttribute('data-username');
      const rowId = btn.getAttribute('data-rowid');
      const subRow = document.getElementById(`${rowId}-mrs-row`);
      if (!subRow) return;
      // Toggle: if already open, close and reset button text
      if (subRow.style.display === '' || subRow.style.display === 'table-row') {
        subRow.style.display = 'none';
        subRow.firstElementChild.innerHTML = '';
        btn.textContent = 'View Assigned MRs';
        return;
      }
      // Otherwise, open and set button text to 'Hide Assigned MRs'
      btn.textContent = 'Hide Assigned MRs';
      subRow.style.display = '';
      subRow.firstElementChild.innerHTML = '<span class="loading">Loading assigned MRs... <span class="spinner"></span></span>';
      try {
        const res = await fetch(`/api/gitlab/assigned-mrs?username=${encodeURIComponent(username)}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          subRow.firstElementChild.innerHTML = `<h4 style='margin:0 0 0.5em 0;'>Assigned Merge Requests for <span style='color:#1976d2;'>${username}</span></h4>` + renderGitlabMrsTable(result.data);
        } else {
          subRow.firstElementChild.innerHTML = `<span class="loading">${result.error || 'Failed to load assigned MRs.'}</span>`;
        }
      } catch {
        subRow.firstElementChild.innerHTML = '<span class="loading">Error loading assigned MRs.</span>';
      }
    });
  });
}

function renderGitlabMrsTable(mrs) {
  if (!mrs.length) return '<em>No assigned merge requests found.</em>';
  let html = `<table style="table-layout:auto;width:100%;">
    <thead><tr>
      <th style="white-space:nowrap;">MR #</th>
      <th>Title</th>
      <th style="white-space:nowrap;">Group</th>
      <th style="white-space:nowrap;">Project Name</th>
      <th style="white-space:nowrap;">Author</th>
      <th>Link</th>
    </tr></thead><tbody>`;
  for (const mr of mrs) {
    html += `<tr>`;
    html += `<td style="white-space:nowrap;">${mr.iid}</td>`;
    html += `<td style="max-width:340px;overflow-x:auto;">${mr.title}</td>`;
    html += `<td style="white-space:nowrap;">${mr.project_group || ''}</td>`;
    html += `<td style="white-space:nowrap;">${mr.project_name || ''}</td>`;
    html += `<td style="white-space:nowrap;">${mr.author && mr.author.username ? mr.author.username : ''}</td>`;
    html += `<td>`;
    if (mr.web_url) {
      html += `<button class="script-btn open-external" data-href="${mr.web_url}">View MR</button>`;
    } else {
      html += '-';
    }
    html += `</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderCountdown() {
  return `<div id="refresh-countdown" class="loading" style="margin-top:0.5em;">Next refresh in <b>${secondsToNextRefresh}</b> seconds</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  attachOutputEvents();
});

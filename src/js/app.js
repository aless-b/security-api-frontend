// State: 'valid' | 'invalid' | 'none'
let currentKeyMode = 'valid';

// DOM Elements
const validKeyBtn = document.getElementById('valid-key-btn');
const invalidKeyBtn = document.getElementById('invalid-key-btn');
const clearKeyBtn = document.getElementById('clear-key-btn');
const activeModeLabel = document.getElementById('active-mode-label');

const getHealthBtn = document.getElementById('get-health-btn');
const getDataBtn = document.getElementById('get-data-btn');
const postDataBtn = document.getElementById('post-data-btn');

const responseOutput = document.getElementById('response-output');
const statusBadge = document.getElementById('status-badge');

// Mode Selection Handlers
function setKeyMode(mode, label, activeBtn) {
  currentKeyMode = mode;
  if (activeModeLabel) {
    activeModeLabel.textContent = label;
  }

  [validKeyBtn, invalidKeyBtn, clearKeyBtn].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

if (validKeyBtn) {
  validKeyBtn.addEventListener('click', () => {
    setKeyMode('valid', 'Valid Key', validKeyBtn);
  });
}

if (invalidKeyBtn) {
  invalidKeyBtn.addEventListener('click', () => {
    setKeyMode('invalid', 'Invalid Key', invalidKeyBtn);
  });
}

if (clearKeyBtn) {
  clearKeyBtn.addEventListener('click', () => {
    setKeyMode('none', 'Clear Key (No Key)', clearKeyBtn);
  });
}

// Helper function to update status badge
function updateStatusBadge(status, statusText) {
  statusBadge.classList.remove('hidden', 'success', 'error');
  statusBadge.textContent = `${status} ${statusText}`;

  if (status >= 200 && status < 300) {
    statusBadge.classList.add('success');
  } else {
    statusBadge.classList.add('error');
  }
}

// Core Fetch Handler - Client Application
// Header Sanitization: Client browser sends ZERO secret tokens or API keys.
// Browser sends ONLY standard headers (Accept / Content-Type).
// Nginx reverse proxy inspects mode parameter and performs server-side header injection.
async function makeApiRequest(endpoint, method = 'GET', body = null) {
  responseOutput.textContent = 'Sending request via Nginx Reverse Proxy...';
  statusBadge.classList.add('hidden');

  // Standard headers ONLY - Zero sensitive credentials attached by browser!
  const headers = {
    'Accept': 'application/json'
  };

  const options = {
    method: method,
    headers: headers
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    // Append mode query parameter for server-side Nginx proxy evaluation
    const url = endpoint.includes('?') 
      ? `${endpoint}&mode=${currentKeyMode}` 
      : `${endpoint}?mode=${currentKeyMode}`;

    const response = await fetch(url, options);

    updateStatusBadge(response.status, response.statusText);

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'No JSON body returned' };
    }

    responseOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    statusBadge.classList.remove('hidden', 'success');
    statusBadge.classList.add('error');
    statusBadge.textContent = 'Network Error';

    responseOutput.textContent = JSON.stringify({
      error: 'Failed to communicate with Nginx proxy server',
      details: error.message
    }, null, 2);
  }
}

// Event Listeners for API Calls
getHealthBtn.addEventListener('click', () => {
  makeApiRequest('/health', 'GET');
});

getDataBtn.addEventListener('click', () => {
  makeApiRequest('/api/data', 'GET');
});

postDataBtn.addEventListener('click', () => {
  makeApiRequest('/api/data', 'POST', { message: 'Secure payload from client' });
});

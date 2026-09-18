// Authentication Check - Protect Dashboard Page
if (sessionStorage.getItem('ldap_authenticated') !== 'true') {
  window.location.href = 'login.html';
}

// Display Authenticated User Session Info
const userDisplayName = document.getElementById('user-display-name');
if (userDisplayName) {
  const username = sessionStorage.getItem('ldap_user') || 'alice';
  const dn = sessionStorage.getItem('ldap_dn') || '';
  userDisplayName.textContent = dn ? `${username} (${dn})` : username;
}

// Logout Handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
}

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

const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const cryptoInput = document.getElementById('crypto-input');

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
  if (!statusBadge) return;
  statusBadge.classList.remove('hidden', 'success', 'error');
  statusBadge.textContent = `${status} ${statusText}`;

  if (status >= 200 && status < 300) {
    statusBadge.classList.add('success');
  } else {
    statusBadge.classList.add('error');
  }
}

// Core Fetch Handler - Client Application
async function makeApiRequest(endpoint, method = 'GET', body = null) {
  if (responseOutput) responseOutput.textContent = 'Sending request via Nginx Reverse Proxy...';
  if (statusBadge) statusBadge.classList.add('hidden');

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

    if (responseOutput) responseOutput.textContent = JSON.stringify(data, null, 2);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    if (statusBadge) {
      statusBadge.classList.remove('hidden', 'success');
      statusBadge.classList.add('error');
      statusBadge.textContent = 'Network Error';
    }

    if (responseOutput) {
      responseOutput.textContent = JSON.stringify({
        error: 'Failed to communicate with Nginx proxy server',
        details: error.message
      }, null, 2);
    }
    return { ok: false, status: 0, error };
  }
}

// Event Listeners for Dashboard API Calls
if (getHealthBtn) {
  getHealthBtn.addEventListener('click', () => {
    makeApiRequest('/health', 'GET');
  });
}

if (getDataBtn) {
  getDataBtn.addEventListener('click', () => {
    makeApiRequest('/api/data', 'GET');
  });
}

if (postDataBtn) {
  postDataBtn.addEventListener('click', () => {
    makeApiRequest('/api/data', 'POST', { message: 'Secure payload from client' });
  });
}

if (encryptBtn) {
  encryptBtn.addEventListener('click', async () => {
    const msg = cryptoInput ? cryptoInput.value : 'Confidential Database Record 123';
    const res = await makeApiRequest('/crypto/encrypt', 'POST', { message: msg });
    if (res.data && res.data.ciphertext && cryptoInput) {
      cryptoInput.value = res.data.ciphertext;
    }
  });
}

if (decryptBtn) {
  decryptBtn.addEventListener('click', async () => {
    const msg = cryptoInput ? cryptoInput.value : '';
    const res = await makeApiRequest('/crypto/decrypt', 'POST', { message: msg });
    if (res.data && res.data.plaintext && cryptoInput) {
      cryptoInput.value = res.data.plaintext;
    }
  });
}

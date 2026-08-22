// DOM Elements
const getHealthBtn = document.getElementById('get-health-btn');
const getDataBtn = document.getElementById('get-data-btn');
const postDataBtn = document.getElementById('post-data-btn');

const responseOutput = document.getElementById('response-output');
const statusBadge = document.getElementById('status-badge');

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
// Credential injection is handled server-side by Nginx reverse proxy.
async function makeApiRequest(endpoint, method = 'GET', body = null) {
  responseOutput.textContent = 'Sending request via Nginx Reverse Proxy...';
  statusBadge.classList.add('hidden');

  // Standard headers ONLY - Zero sensitive credentials or tokens attached by browser
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
    // Relative URL request routed to local Nginx reverse proxy
    const response = await fetch(endpoint, options);

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

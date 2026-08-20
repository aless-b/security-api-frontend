// API Base URL
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_API_KEY = 'SECRET_EDUCATIONAL_KEY_12345';

// DOM Elements
const apiKeyInput = document.getElementById('api-key-input');
const resetKeyBtn = document.getElementById('reset-key-btn');
const clearKeyBtn = document.getElementById('clear-key-btn');

const getHealthBtn = document.getElementById('get-health-btn');
const getDataBtn = document.getElementById('get-data-btn');
const postDataBtn = document.getElementById('post-data-btn');

const responseOutput = document.getElementById('response-output');
const statusBadge = document.getElementById('status-badge');

// Key Control Handlers
resetKeyBtn.addEventListener('click', () => {
  apiKeyInput.value = DEFAULT_API_KEY;
});

clearKeyBtn.addEventListener('click', () => {
  apiKeyInput.value = '';
});

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

// Core Fetch Handler
async function makeApiRequest(endpoint, method = 'GET', includeKey = true) {
  responseOutput.textContent = 'Sending request...';
  statusBadge.classList.add('hidden');

  const headers = {};
  if (includeKey) {
    const key = apiKeyInput.value.trim();
    if (key) {
      headers['x-api-key'] = key;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method,
      headers: headers
    });

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
      error: 'Failed to communicate with API server',
      details: error.message,
      hint: `Ensure backend is running at ${API_BASE_URL}`
    }, null, 2);
  }
}

// Event Listeners for API Calls
getHealthBtn.addEventListener('click', () => {
  // Public endpoint - does not send x-api-key
  makeApiRequest('/health', 'GET', false);
});

getDataBtn.addEventListener('click', () => {
  // Protected GET endpoint - sends x-api-key
  makeApiRequest('/api/data', 'GET', true);
});

postDataBtn.addEventListener('click', () => {
  // Protected POST endpoint - sends x-api-key
  makeApiRequest('/api/data', 'POST', true);
});

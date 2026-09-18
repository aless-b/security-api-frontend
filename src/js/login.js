// Dedicated LDAP Login Page Handler

const loginForm = document.getElementById('login-form');
const loginErrorBanner = document.getElementById('login-error-banner');
const loginErrorText = document.getElementById('login-error-text');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginErrorBanner) loginErrorBanner.classList.add('hidden');

    const usernameInput = document.getElementById('ldap-username');
    const passwordInput = document.getElementById('ldap-password');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) return;

    try {
      const response = await fetch('/ldap/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok && data && data.authenticated) {
        // Save session info and redirect to main dashboard index.html
        sessionStorage.setItem('ldap_authenticated', 'true');
        sessionStorage.setItem('ldap_user', data.username);
        sessionStorage.setItem('ldap_dn', data.dn);
        window.location.href = 'index.html';
      } else {
        // Show error message
        if (loginErrorBanner) loginErrorBanner.classList.remove('hidden');
        if (loginErrorText) {
          loginErrorText.textContent = (data && data.detail) ? data.detail : 'Invalid username or password.';
        }
      }
    } catch (err) {
      if (loginErrorBanner) loginErrorBanner.classList.remove('hidden');
      if (loginErrorText) loginErrorText.textContent = 'Failed to connect to LDAP server.';
    }
  });
}

// Shared auth utilities — include AFTER firebase-config.js on every protected page.

const TEST_OTP      = '8656';
const TEST_MODE     = firebaseConfig.apiKey === 'YOUR_API_KEY';
const TEST_USER     = { phoneNumber: '+91 (test mode)' };
const SESSION_KEY   = 'mpm_test_authed';

function requireAuth(loginRelPath, onAuthenticated) {
  showLoading(true);

  // Test mode: use sessionStorage to mimic an auth session
  if (TEST_MODE) {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      showLoading(false);
      if (onAuthenticated) onAuthenticated(TEST_USER);
    } else {
      const ret = encodeURIComponent(window.location.href);
      window.location.replace(loginRelPath + '?return=' + ret);
    }
    return;
  }

  auth.onAuthStateChanged(user => {
    if (!user) {
      const ret = encodeURIComponent(window.location.href);
      window.location.replace(loginRelPath + '?return=' + ret);
    } else {
      showLoading(false);
      if (onAuthenticated) onAuthenticated(user);
    }
  });
}

function showLoading(show) {
  const loading = document.getElementById('app-loading');
  const content = document.getElementById('app-content');
  if (loading) loading.style.display = show ? 'flex' : 'none';
  if (content) content.style.display = show ? 'none' : 'block';
}

function getPhoneDisplay(user) {
  return user.phoneNumber || '';
}

function signOut() {
  sessionStorage.removeItem(SESSION_KEY);
  if (TEST_MODE) {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    window.location.href = (depth > 2 ? '../' : './') + 'login.html';
    return;
  }
  auth.signOut().then(() => {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    window.location.href = (depth > 2 ? '../' : './') + 'login.html';
  });
}

function renderNavbar(user, backLink) {
  const userEl = document.getElementById('navbar-user');
  if (!userEl) return;
  const phone = getPhoneDisplay(user);
  userEl.innerHTML = `
    ${backLink ? `<a href="${backLink.href}" class="navbar-back">← ${backLink.label}</a>` : ''}
    <span class="navbar-phone">📱 ${phone}</span>
    <button class="navbar-logout" onclick="signOut()">Logout</button>
  `;
}

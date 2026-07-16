// Shared auth utilities — include AFTER firebase-config.js on every protected page.

function requireAuth(loginRelPath, onAuthenticated) {
  showLoading(true);
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
  auth.signOut().then(() => {
    // Walk up to find login.html relative to current page depth
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    const prefix = depth > 2 ? '../' : './';
    window.location.href = prefix + 'login.html';
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

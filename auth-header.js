// auth-header.js
export function updateAuthUI() {
    const Auth = window.AuthUtils;
    const user = Auth?.getCurrentUser?.();
  
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
    const accountText = document.querySelector('.account-text');
    const accountAvatar = document.querySelector('.account-avatar');
  
    if (user) {
      loginLinks.forEach(link => link.style.display = 'none');
      logoutLinks.forEach(link => link.style.display = 'block');
      if (accountText) accountText.style.display = 'none';
      if (accountAvatar) {
        accountAvatar.style.display = 'flex';
        accountAvatar.textContent = (user.name || user.email || 'U')[0].toUpperCase();
      }
    } else {
      loginLinks.forEach(link => link.style.display = 'block');
      logoutLinks.forEach(link => link.style.display = 'none');
      if (accountText) accountText.style.display = 'inline';
      if (accountAvatar) accountAvatar.style.display = 'none';
    }
  }
  
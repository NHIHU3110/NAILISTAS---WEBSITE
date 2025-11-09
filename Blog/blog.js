// ==========================
// Fade-in nội dung trang khi load
// ==========================
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
  updateAuthUI();
});

// ==========================
// Overlay & Page Transition
// ==========================
function showOverlayAndRedirect(url, delay = 800) {
  const overlay = document.getElementById('transition-overlay');
  if (!overlay) {
    window.location.href = url;
    return;
  }
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  setTimeout(() => { window.location.href = url; }, delay);
}

// ==========================
// Logout (⚡ FIXED VERSION)
// ==========================
function logout() {
  try {
    const Auth = window.AuthUtils;
    if (Auth?.logout) Auth.logout();

    // Xóa dữ liệu user
    sessionStorage.removeItem('overlayShown');
    localStorage.removeItem('currentUser');

    // Cập nhật UI ngay
    forceUpdateAuthUI(false);

    // Ẩn avatar + hiện text login
    const avatar = document.querySelector('.account-avatar');
    const text = document.querySelector('.account-text');
    if (avatar) avatar.style.display = 'none';
    if (text) text.style.display = 'inline-block';

    // Chờ 50ms để browser render xong rồi overlay + redirect
    setTimeout(() => {
      showOverlayAndRedirect("../Homepage/ck.html", 800);
    }, 50);

  } catch (err) {
    console.error('Logout error:', err);
    forceUpdateAuthUI(false);
    setTimeout(() => showOverlayAndRedirect("../Homepage/ck.html", 800), 50);
  }
}

// ==========================
// Update UI theo trạng thái đăng nhập
// ==========================
function forceUpdateAuthUI(isLoggedIn) {
  const loginLinks = document.querySelectorAll('a[href*="login.html"]');
  const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
  const accountAvatar = document.querySelector('.account-avatar');
  const accountText = document.querySelector('.account-text');

  if (isLoggedIn) {
    loginLinks.forEach(l => {
      l.style.display = 'none';
      l.style.visibility = 'hidden';
    });
    logoutLinks.forEach(l => {
      l.style.display = 'inline-block';
      l.style.visibility = 'visible';
    });
    if (accountAvatar) {
      accountAvatar.style.display = 'flex';
      accountAvatar.style.visibility = 'visible';
    }
    if (accountText) {
      accountText.style.display = 'none';
      accountText.style.visibility = 'hidden';
    }
  } else {
    loginLinks.forEach(l => {
      l.style.display = 'inline-block';
      l.style.visibility = 'visible';
    });
    logoutLinks.forEach(l => {
      l.style.display = 'none';
      l.style.visibility = 'hidden';
    });
    if (accountAvatar) {
      accountAvatar.style.display = 'none';
      accountAvatar.style.visibility = 'hidden';
    }
    if (accountText) {
      accountText.style.display = 'inline-block';
      accountText.style.visibility = 'visible';
    }
  }
}

function updateAuthUI() {
  try {
    const Auth = window.AuthUtils;
    const user = Auth?.getCurrentUser?.();

    if (user) {
      forceUpdateAuthUI(true);
      const accountAvatar = document.querySelector('.account-avatar');
      if (accountAvatar)
        accountAvatar.textContent = user.name ? user.name[0].toUpperCase() : 'U';
    } else {
      forceUpdateAuthUI(false);
    }
  } catch (error) {
    console.error('Error updating auth UI:', error);
    forceUpdateAuthUI(false);
  }
}

// ==========================
// Login link: overlay + redirect
// ==========================
document.querySelectorAll('a[href*="login.html"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetUrl = link.getAttribute('href');
    showOverlayAndRedirect(targetUrl, 800);
  });
});

// ==========================
// Header links khác: overlay + redirect
// ==========================
document.querySelectorAll('a[data-transition]').forEach(link => {
  link.addEventListener('click', e => {
    const targetUrl = link.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#')) return;
    e.preventDefault();
    showOverlayAndRedirect(targetUrl, 800);
  });
});

// ==========================
// Read more button
// ==========================
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const link = btn.dataset.link;
    if (!link) return;
    showOverlayAndRedirect(link, 800);
  });
});

// ==========================
// Go Home
// ==========================
function goHome() {
  showOverlayAndRedirect("../Homepage/ck.html", 800);
}

// ==========================
// Tawk.to chat
// ==========================
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/68fd00ab603401195169ddbc/1j8e4l8i4';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
})();

// ==========================
// ===== CART POP UP =====
// ==========================
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const PAYMENT_URL =
      document.querySelector('meta[name="payment-url"]')?.content || '../Product/html/payment.html';

    const overlay = document.getElementById('overlay');
    const drawer = document.getElementById('cart-popup');
    const contentEl = document.getElementById('cart-content');
    const totalEl = document.getElementById('cart-total-amount');
    const countTitle = document.getElementById('cart-count-title');
    const badgeEl = document.getElementById('cart-count');
    const checkout = document.getElementById('checkout-btn');
    const headerCartLink = document.getElementById('cart-link');

    if (!overlay || !drawer || !contentEl || !totalEl || !checkout || !headerCartLink) {
      console.warn('[NailistasCart] Thiếu HTML fragment.');
      return;
    }

    const toNumber = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;
    const VND = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' VND';
    const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
    const setCart = (c) => localStorage.setItem('cart', JSON.stringify(c));
    const countCart = (c = getCart()) => c.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    const totalCart = (c = getCart()) =>
      c.reduce((s, it) => s + toNumber(it.price) * (Number(it.quantity) || 0), 0);

    function renderBadge() {
      const c = countCart();
      if (badgeEl) badgeEl.textContent = c > 99 ? '99+' : String(c);
      if (countTitle) countTitle.textContent = String(c);
    }

    function openCart() {
      renderPopup();
      overlay.classList.add('show');
      drawer.classList.add('open');
    }

    function closeCart() {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    }

    function renderPopup() {
      const cart = getCart();
      contentEl.innerHTML = '';

      if (!cart.length) {
        contentEl.innerHTML = '<p style="padding:12px 24px;color:#666;">Giỏ hàng trống.</p>';
        totalEl.textContent = VND(0);
        if (checkout) checkout.disabled = true;
        renderBadge();
        return;
      }

      if (checkout) checkout.disabled = false;

      cart.forEach((it) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <img src="${it.img || ''}" alt="${it.name || ''}">
          <div class="cart-item-info">
            <h4>${it.name || ''}</h4>
            <div class="bottom-row">
              <div class="quantity-box" data-id="${it.id}">
                <button class="qty-btn" data-action="dec">−</button>
                <input type="number" class="qty-input" value="${Number(it.quantity) || 1}" readonly />
                <button class="qty-btn" data-action="inc">+</button>
              </div>
              <p>${VND(it.price)}</p>
            </div>
          </div>
          <button class="remove-btn" title="Xóa" aria-label="Xóa" data-action="remove" data-id="${it.id}">×</button>
        `;
        contentEl.appendChild(row);
      });

      totalEl.textContent = VND(totalCart(cart));
      renderBadge();
    }

    overlay.addEventListener('click', closeCart);
    drawer.querySelector('.close-btn')?.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
    headerCartLink.addEventListener('click', (e) => { e.preventDefault(); openCart(); });

    contentEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id') || btn.parentElement?.getAttribute('data-id');
      if (!id) return;
      const cart = getCart();
      const idx = cart.findIndex((x) => String(x.id) === String(id));
      if (idx === -1) return;
      if (action === 'inc') cart[idx].quantity++;
      if (action === 'dec') cart[idx].quantity = Math.max(1, Number(cart[idx].quantity || 1) - 1);
      if (action === 'remove') cart.splice(idx, 1);
      setCart(cart);
      renderPopup();
    });

    checkout.addEventListener('click', (e) => {
      e.preventDefault();
      const cart = getCart();
      if (!cart.length) return alert('Giỏ hàng trống!');
      const items = cart.map(({ id, name, price, quantity, img }) => ({
        id,
        name,
        unitPrice: toNumber(price),
        quantity: Number(quantity) || 1,
        imageSrc: img || ''
      }));
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const shipping = 15000;
      const total = subtotal + shipping;
      const payload = { items, subtotal, shipping, total, currency:'VND', locale:'vi-VN', savedAt:new Date().toISOString() };
      sessionStorage.setItem('checkoutData', JSON.stringify(payload));
      sessionStorage.setItem('paymentOrigin', location.href);
      window.location.href = PAYMENT_URL;
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add-to-cart');
      if (!btn) return;
      const id = btn.dataset.id;
      const name = btn.dataset.name || '';
      const price = toNumber(btn.dataset.price || 0);
      const img = btn.dataset.img || '';
      if (!id) return console.warn('[NailistasCart] Thiếu data-id');
      addToCart({ id, name, price, img }, 1, { open: true });
    });

    function addToCart(prod, qty = 1, opts = { open: true }) {
      const cart = getCart();
      const idx = cart.findIndex((it) => String(it.id) === String(prod.id));
      if (idx !== -1) cart[idx].quantity += Number(qty || 1);
      else cart.push({ id: prod.id, name: prod.name||'', price: toNumber(prod.price||0), img: prod.img||'', quantity:Number(qty||1) });
      setCart(cart);
      renderBadge();
      if (opts.open) openCart();
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') { renderBadge(); if(drawer.classList.contains('open')) renderPopup(); }
    });

    function reopenIfNeeded() {
      if (sessionStorage.getItem('reopenCart') === '1') {
        sessionStorage.removeItem('reopenCart');
        openCart();
      }
    }

    window.addEventListener('pageshow', reopenIfNeeded);
    if (document.readyState === 'complete' || document.readyState === 'interactive') reopenIfNeeded();

    window.NailistasCart = { open: openCart, close: closeCart, add: addToCart, count: () => countCart(), total: () => totalCart() };
    renderBadge();
  });
})();

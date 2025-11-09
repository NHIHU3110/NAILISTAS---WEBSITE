// ================= Fade-in + Transition Overlay =================
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
  const overlay = document.getElementById('transition-overlay');
  if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 800);
  }
  updateAuthUI();
});

// ================= Auth UI + Avatar =================
function updateAuthUI() {
  const loginLinks = document.querySelectorAll('a[href*="login.html"]');
  const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
  const accountAvatar = document.querySelector('.nav-right .account-avatar');

  try {
      const Auth = window.AuthUtils;
      const user = Auth?.getCurrentUser?.();

      if (user) {
          // Ẩn login, hiện logout
          loginLinks.forEach(link => link.closest('header') && (link.style.display = 'none'));
          logoutLinks.forEach(link => link.style.display = 'block');

          // Hiển thị avatar
          if (accountAvatar) {
              accountAvatar.style.display = 'flex';
              accountAvatar.textContent = user.name ? user.name[0].toUpperCase() : 'U';
          }

          // Bind logout click
          logoutLinks.forEach(link => {
              link.removeEventListener('click', logout); // tránh bind nhiều lần
              link.addEventListener('click', e => {
                  e.preventDefault();
                  logout();
              });
          });
      } else {
          // Không có user: hiện login, ẩn logout, ẩn avatar
          loginLinks.forEach(link => link.closest('header') && (link.style.display = 'block'));
          logoutLinks.forEach(link => link.style.display = 'none');
          if (accountAvatar) accountAvatar.style.display = 'none';
      }
  } catch (err) {
      console.error('Auth UI error:', err);
      loginLinks.forEach(link => link.closest('header') && (link.style.display = 'block'));
      logoutLinks.forEach(link => link.style.display = 'none');
      if (accountAvatar) accountAvatar.style.display = 'none';
  }
}

// ================= Logout =================
function logout() {
  try {
      const Auth = window.AuthUtils;
      Auth?.logout?.();
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('overlayShown');

      updateAuthUI(); // cập nhật UI ngay

      const overlay = document.getElementById('transition-overlay');
      if (overlay) {
          overlay.style.display = 'flex';
          overlay.style.opacity = '1';
      }

      setTimeout(() => {
          window.location.href = "../Homepage/ck.html";
      }, 800);
  } catch (err) {
      console.error('Logout error:', err);
      updateAuthUI();
      window.location.href = "../Homepage/ck.html";
  }
}


// ================= Back / Home Buttons =================
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
  }
  setTimeout(() => { window.location.href = '../Homepage/ck.html'; }, 800);
}

function goBack() {
  if (document.referrer) window.history.back();
  else goHome();
}

// ================= Page Transition Overlay =================
function initPageTransitions() {
  const overlay = document.getElementById('transition-overlay');
  if (!overlay) return;

  const links = [...document.querySelectorAll('a[data-transition]'), ...document.querySelectorAll('.post-card')];
  links.forEach(link => {
      link.addEventListener('click', e => {
          const targetUrl = link.getAttribute('href') || link.dataset.link;
          if (!targetUrl || targetUrl.startsWith('#')) return;
          e.preventDefault();
          overlay.style.display = 'flex';
          overlay.style.opacity = '1';
          setTimeout(() => { window.location.href = targetUrl; }, 800);
      });
  });

  document.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          const link = btn.dataset.link;
          if (!link) return;
          overlay.style.display = 'flex';
          overlay.style.opacity = '1';
          setTimeout(() => { window.location.href = link; }, 800);
      });
  });
}

// ================= Cart Drawer =================
function initCart() {
  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('cart-popup');
  const contentEl = document.getElementById('cart-content');
  const totalEl = document.getElementById('cart-total-amount');
  const countTitle = document.getElementById('cart-count-title');
  const badgeEl = document.getElementById('cart-count');
  const checkout = document.getElementById('checkout-btn');
  const headerCartLink = document.getElementById('cart-link');
  const PAYMENT_URL = document.querySelector('meta[name="payment-url"]')?.content || '../Product/html/payment.html';

  if (!overlay || !drawer || !contentEl || !totalEl || !checkout || !headerCartLink) return;

  const toNumber = v => Number(String(v).replace(/[^\d.-]/g, '')) || 0;
  const VND = n => (Number(n) || 0).toLocaleString('vi-VN') + ' VND';
  const getCart = () => { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } };
  const setCart = c => localStorage.setItem('cart', JSON.stringify(c));
  const countCart = c => (c || getCart()).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const totalCart = c => (c || getCart()).reduce((s, it) => s + toNumber(it.price) * (Number(it.quantity) || 0), 0);

  function renderBadge() {
      const c = countCart();
      if (badgeEl) badgeEl.textContent = c > 99 ? '99+' : String(c);
      if (countTitle) countTitle.textContent = String(c);
  }

  function renderPopup() {
      const cart = getCart();
      contentEl.innerHTML = '';
      if (!cart.length) {
          contentEl.innerHTML = '<p style="padding:12px 24px;color:#666;">Giỏ hàng trống.</p>';
          totalEl.textContent = VND(0);
          checkout.disabled = true;
          renderBadge();
          return;
      }
      checkout.disabled = false;
      cart.forEach(it => {
          const row = document.createElement('div');
          row.className = 'cart-item';
          row.innerHTML = `
              <img src="${it.img || ''}" alt="${it.name || ''}">
              <div class="cart-item-info">
                  <h4>${it.name || ''}</h4>
                  <div class="bottom-row">
                      <div class="quantity-box" data-id="${it.id}">
                          <button class="qty-btn" data-action="dec">−</button>
                          <input type="number" class="qty-input" value="${Number(it.quantity)||1}" readonly />
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

  function openCart() {
      renderPopup();
      overlay.classList.add('show');
      drawer.classList.add('open');
  }
  function closeCart() {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
  }

  overlay.addEventListener('click', closeCart);
  drawer.querySelector('.close-btn')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => e.key==='Escape' && closeCart());
  headerCartLink.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openCart(); });

  contentEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id') || btn.parentElement?.getAttribute('data-id');
      if (!id) return;
      const cart = getCart();
      const idx = cart.findIndex(x => String(x.id) === String(id));
      if (idx === -1) return;
      if (action === 'inc') cart[idx].quantity++;
      if (action === 'dec') cart[idx].quantity = Math.max(1, Number(cart[idx].quantity || 1)-1);
      if (action === 'remove') cart.splice(idx,1);
      setCart(cart);
      renderPopup();
  });

  checkout.addEventListener('click', e => {
      e.preventDefault();
      const cart = getCart();
      if (!cart.length) { alert('Giỏ hàng trống!'); return; }
      const items = cart.map(({id,name,price,quantity,img}) => ({
          id, name, unitPrice: toNumber(price), quantity: Number(quantity)||1, imageSrc: img||''
      }));
      const subtotal = items.reduce((s,i)=>s+i.unitPrice*i.quantity,0);
      const shipping = 15000;
      const total = subtotal + shipping;
      const payload = { items, subtotal, shipping, total, currency:'VND', locale:'vi-VN', savedAt:new Date().toISOString() };
      sessionStorage.setItem('checkoutData', JSON.stringify(payload));
      sessionStorage.setItem('paymentOrigin', location.href);
      window.location.href = PAYMENT_URL;
  });

  document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-add-to-cart');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return console.warn('[Cart] Thiếu data-id');
      addToCart({ id, name: btn.dataset.name||'', price: toNumber(btn.dataset.price||0), img: btn.dataset.img||'' }, 1, { open:true });
  });

  function addToCart(prod, qty=1, opts={open:true}) {
      const cart = getCart();
      const idx = cart.findIndex(it => String(it.id)===String(prod.id));
      if (idx!==-1) cart[idx].quantity += Number(qty);
      else cart.push({...prod, quantity:Number(qty)});
      setCart(cart);
      renderBadge();
      if (opts.open) openCart();
  }

  window.addEventListener('storage', e => {
      if (e.key==='cart') { renderBadge(); if(drawer.classList.contains('open')) renderPopup(); }
  });

  function reopenIfNeeded() {
      if (sessionStorage.getItem('reopenCart')==='1') {
          sessionStorage.removeItem('reopenCart');
          openCart();
      }
  }

  window.addEventListener('pageshow', reopenIfNeeded);
  if (document.readyState==='complete'||document.readyState==='interactive') reopenIfNeeded();

  renderBadge();
  window.NailistasCart = { open:openCart, close:closeCart, add:addToCart, count:()=>countCart(), total:()=>totalCart() };
}

// ================= Boot All =================
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initCart();
});

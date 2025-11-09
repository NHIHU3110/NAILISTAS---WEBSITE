// ================== CONTACT POPUP ==================
const openBtn = document.getElementById("openContact");
const closeBtn = document.getElementById("closePopup");
const popup = document.getElementById("contactPopup");
const overlayContact = document.getElementById("overlay-contact");

// Mở / đóng popup
openBtn.addEventListener("click", () => {
  popup.classList.add("show");
  overlayContact.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  popup.classList.remove("show");
  overlayContact.classList.remove("show");
});

overlayContact.addEventListener("click", () => {
  popup.classList.remove("show");
  overlayContact.classList.remove("show");
});

// ================== BODY FADE IN ==================
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
});

// ================== TRANSITION OVERLAY CHO TẤT CẢ LINK ==================
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:')) return;

    e.preventDefault();
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 800);
  });
});

// ================== HIỆU ỨNG RELOAD / QUAY LẠI ==================
window.addEventListener('pageshow', () => {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.opacity = '1';
    }, 800);
  }, 400);
  updateAuthUI();
});

// ================== AUTH UI ==================
function updateAuthUI() {
  try {
    const Auth = window.AuthUtils;
    const user = Auth?.getCurrentUser?.();
    
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
    
    if (user) {
      loginLinks.forEach(link => {
        if (link.closest('header')) link.style.display = 'none';
      });
      logoutLinks.forEach(link => link.style.display = 'block');
      console.log('User logged in:', user.name || user.email);
    } else {
      loginLinks.forEach(link => {
        if (link.closest('header')) link.style.display = 'block';
      });
      logoutLinks.forEach(link => link.style.display = 'none');
      console.log('User not logged in');
    }
  } catch (error) {
    console.error('Error updating auth UI:', error);
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
    loginLinks.forEach(link => link.style.display = 'block');
    logoutLinks.forEach(link => link.style.display = 'none');
  }
}

function logout() {
  try {
    const Auth = window.AuthUtils;
    if (Auth?.logout) Auth.logout();

    sessionStorage.removeItem('overlayShown');
    localStorage.removeItem('currentUser');
    updateAuthUI();

    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    }

    setTimeout(() => {
      window.location.href = "../Homepage/ck.html";
    }, 800);
  } catch (error) {
    console.error('Logout error:', error);
    sessionStorage.removeItem('overlayShown');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    window.location.href = "../Homepage/ck.html";
  }
}

function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  setTimeout(() => {
    window.location.href = "../Homepage/ck.html";
  }, 800);
}

// ================== FORM THANK YOU POPUP ==================
const form = document.querySelector("#contactPopup form");
const thankPopup = document.getElementById("thankPopup");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    popup.classList.remove("show");
    overlayContact.classList.remove("show");
    form.reset();
    thankPopup.classList.add("show");
    setTimeout(() => {
      thankPopup.classList.remove("show");
    }, 2000);
  });
}

// ================== TAWK.TO CHAT ==================
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/68fd00ab603401195169ddbc/1j8e4l8i4';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
})();

//CART POP UP//
document.addEventListener('DOMContentLoaded', () => {
  const overlay   = document.getElementById('overlay');
  const drawer    = document.getElementById('cart-popup');
  const contentEl = document.getElementById('cart-content');
  const totalEl   = document.getElementById('cart-total-amount');
  const countTitle= document.getElementById('cart-count-title');
  const badgeEl   = document.getElementById('cart-count');
  const checkout  = document.getElementById('checkout-btn');
  const headerCartLink = document.getElementById('cart-link');

  if (!overlay || !drawer || !contentEl || !totalEl || !checkout || !headerCartLink) {
    console.warn('[NailistasCart] Thiếu HTML fragment.');
    return;
  }

  // ----- Utils -----
  const toNumber = v => Number(String(v).replace(/[^\d.-]/g,'')) || 0;
  const VND      = n => (Number(n)||0).toLocaleString('vi-VN')+' VND';
  const getCart  = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const setCart  = c => localStorage.setItem('cart', JSON.stringify(c));
  const countCart= c => (c||getCart()).reduce((s,it)=> s + (Number(it.quantity)||0), 0);
  const totalCart= c => (c||getCart()).reduce((s,it)=> s + toNumber(it.price)*(Number(it.quantity)||0), 0);

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
        <img src="${it.img||''}" alt="${it.name||''}">
        <div class="cart-item-info">
          <h4>${it.name||''}</h4>
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

  // ----- Open/Close -----
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
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeCart(); });

  // ----- Header link click -----
  headerCartLink.addEventListener('click', e => {
    e.preventDefault();
    openCart();
  });

  // ----- Quantity / Remove -----
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
    if (action === 'dec') cart[idx].quantity = Math.max(1, Number(cart[idx].quantity||1)-1);
    if (action === 'remove') cart.splice(idx,1);

    setCart(cart);
    renderPopup();
  });

  // ----- Checkout -----
  checkout.addEventListener('click', e => {
    e.preventDefault();
    const cart = getCart();
    if (!cart.length) { alert('Giỏ hàng trống!'); return; }

    const items = cart.map(({id,name,price,quantity,img})=>({
      id,name,unitPrice: toNumber(price),quantity:Number(quantity)||1,imageSrc:img||''
    }));
    const subtotal = items.reduce((s,i)=> s+i.unitPrice*i.quantity,0);
    const shipping = 15000;
    const total = subtotal + shipping;

    const payload = { items, subtotal, shipping, total, currency:'VND', locale:'vi-VN', savedAt:new Date().toISOString() };
    sessionStorage.setItem('checkoutData', JSON.stringify(payload));
    sessionStorage.setItem('paymentOrigin', location.href);

    const PAYMENT_URL = document.querySelector('meta[name="payment-url"]')?.content || '../html/payment.html';
    window.location.href = PAYMENT_URL;
  });

  // ----- Global add-to-cart support -----
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;

    const id   = btn.dataset.id;
    const name = btn.dataset.name||'';
    const price= toNumber(btn.dataset.price||0);
    const img  = btn.dataset.img||'';
    if (!id) { console.warn('[NailistasCart] Thiếu data-id'); return; }

    const cart = getCart();
    const k = cart.findIndex(it => String(it.id) === String(id));
    if (k!==-1) cart[k].quantity +=1;
    else cart.push({id,name,price,img,quantity:1});
    setCart(cart);
    renderBadge();
    openCart();
  });

  // ----- Sync multiple tabs -----
  window.addEventListener('storage', e => {
    if(e.key==='cart') renderBadge();
  });

  // ----- Initial -----
  renderBadge();
});

//LOGIN ACCOUNT AVT//

function updateAuthUI() {
  const Auth = window.AuthUtils;
  const user = Auth?.getCurrentUser?.();

  const loginLinks  = document.querySelectorAll('a[href*="login.html"]');
  const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
  const accountAvatar = document.querySelector('.account-avatar');
  const accountText = document.querySelector('.account-text');

  if (user) {
    // Ẩn login, hiện logout + avatar
    loginLinks.forEach(link => link.style.display = 'none');
    logoutLinks.forEach(link => link.style.display = 'block');

    if (accountAvatar) {
      accountAvatar.style.display = 'flex';
      accountAvatar.textContent = (user.name || user.email || '?')[0].toUpperCase();
    }
    if (accountText) accountText.style.display = 'none';
  } else {
    // Chưa login
    loginLinks.forEach(link => link.style.display = 'inline');
    logoutLinks.forEach(link => link.style.display = 'none');
    if (accountAvatar) accountAvatar.style.display = 'none';
    if (accountText) accountText.style.display = 'inline';
  }
}

// Gắn sự kiện logout
document.querySelectorAll('[data-auth="logout"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    if (window.AuthUtils?.logout) window.AuthUtils.logout();
    updateAuthUI();
  });
});

// Khi load trang
document.addEventListener('DOMContentLoaded', updateAuthUI);
const avatar = document.querySelector('.account-avatar');
let bubbleInterval;

avatar.addEventListener('mouseenter', () => {
  bubbleInterval = setInterval(() => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Kích thước ngẫu nhiên
    const size = Math.random() * 10 + 4; // 4px -> 14px
    bubble.style.width = bubble.style.height = size + 'px';
    bubble.style.background = `rgba(25,53,225,${Math.random()*0.5 + 0.3})`;

    // Hướng và khoảng cách ngẫu nhiên
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 40 + 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius - 50;

    bubble.style.setProperty('--x', `${x}px`);
    bubble.style.setProperty('--y', `${y}px`);
    bubble.style.setProperty('--s', (Math.random()*0.6 + 0.6).toFixed(2));

    // Thời gian animation ngẫu nhiên
    bubble.style.animationDuration = `${Math.random()*1.5 + 1.5}s`;

    avatar.appendChild(bubble);

    // Tự động remove sau animation
    setTimeout(() => bubble.remove(), 3000);
  }, 200); // 5 bong bóng/giây, có thể tăng/giảm
});

avatar.addEventListener('mouseleave', () => {
  clearInterval(bubbleInterval);
});

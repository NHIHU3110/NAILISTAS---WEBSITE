// ==========================
// Overlay chuyển trang + Home
// ==========================
function showOverlayThenNavigate(url){
  const ov = document.getElementById('transition-overlay');
  if (ov){
    ov.style.display = 'flex';
    ov.style.opacity = '1';
    setTimeout(()=>{ window.location.href = url; }, 600);
  } else {
    window.location.href = url;
  }
}
// Hỗ trợ cả inline onclick="goHome()" lẫn addEventListener
function goHome(){ showOverlayThenNavigate('ck.html'); }
document.getElementById('homeLogo')?.addEventListener('click', ()=> showOverlayThenNavigate('ck.html'));

// Giữ behavior data-transition cho các link khác (trừ giỏ hàng)
document.querySelectorAll('header a[data-transition]').forEach(a=>{
  if(a.id === 'cart-link') return;
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#')) return;
    e.preventDefault();
    showOverlayThenNavigate(href);
  });
});

// ==========================
// Search
// ==========================
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
if(searchBtn){
  searchBtn.addEventListener("click", () => {
    const query = (searchInput?.value || "").trim();
    if (query) window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  });
}
if(searchInput){
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn?.click();
    }
  });
}

// ==========================
// Scroll to top
// ==========================
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn){
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==========================
// Helpers
// ==========================
const toNumber = (x) => {
  if (typeof x === 'number') return x;
  const digits = String(x || '').replace(/[^\d.-]/g, '');
  return digits ? parseInt(digits, 10) : 0;
};
const VND  = (n) => (Number(n)||0).toLocaleString('vi-VN') + ' VND';
const slug = (s) => String(s||'')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/đ/g,'d').replace(/Đ/g,'D')
  .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

// ==========================
// Cart state (localStorage)
// ==========================
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function countCart(c=getCart()){ return c.reduce((s,it)=> s + (Number(it.quantity)||0 || 1), 0); }
function totalCart(c=getCart()){ return c.reduce((s,it)=> s + toNumber(it.price)*(Number(it.quantity)||0 || 1), 0); }

function renderCartBadge(){
  const badge = document.getElementById('cart-count');
  if(!badge) return;
  const c = countCart();
  badge.textContent = c > 99 ? '99+' : String(c);
}

// ==========================
// Drawer controls (template)
// ==========================
const drawerOverlay = document.getElementById('overlay');          // nền mờ của drawer
const drawer        = document.getElementById('cart-drawer');      // khung drawer
const content       = document.getElementById('cart-content');     // danh sách item
const totalEl       = document.getElementById('cart-total-amount');
const countTitle    = document.getElementById('cart-count-title');
const checkoutBtn   = document.getElementById('checkout-btn');

// Có drawer?
const hasDrawer = !!drawer && !!drawerOverlay && !!content;

function openCartDrawer(){
  if (!hasDrawer) return; // nếu không có drawer trên trang, bỏ qua
  renderCartDrawer();
  drawerOverlay.classList.add('show');
  drawer.classList.add('open');
  // 🔒 Khóa cuộn + Ẩn up arrow
  document.body.classList.add('no-scroll');
  scrollTopBtn?.classList.add('hide');
}
function closeCartDrawer(){
  if (!hasDrawer) return;
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('show');
  // 🔓 Mở cuộn + Hiện up arrow lại (nếu cần)
  document.body.classList.remove('no-scroll');
  scrollTopBtn?.classList.remove('hide');
}
drawerOverlay?.addEventListener('click', closeCartDrawer);
drawer?.querySelector('.close-btn')?.addEventListener('click', closeCartDrawer);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeCartDrawer(); });

// Header cart link: mở drawer nếu có, nếu không thì để điều hướng mặc định
document.getElementById('cart-link')?.addEventListener('click', (e)=>{
  if (hasDrawer){
    e.preventDefault(); e.stopPropagation();
    openCartDrawer();
  }
});

// Render nội dung giỏ hàng
function renderCartDrawer(){
  if (!hasDrawer) return;
  const cart = getCart();
  content.innerHTML = '';
  if(cart.length === 0){
    content.innerHTML = '<p style="padding:12px 20px;color:#666;">Giỏ hàng trống.</p>';
    if (countTitle) countTitle.textContent = '0';
    if (totalEl)    totalEl.textContent    = VND(0);
    if (checkoutBtn) checkoutBtn.disabled  = true;
    return;
  }
  if (checkoutBtn) checkoutBtn.disabled = false;

  cart.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'cart-item';
   row.innerHTML = `
  <img src="${it.img || '../images/background.png'}" alt="${it.name}">
  <div class="cart-item-info">
    <h4>${it.name}</h4>
    <div class="bottom-row">
      <div class="quantity-box" data-id="${it.id}">
        <button class="qty-btn" data-action="dec">−</button>
        <input type="number" class="qty-input" value="${it.quantity || 1}" readonly/>
        <button class="qty-btn" data-action="inc">+</button>
      </div>
      <p>${VND(it.price)}</p>
    </div>
  </div>
  <button class="remove-btn" title="Xóa" aria-label="Xóa" data-action="remove" data-id="${it.id}">×</button>
`;

    content.appendChild(row);
  });
  if (countTitle) countTitle.textContent = String(countCart(cart));
  if (totalEl)    totalEl.textContent    = VND(totalCart(cart));
}

// Sự kiện +/−/xóa trong drawer (uỷ quyền)
content?.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id') || btn.parentElement.getAttribute('data-id');
  const cart = getCart();
  const idx = cart.findIndex(x=> String(x.id) === String(id));
  if(idx === -1) return;

  if(action === 'inc') cart[idx].quantity = (cart[idx].quantity||1) + 1;
  if(action === 'dec') cart[idx].quantity = Math.max(1, (cart[idx].quantity||1) - 1);
  if(action === 'remove') cart.splice(idx,1);

  setCart(cart);
  renderCartBadge();
  renderCartDrawer();
});

// Thanh toán (đổi URL nếu cần)
// Thay cho: checkoutBtn?.addEventListener('click', ()=>{ window.location.href = '../Checkout/checkout.html'; });

checkoutBtn?.addEventListener('click', (e) => {
  e.preventDefault();

  // 👉 Trang đích: đổi tùy bạn dùng payment hay checkout
  const PAYMENT_URL = '../html/payment.html';    // hoặc '../Checkout/checkout.html'

  // helper ép số
  const toNumber = v => Number(String(v).replace(/[^\d.-]/g, '')) || 0;

  // 1) Lấy giỏ từ localStorage (key 'cart')
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) { alert('Giỏ hàng trống!'); return; }

  // 2) Đóng gói payload
  const items = cart.map(({ id, name, price, quantity, img }) => ({
    id,
    name,
    unitPrice: toNumber(price),
    quantity: Number(quantity) || 1,
    imageSrc: img || ''
  }));
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = 15000; // payment sẽ tự tính lại nếu đổi phương thức
  const total    = subtotal + shipping;

  // 3) Lưu tạm + nguồn điều hướng để quay lại mở lại drawer
  sessionStorage.setItem('checkoutData', JSON.stringify({
    items, subtotal, shipping, total,
    currency: 'VND', locale: 'vi-VN', savedAt: new Date().toISOString()
  }));
  sessionStorage.setItem('paymentOrigin', location.href);

  // 4) Sang trang thanh toán
  window.location.href = PAYMENT_URL;
});


// ==========================
// Add to cart (mở drawer nếu có; nếu không thì hiện toast)
// ==========================
const toast = document.getElementById('popupCart'); // fallback popup text (không dùng khi có drawer)
document.querySelectorAll(".btn-cart").forEach(btn=>{
  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    const name = btn.getAttribute("data-name") || 'Sản phẩm';
    const priceNumber = toNumber(btn.getAttribute("data-price"));
    const card = btn.closest('.product-card');
    const imgSrc = card?.querySelector('img')?.getAttribute('src') || '../images/background.png';
    const id = slug(name);

    let cart = getCart();
    const found = cart.find(x=> x.id === id);
    if(found) found.quantity = (found.quantity||1) + 1;
    else cart.push({ id, name, price: priceNumber, img: imgSrc, quantity: 1 });

    setCart(cart);
    renderCartBadge();

    if (hasDrawer) {
      openCartDrawer();
    } else if (toast) {
      toast.textContent = `${name} đã được thêm vào giỏ hàng!`;
      toast.style.display = 'block';
      toast.style.opacity = 1;
      setTimeout(()=>{ toast.style.display = 'none'; }, 1500);
    }
  });
});

// ==========================
// Rating (giữ logic hiện tại)
// ==========================
function updateProductRatings() {
  const ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
  document.querySelectorAll(".product-card").forEach(card => {
    const img = card.querySelector("img");
    // lấy id từ onclick="location.href='Product_detail.html?id=...'"
    const match = img?.getAttribute("onclick")?.match(/id=([^'"]+)/);
    const productId = match ? match[1] : null;

    const avgRating = productId ? (parseFloat(ratings[productId]) || 0) : 0;
    const fullStars = Math.round(avgRating);
    const emptyStars = 5 - fullStars;
    const stars = "★".repeat(fullStars) + "☆".repeat(emptyStars);

    const ratingElem = card.querySelector(".product-rating .stars");
    const valueElem  = card.querySelector(".product-rating .rating-value");
    if (ratingElem && valueElem) {
      ratingElem.textContent = stars;
      ratingElem.style.color = avgRating > 0 ? "gold" : "#ccc";
      valueElem.textContent  = `(${avgRating.toFixed(1)})`;
    }
  });
}
updateProductRatings();

// ==========================
// React to storage updates
// ==========================
window.addEventListener("storage", (e) => {
  if (e.key === "ratings") updateProductRatings();
  if (e.key === "cart") {
    renderCartBadge();
    if (hasDrawer && drawer.classList.contains('open')) renderCartDrawer();
  }
});

// Boot
renderCartBadge();

/* =================== AUTH + LOGIN/LOGOUT =================== */

// 🔹 Auth helper
window.AuthUtils = {
  // Lấy user hiện tại
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  },

  // Login: lưu user vào localStorage và cập nhật UI
  login: function(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthUI();
  },

  // Logout: xóa user và cập nhật UI
  logout: function() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
  }
};

// 🔹 Cập nhật giao diện theo trạng thái đăng nhập
function updateAuthUI() {
  const user = AuthUtils.getCurrentUser();

  const loginLinks = document.querySelectorAll('a[href*="login.html"]');
  const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');

  if (user) {
    // Người dùng ĐÃ đăng nhập
    loginLinks.forEach(link => link.style.display = 'none');
    logoutLinks.forEach(link => link.style.display = 'block');
    console.log('User logged in:', user.name || user.email);
  } else {
    // Người dùng CHƯA đăng nhập
    loginLinks.forEach(link => link.style.display = 'block');
    logoutLinks.forEach(link => link.style.display = 'none');
    console.log('User not logged in');
  }
}

// 🔹 Gọi khi trang load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});

// 🔹 Logout button handler
document.querySelectorAll('[data-auth="logout"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();

    // Hiệu ứng overlay
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    }

    // Logout thực sự
    AuthUtils.logout();

    // Chuyển về trang chủ sau 800ms
    setTimeout(() => {
      window.location.href = "../Homepage/ck.html";
    }, 800);
  });
});

// 🔹 Đồng bộ UI khi localStorage thay đổi (tab khác)
window.addEventListener('storage', (e) => {
  if (e.key === 'currentUser') {
    updateAuthUI();
  }
});

/* =================== Example Login Form Handler =================== */
/* Thêm vào trang login.html */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();

    if (!email || !name) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Lưu user + cập nhật UI
    AuthUtils.login({ name, email });

    // Chuyển về trang trước đó hoặc home
    window.location.href = "../../Homepage/ck.html";
  });
}

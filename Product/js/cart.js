function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    const overlay = document.getElementById('overlay');
    const isOpen = cartPopup.classList.contains('open');
    if (!isOpen) {
      cartPopup.classList.add('open');
      overlay.classList.add('show');
    } else {
      cartPopup.classList.remove('open');
      overlay.classList.remove('show');
    }
  }


  function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    const overlay = document.getElementById('overlay');
    const isOpen = cartPopup.classList.contains('open');
    if (!isOpen) {
      cartPopup.classList.add('open');
      overlay.classList.add('show');
    } else {
      cartPopup.classList.remove('open');
      overlay.classList.remove('show');
    }
  }

  function updateQuantity(action, productId) {
    const item = document.querySelector(`#cart-popup .cart-item:nth-child(${productId})`);
    const qtyInput = item.querySelector('.qty-input');
    let qty = parseInt(qtyInput.value);
    if (action === 'increment') qty++;
    else if (action === 'decrement' && qty > 1) qty--;
    qtyInput.value = qty;
    updateCartTotal();
  }

  function updateCartTotal() {
    let total = 0;
    const cartItems = document.querySelectorAll('#cart-popup .cart-item');
    cartItems.forEach(item => {
      const price = parseInt(item.querySelector('.cart-item-info p').textContent.replace('₫', '').replace(/\./g, '').trim());
      const qty = parseInt(item.querySelector('.qty-input').value);
      total += price * qty;
    });
    document.getElementById('cart-total-amount').textContent = total.toLocaleString() + '₫';
    updateCartCount();
  }

  function removeItem(productId) {
    const item = document.querySelector(`#cart-popup .cart-item:nth-child(${productId})`);
    if (item) item.remove();
    updateCartTotal();
  }

  function updateCartCount() {
    const cartItems = document.querySelectorAll('#cart-popup .cart-item');
    const count = cartItems.length;
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-count-title').textContent = count;
  }

  function checkout() {
  window.location.href = "payment.html" ;
}
// Fade-in toàn trang + tắt overlay khi tải
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
  const overlay = document.getElementById('transition-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.style.display = 'none'; }, 800);
});

// Nút quay về với hiệu ứng overlay
function goHome() {
const overlay = document.getElementById('transition-overlay');
overlay.style.display = 'flex';
overlay.style.opacity = '1';
setTimeout(() => { window.location.href = '../Homepage/ck.html'; }, 800); 
}
function goBack() {
// Kiểm tra xem có trang trước không, nếu không thì về trang chủ
if (document.referrer) {
  window.history.back();
} else {
  window.location.href = 'index.html'; // Thay 'index.html' bằng trang chủ của bạn
}
}


// Chuyển trang mượt mà với overlay
document.querySelectorAll('a[data-transition]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#')) return;
    e.preventDefault();
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => { window.location.href = targetUrl; }, 800);
  });
});

// Nút "ĐỌC BÀI VIẾT" với hiệu ứng chuyển trang
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const link = this.dataset.link;
    if (!link) return;
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => window.location.href = link, 800);
  });
});




  function updateQuantity(action, productId) {
    const item = document.querySelector(`#cart-popup .cart-item:nth-child(${productId})`);
    const qtyInput = item.querySelector('.qty-input');
    let qty = parseInt(qtyInput.value);
    if (action === 'increment') qty++;
    else if (action === 'decrement' && qty > 1) qty--;
    qtyInput.value = qty;
    updateCartTotal();
  }

  function updateCartTotal() {
    let total = 0;
    const cartItems = document.querySelectorAll('#cart-popup .cart-item');
    cartItems.forEach(item => {
      const price = parseInt(item.querySelector('.cart-item-info p').textContent.replace('₫', '').replace(/\./g, '').trim());
      const qty = parseInt(item.querySelector('.qty-input').value);
      total += price * qty;
    });
    document.getElementById('cart-total-amount').textContent = total.toLocaleString() + '₫';
    updateCartCount();
  }

  function removeItem(productId) {
    const item = document.querySelector(`#cart-popup .cart-item:nth-child(${productId})`);
    if (item) item.remove();
    updateCartTotal();
  }

  function updateCartCount() {
    const cartItems = document.querySelectorAll('#cart-popup .cart-item');
    const count = cartItems.length;
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-count-title').textContent = count;
  }

  function checkout() {
  window.location.href = "payment.html" ;
}
// Fade-in toàn trang + tắt overlay khi tải
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
  const overlay = document.getElementById('transition-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.style.display = 'none'; }, 800);
});

// Nút quay về với hiệu ứng overlay
function goHome() {
const overlay = document.getElementById('transition-overlay');
overlay.style.display = 'flex';
overlay.style.opacity = '1';
setTimeout(() => { window.location.href = '../Homepage/ck.html'; }, 800); 
}
function goBack() {
// Kiểm tra xem có trang trước không, nếu không thì về trang chủ
if (document.referrer) {
  window.history.back();
} else {
  window.location.href = 'index.html'; // Thay 'index.html' bằng trang chủ của bạn
}
}


// Chuyển trang mượt mà với overlay
document.querySelectorAll('a[data-transition]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#')) return;
    e.preventDefault();
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => { window.location.href = targetUrl; }, 800);
  });
});

// Nút "ĐỌC BÀI VIẾT" với hiệu ứng chuyển trang
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const link = this.dataset.link;
    if (!link) return;
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => window.location.href = link, 800);
  });
});
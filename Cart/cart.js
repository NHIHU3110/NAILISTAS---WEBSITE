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
  updateAuthUI();
});

// 🔑 Function cập nhật giao diện theo trạng thái đăng nhập
function updateAuthUI() {
  try {
    const Auth = window.AuthUtils;
    const user = Auth?.getCurrentUser?.();
    
    // Tìm các link đăng nhập và đăng xuất
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
    
    if (user) {
      // Người dùng ĐÃ đăng nhập
      loginLinks.forEach(link => {
        // Chỉ ẩn link đăng nhập ở header, không ẩn tất cả
        if (link.closest('header')) {
          link.style.display = 'none';
        }
      });
      logoutLinks.forEach(link => link.style.display = 'block');
      
      console.log('User logged in:', user.name || user.email);
    } else {
      // Người dùng CHƯA đăng nhập
      loginLinks.forEach(link => {
        if (link.closest('header')) {
          link.style.display = 'block';
        }
      });
      logoutLinks.forEach(link => link.style.display = 'none');
      
      console.log('User not logged in');
    }
  } catch (error) {
    console.error('Error updating auth UI:', error);
    // Nếu có lỗi, mặc định hiển thị đăng nhập
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    const logoutLinks = document.querySelectorAll('a[data-auth="logout"]');
    loginLinks.forEach(link => link.style.display = 'block');
    logoutLinks.forEach(link => link.style.display = 'none');
  }
}
function logout() {
  try {
    const Auth = window.AuthUtils;
    
    // Thực hiện đăng xuất
    if (Auth?.logout) {
      Auth.logout();
    }

    // ✅ Xóa session / localStorage để mất trạng thái đăng nhập
    sessionStorage.removeItem('overlayShown');
    localStorage.removeItem('currentUser');
    
    // ✅ Cập nhật lại giao diện (ẩn nút đăng xuất, hiện đăng nhập)
    updateAuthUI();

    // Hiển thị hiệu ứng overlay
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    }

    // ✅ Chuyển về trang chủ sau 800ms
    setTimeout(() => {
      window.location.href = "../Homepage/ck.html";
    }, 800);
    
  } catch (error) {
    console.error('Logout error:', error);

    // Trường hợp lỗi vẫn đảm bảo đăng xuất hoàn toàn
    sessionStorage.removeItem('overlayShown');
    localStorage.removeItem('currentUser');
    updateAuthUI();

    window.location.href = "../Homepage/ck.html";
  }
}

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
   // 🔹 Hiệu ứng khi nhấn logo – trở về trang chủ
  function goHome() {
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => {
      window.location.href = "ck.html"; // 🔹 Trang chủ của bạn
    }, 800);
  }
// 🔍 TÌM KIẾM SẢN PHẨM
// ----------------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) window.location.href = `search.html?query=${encodeURIComponent(query)}`;
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});

// ----------------------
// 🛒 THÊM GIỎ HÀNG
// ----------------------
const cartButtons = document.querySelectorAll(".btn-cart");
const popup = document.getElementById("popupCart");

cartButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const name = btn.getAttribute("data-name");
    const priceRaw = btn.getAttribute("data-price");

    const priceNumber = (() => {
      if (!priceRaw) return 0;
      if (typeof priceRaw === "number") return priceRaw;
      const digits = priceRaw.replace(/[^\d]/g, "");
      return digits ? parseInt(digits, 10) : 0;
    })();

    const item = { name, price: priceNumber, quantity: 1 };
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(p => p.name === name);
    if (existing) existing.quantity++;
    else cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));

    popup.textContent = `${name} đã được thêm vào giỏ hàng!`;
    popup.style.display = "block";
    setTimeout(() => popup.style.display = "none", 1500);
  });
});

// ----------------------
// 🔝 NÚT LÊN ĐẦU TRANG
// ----------------------
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) scrollTopBtn.classList.add('show');
  else scrollTopBtn.classList.remove('show');
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ----------------------
// ⭐ HIỂN THỊ TRUNG BÌNH SAO
// ----------------------
function updateProductRatings() {
  const ratings = JSON.parse(localStorage.getItem("ratings") || "{}");

  document.querySelectorAll(".product-card").forEach(card => {
    const img = card.querySelector("img");
    const url = new URL(img.getAttribute("onclick").match(/'(.*?)'/)[1], window.location.href);
    const productId = url.searchParams.get("id");

    const avgRating = parseFloat(ratings[productId]) || 0;
    const fullStars = Math.round(avgRating);
    const emptyStars = 5 - fullStars;
    const stars = "★".repeat(fullStars) + "☆".repeat(emptyStars);

    const ratingElem = card.querySelector(".product-rating .stars");
    const valueElem = card.querySelector(".product-rating .rating-value");

    if (ratingElem && valueElem) {
      ratingElem.textContent = stars;
      ratingElem.style.color = avgRating > 0 ? "gold" : "#ccc";
      valueElem.textContent = `(${avgRating.toFixed(1)})`;
    }
  });
}

// Gọi khi load trang
updateProductRatings();

// 🔄 Cập nhật realtime khi localStorage thay đổi (ở tab khác)
window.addEventListener("storage", (e) => {
  if (e.key === "ratings") updateProductRatings();
});


  // 🔹 Khi click nút Thêm vào giỏ hàng
  document.querySelectorAll(".btn-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const popup = document.getElementById("popupCart");
      popup.classList.add("show");
      setTimeout(() => popup.classList.remove("show"), 2000); // tự ẩn sau 2 giây
    });
  });

  function toggleCartPopup() {
    const popup = document.getElementById("cart-popup");
    const overlay = document.getElementById("overlay");
    const isOpen = popup.classList.contains("open");

    if (!isOpen) {
      popup.classList.add("open");
      overlay.classList.add("show");
    } else {
      popup.classList.remove("open");
      overlay.classList.remove("show");
    }
  }

  // 🔹 Khi click "Thêm vào giỏ hàng" thì mở popup
  document.querySelectorAll(".btn-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleCartPopup();
    });
  });

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


//pop up//
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


(function () {
  function formatVNCurrency(amount) {
    const safe = Number.isFinite(amount) ? amount : 0;
    return new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(safe))) + '₫';
  }

  function parseCurrencyVND(text) {
    if (!text) return 0;
    const digits = String(text).replace(/[^\d]/g, '');
    const value = Number(digits);
    return Number.isFinite(value) ? value : 0;
  }

  function loadCheckoutData() {
    try {
      const raw = localStorage.getItem('checkoutData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function renderCartFromData(data) {
    const container = document.querySelector('.product-column .cart-summary');
    if (!container || !Array.isArray(data.items)) return;

    // Remove existing static items
    container.querySelectorAll('.cart-item').forEach(function (node) { node.remove(); });

    // Render saved items (unit price shown; qty line used for calculation)
    data.items.forEach(function (item) {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML =
        '<img src="' + (item.imageSrc || 'images/nailbox1.jpg') + '" alt="' + (item.name || 'Sản phẩm') + '">' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + (item.name || '') + '</div>' +
          '<div class="cart-item-details">Size: ' + (item.size || 'M') + ' / Color: ' + (item.color || 'Pink') + '</div>' +
          '<div class="cart-item-footer">' +
            '<span class="cart-item-price">' + formatVNCurrency(item.unitPrice || 0) + '</span>' +
            '<button class="remove-btn">🗑️ Xóa</button>' +
          '</div>' +
        '</div>';
      container.appendChild(el);
    });
  }

  function getItemQuantity(itemEl) {
    const qtyInput = itemEl.querySelector('input[type="number"], .qty-input, select[name*="qty"]');
    if (qtyInput) {
      const v = parseInt(qtyInput.value, 10);
      return Number.isFinite(v) && v > 0 ? v : 1;
    }
    // Prefer explicit qty line we render
    const qtyEl = itemEl.querySelector('.cart-item-qty');
    if (qtyEl) {
      const m = qtyEl.textContent.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 1;
    }
    // Fallback: first p in info
    const qtyText = itemEl.querySelector('.cart-item-info p');
    if (!qtyText) return 1;
    const m = qtyText.textContent.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  function getItemUnitPrice(itemEl) {
    const priceEl = itemEl.querySelector('.cart-item-footer span');
    return parseCurrencyVND(priceEl ? priceEl.textContent : '0');
  }

  function getShippingFee() {
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (!selectedShipping) return 15000; // Default to standard shipping
    
    if (selectedShipping.value === 'express') {
      return 30000; // Hỏa tốc
    } else {
      return 15000; // Tiêu chuẩn
    }
  }

  function calculateCartTotalFromDom() {
    const items = document.querySelectorAll('.product-column .cart-summary .cart-item');
    let subtotal = 0;
    items.forEach(function (item) {
      const qty = getItemQuantity(item);
      const unitPrice = getItemUnitPrice(item);
      subtotal += unitPrice * qty;
    });
    const shipping = getShippingFee();
    return subtotal + shipping;
  }

  function updateTotalDisplay(amount) {
    const totalEl = document.querySelector('.checkout-footer .total h2');
    const subtotalEl = document.getElementById('subtotal-display');
    const shippingEl = document.getElementById('shipping-display');
    const totalDisplayEl = document.getElementById('total-display');
    
    if (!totalEl) return;
    const value = Number.isFinite(amount) ? amount : calculateCartTotalFromDom();
    totalEl.textContent = formatVNCurrency(value);
    
    // Update cost breakdown
    if (subtotalEl) {
      const items = document.querySelectorAll('.product-column .cart-summary .cart-item');
      let subtotal = 0;
      items.forEach(function (item) {
        const qty = getItemQuantity(item);
        const unitPrice = getItemUnitPrice(item);
        subtotal += unitPrice * qty;
      });
      subtotalEl.textContent = formatVNCurrency(subtotal);
    }
    
    if (shippingEl) {
      const shipping = getShippingFee();
      shippingEl.textContent = formatVNCurrency(shipping);
    }
    
    if (totalDisplayEl) {
      totalDisplayEl.textContent = formatVNCurrency(value);
    }
  }

  function persistToLocalStorageFromDom() {
    const items = Array.from(document.querySelectorAll('.product-column .cart-summary .cart-item')).map(function (item) {
      const name = (item.querySelector('.cart-item-name')?.textContent || '').trim();
      const details = (item.querySelector('.cart-item-details')?.textContent || '').trim();
      const size = details.includes('Size:') ? details.split('Size: ')[1]?.split(' /')[0] || 'M' : 'M';
      const color = details.includes('Color:') ? details.split('Color: ')[1] || 'Pink' : 'Pink';
      const quantity = getItemQuantity(item);
      const unitPrice = getItemUnitPrice(item);
      const imageSrc = item.querySelector('img')?.getAttribute('src') || '';
      const lineTotal = unitPrice * quantity;
      return { name, size, color, quantity, unitPrice, lineTotal, imageSrc };
    });
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const shipping = getShippingFee();
    const total = subtotal + shipping;
    const payload = {
      items,
      subtotal,
      shipping,
      total,
      currency: 'VND',
      locale: 'vi-VN',
      savedAt: new Date().toISOString(),
    };
    try { localStorage.setItem('checkoutData', JSON.stringify(payload)); } catch {}
  }

  function wireRemoveButtons() {
    document.querySelectorAll('.product-column .cart-summary .cart-item .remove-btn')
      .forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const item = btn.closest('.cart-item');
          if (item) item.remove();
          persistToLocalStorageFromDom();
          updateTotalDisplay();
        });
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit for all elements to be ready
    setTimeout(function() {
      const data = loadCheckoutData();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        renderCartFromData(data);
        updateTotalDisplay(data.total); // show exactly what was in cart
      } else {
        updateTotalDisplay(); // fallback to static DOM
      }
  
      wireRemoveButtons();
  
      // Auto-update if DOM changes (e.g., removes)
      const cart = document.querySelector('.product-column .cart-summary');
      if (cart && 'MutationObserver' in window) {
        const observer = new MutationObserver(function () {
          updateTotalDisplay();
          wireRemoveButtons();
        });
        observer.observe(cart, { childList: true, subtree: true });
      }
    }, 100);

    // Listen for qty changes if present
    document.body.addEventListener('input', function (e) {
      if (e.target.matches('input[type="number"], .qty-input, select[name*="qty"]')) {
        persistToLocalStorageFromDom();
        updateTotalDisplay();
      }
    });

    // Listen for shipping method changes
    document.body.addEventListener('change', function (e) {
      if (e.target.matches('input[name="shipping"]')) {
        persistToLocalStorageFromDom();
        updateTotalDisplay();
      }
    });
  });
})();

document.querySelector('.checkout-btn').addEventListener('click', function () {
  // Lấy thông tin người dùng
  const email = document.querySelector('input[type="email"]').value.trim() || "Chưa nhập";
  const name = document.querySelector('input[placeholder="Họ và tên"]').value.trim() || "Chưa nhập";
  const phone = document.querySelector('input[placeholder="Nhập số điện thoại"]').value.trim() || "Chưa nhập";
  const address = document.querySelector('input[placeholder="Số nhà, đường, khu vực"]').value.trim() || "";
  const ward = document.querySelectorAll('select')[2]?.value || "";
  const district = document.querySelectorAll('select')[1]?.value || "";
  const province = document.querySelectorAll('select')[0]?.value || "";
  const fullAddress = `${address}, ${ward}, ${district}, ${province}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '');

  // Lấy thông tin vận chuyển
  const selectedShipping = document.querySelector('input[name="shipping"]:checked');
  const shippingMethod = selectedShipping ? (selectedShipping.value === 'express' ? 'Giao hàng hoả tốc (4 giờ)' : 'Giao hàng tiêu chuẩn (2-3 ngày)') : 'Chưa chọn';
  const shippingFee = getShippingFee();

  // Tính subtotal (tổng tiền hàng không bao gồm phí ship)
  const items = document.querySelectorAll('.product-column .cart-summary .cart-item');
  let subtotal = 0;
  items.forEach(function (item) {
    const qty = getItemQuantity(item);
    const unitPrice = getItemUnitPrice(item);
    subtotal += unitPrice * qty;
  });

  // Lấy tổng tiền
  const total = document.querySelector('.checkout-footer .total h2').textContent;

  // Tạo nội dung hóa đơn
  const invoiceHTML = `
    <strong>Khách hàng:</strong> ${name}<br>
    <strong>Email:</strong> ${email}<br>
    <strong>Số điện thoại:</strong> ${phone}<br>
    <strong>Địa chỉ:</strong> ${fullAddress}<br>
    <strong>Phương thức vận chuyển:</strong> ${shippingMethod}<br><br>
    <strong>Chi tiết đơn hàng:</strong><br>
    - Tổng tiền hàng: ${formatVNCurrency(subtotal)}<br>
    <strong>Tổng cộng: ${total}</strong><br><br>
    Cảm ơn bạn đã đặt hàng tại <b>Nailistas Việt Nam</b> 💅
  `;

  document.getElementById('invoiceDetails').innerHTML = invoiceHTML;

  // Hiện popup
  document.getElementById('invoicePopup').style.display = 'flex';
});

// Nút đóng popup
document.getElementById('closeInvoice').addEventListener('click', function () {
  document.getElementById('invoicePopup').style.display = 'none';
});
window.addEventListener('load', function() {
  const overlay = document.getElementById('transition-overlay');
  
  // Hiển thị overlay 3 giây trước khi fade out
  setTimeout(() => {
    overlay.style.opacity = 0; // fade out
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 800); // 800ms = thời gian transition trong CSS
  }, 1000); // 1000ms = 1 giây
});
function goBack() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = 1;

  // Giữ overlay 3 giây trước khi quay lại trang trước
  setTimeout(() => {
    window.history.back();
  }, 3000);
}

// Function to go to a specific page (goHome) with transition effect
function goHome() {
const overlay = document.getElementById('transition-overlay');
overlay.style.display = 'flex'; // Show the overlay
overlay.style.opacity = '1';    // Make the overlay visible
setTimeout(() => {
  window.location.href = "../Homepage/ck.html";  // Redirect to the desired page after 800ms
}, 800); // Wait for 800ms to let the overlay transition
}

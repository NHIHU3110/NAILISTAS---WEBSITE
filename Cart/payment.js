(function () {
  // ======== HELPER FUNCTIONS ========
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

  function getItemQuantity(itemEl) {
      const qtyInput = itemEl.querySelector('input[type="number"], .qty-input, select[name*="qty"]');
      if (qtyInput) {
          const v = parseInt(qtyInput.value, 10);
          return Number.isFinite(v) && v > 0 ? v : 1;
      }
      const qtyEl = itemEl.querySelector('.cart-item-qty');
      if (qtyEl) {
          const m = qtyEl.textContent.match(/(\d+)/);
          return m ? parseInt(m[1], 10) : 1;
      }
      return 1;
  }

  function getItemUnitPrice(itemEl) {
      const priceEl = itemEl.querySelector('.cart-item-footer span');
      return parseCurrencyVND(priceEl ? priceEl.textContent : '0');
  }

  // ======= SỬA THÊM: Lấy phí vận chuyển và hiển thị ngay khi chọn =======
  function getShippingFee() {
      const selectedShipping = document.querySelector('input[name="shipping"]:checked');
      if (!selectedShipping) return 15000;
      return selectedShipping.value === 'express' ? 30000 : 15000;
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
      const subtotalEl = document.getElementById('subtotal-display');
      const shippingEl = document.getElementById('shipping-display');
      const totalDisplayEl = document.getElementById('total-display');

      const items = document.querySelectorAll('.product-column .cart-summary .cart-item');
      let subtotal = 0;
      items.forEach(function (item) {
          subtotal += getItemQuantity(item) * getItemUnitPrice(item);
      });

      if (subtotalEl) subtotalEl.textContent = formatVNCurrency(subtotal);
      if (shippingEl) shippingEl.textContent = formatVNCurrency(getShippingFee());
      if (totalDisplayEl) totalDisplayEl.textContent = formatVNCurrency(amount || subtotal + getShippingFee());
  }

  function renderCartFromData(data) {
      const container = document.querySelector('.product-column .cart-summary');
      if (!container || !Array.isArray(data.items)) return;
      container.querySelectorAll('.cart-item').forEach(node => node.remove());

      data.items.forEach(item => {
          const el = document.createElement('div');
          el.className = 'cart-item';
          el.innerHTML =
              `<img src="${item.imageSrc || 'images/nailbox1.jpg'}" alt="${item.name || 'Sản phẩm'}">
              <div class="cart-item-info">
                  <div class="cart-item-name">${item.name || ''}</div>
                  <div class="cart-item-details">Size: ${item.size || 'M'} / Color: ${item.color || 'Pink'}</div>
                  <div class="cart-item-footer">
                      <span class="cart-item-price">${formatVNCurrency(item.unitPrice || 0)}</span>
                      <button class="remove-btn">🗑️ Xóa</button>
                  </div>
              </div>`;
          container.appendChild(el);
      });
  }

  function persistToLocalStorageFromDom() {
      const items = Array.from(document.querySelectorAll('.product-column .cart-summary .cart-item')).map(item => {
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
      const payload = { items, subtotal, shipping, total, currency: 'VND', locale: 'vi-VN', savedAt: new Date().toISOString() };
      try { localStorage.setItem('checkoutData', JSON.stringify(payload)); } catch {}
  }

  function wireRemoveButtons() {
      document.querySelectorAll('.product-column .cart-summary .cart-item .remove-btn').forEach(btn => {
          btn.addEventListener('click', function (e) {
              e.preventDefault();
              const item = btn.closest('.cart-item');
              if (item) item.remove();
              persistToLocalStorageFromDom();
              updateTotalDisplay();
          });
      });
  }

  // ======== DOM CONTENT LOADED ========
  document.addEventListener('DOMContentLoaded', function () {
      const data = loadCheckoutData();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
          renderCartFromData(data);
          updateTotalDisplay(data.total);
      } else {
          updateTotalDisplay();
      }
      wireRemoveButtons();

      // Observer để tự động cập nhật khi xóa items
      const cart = document.querySelector('.product-column .cart-summary');
      if (cart && 'MutationObserver' in window) {
          const observer = new MutationObserver(() => { updateTotalDisplay(); wireRemoveButtons(); });
          observer.observe(cart, { childList: true, subtree: true });
      }

      // Lắng nghe input số lượng
      document.body.addEventListener('input', e => {
          if (e.target.matches('input[type="number"], .qty-input, select[name*="qty"]')) {
              persistToLocalStorageFromDom();
              updateTotalDisplay();
          }
      });

      // Lắng nghe thay đổi phương thức vận chuyển → cập nhật ngay
      document.body.addEventListener('change', e => {
          if (e.target.matches('input[name="shipping"]')) {
              persistToLocalStorageFromDom();
              updateTotalDisplay();
          }
      });

   // ======== BUTTON "ĐẶT HÀNG" + KIỂM TRA THÔNG TIN KHÁCH HÀNG =======
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
        const emailEl = document.querySelector('input[type="email"]');
        const nameEl = document.querySelector('input[placeholder="Họ và tên"]');
        const phoneEl = document.querySelector('input[placeholder="Nhập số điện thoại"]');
        const addressEl = document.querySelector('input[placeholder="Số nhà, đường, khu vực"]');

        // Checkbox và textarea lời nhắn
        const giftCheckbox = document.querySelector('#gift');
        const giftMessage = document.querySelector('.gift-message textarea');

        // ======= KIỂM TRA NHẬP ĐẦY ĐỦ =======
        let valid = true;
        [emailEl, nameEl, phoneEl, addressEl].forEach(el => {
            if (!el || !el.value.trim()) {
                el.style.border = '1px solid red';
                valid = false;
            } else {
                el.style.border = '';
            }
        });
        if (!valid) { 
            alert('Vui lòng điền đầy đủ thông tin khách hàng!'); 
            return; 
        }

        const email = emailEl.value.trim();
        const phone = phoneEl.value.trim();
        const name = nameEl.value.trim();
        const address = addressEl.value.trim();

        // ======= KIỂM TRA EMAIL =======
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailPattern.test(email)) {
            emailEl.style.border = '1px solid red';
            alert('Email không hợp lệ! Vui lòng nhập đúng định dạng email.');
            return;
        } else {
            emailEl.style.border = '';
        }

        // ======= KIỂM TRA SỐ ĐIỆN THOẠI =======
        const phonePattern = /^(0\d{9}|\+84\d{9})$/;
        if(!phonePattern.test(phone)) {
            phoneEl.style.border = '1px solid red';
            alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số, bắt đầu bằng 0 hoặc +84.');
            return;
        } else {
            phoneEl.style.border = '';
        }

        if(giftCheckbox && giftCheckbox.checked) {
          if(!giftMessage || !giftMessage.value.trim()) {
              // Nếu checkbox gửi lời nhắn tick nhưng chưa nhập nội dung
              giftMessage.style.border = '1px solid red'; // viền đỏ báo lỗi
              alert('Bạn đã tick gửi lời nhắn, vui lòng nhập nội dung!');
              return; // Dừng hàm, không tiếp tục checkout / show QR
          } else {
              giftMessage.style.border = ''; // xóa viền đỏ nếu đã nhập
          }
      }
      

        const ward = document.querySelectorAll('select')[2]?.value || "";
        const district = document.querySelectorAll('select')[1]?.value || "";
        const province = document.querySelectorAll('select')[0]?.value || "";
        const fullAddress = `${address}, ${ward}, ${district}, ${province}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '');

        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        const shippingMethod = selectedShipping ?
            (selectedShipping.value === 'express' ? 'Giao hàng hoả tốc (4 giờ)' : 'Giao hàng tiêu chuẩn (2-3 ngày)') : 'Chưa chọn';
        const shippingFee = getShippingFee();

        const items = document.querySelectorAll('.product-column .cart-summary .cart-item');
        let subtotal = 0;
        items.forEach(item => { subtotal += getItemQuantity(item) * getItemUnitPrice(item); });

        const total = subtotal + shippingFee;

        const invoiceHTML = `
            <strong>Khách hàng:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Số điện thoại:</strong> ${phone}<br>
            <strong>Địa chỉ:</strong> ${fullAddress}<br>
            <strong>Phương thức vận chuyển:</strong> ${shippingMethod}<br><br>
            ${giftCheckbox && giftCheckbox.checked ? `<strong>Lời nhắn:</strong> ${giftMessage.value.trim()}<br><br>` : ''}
            <strong>Tổng tiền hàng:</strong> ${formatVNCurrency(subtotal)}<br>
            <strong>Phí vận chuyển:</strong> ${formatVNCurrency(shippingFee)}<br>
            <strong>Tổng cộng:</strong> ${formatVNCurrency(total)}<br><br>
            Cảm ơn bạn đã đặt hàng tại <b>Nailistas Việt Nam</b> 💅
        `;
        document.getElementById('invoiceDetails').innerHTML = invoiceHTML;
        document.getElementById('invoicePopup').style.display = 'flex';
    });
}


      // Nút đóng popup
      const closeInvoiceBtn = document.getElementById('closeInvoice');
      if (closeInvoiceBtn) {
          closeInvoiceBtn.addEventListener('click', function () {
              document.getElementById('invoicePopup').style.display = 'none';
          });
      }
  });

  // ======== TRANSITION OVERLAY ========
  window.addEventListener('load', function () {
      const overlay = document.getElementById('transition-overlay');
      setTimeout(() => {
          overlay.style.opacity = 0;
          setTimeout(() => { overlay.style.display = 'none'; }, 800);
      }, 1000);
  });

  // Go back function
  window.goBack = function () {
      const overlay = document.getElementById('transition-overlay');
      overlay.style.display = 'flex';
      overlay.style.opacity = 1;
      setTimeout(() => { window.history.back(); }, 3000);
  };

  // Go home function
  window.goHome = function () {
      const overlay = document.getElementById('transition-overlay');
      overlay.style.display = 'flex';
      overlay.style.opacity = 1;
      setTimeout(() => { window.location.href = "../Homepage/ck.html"; }, 800);
  };
})();
// Hàm lấy danh sách tỉnh thành
function loadProvinces() {
  fetch('https://api.vnappmob.com/api/v2/province/')
    .then(response => response.json())
    .then(data => {
      const provinceSelect = document.getElementById('province');
      data.results.forEach(province => {
        const option = document.createElement('option');
        option.value = province.province_id;
        option.textContent = province.province_name;
        provinceSelect.appendChild(option);
      });
    });
}

// Hàm lấy danh sách quận/huyện theo tỉnh
function loadDistricts(provinceId) {
  fetch(`https://api.vnappmob.com/api/v2/province/district/${provinceId}`)
    .then(response => response.json())
    .then(data => {
      const districtSelect = document.getElementById('district');
      districtSelect.innerHTML = ''; // Xóa các tùy chọn cũ
      data.results.forEach(district => {
        const option = document.createElement('option');
        option.value = district.district_id;
        option.textContent = district.district_name;
        districtSelect.appendChild(option);
      });
    });
}

// Hàm lấy danh sách phường/xã theo quận/huyện
function loadWards(districtId) {
  fetch(`https://api.vnappmob.com/api/v2/province/ward/${districtId}`)
    .then(response => response.json())
    .then(data => {
      const wardSelect = document.getElementById('ward');
      wardSelect.innerHTML = ''; // Xóa các tùy chọn cũ
      data.results.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.ward_id;
        option.textContent = ward.ward_name;
        wardSelect.appendChild(option);
      });
    });
}

// Sự kiện thay đổi tỉnh thành
document.getElementById('province').addEventListener('change', (event) => {
  const provinceId = event.target.value;
  loadDistricts(provinceId);
});

// Sự kiện thay đổi quận/huyện
document.getElementById('district').addEventListener('change', (event) => {
  const districtId = event.target.value;
  loadWards(districtId);
});

// Gọi hàm để nạp danh sách tỉnh thành khi trang được tải
window.addEventListener('DOMContentLoaded', () => {
  loadProvinces();
});

/*Toạ dộ */
// ==== MAP LEAFLET ====
let map, marker;

// Hàm khởi tạo map
function initMap(lat = 21.0285, lng = 105.8542) { // mặc định Hà Nội
  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
  }).addTo(map);

  marker = L.marker([lat, lng], { draggable: true }).addTo(map);

  marker.on('dragend', function(e) {
      const pos = marker.getLatLng();
      updateAddressInput(pos.lat, pos.lng);
  });

  map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      updateAddressInput(e.latlng.lat, e.latlng.lng);
  });
}

// Hàm cập nhật input địa chỉ từ lat/lng bằng Nominatim (OpenStreetMap)
function updateAddressInput(lat, lng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
          if(data.display_name) {
              const fullAddressInput = document.getElementById('fullAddress');
              if(fullAddressInput) fullAddressInput.value = data.display_name;
          }
      });
}

// Khi người chọn ward/quận, cập nhật map trung tâm
function focusOnLocation(lat, lng) {
  if(map && marker) {
      map.setView([lat, lng], 16);
      marker.setLatLng([lat, lng]);
      updateAddressInput(lat, lng);
  }
}

// Khởi tạo map khi DOM xong
window.addEventListener('DOMContentLoaded', () => {
  initMap();
});

function focusLocationByName(name) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
          if(data[0]) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              focusOnLocation(lat, lng);
          }
      });
}

function focusOnLocation(lat, lng) {
  if(marker) marker.setLatLng([lat, lng]);
  if(map) map.setView([lat, lng], 15);
}

document.getElementById('province').addEventListener('change', (e) => {
  const provinceName = e.target.selectedOptions[0].text;
  focusLocationByName(provinceName);
});

document.getElementById('district').addEventListener('change', (e) => {
  const districtName = e.target.selectedOptions[0].text;
  focusLocationByName(districtName);
});
document.getElementById('ward').addEventListener('change', (e) => {
  const wardName = e.target.selectedOptions[0].text;
  const districtName = document.getElementById('district').selectedOptions[0].text;
  const provinceName = document.getElementById('province').selectedOptions[0].text;
  const fullAddress = `${wardName}, ${districtName}, ${provinceName}`;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
      .then(res => res.json())
      .then(data => {
          if(data[0]) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              const bbox = data[0].boundingbox.map(Number); // [lat_min, lat_max, lon_min, lon_max]
              if(map && marker) {
                  marker.setLatLng([lat, lng]);
                  map.fitBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]]); // zoom vào xã đúng
              }
          }
      });
});

// Lấy các element
const qrPopup = document.getElementById("qrPopup");
const closeQRBtn = document.getElementById("closeQR"); // nút hủy QR
const paymentStatusPopup = document.getElementById("paymentStatusPopup");
const paymentStatusTitle = document.getElementById("paymentStatusTitle");
const paymentStatusMessage = document.getElementById("paymentStatusMessage");
const closePaymentStatus = document.getElementById("closePaymentStatus");

// Nút checkout
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
        const emailEl = document.querySelector('input[type="email"]');
        const nameEl = document.querySelector('input[placeholder="Họ và tên"]');
        const phoneEl = document.querySelector('input[placeholder="Nhập số điện thoại"]');
        const addressEl = document.querySelector('input[placeholder="Số nhà, đường, khu vực"]');

        // Kiểm tra info
        if (![emailEl, nameEl, phoneEl, addressEl].every(el => el && el.value.trim())) {
            alert('Vui lòng điền đầy đủ thông tin khách hàng!');
            return;
        }

        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if(!selectedPayment) {
            alert('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        // Xác định QR
        const label = selectedPayment.closest('label') || selectedPayment.parentElement;
        let qrSrc = '';
        if(label.textContent.includes("Ví MoMo")) qrSrc = "images/facebook_qrcode.png";
        else if(label.textContent.includes("ATM/VISA/MASTER")) qrSrc = "images/facebook_qrcode.png";

        // Hiển thị QR nếu có
        if(qrSrc) showQR(qrSrc);

        // Lấy dữ liệu khách hàng để invoice
        const fullAddress = `${addressEl.value}, ${document.getElementById('ward').selectedOptions[0]?.text || ""}, ${document.getElementById('district').selectedOptions[0]?.text || ""}, ${document.getElementById('province').selectedOptions[0]?.text || ""}`;
        const invoiceHTML = `
            <strong>Khách hàng:</strong> ${nameEl.value}<br>
            <strong>Email:</strong> ${emailEl.value}<br>
            <strong>Số điện thoại:</strong> ${phoneEl.value}<br>
            <strong>Địa chỉ:</strong> ${fullAddress}<br>
            <strong>Phương thức thanh toán:</strong> ${label.textContent.trim()}<br>
            <strong>Tổng tiền:</strong> ...<br>
        `;
        // Lưu tạm để hiển thị sau khi thanh toán thành công
        qrPopup.dataset.invoiceHTML = invoiceHTML;
    });
}

// Hiển thị QR
function showQR(qrSrc) {
    document.getElementById("qrCodeImage").src = qrSrc;
    qrPopup.style.display = "flex";
    startCountdown(5*60);
}

// Nút hủy QR
if(closeQRBtn) closeQRBtn.addEventListener('click', () => qrPopup.style.display = "none");

function simulatePaymentSuccess() {
  window.paymentTimeout = setTimeout(() => {
      // Chỉ hiển thị nếu popup QR đang mở
      if(qrPopup.style.display !== "none") {
          hideQR();
          paymentStatusTitle.textContent = "✅ Thanh toán thành công!";
          paymentStatusMessage.innerHTML = qrPopup.dataset.invoiceHTML || "";
          paymentStatusPopup.style.display = "flex";
      }
      window.paymentTimeout = null;
  }, 8000); 
}


// Countdown QR
function startCountdown(seconds) {
    let remaining = seconds;
    const countdownEl = document.getElementById("countdown");
    updateCountdownText(remaining, countdownEl);
    clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(() => {
        remaining--;
        if(remaining <= 0){
            clearInterval(window.countdownInterval);
            alert("Thời gian thanh toán hết!");
            hideQR();
            return;
        }
        updateCountdownText(remaining, countdownEl);
    }, 1000);
    simulatePaymentSuccess();
}

function updateCountdownText(seconds, el){
    const m = String(Math.floor(seconds/60)).padStart(2,"0");
    const s = String(seconds%60).padStart(2,"0");
    if(el) el.textContent = `${m}:${s}`;
}

function hideQR(){
  qrPopup.style.display = "none";
  clearInterval(window.countdownInterval);

  // Hủy simulatePaymentSuccess nếu đang chờ
  if(window.paymentTimeout) {
      clearTimeout(window.paymentTimeout);
      window.paymentTimeout = null;
  }
}


// Đóng popup thanh toán thành công
if(closePaymentStatus) closePaymentStatus.addEventListener("click", () => paymentStatusPopup.style.display = "none");

//chatbot//
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/68fd00ab603401195169ddbc/1j8e4l8i4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();


// ====== CHECKOUT ======
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const voucherInput = document.querySelector('.voucher-input');
    const voucherBtn = document.querySelector('.voucher-apply-btn');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const shippingDisplay = document.getElementById('shipping-display');
    const discountDisplay = document.querySelector('.cost-row:nth-child(4) span');
    const totalDisplay = document.getElementById('total-display');
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');

    // --- Mã voucher ---
    const vouchers = {
        "GIAM10": 0.1,      // giảm 10%
        "GIAM50K": 50000,   // giảm 50.000₫
        "FREE": 1           // giảm 100%
    };

    // --- Biến lưu trữ ---
    let discountCoupon = 0;

    // --- Lấy subtotal và shipping từ DOM ---
    function getCostsFromDOM() {
        const subtotal = parseInt(subtotalDisplay?.textContent.replace(/[^\d]/g, '')) || 0;
        let shipping = 0;
        shippingRadios.forEach(r => {
            if (r.checked) shipping = r.value === 'express' ? 30000 : 15000;
        });
        return { subtotal, shipping };
    }
    function updateCostDisplay() {
        const { subtotal, shipping } = getCostsFromDOM();
    
        const subtotalDisplay = document.getElementById('subtotal-display');
        const shippingDisplay = document.getElementById('shipping-display');
        const memberDiscountDisplay = document.querySelector('.member-discount'); // đổi từ .discount-amount
        const totalDisplay = document.getElementById('total-display');
    
        subtotalDisplay.textContent = subtotal.toLocaleString('vi-VN') + "₫";
        shippingDisplay.textContent = shipping.toLocaleString('vi-VN') + "₫";
    
        // Giảm giá hiển thị ngay chỗ member-discount
        memberDiscountDisplay.textContent = discountCoupon.toLocaleString('vi-VN') + "₫";
    
        const total = subtotal + shipping - discountCoupon;
totalDisplay.textContent = (total > 0 ? total : 0).toLocaleString('vi-VN') + "₫";
    }
    


    // --- Áp dụng voucher ---
    if(voucherBtn){
        voucherBtn.addEventListener('click', () => {
            const code = voucherInput?.value.toUpperCase().trim();
            const { subtotal } = getCostsFromDOM();

            if (!code) {
                alert("Vui lòng nhập mã voucher!");
                return;
            }

            if (vouchers[code] !== undefined) {
                if (vouchers[code] < 1) {
                    discountCoupon = Math.round(subtotal * vouchers[code]); // giảm % theo subtotal
                } else {
                    discountCoupon = vouchers[code]; // giảm tiền cố định
                }
                alert(`Voucher hợp lệ! Bạn được giảm ${discountCoupon.toLocaleString('vi-VN')}₫`);
            } else {
                discountCoupon = 0;
                alert("Mã voucher không hợp lệ!");
            }

            updateCostDisplay();
        });
    }

    // --- Thay đổi phí vận chuyển ---
    shippingRadios.forEach(radio => radio.addEventListener('change', updateCostDisplay));

    // --- Khởi tạo hiển thị ---
    updateCostDisplay();
});

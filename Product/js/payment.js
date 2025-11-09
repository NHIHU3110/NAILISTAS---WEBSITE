(function () {
  // ========= Utils =========
  const VND = n => (Number(n) || 0).toLocaleString('vi-VN') + '₫';
  const toInt = s => {
    const v = Number(String(s||'').replace(/[^\d]/g,''));
    return Number.isFinite(v) ? v : 0;
  };

  // ========= Seed checkoutData nếu thiếu (từ localStorage.cart) =========
  (function seedFromLocalStorageIfMissing(){
    try{
      if(!sessionStorage.getItem('checkoutData')){
        const ls = JSON.parse(localStorage.getItem('cart')||'[]');
        if(ls.length){
          const items = ls.map(x => ({
            id        : String(x.id || ''),
            name      : x.name || 'Sản phẩm',
            imageSrc  : x.img || 'images/nailbox1.jpg',
            size      : x.size || '',
            color     : x.color || '',
            quantity  : Number(x.quantity) || 1,
            unitPrice : Number(x.price) || 0
          }));
          sessionStorage.setItem('checkoutData', JSON.stringify({ items }));
        }
      }
    }catch{}
  })();

  // ========= Nguồn dữ liệu & đồng bộ =========
  function getCheckoutData(){
    try { return JSON.parse(sessionStorage.getItem('checkoutData')||'{}'); } catch { return {}; }
  }
  function setCheckoutData(payload){
    try { sessionStorage.setItem('checkoutData', JSON.stringify(payload || {})); } catch {}
  }
  function getItems(){
    const data = getCheckoutData();
    return Array.isArray(data.items) ? data.items : [];
  }
  function setItems(items){
    setCheckoutData({ items });
  }

  function syncItemsToLocalStorageCart(items){
    // Đồng bộ về localStorage.cart để trang nguồn/popup giỏ hàng update
    const mapped = items.map(it => ({
      id: it.id, name: it.name, img: it.imageSrc, price: it.unitPrice, quantity: it.quantity
    }));
    try { localStorage.setItem('cart', JSON.stringify(mapped)); } catch {}
  }

  // ========= Render giỏ trên payment =========
  const wrapSelector = () => document.getElementById('payment-cart-summary')
                        || document.querySelector('.product-column .cart-summary');

  function renderCart(){
    const wrap = wrapSelector();
    if(!wrap) return;
    wrap.innerHTML = '';

    const items = getItems();
    if(!items.length){
      wrap.innerHTML = `<p style="color:#666">Giỏ hàng trống.</p>`;
      updateCostsUI(0, getShippingFee(), currentDiscount());
      return;
    }

    items.forEach(it=>{
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${it.imageSrc || 'images/nailbox1.jpg'}" alt="${it.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${it.name}</div>
          <div class="cart-item-details">
            ${it.size ? `Size: ${it.size}` : ''} ${it.color ? `/ Color: ${it.color}` : ''} ${(!it.size && !it.color) ? '' : ''} 
            ${it.quantity ? ` ${it.quantity > 1 ? `(x${it.quantity})` : ''}` : ''}
          </div>
          <div class="cart-item-footer">
            <span class="cart-item-price">${VND(it.unitPrice * (it.quantity || 1))}</span>
            <button class="remove-btn" data-id="${it.id}">🗑️ Xóa</button>
          </div>
        </div>
      `;
      wrap.appendChild(row);
    });

    const subtotal = items.reduce((s,it)=> s + (Number(it.unitPrice)||0)*(Number(it.quantity)||1), 0);
    updateCostsUI(subtotal, getShippingFee(), currentDiscount());
  }

  // ========= Shipping / Voucher / Totals =========
  function getShippingFee(){
    const r = document.querySelector('input[name="shipping"]:checked');
    if(!r) return 15000;
    return r.value === 'express' ? 30000 : 15000;
  }

  let discountCoupon = 0; // số tiền giảm hiện hành
  function currentDiscount(){ return discountCoupon; }

  function updateCostsUI(subtotal, shipping, discount){
    const subtotalEl = document.getElementById('subtotal-display');
    const shipEl     = document.getElementById('shipping-display');
    const discEl     = document.querySelector('.member-discount');
    const totalEl    = document.getElementById('total-display');

    if(subtotalEl) subtotalEl.textContent = VND(subtotal);
    if(shipEl)     shipEl.textContent     = VND(shipping);
    if(discEl)     discEl.textContent     = VND(discount);

    const total = Math.max(0, subtotal + shipping - discount);
    if(totalEl)   totalEl.textContent     = VND(total);
  }

  // ========= Popups & Overlay =========
  window.addEventListener('load', function () {
    const overlay = document.getElementById('transition-overlay');
    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => { overlay.style.display = 'none'; }, 800);
    }, 1000);
  });

  window.goHome = function(){
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = 1;
    setTimeout(()=> window.location.href = "../Homepage/ck.html", 800);
  };

  // ========= Form/validate & Invoice =========
  function readCustomer(){
    const emailEl   = document.querySelector('input[type="email"]');
    const nameEl    = document.querySelector('input[placeholder="Họ và tên"]');
    const phoneEl   = document.querySelector('input[placeholder="Nhập số điện thoại"]');
    const addressEl = document.querySelector('input[placeholder="Số nhà, đường, khu vực"]');

    return {
      emailEl, nameEl, phoneEl, addressEl,
      email:   emailEl?.value.trim()   || '',
      name:    nameEl?.value.trim()    || '',
      phone:   phoneEl?.value.trim()   || '',
      address: addressEl?.value.trim() || ''
    };
  }

  function validateCustomer(){
    const {emailEl, nameEl, phoneEl, addressEl, email, name, phone, address} = readCustomer();
    let ok = true;

    [emailEl, nameEl, phoneEl, addressEl].forEach(el=>{
      if(!el || !el.value.trim()){ el.style.border = '1px solid red'; ok=false; }
      else el.style.border = '';
    });
    if(!ok){ alert('Vui lòng điền đầy đủ thông tin khách hàng!'); return false; }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){ emailEl.style.border='1px solid red'; alert('Email không hợp lệ!'); return false; }

    const phonePattern = /^(0\d{9}|\+84\d{9})$/;
    if(!phonePattern.test(phone)){ phoneEl.style.border='1px solid red'; alert('Số điện thoại không hợp lệ!'); return false; }

    // Nếu tick lời nhắn thì phải nhập nội dung
    const giftCheckbox = document.getElementById('gift');
    const giftMessage  = document.querySelector('.gift-message textarea');
    if(giftCheckbox && giftCheckbox.checked){
      if(!giftMessage || !giftMessage.value.trim()){ giftMessage.style.border='1px solid red'; alert('Bạn đã tick gửi lời nhắn, vui lòng nhập nội dung!'); return false; }
      giftMessage.style.border = '';
    }
    return true;
  }

  function buildInvoiceHTML(totalOverride){
    const {email, name, phone, address} = readCustomer();
    const ward = document.getElementById('ward')?.selectedOptions[0]?.text || "";
    const district = document.getElementById('district')?.selectedOptions[0]?.text || "";
    const province = document.getElementById('province')?.selectedOptions[0]?.text || "";
    const fullAddress = `${address}, ${ward}, ${district}, ${province}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '');

    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    const shippingMethod = selectedShipping?.value === 'express' ? 'Giao hàng hoả tốc (4 giờ)' : 'Giao hàng tiêu chuẩn (2-3 ngày)';

    const items = getItems();
    const subtotal = items.reduce((s,it)=> s + (Number(it.unitPrice)||0)*(Number(it.quantity)||1), 0);
    const shipping = getShippingFee();
    const total = typeof totalOverride === 'number' ? totalOverride : Math.max(0, subtotal + shipping - currentDiscount());

    const giftCheckbox = document.getElementById('gift');
    const giftMessage  = document.querySelector('.gift-message textarea');

    return `
      <strong>Khách hàng:</strong> ${name}<br>
      <strong>Email:</strong> ${email}<br>
      <strong>Số điện thoại:</strong> ${phone}<br>
      <strong>Địa chỉ:</strong> ${fullAddress}<br>
      <strong>Phương thức vận chuyển:</strong> ${shippingMethod}<br><br>
      ${giftCheckbox && giftCheckbox.checked ? `<strong>Lời nhắn:</strong> ${giftMessage.value.trim()}<br><br>` : ''}
      <strong>Tổng tiền hàng:</strong> ${VND(subtotal)}<br>
      <strong>Phí vận chuyển:</strong> ${VND(shipping)}<br>
      <strong>Giảm giá:</strong> ${VND(currentDiscount())}<br>
      <strong>Tổng cộng:</strong> ${VND(total)}<br><br>
      Cảm ơn bạn đã đặt hàng tại <b>Nailistas Việt Nam</b> 💅
    `;
  }

  // ========= QR & Thanh toán mô phỏng =========
  const qrPopup = document.getElementById("qrPopup");
  const paymentStatusPopup = document.getElementById("paymentStatusPopup");
  const paymentStatusTitle = document.getElementById("paymentStatusTitle");
  const paymentStatusMessage = document.getElementById("paymentStatusMessage");

  function showQR(qrSrc){
    document.getElementById("qrCodeImage").src = qrSrc;
    qrPopup.style.display = "flex";
    startCountdown(5*60);
  }
  function hideQR(){
    qrPopup.style.display = "none";
    clearInterval(window.countdownInterval);
    if(window.paymentTimeout){ clearTimeout(window.paymentTimeout); window.paymentTimeout=null; }
  }
  function updateCountdownText(seconds, el){
    const m = String(Math.floor(seconds/60)).padStart(2,"0");
    const s = String(seconds%60).padStart(2,"0");
    if(el) el.textContent = `${m}:${s}`;
  }
  function startCountdown(seconds){
    let remaining = seconds;
    const el = document.getElementById("countdown");
    updateCountdownText(remaining, el);
    clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(()=>{
      remaining--;
      if(remaining<=0){
        clearInterval(window.countdownInterval);
        alert("Thời gian thanh toán hết!");
        hideQR();
        return;
      }
      updateCountdownText(remaining, el);
    },1000);
    simulatePaymentSuccess(); // mô phỏng thành công sau 8s
  }
  function simulatePaymentSuccess(){
    window.paymentTimeout = setTimeout(()=>{
      if(qrPopup.style.display !== "none"){
        hideQR();
        paymentStatusTitle.textContent = "✅ Thanh toán thành công!";
        paymentStatusMessage.innerHTML = buildInvoiceHTML();
        paymentStatusPopup.style.display = "flex";

        // ✅ Clear giỏ, set reopenCart, điều hướng về nguồn khi đóng popup
        finalizeOrderAndPrepareReturn();
      }
      window.paymentTimeout=null;
    }, 8000);
  }

  function finalizeOrderAndPrepareReturn(){
    // Dọn giỏ
    try { localStorage.setItem('cart','[]'); } catch {}
    setItems([]); // checkoutData -> rỗng
    try { sessionStorage.setItem('reopenCart','1'); } catch {}

    // Khi đóng popup => quay về trang nguồn + mở drawer
    const closePaymentStatus = document.getElementById("closePaymentStatus");
    if(closePaymentStatus){
      closePaymentStatus.onclick = ()=>{
        paymentStatusPopup.style.display = "none";
        navigateBackToOrigin();
      };
    }
  }

  function navigateBackToOrigin(){
    const origin = sessionStorage.getItem('paymentOrigin')
                || document.referrer
                || '../Cart/cart.html';
    window.location.href = origin;
  }

  // ========= Buttons / Events =========
  document.addEventListener('DOMContentLoaded', function(){
    // Render giỏ & totals lần đầu
    renderCart();

    // Lắng nghe xóa item
    const container = wrapSelector();
    container?.addEventListener('click', (e)=>{
      const btn = e.target.closest('.remove-btn');
      if(!btn) return;
      const id = btn.getAttribute('data-id');
      const items = getItems().filter(it => String(it.id) !== String(id));
      setItems(items);
      syncItemsToLocalStorageCart(items);
      renderCart();
    });

    // Voucher
    const voucherBtn = document.querySelector('.voucher-apply-btn');
    const voucherInput = document.querySelector('.voucher-input');
    const VOUCHERS = { GIAM10: 'pct10', GIAM50K: '50k', FREE: 'free' };

    voucherBtn?.addEventListener('click', ()=>{
      const code = (voucherInput?.value || '').toUpperCase().trim();
      const items = getItems();
      const subtotal = items.reduce((s,it)=> s + (Number(it.unitPrice)||0)*(Number(it.quantity)||1), 0);

      if(!code){ alert('Vui lòng nhập mã voucher!'); return; }
      if(!(code in VOUCHERS)){ discountCoupon=0; alert('Mã voucher không hợp lệ!'); renderCart(); return; }

      switch (VOUCHERS[code]){
        case 'pct10': discountCoupon = Math.round(subtotal*0.10); break;
        case '50k' : discountCoupon = 50000; break;
        case 'free': discountCoupon = subtotal; break;
      }
      alert(`Voucher hợp lệ! Bạn được giảm ${VND(discountCoupon)}`);
      renderCart();
    });

    // Shipping thay đổi
    document.querySelectorAll('input[name="shipping"]').forEach(r=>{
      r.addEventListener('change', ()=> renderCart());
    });

    // Nút đặt hàng
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn?.addEventListener('click', ()=>{
      if(!validateCustomer()) return;

      const selectedPayment = document.querySelector('input[name="payment"]:checked');
      if(!selectedPayment){ alert('Vui lòng chọn phương thức thanh toán!'); return; }

      // Lưu invoice hiển thị (nếu bạn vẫn dùng popup invoice)
      document.getElementById('invoiceDetails').innerHTML = buildInvoiceHTML();
      document.getElementById('invoicePopup').style.display = 'flex';

      // QR theo phương thức
      const labelText = (selectedPayment.closest('label') || selectedPayment.parentElement)?.textContent || '';
      let qrSrc = '';
      if(labelText.includes('MoMo') || labelText.includes('ATM/VISA/MASTER')){
        qrSrc = 'images/facebook_qrcode.png';
      }
      if(qrSrc) showQR(qrSrc);
    });

    // Đóng invoice popup
    document.getElementById('closeInvoice')?.addEventListener('click', ()=>{
      document.getElementById('invoicePopup').style.display = 'none';
    });

    // Hủy QR
    document.getElementById('closeQR')?.addEventListener('click', ()=> hideQR());

    // Quay lại giỏ hàng: set reopenCart rồi về origin
    document.getElementById('back-to-cart')?.addEventListener('click', (e)=>{
      e.preventDefault();
      try { sessionStorage.setItem('reopenCart','1'); } catch {}
      navigateBackToOrigin();
    });
  });

  // ========= Địa lý & Bản đồ =========
  function loadProvinces(){
    fetch('https://api.vnappmob.com/api/v2/province/')
      .then(r=>r.json())
      .then(data=>{
        const sel = document.getElementById('province');
        data.results.forEach(p=>{
          const o=document.createElement('option');
          o.value=p.province_id; o.textContent=p.province_name; sel.appendChild(o);
        });
      });
  }
  function loadDistricts(pid){
    fetch(`https://api.vnappmob.com/api/v2/province/district/${pid}`)
      .then(r=>r.json())
      .then(data=>{
        const sel = document.getElementById('district');
        sel.innerHTML='';
        data.results.forEach(d=>{
          const o=document.createElement('option');
          o.value=d.district_id; o.textContent=d.district_name; sel.appendChild(o);
        });
      });
  }
  function loadWards(did){
    fetch(`https://api.vnappmob.com/api/v2/province/ward/${did}`)
      .then(r=>r.json())
      .then(data=>{
        const sel = document.getElementById('ward');
        sel.innerHTML='';
        data.results.forEach(w=>{
          const o=document.createElement('option');
          o.value=w.ward_id; o.textContent=w.ward_name; sel.appendChild(o);
        });
      });
  }

  // Map (Leaflet)
  let map, marker;
  function initMap(lat=21.0285,lng=105.8542){
    map = L.map('map').setView([lat,lng],15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);
    marker = L.marker([lat,lng], {draggable:true}).addTo(map);
    marker.on('dragend', ()=>{ const pos=marker.getLatLng(); updateAddressInput(pos.lat,pos.lng); });
    map.on('click', e=>{ marker.setLatLng(e.latlng); updateAddressInput(e.latlng.lat,e.latlng.lng); });
  }
  function updateAddressInput(lat,lng){
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res=>res.json())
      .then(data=>{
        if(data.display_name){
          const full = document.getElementById('fullAddress');
          if(full) full.value = data.display_name;
        }
      });
  }
  function focusLocationByName(name){
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`)
      .then(res=>res.json())
      .then(data=>{
        if(data[0]){
          const lat=parseFloat(data[0].lat), lng=parseFloat(data[0].lon);
          if(marker) marker.setLatLng([lat,lng]);
          if(map) map.setView([lat,lng],15);
        }
      });
  }

  // Đăng ký select thay đổi để focus map
  document.addEventListener('DOMContentLoaded', ()=>{
    loadProvinces();
    initMap();
    document.getElementById('province')?.addEventListener('change', e=>{
      const id = e.target.value;
      const name = e.target.selectedOptions[0]?.text || '';
      loadDistricts(id);
      if(name) focusLocationByName(name);
    });
    document.getElementById('district')?.addEventListener('change', e=>{
      const id = e.target.value;
      const name = e.target.selectedOptions[0]?.text || '';
      loadWards(id);
      if(name) focusLocationByName(name);
    });
    document.getElementById('ward')?.addEventListener('change', e=>{
      const wardName = e.target.selectedOptions[0]?.text || '';
      const districtName = document.getElementById('district')?.selectedOptions[0]?.text || '';
      const provinceName = document.getElementById('province')?.selectedOptions[0]?.text || '';
      const full = `${wardName}, ${districtName}, ${provinceName}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(full)}`)
        .then(res=>res.json())
        .then(data=>{
          if(data[0]){
            const lat=parseFloat(data[0].lat), lng=parseFloat(data[0].lon);
            const bbox=data[0].boundingbox.map(Number);
            if(marker) marker.setLatLng([lat,lng]);
            if(map) map.fitBounds([[bbox[0],bbox[2]],[bbox[1],bbox[3]]]);
          }
        });
    });
  });

  // Chatbot (giữ nguyên)
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/68fd00ab603401195169ddbc/1j8e4l8i4';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
  })();

})();


// ===== BACK TO CART (DROP-IN) =====
// Mục tiêu: Ở payment.html, bấm "Quay lại" sẽ về trang trước (origin), bỏ payment khỏi history.
// Cart của bạn là popup nên fallback về trang Home (không có cart.html).

// ===== BACK TO CART — FIX DOUBLE BACK =====
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const backEl = document.getElementById('back-to-cart');
    if (!backEl) return;

    // Ghi nhớ origin một lần khi vào payment (nếu có referrer hợp lệ)
    try {
      if (!sessionStorage.getItem('paymentOrigin')) {
        const ref = document.referrer;
        if (ref && !/payment\.html(?:$|[?#])/i.test(ref)) {
          sessionStorage.setItem('paymentOrigin', ref);
        }
      }
    } catch {}

    // Hàm quay lại: ưu tiên history.back() để POP payment khỏi history (không tạo bản sao PageA)
    function navigateBackToOrigin() {
      const FALLBACK =
        backEl.getAttribute('data-fallback') || '../Homepage/ck.html'; // chỉnh theo dự án của bạn
      const ref = document.referrer || '';
      const saved = sessionStorage.getItem('paymentOrigin') || '';

      // 1) Có referrer hợp lệ (không phải payment) -> dùng history.back() để bỏ hẳn entry payment
      if (ref && !/payment\.html/i.test(ref)) {
        // set cờ mở popup ở trang trước rồi back
        try { sessionStorage.setItem('reopenCart','1'); } catch {}
        history.back();
        return;
      }

      // 2) Không có referrer nhưng có origin đã lưu -> replace tới origin
      if (saved && !/payment\.html/i.test(saved)) {
        try { sessionStorage.setItem('reopenCart','1'); } catch {}
        window.location.replace(saved);
        return;
      }

      // 3) Fallback an toàn (vì cart là popup, không có cart.html riêng)
      try { sessionStorage.setItem('reopenCart','1'); } catch {}
      window.location.replace(FALLBACK);
    }

    // Click nút "Quay lại"
    backEl.addEventListener('click', function (e) {
      e.preventDefault();
      navigateBackToOrigin();
    });
  });
})();


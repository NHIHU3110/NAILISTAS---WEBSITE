 // 🔹 Hiệu ứng khi nhấn logo – trở về trang chủ
  function goHome() {
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => {
      window.location.href = "ck.html"; // 🔹 Trang chủ của bạn
    }, 800);
  }


const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.getElementById("back-button").onclick = () => {
  if (document.referrer) window.history.back();
  else window.location.href = "Product.html";
};

const cartPopup = document.getElementById('cart-popup');
const loadingMsg = document.getElementById('loading-message');

fetch('../data/products.json')
  .then(response => {
    if (!response.ok) throw new Error("Không thể tải dữ liệu sản phẩm");
    return response.json();
  })
  .then(products => {
    const product = products[id];
    const productDetail = document.getElementById("product-detail");

    loadingMsg.style.display = "none";

    // 🔹 Nếu không có sản phẩm → hiện thông báo và KHÔNG hiển thị breadcrumb
    if (!product) {
      productDetail.innerHTML = `<p style="text-align:center; color:#9F4E6E;">Không tìm thấy sản phẩm này.</p>`;
      return;
    }

    // 🔹 Xử lý breadcrumb (chỉ tạo nếu có sản phẩm)
    let categoryName = "";
    let categoryLink = "#";

    switch (product.type) {
      case "polish":
        categoryName = "Sản phẩm sơn móng";
        categoryLink = "../html/nail_polish.html";
        break;
      case "tool":
        categoryName = "Dụng cụ cơ bản";
        categoryLink = "../html/basic_tools.html";
        break;
      case "fake_nail":
        categoryName = "Sản phẩm Nailbox";
        categoryLink = "../html/fake_nails.html";
        break;
    }

    // ✅ Tạo breadcrumb động
    const breadcrumbContainer = document.createElement("div");
    breadcrumbContainer.className = "breadcrumb-container";

    const breadcrumb = document.createElement("div");
    breadcrumb.className = "breadcrumb";
    breadcrumb.innerHTML = `
      <a href="ck.html">Nailistas</a> /
      <a href="${categoryLink}">${categoryName}</a> /
      <span>${product.name}</span>
    `;

    breadcrumbContainer.appendChild(breadcrumb);

    // Chèn breadcrumb vào ngay trên phần chi tiết sản phẩm
    const main = document.querySelector("main");
    main.insertBefore(breadcrumbContainer, productDetail);

    // 🔹 Xử lý giá an toàn
    let priceNumber = 0;
    if (typeof product.price === "string") {
      const digits = product.price.replace(/[^\d]/g, "");
      priceNumber = digits ? parseInt(digits) : 0;
    } else if (typeof product.price === "number") {
      priceNumber = product.price;
    } else {
      priceNumber = 0;
    }

    const formattedPrice = priceNumber
      ? priceNumber.toLocaleString("vi-VN") + " VND"
      : "Đang cập nhật";

    // 🔹 Hiển thị chi tiết sản phẩm
    productDetail.innerHTML = `
      <div class="product-image">
        <img src="${product.img}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h2>${product.name}</h2>
        <div class="price">Giá: ${formattedPrice}</div>
        <p>${product.desc || "Mô tả đang cập nhật."}</p>
        <div class="action-buttons">
          <div class="quantity-container">
            <button class="qty-btn" id="minus-btn"><img src="../images/minus.png" alt="-"></button>
            <input type="number" id="quantity" value="1" min="1">
            <button class="qty-btn" id="plus-btn"><img src="../images/plus.png" alt="+"></button>
          </div>
          <div class="btn-cart">
            <img src="../images/cart.png" alt="Thêm vào giỏ">
          </div>
        </div>
      </div>
    `;

    // 🔹 Xử lý tăng/giảm số lượng
    const minusBtn = document.getElementById("minus-btn");
    const plusBtn = document.getElementById("plus-btn");
    const quantityInput = document.getElementById("quantity");

    minusBtn.onclick = () => {
      let value = parseInt(quantityInput.value) || 1;
      if (value > 1) quantityInput.value = value - 1;
    };
    plusBtn.onclick = () => {
      let value = parseInt(quantityInput.value) || 1;
      quantityInput.value = value + 1;
    };

    // 🔹 Nút thêm giỏ hàng
    const cartBtn = document.querySelector(".btn-cart img");
    cartBtn.onclick = () => {
      const quantity = parseInt(quantityInput.value) || 1;
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existingIndex = cart.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: id,
          name: product.name,
          img: product.img,
          price: priceNumber,
          quantity: quantity
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      cartPopup.textContent = `${product.name} đã được thêm vào giỏ hàng!`;
      cartPopup.style.display = 'block';
      cartPopup.classList.add('show');
      setTimeout(() => {
        cartPopup.classList.remove('show');
        setTimeout(() => cartPopup.style.display = 'none', 300);
      }, 1500);
    };

    // 🔹 Carousel gợi ý sản phẩm
    const carousel = document.getElementById("recommendation-carousel");
    let keys = Object.keys(products).filter(key => key !== id);
    keys.sort(() => Math.random() - 0.5);
    keys = keys.slice(0, 9);

    keys.forEach(key => {
      const p = products[key];
      let pPrice = 0;
      if (typeof p.price === "string") {
        const digits = p.price.replace(/[^\d]/g, "");
        pPrice = digits ? parseInt(digits) : 0;
      } else if (typeof p.price === "number") {
        pPrice = p.price;
      }

      const card = document.createElement("div");
      card.className = "carousel-card";
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${pPrice.toLocaleString("vi-VN")} VND</p>
      `;
      card.onclick = () => window.location.href = `Product_detail.html?id=${key}`;
      carousel.appendChild(card);
    });

    document.getElementById("arrow-left").onclick = () =>
      carousel.scrollBy({ left: -220, behavior: 'smooth' });
    document.getElementById("arrow-right").onclick = () =>
      carousel.scrollBy({ left: 220, behavior: 'smooth' });
  })
  .catch(err => {
    console.error("Lỗi load sản phẩm:", err);
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) loadingMsg.textContent = "Không thể tải dữ liệu sản phẩm.";
  });

/* 🔹 Nút lên đầu trang */
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (document.documentElement.scrollTop > 200) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // 🚨 Kiểm tra productId trước khi load
  if (!productId) {
    console.error("❌ Không tìm thấy productId trong URL");
    return;
  }

  const reviewBtn = document.getElementById("leave-review-btn");
  const popup = document.getElementById("review-popup");
  const closeBtn = document.getElementById("close-popup");
  const form = document.getElementById("review-form");
  const reviewList = document.getElementById("review-list");

  let selectedRating = 0;

  // ⭐ Chọn sao đánh giá
  document.querySelectorAll(".star-rating span").forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = star.dataset.value;
      document.querySelectorAll(".star-rating span").forEach(s => {
        s.classList.toggle("active", s.dataset.value <= selectedRating);
      });
    });
  });

  // 🔒 Escape HTML (chống XSS)
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));
  }

  // 🔹 Hiển thị danh sách đánh giá
  function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];
    reviewList.innerHTML = "";
    if (reviews.length === 0) {
      reviewList.innerHTML = "<p class='review-message'>Chưa có đánh giá nào cho sản phẩm này.</p>";
    } else {
      reviews.forEach(r => {
        const item = document.createElement("div");
        item.classList.add("review-item");
        item.innerHTML = `
          <strong>${escapeHTML(r.name)}</strong> (${escapeHTML(r.email)})<br>
          <span>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span><br>
          <p>${escapeHTML(r.content)}</p>
          <small class="review-date">${new Date(r.date).toLocaleDateString("vi-VN")}</small>
        `;
        reviewList.prepend(item);
      });
      reviewBtn.textContent = "Để lại đánh giá khác";
    }
  }

  loadReviews();
  function loadReviews() {
    let reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];
    reviewList.innerHTML = "";

    const filterStar = document.getElementById("filter-star")?.value || "all";
    const filterTime = document.getElementById("filter-time")?.value || "newest";

    // 🔹 Lọc theo số sao
    if (filterStar !== "all") {
      reviews = reviews.filter(r => r.rating === parseInt(filterStar));
    }

    // 🔹 Sắp xếp theo thời gian
    reviews.sort((a, b) => {
      return filterTime === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    });

    if (reviews.length === 0) {
      reviewList.innerHTML = "<p class='review-message'>Chưa có đánh giá nào cho sản phẩm này.</p>";
    } else {
      reviews.forEach(r => {
        const item = document.createElement("div");
        item.classList.add("review-item");
        item.innerHTML = `
          <strong>${escapeHTML(r.name)}</strong> (${escapeHTML(r.email)})<br>
          <span>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span><br>
          <p>${escapeHTML(r.content)}</p>
          <small class="review-date">${new Date(r.date).toLocaleDateString("vi-VN")}</small>
       `;
        reviewList.prepend(item);
      });
      reviewBtn.textContent = "Để lại đánh giá khác";
    }
  }

  // ✅ Gọi hàm và gắn sự kiện lọc
  loadReviews();
  document.getElementById("filter-star")?.addEventListener("change", loadReviews);
  document.getElementById("filter-time")?.addEventListener("change", loadReviews);

   // 🔹 Cập nhật số lượng review & điểm trung bình sao
  function updateReviewSummary() {
    const reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];
    const count = reviews.length;
    const avg = count
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : "0.0";

    const reviewCountEl = document.getElementById("review-count");
    const avgRatingEl = document.getElementById("average-rating");

    if (reviewCountEl) reviewCountEl.textContent = `Reviews (${count})`;
    if (avgRatingEl) avgRatingEl.textContent = `${avg} ★★★★★`;
  }

  // Gọi ngay khi load xong danh sách
  updateReviewSummary();

  // 🔹 Mở popup (reset trạng thái cũ)
  reviewBtn.addEventListener("click", () => {
    popup.style.display = "flex";
    selectedRating = 0;
    document.querySelectorAll(".star-rating span").forEach(s => s.classList.remove("active"));
    form.reset();
  });

  // 🔹 Đóng popup
  closeBtn.addEventListener("click", () => popup.style.display = "none");
  window.addEventListener("click", e => {
    if (e.target === popup) popup.style.display = "none";
  });



  // them popup tu dong thay alert
  function showPopup(message, isError = false) {
  const popup = document.getElementById("review-success-popup");
  const msg = document.getElementById("success-popup-message");
  msg.textContent = message;
  popup.querySelector(".success-popup-content").style.background = isError ? "#ffecec" : "#fff";
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

  // 🔹 Gửi đánh giá
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const content = document.getElementById("review-content").value.trim();

    if (!selectedRating) {
      
      showPopup("Vui lòng chọn số sao đánh giá!", true);
      return;
    }

    const reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];

    // 🚫 Ngăn trùng email
    if (reviews.some(r => r.email === email)) {
      
      showPopup("Email này đã đánh giá sản phẩm rồi!", true);
      return;
    }

    const newReview = {
      name,
      email,
      content,
      rating: parseInt(selectedRating),
      date: new Date()
    };

    reviews.unshift(newReview);
    localStorage.setItem("reviews_" + productId, JSON.stringify(reviews));

    // ✅ Tính trung bình sao và lưu lại
const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

// Lấy object ratings hiện tại (chứa trung bình sao của tất cả sản phẩm)
const ratings = JSON.parse(localStorage.getItem("ratings") || "{}");

// Cập nhật trung bình sao cho sản phẩm hiện tại
ratings[productId] = avg;

// Lưu lại vào localStorage
localStorage.setItem("ratings", JSON.stringify(ratings));

// 🔄 Gửi tín hiệu cập nhật realtime (cho product.html nếu đang mở song song)
window.dispatchEvent(new StorageEvent("storage", { key: "ratings", newValue: JSON.stringify(ratings) }));

    popup.style.display = "none";
    loadReviews();
    updateReviewSummary();
    showPopup("Cảm ơn bạn đã gửi đánh giá 💅");
  });
});




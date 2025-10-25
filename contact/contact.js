const openBtn = document.getElementById("openContact");
const closeBtn = document.getElementById("closePopup");
const popup = document.getElementById("contactPopup");
const overlay = document.getElementById("overlay");

// Mở / đóng popup
openBtn.addEventListener("click", () => {
  popup.classList.add("show");
  overlay.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  popup.classList.remove("show");
  overlay.classList.remove("show");
});

overlay.addEventListener("click", () => {
  popup.classList.remove("show");
  overlay.classList.remove("show");
});

// Hiệu ứng load trang khi mới vào
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
});

// ✨ Áp dụng hiệu ứng overlay cho TẤT CẢ các thẻ <a> ✨
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    // Bỏ qua nếu là liên kết # hoặc tel/mailto
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

// Hiệu ứng khi reload / quay lại trang
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
});

// Chuyển trang về home
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  setTimeout(() => {
    window.location.href = "../Homepage/ck.html";
  }, 800);
}

// 💌 Popup cảm ơn khi gửi form
const form = document.querySelector("#contactPopup form");
const thankPopup = document.getElementById("thankPopup");

// Kiểm tra nếu form tồn tại
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Ngăn reload trang

    // Ẩn form liên hệ
    popup.classList.remove("show");
    overlay.classList.remove("show");

    // Reset (xoá toàn bộ nội dung nhập)
    form.reset();

    // Hiện popup cảm ơn
    thankPopup.classList.add("show");

    // Tự động ẩn sau 2s
    setTimeout(() => {
      thankPopup.classList.remove("show");
    }, 2000);
  });
}

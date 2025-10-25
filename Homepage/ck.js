
window.addEventListener('load', () => {
const overlay = document.getElementById('transition-overlay');

// Nếu overlay đã ẩn, không cần hiển thị lại
if (!sessionStorage.getItem('overlayShown')) {
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 800);
    sessionStorage.setItem('overlayShown', 'true'); // đánh dấu đã hiển thị
  }, 500);
} else {
  overlay.style.display = 'none';
}
});

// Transition khi click link
document.querySelectorAll('a[data-transition]').forEach(link => {
link.addEventListener('click', function(e) {
  const targetUrl = this.getAttribute('href');
  if(targetUrl.startsWith('#')) return;

  e.preventDefault();
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';

  setTimeout(() => {
    window.location.href = targetUrl;
  }, 800);
});
});

const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) slide.classList.add('active');
  });
}

function changeSlide(n) {
  currentSlide += n;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  if (currentSlide >= slides.length) currentSlide = 0;
  showSlide(currentSlide);
}

// Nếu muốn auto slide
setInterval(() => { changeSlide(1); }, 8000); // 8 giây/slide

// Function to go to a specific page (goHome) with transition effect
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex'; // Show the overlay
  overlay.style.opacity = '1';    // Make the overlay visible
  setTimeout(() => {
    window.location.href = "../Homepage/ck.html";  // Redirect to the desired page after 800ms
  }, 800); // Wait for 800ms to let the overlay transition
}

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
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

  // Chuyển trang mượt mà với overlay cho các bài viết nổi bật
  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const targetUrl = this.getAttribute('href');
      if (!targetUrl) return;
      const overlay = document.getElementById('transition-overlay');
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      setTimeout(() => { window.location.href = targetUrl; }, 800);
    });
  });

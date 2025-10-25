// Fade-in khi load trang
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
});

// Hiệu ứng overlay khi click bất kỳ <a>
function showOverlayAndRedirect(url, delay = 800) {
  const overlay = document.getElementById('transition-overlay');
  if (!overlay) return;
  overlay.classList.add('show');

  setTimeout(() => {
    window.location.href = url;
  }, delay);
}

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:')) return;

    e.preventDefault();
    showOverlayAndRedirect(targetUrl);
  });
});

// Ẩn overlay khi reload/back
window.addEventListener('pageshow', () => {
  const overlay = document.getElementById('transition-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
});

    // Function to go to a specific page (goHome) with transition effect
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex'; // Show the overlay
  overlay.style.opacity = '1';    // Make the overlay visible
  setTimeout(() => {
  window.location.href = "../Homepage/ck.html";  // Redirect to the desired page after 800ms
  }, 800); // Wait for 800ms to let the overlay transition
}
  
document.querySelectorAll('.service-slider').forEach(slider => {
  const container = slider.querySelector('.slider-container');
  const boxes = slider.querySelectorAll('.slider-box');
  const leftBtn = slider.querySelector('.slider-btn.left');
  const rightBtn = slider.querySelector('.slider-btn.right');

  let currentIndex = 0;
  const visibleBoxes = 3;

  function updateSlider(index) {
    const boxWidth = boxes[0].offsetWidth + 30; // 30 = gap
    container.style.transform = `translateX(-${boxWidth * index}px)`;
  }

  rightBtn.addEventListener('click', () => {
    if (currentIndex < boxes.length - visibleBoxes) {
      currentIndex++;
    } else {
      currentIndex = 0; // quay về đầu
    }
    updateSlider(currentIndex);
  });

  leftBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = boxes.length - visibleBoxes; // quay về cuối
    }
    updateSlider(currentIndex);
  });
});

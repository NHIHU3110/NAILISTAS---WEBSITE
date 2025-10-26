// Fade-in nội dung trang khi load
window.addEventListener('load', () => { document.body.classList.add('fade-in'); });

// Overlay khi nhấn link header
document.querySelectorAll('a[data-transition]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetUrl = this.getAttribute('href');
    if (!targetUrl || targetUrl.startsWith('#')) return;
    e.preventDefault();
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    setTimeout(() => window.location.href = targetUrl, 800);
  });
});

// Nút "ĐỌC BÀI VIẾT" với overlay
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
// Function to go to a specific page (goHome) with transition effect
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex'; // Show the overlay
  overlay.style.opacity = '1';    // Make the overlay visible
  setTimeout(() => {
    window.location.href = "../Homepage/ck.html";  // Redirect to the desired page after 800ms
  }, 800); // Wait for 800ms to let the overlay transition
}

var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/68fd00ab603401195169ddbc/1j8e4l8i4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();


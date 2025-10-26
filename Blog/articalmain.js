// Hiệu ứng load trang
window.addEventListener('load', () => {
    document.body.classList.add('fade-in');
  });
  
  // Nút quay lại có hiệu ứng
  function goBack() {
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
      history.back();
    }, 800);
  }
  
  // Overlay khi nhấn link trên header
  document.querySelectorAll('a[data-transition]').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetUrl = this.getAttribute('href');
      if (!targetUrl || targetUrl.startsWith('#')) return; // Không chuyển cho anchor
      e.preventDefault();
      const overlay = document.getElementById('transition-overlay');
      overlay.style.display = 'flex';          // Hiện overlay
      overlay.style.opacity = '1';             // Reset opacity
      setTimeout(() => {
        window.location.href = targetUrl;      // Chuyển trang sau 800ms
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


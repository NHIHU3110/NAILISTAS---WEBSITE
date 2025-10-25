// ===== Utilities =====
const $  = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== Users "database": localStorage (bền) + sessionStorage (tạm) =====
function loadUsers(){
  let local = [], sess = [];
  try { local = JSON.parse(localStorage.getItem("sv_users") || "[]"); } catch {}
  try { sess  = JSON.parse(sessionStorage.getItem("sv_users") || "[]"); } catch {}
  // Gộp theo email, ưu tiên phiên bản session (tạm) ghi đè
  const map = new Map();
  [...local, ...sess].forEach(u => { if (u?.email) map.set(u.email, u); });
  return Array.from(map.values());
}
function saveUsers(list){ localStorage.setItem("sv_users", JSON.stringify(list)); }
function saveUsersTemp(list){ sessionStorage.setItem("sv_users", JSON.stringify(list)); }

// ===== Hash demo (KHÔNG dùng production) =====
function hashPassword(pw){
  return btoa(unescape(encodeURIComponent(pw))).split("").reverse().join("");
}

// ===== Toggle eye buttons =====
function initToggleEye(){
  $$(".toggle-eye").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.for;
      const input = document.getElementById(id);
      if (!input) return;
      input.type = (input.type === "password") ? "text" : "password";
    });
  });
}

// ===== Password strength meter =====
function initPasswordStrength(inputId, barId, hintId){
  const input = document.getElementById(inputId);
  const bar   = document.getElementById(barId);
  const hint  = document.getElementById(hintId);
  if(!input || !bar || !hint) return;

  input.addEventListener("input", e => {
    const v = e.target.value;
    let score = 0;
    if(v.length >= 8) score++;
    if(/[A-Z]/.test(v)) score++;
    if(/[a-z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;
    const pct = Math.min(100, score*20);
    bar.style.width = pct + "%";
    hint.textContent = "Độ mạnh: " + (pct<40 ? "yếu" : pct<80 ? "trung bình" : "mạnh");
  });
}


// ===== Current user: lưu role cũng vào localStorage =====
function setCurrentUser(user){
  if (!user) return;
  localStorage.setItem("sv_current_user", JSON.stringify({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user"
  }));
}
function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem("sv_current_user") || "null"); }
  catch { return null; }
}
function clearCurrentUser(){
  localStorage.removeItem("sv_current_user");
}



// ===== Export =====
window.AuthUtils = {
  $, $$, emailRe,
  loadUsers, saveUsers, saveUsersTemp,
  hashPassword,
  initToggleEye, initPasswordStrength,
  setCurrentUser, getCurrentUser, clearCurrentUser
};
// Function to go to a specific page (goHome) with transition effect
function goHome() {
  const overlay = document.getElementById('transition-overlay');
  overlay.style.display = 'flex'; // Show the overlay
  overlay.style.opacity = '1';    // Make the overlay visible
  setTimeout(() => {
    window.location.href = "../Homepage/ck.html";  // Redirect to the desired page after 800ms
  }, 800); // Wait for 800ms to let the overlay transition
}

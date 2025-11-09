const form = document.getElementById('formDatLich');
const formContainer = document.getElementById('formContainer');
const overlayError = document.getElementById('overlayError');
const overlaySuccess = document.getElementById('overlaySuccess');

form.addEventListener('submit', function(e){
  e.preventDefault();

  const soDienThoai = document.getElementById('soDienThoai').value.trim();
  const ngayInput = document.getElementById('ngay').value;
  const gioInput = document.getElementById('gio').value;

  // Kiểm tra số điện thoại
  if(!/^\d+$/.test(soDienThoai)){
    showError();
    return;
  }

  // Kiểm tra ngày
  const today = new Date();
  today.setHours(0,0,0,0);
  const ngayChon = new Date(ngayInput);
  if(ngayChon < today){
    showError();
    return;
  }

  // 👉 Kiểm tra giờ trong quá khứ (cả khi là hôm nay)
  const [gio, phut] = gioInput.split(':').map(Number);
  const now = new Date();
  if (
    ngayChon.toDateString() === now.toDateString() && // nếu đặt hôm nay
    (gio < now.getHours() || (gio === now.getHours() && phut <= now.getMinutes()))
  ) {
    showError();
    return;
  }

  // Kiểm tra giờ trong khung làm việc (8h - 17h30)
  const trongGio = (gio >= 8 && (gio < 17 || (gio === 17 && phut <= 30)));
  if(!trongGio){
    showError();
    return;
  }

  showSuccess();
  form.reset();
});

function showError(){
  overlayError.style.display='flex';
  formContainer.style.filter='brightness(50%)';
}
function closeError(){
  overlayError.style.display='none';
  formContainer.style.filter='brightness(100%)';
}

function showSuccess(){
  overlaySuccess.style.display='flex';
  formContainer.style.filter='brightness(50%)';
}
function closeSuccess(){
  overlaySuccess.style.display='none';
  formContainer.style.filter='brightness(100%)';
}

// Event listener untuk tombol logout
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', function() {
// Hapus cookie 'username'
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Hapus cookie 'loggedIn'
document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Arahkan ke halaman login.html
window.location.href = 'login.html';
});

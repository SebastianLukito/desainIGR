// Daftar username admin
const adminUsers = ["sebastian", "naufal"];
const adminSpecial = ["admin"];

// Fungsi untuk mengambil nilai cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const loggedIn = getCookie('loggedIn');
const username = getCookie('username');

// Cek apakah pengguna sudah login dan username tersedia
if (!loggedIn || !username) {
    // Dapatkan nama halaman saat ini
    const currentPage = window.location.pathname.split('/').pop();

    // Jika pengguna tidak berada di index.html atau login.html, redirect ke halaman login
    if (currentPage !== 'index.html' && currentPage !== 'login.html') {
        window.location.href = 'login.html'; // Atau 'index.html' sesuai kebutuhan Anda
    }
} else {
    // Perbarui teks marquee dengan menyertakan username
    const marqueeText = document.getElementById('marqueeText');
    marqueeText.innerHTML = `SELAMAT DATANG <strong>${username.toUpperCase()}</strong> DI WEBSITE MARKETING INDOGROSIR - SUB DIVISI DESAIN GRAFIS <img src="assets/img/igr.png" alt="Logo Indogrosir" class="marquee-logo">`;
}

// Event listener untuk klik pada marquee
document.getElementById('marquee').addEventListener('click', function() {
    const username = getCookie('username');

    if (username && adminUsers.includes(username.toLowerCase())) {
        // Jika user adalah admin, redirect ke admin.html
        window.location.href = 'admin.html';
    } else if (username && adminSpecial.includes(username.toLowerCase())) {
        // Jika user adalah admin spesial, redirect ke main_admin.html
        window.location.href = 'main_admin.html';
    } else {
        // Jika bukan admin, redirect ke main.html
        window.location.href = 'main.html';
    }
});
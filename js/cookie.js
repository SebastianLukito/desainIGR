// Daftar username admin
const adminUsers = ["sebastian", "naufal"];
const adminSpecial = ["admin"];

// Fungsi untuk mengambil nilai cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Firebase Firestore - Tambahkan data pengunjung
function addVisitorToFirestore(username) {
    db.collection("visitors")
        .add({
            username: username,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Tambahkan timestamp otomatis
        })
        .then(() => {
            console.log("Pengunjung berhasil ditambahkan ke statistik!");
        })
        .catch((error) => {
            console.error("Error menambahkan pengunjung ke statistik:", error);
        });
}

// Validasi cookie login
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
    if (marqueeText) {
        marqueeText.innerHTML = `SELAMAT DATANG <strong>${username.toUpperCase()}</strong> DI WEBSITE MARKETING INDOGROSIR - SUB DIVISI DESAIN GRAFIS <img src="assets/img/igr.png" alt="Logo Indogrosir" class="marquee-logo">`;
    }

    // Tambahkan data pengunjung ke Firestore (jika login berhasil)
    addVisitorToFirestore(username);
}


console.log("Firebase DB instance:", db);

const allowedUsernames = ["sebastian", "naufal"];
const adminUsername = ["admin"];

// Fungsi login dengan Firebase Firestore
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim(); // Menghapus spasi di awal/akhir
    const password = document.getElementById('password').value;

    try {
        // Dapatkan dokumen pengguna berdasarkan username dari Firestore
        const userDoc = await db.collection("users").doc(username).get();

        if (userDoc.exists && userDoc.data().password === password) {
            // Jika username dan password cocok
            // Simpan username dalam cookie
            setCookie('username', username, 1440); // Menyimpan username selama 1 hari (1440 menit)

            // Cek jika login sebagai admin utama
            if (adminUsername.includes(username.toLowerCase())) {
                setCookie('loggedIn', 'admin', 1440); // Set cookie untuk login status admin utama
                window.location.href = 'main_admin.html';
            }
            // Cek jika login sebagai admin biasa
            else if (allowedUsernames.includes(username.toLowerCase())) {
                setCookie('loggedIn', 'admin', 1440); // Set cookie untuk login status admin
                window.location.href = 'admin.html';
            }
            // Jika bukan admin, redirect ke halaman pengguna biasa
            else {
                setCookie('loggedIn', 'user', 1440); // Set cookie untuk login status pengguna biasa
                window.location.href = 'loading.html';
            }
        } else {
            document.getElementById('errorMessage').innerText = 'Salah bosku, anda karyawan mana?';
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('errorMessage').innerText = 'Error logging in. Please try again later.';
    }
});

function togglePasswordVisibility() {
    var passwordInput = document.getElementById('password');
    var openEye = document.querySelector('.open-eye');
    var closedEye = document.querySelector('.closed-eye');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        openEye.style.display = 'block';
        closedEye.style.display = 'none';
    } else {
        passwordInput.type = "password";
        openEye.style.display = 'none';
        closedEye.style.display = 'block';
    }
}

// Fungsi untuk menyetel cookie dengan opsi keamanan tambahan
function setCookie(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    const secure = location.protocol === 'https:' ? ';secure' : ''; // Hanya set 'secure' jika menggunakan HTTPS
    const path = ";path=/";
    document.cookie = `${name}=${value};${expires}${path}${secure};SameSite=Lax`;
}

// Animasi gambar motor
const motorAnimation = document.querySelector('.motor-animation');
const motorBaruteks = document.querySelector('.motor-baruteks');

motorAnimation.addEventListener('mouseover', () => {
    motorAnimation.style.display = 'none';
    motorBaruteks.style.display = 'block';
});

motorBaruteks.addEventListener('mouseout', () => {
    motorBaruteks.style.display = 'none';
    motorAnimation.style.display = 'block';
});

// Event listener untuk "Lupa password?"
document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
    event.preventDefault();

    // Mengganti konten login-box dengan pesan baru
    const loginBox = document.querySelector('.login-box');
    loginBox.innerHTML = `
        <div class="info">
        <h2>Informasi</h2>
        <p>Mohon maaf, user tidak diizinkan untuk membuat akun atau mengganti password. Hal ini ditujukan untuk melindungi keamanan data internal Marketing Indogrosir.
        <br><br> Untuk membuat akun, mengganti, atau melihat password, <b> mohon hubungi Sebastian atau Naufal </b> dengan otoritas admin. Mereka akan membantumu dengan senang hati.</p>
        <button id="backToLogin" class="btn">Login Kembali</button>
        <div>
    `;

    // Menambahkan event listener untuk tombol "Login Kembali"
    document.getElementById('backToLogin').addEventListener('click', function() {
        // Memuat ulang halaman atau mengembalikan form login
        window.location.reload();
    });
});
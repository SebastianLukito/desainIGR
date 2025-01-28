import { auth } from './fbconfig.js'; // Sesuaikan dengan path file konfigurasi Firebase Anda

// Fungsi untuk menghapus cookie dengan aman
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}; Secure; SameSite=Lax`;
}

// Event listener untuk tombol logout
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async function() {
    if (confirm("Apakah Anda yakin ingin logout?")) {
        // Tampilkan animasi loading
        logoutBtn.innerHTML = "Logging out... <span class='spinner'></span>";
        logoutBtn.disabled = true;

        try {
            // Logout dari Firebase (jika menggunakan Firebase)
            await auth.signOut();

            // Hapus cookie 'username' dan 'loggedIn'
            deleteCookie('username');
            deleteCookie('loggedIn');

            // Hapus data dari localStorage atau sessionStorage
            localStorage.removeItem('userData');
            sessionStorage.clear();

            // Arahkan ke halaman login.html
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Logout failed. Please check your connection and try again.");
        } finally {
            // Reset tombol logout
            logoutBtn.innerHTML = "Logout";
            logoutBtn.disabled = false;
        }
    }
});
// Ambil elemen overlay
const popupOverlay = document.getElementById('popupOverlay');

// Fungsi untuk mencegah klik kanan dan menampilkan pop-up
document.addEventListener('contextmenu', function (event) {
    event.preventDefault(); // Cegah menu klik kanan
    popupOverlay.style.display = 'block'; // Tampilkan pop-up
});

// Tutup pop-up ketika user klik di luar area pop-up
popupOverlay.addEventListener('click', function (event) {
    if (event.target === popupOverlay) { // Pastikan klik di luar pop-up
        popupOverlay.style.display = 'none';
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const hhBtn = document.getElementById('hh-btn');
    const spBtn = document.getElementById('sp-btn');
    const kebulanBtn = document.getElementById('kebulan-btn');
    const sheetEditor = document.getElementById('sheet-editor');
    const loadingPopup = document.getElementById('loading-popup');

    function showLoading() {
        loadingPopup.style.display = 'flex'; // Tampilkan loading
    }

    function hideLoading() {
        loadingPopup.style.display = 'none'; // Sembunyikan loading
    }

    function loadSheet(googleSheetsUrl) {
        showLoading();
        sheetEditor.src = googleSheetsUrl;

        sheetEditor.onload = function() {
            // Tambahkan sedikit penundaan untuk memastikan bahwa konten iframe telah selesai dimuat
            setTimeout(hideLoading, 0.15); // Menunggu 1 detik setelah load untuk memastikan semuanya sudah dimuat
        };
    }

    hhBtn.addEventListener('click', function () {
        const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/1-CiNOAywOmTQzyFJxS0LSBvNl0gIro5BAPYYAa3H_8c/edit?gid=359849260#gid=359849260';
        loadSheet(googleSheetsUrl);
    });

    spBtn.addEventListener('click', function () {
        const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/1kD7cBiSIDYNZhaOsDUSaYAdOrZjhFKCx7QK3Y_LHgac/edit?gid=2055181361#gid=2055181361';
        loadSheet(googleSheetsUrl);
    });

    kebulanBtn.addEventListener('click', function () {
        const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/1ThKS2oc2htWAedffEFWSpCIEJZ0k9aUSyEYoWgN-yQo/edit?gid=2086912375#gid=2086912375';
        loadSheet(googleSheetsUrl);
    });

    document.getElementById('reset-btn').addEventListener('click', function () {
        sheetEditor.src = ''; // Kosongkan iframe jika reset
        hideLoading(); // Sembunyikan loading saat di-reset
    });
});

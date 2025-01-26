document.addEventListener('DOMContentLoaded', () => {
    const marquee = document.getElementById('marquee');
    const marqueeText = document.getElementById('marqueeText');

    // Elemen pencarian dan container daftar user
    const searchInput = document.getElementById('searchInput');
    const nameListContainer = document.getElementById('name-list');
    
    // Elemen untuk menampilkan FTP
    const ftpDisplay = document.getElementById('ftp-display');

    const rightPanel = document.querySelector('.right-panel'); 
    const motorContainer = document.querySelector('.motor-container');

    // Variabel global untuk data
    let allUsers = [];

    // Fetch data dari JSON
    fetch('../assets/list/ftpdata.json')
        .then(response => response.json())
        .then(data => {
            allUsers = data.users || [];
            displayUsers('');
        })
        .catch(error => console.error('Error loading JSON:', error));

    // Fungsi menampilkan daftar user di panel kiri
    function displayUsers(filter) {
        nameListContainer.innerHTML = '';

        // Filter user berdasarkan pencarian
        const filtered = allUsers.filter(user =>
            user.name.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(user => {
            const nameItem = document.createElement('div');
            nameItem.classList.add('name-item');
            nameItem.textContent = user.name;

            // Klik pada nama
            nameItem.addEventListener('click', () => {
                // Tampilkan alamat FTP milik user tersebut
                showFtp(user);
                
                // Tandai item yang sedang dipilih (opsional)
                document.querySelectorAll('.name-item').forEach(item => {
                    item.classList.remove('selected');
                });
                nameItem.classList.add('selected');
            });

            nameListContainer.appendChild(nameItem);
        });
    }

    // Fungsi menampilkan alamat FTP seseorang di panel kanan
    function showFtp(user) {
        ftpDisplay.innerHTML = '';
        rightPanel.classList.remove('active'); // Reset animasi sebelum diaktifkan kembali
        motorContainer.classList.add('hidden'); // Sembunyikan GIF motor

        if (!user.ftp || user.ftp.length === 0) {
            // Jika user tidak memiliki FTP, sembunyikan panel kanan dan tampilkan GIF motor
            rightPanel.classList.remove('active');
            motorContainer.classList.remove('hidden');
            return;
        }
        // Tampilkan panel kanan dengan animasi
        setTimeout(() => {
            rightPanel.classList.add('active');
            motorContainer.classList.add('hidden');
        }, 10); // Delay untuk memastikan transisi terlihat
    
        user.ftp.forEach(ftpAddress => {
            // Bungkus tiap ftp address dalam container
            const ftpContainer = document.createElement('div');
            ftpContainer.classList.add('ftp-container');
    
            const ftpText = document.createElement('span');
            ftpText.classList.add('ftp-text');
            ftpText.textContent = ftpAddress;
    
            // Tombol copy
            const copyBtn = document.createElement('button');
            copyBtn.classList.add('copy-btn');
            copyBtn.innerHTML = '<img src="https://www.svgrepo.com/show/309480/copy.svg" width="15" height="15" alt="Copy"> COPY';
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(ftpAddress)
                    .then(() => {
                        showPopup(`FTP berhasil disalin: ${ftpAddress}`);
                    })
                    .catch(err => {
                        console.error('Gagal menyalin FTP: ', err);
                    });
            });
    
            // Masukkan teks dan tombol ke dalam container
            ftpContainer.appendChild(ftpText);
            ftpContainer.appendChild(copyBtn);
    
            // Masukkan container ke panel kanan
            ftpDisplay.appendChild(ftpContainer);
        });
    }

    // Event listener untuk pencarian
    searchInput.addEventListener('input', () => {
        const filterValue = searchInput.value.trim();
        displayUsers(filterValue);
    });

    // Klik di luar untuk menyembunyikan panel kanan dan tampilkan GIF motor
    document.addEventListener('click', (e) => {
        if (!rightPanel.contains(e.target) && !nameListContainer.contains(e.target)) {
            rightPanel.classList.remove('active');
            motorContainer.classList.remove('hidden');
        }
    });
});

function showPopup(message) {
    const popupOverlay = document.getElementById('popup-message');
    const popupText = document.getElementById('popup-text');
    
    // Tampilkan pesan di <p id="popup-text">
    popupText.textContent = message;
    
    // Tampilkan popup
    popupOverlay.style.display = 'flex';
    
    // Klik di luar konten = tutup popup
    popupOverlay.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });
    
    // Mencegah popup menutup jika user klik tepat di area konten
    const popupContent = document.getElementById('popup-content');
    popupContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

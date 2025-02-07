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

    // Tombol "Tambah FTP"
    const addFtpBtn = document.getElementById('addFtpBtn');

    // Variabel global untuk data user
    let allUsers = [];
    // Variabel untuk user yang sedang dipilih (agar "Tambah FTP" tahu user mana)
    let currentSelectedUser = null;

    // Ambil data dari Firestore di collection "ftpUsers"
    db.collection("ftpUsers").get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                const userData = doc.data();

                // Pastikan dokumen memiliki 'name' dan 'ftp'
                if (!userData.name || typeof userData.name !== "string") {
                    console.warn("Skipping doc with missing or invalid name field:", doc.id, userData);
                    return;
                }

                // Pastikan 'ftp' adalah array
                const ftpArray = Array.isArray(userData.ftp) ? userData.ftp : [];

                // Simpan docId agar bisa update data
                allUsers.push({
                    docId: doc.id,
                    name: userData.name,
                    ftp: ftpArray
                });
            });

            // Setelah data berhasil diambil, tampilkan di panel kiri
            displayUsers('');
        })
        .catch((error) => {
            console.error("Error loading data from Firestore:", error);
        });

    // Fungsi menampilkan daftar user di panel kiri
    function displayUsers(filter) {
        nameListContainer.innerHTML = '';

        // Filter user berdasarkan pencarian
        const filtered = allUsers.filter(user => {
            const userName = user.name || "";
            return userName.toLowerCase().includes(filter.toLowerCase());
        });

        filtered.forEach(user => {
            const nameItem = document.createElement('div');
            nameItem.classList.add('name-item');
            nameItem.textContent = user.name;

            // Klik pada nama => tampilkan alamat FTP milik user
            nameItem.addEventListener('click', () => {
                currentSelectedUser = user; // Set user terpilih global
                document.querySelectorAll('.name-item').forEach(item => {
                    item.classList.remove('selected');
                });
                nameItem.classList.add('selected');

                // Tampilkan alamat FTP
                showFtp(user);
            });

            nameListContainer.appendChild(nameItem);
        });
    }

    // Fungsi menampilkan alamat FTP seseorang di panel kanan
    function showFtp(user) {
        ftpDisplay.innerHTML = '';
        rightPanel.classList.remove('active');
        motorContainer.classList.add('hidden');
    
        if (!user.ftp || user.ftp.length === 0) {
            rightPanel.classList.remove('active');
            motorContainer.classList.remove('hidden');
            addFtpBtn.style.display = 'block';
            return;
        }
    
        setTimeout(() => {
            rightPanel.classList.add('active');
            motorContainer.classList.add('hidden');
        }, 10);
    
        // Tampilkan tombol "Tambah FTP"
        addFtpBtn.style.display = 'block';
    
        user.ftp.forEach((ftpAddress) => {
            const ftpContainer = document.createElement('div');
            ftpContainer.classList.add('ftp-container');
    
            // Teks alamat FTP
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
                    .catch((err) => {
                        console.error('Gagal menyalin FTP:', err);
                    });
            });
    
            // Tombol edit
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'EDIT';
            editBtn.addEventListener('click', () => {
                const newFtp = prompt("Masukkan alamat FTP baru:", ftpAddress);
                if (newFtp && newFtp !== ftpAddress) {
                    const index = user.ftp.indexOf(ftpAddress);
                    if (index !== -1) {
                        user.ftp[index] = newFtp;
                        db.collection("ftpUsers").doc(user.docId).update({
                            ftp: user.ftp
                        })
                        .then(() => {
                            showPopup(`Alamat FTP berhasil diubah menjadi: ${newFtp}`);
                            showFtp(user);
                        })
                        .catch((err) => console.error("Gagal update:", err));
                    }
                }
            });
    
            // Tombol delete
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'DELETE';
            deleteBtn.addEventListener('click', () => {
                // Minta konfirmasi
                const confirmDelete = confirm(`Yakin menghapus alamat FTP: ${ftpAddress}?`);
                if (!confirmDelete) return;
    
                // Hapus alamat FTP dari array
                const index = user.ftp.indexOf(ftpAddress);
                if (index !== -1) {
                    user.ftp.splice(index, 1); // hapus satu elemen dari array
                    
                    // Update Firestore
                    db.collection("ftpUsers").doc(user.docId).update({
                        ftp: user.ftp
                    })
                    .then(() => {
                        showPopup(`Alamat FTP berhasil dihapus: ${ftpAddress}`);
                        showFtp(user);
                    })
                    .catch((err) => console.error("Gagal menghapus FTP:", err));
                }
            });
    
            // Susun tombol ke container
            ftpContainer.appendChild(ftpText);
            ftpContainer.appendChild(copyBtn);
            ftpContainer.appendChild(editBtn);
            ftpContainer.appendChild(deleteBtn);
    
            // Masukkan container ke ftpDisplay
            ftpDisplay.appendChild(ftpContainer);
        });
    }
    

    // Event listener pencarian
    searchInput.addEventListener('input', () => {
        const filterValue = searchInput.value.trim();
        displayUsers(filterValue);
    });

    // Klik di luar panel kanan untuk menutup panel
    document.addEventListener('click', (e) => {
        if (!rightPanel.contains(e.target) && !nameListContainer.contains(e.target)) {
            rightPanel.classList.remove('active');
            motorContainer.classList.remove('hidden');
            // Sembunyikan tombol Tambah FTP jika panel ditutup
            addFtpBtn.style.display = 'none';
        }
    });

    // Tombol "Tambah FTP" - menambah alamat baru
    addFtpBtn.addEventListener('click', () => {
        if (!currentSelectedUser) return; // Jika belum ada user dipilih

        const newFtpAddress = prompt("Masukkan alamat FTP baru:");
        if (newFtpAddress) {
            // Tambahkan ke array
            currentSelectedUser.ftp.push(newFtpAddress);
            // Update Firestore
            db.collection("ftpUsers").doc(currentSelectedUser.docId).update({
                ftp: currentSelectedUser.ftp
            })
                .then(() => {
                    showPopup(`Alamat FTP baru ditambahkan: ${newFtpAddress}`);
                    // Refresh tampilan
                    showFtp(currentSelectedUser);
                })
                .catch((err) => {
                    console.error("Gagal menambahkan FTP:", err);
                });
        }
    });
});

// Fungsi menampilkan popup
function showPopup(message) {
    const popupOverlay = document.getElementById('popup-message');
    const popupText = document.getElementById('popup-text');

    // Tampilkan pesan
    popupText.textContent = message;

    // Tampilkan overlay
    popupOverlay.style.display = 'flex';

    // Klik di luar konten => tutup popup
    popupOverlay.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });

    // Mencegah popup menutup jika user klik area konten
    const popupContent = document.getElementById('popup-content');
    popupContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

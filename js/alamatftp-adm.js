document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const nameListContainer = document.getElementById('name-list');
    const ftpDisplay = document.getElementById('ftp-display');
    const rightPanel = document.querySelector('.right-panel');
    const motorContainer = document.querySelector('.motor-container');
    const addFtpBtn = document.getElementById('addFtpBtn');

    let allUsers = [];
    let currentSelectedUser = null;

    // Ambil data dari Firestore (collection ftpUsers)
    db.collection("ftpUsers").get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
        const userData = doc.data();
        if (!userData.name || typeof userData.name !== "string") {
            console.warn("Skipping doc with missing or invalid name field:", doc.id, userData);
            return;
        }

        const ftpArray = Array.isArray(userData.ftp) ? userData.ftp : [];
        allUsers.push({
            docId: doc.id,
            name: userData.name,
            ftp: ftpArray
        });
        });
        displayUsers('');
    })
    .catch((error) => {
        console.error("Error loading data from Firestore:", error);
    });

    function displayUsers(filter) {
    nameListContainer.innerHTML = '';
    const filtered = allUsers.filter(user =>
        (user.name || "").toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(user => {
        const nameItem = document.createElement('div');
        nameItem.classList.add('name-item');
        nameItem.textContent = user.name;

        nameItem.addEventListener('click', () => {
        currentSelectedUser = user;
        document.querySelectorAll('.name-item').forEach(item => item.classList.remove('selected'));
        nameItem.classList.add('selected');
        showFtp(user);
        });

        nameListContainer.appendChild(nameItem);
    });
    }

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

    addFtpBtn.style.display = 'block';

    user.ftp.forEach((ftpAddress) => {
        const ftpContainer = document.createElement('div');
        ftpContainer.classList.add('ftp-container');

        const ftpText = document.createElement('span');
        ftpText.classList.add('ftp-text');
        ftpText.textContent = ftpAddress;

        // Tombol copy
        const copyBtn = document.createElement('button');
        copyBtn.classList.add('copy-btn');
        copyBtn.innerHTML = 'COPY';
        copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(ftpAddress)
            .then(() => showPopup(`FTP berhasil disalin: ${ftpAddress}`))
            .catch((err) => console.error('Gagal menyalin FTP:', err));
        });

        // Tombol edit
        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'EDIT';
        editBtn.addEventListener('click', () => {
        // Pakai modal form
        openModalForm({
            title: 'Edit Alamat FTP',
            description: 'Ubah alamat FTP di bawah:',
            defaultValue: ftpAddress,
            onConfirm: (newVal) => {
            if (newVal && newVal !== ftpAddress) {
                const index = user.ftp.indexOf(ftpAddress);
                if (index !== -1) {
                user.ftp[index] = newVal;
                db.collection("ftpUsers").doc(user.docId)
                    .update({ ftp: user.ftp })
                    .then(() => {
                    showPopup(`Alamat FTP berhasil diubah menjadi: ${newVal}`);
                    showFtp(user);
                    })
                    .catch((err) => console.error("Gagal update:", err));
                }
            }
            }
        });
        });

        // Tombol delete
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'DELETE';
        deleteBtn.addEventListener('click', () => {
        // Pakai modal konfirmasi
        openConfirmModal({
            title: 'Konfirmasi Hapus',
            description: `Yakin ingin menghapus alamat FTP: ${ftpAddress}?`,
            onYes: () => {
            const index = user.ftp.indexOf(ftpAddress);
            if (index !== -1) {
                user.ftp.splice(index, 1);
                db.collection("ftpUsers").doc(user.docId)
                .update({ ftp: user.ftp })
                .then(() => {
                    showPopup(`Alamat FTP berhasil dihapus: ${ftpAddress}`);
                    showFtp(user);
                })
                .catch((err) => console.error("Gagal menghapus FTP:", err));
            }
            }
        });
        });

        ftpContainer.appendChild(ftpText);
        ftpContainer.appendChild(copyBtn);
        ftpContainer.appendChild(editBtn);
        ftpContainer.appendChild(deleteBtn);

        ftpDisplay.appendChild(ftpContainer);
    });
    }

    // Event pencarian
    searchInput.addEventListener('input', () => {
    displayUsers(searchInput.value.trim());
    });

    // Klik di luar panel kanan => tutup panel
    document.addEventListener('click', (e) => {
    if (!rightPanel.contains(e.target) && !nameListContainer.contains(e.target)) {
        rightPanel.classList.remove('active');
        motorContainer.classList.remove('hidden');
        addFtpBtn.style.display = 'none';
    }
    });

    // Tambah FTP (pakai modal form)
    addFtpBtn.addEventListener('click', () => {
    if (!currentSelectedUser) return;
    openModalForm({
        title: 'Tambah Alamat FTP',
        description: 'Masukkan alamat FTP baru:',
        defaultValue: '',
        onConfirm: (newVal) => {
        if (newVal) {
            currentSelectedUser.ftp.push(newVal);
            db.collection("ftpUsers").doc(currentSelectedUser.docId)
            .update({ ftp: currentSelectedUser.ftp })
            .then(() => {
                showPopup(`Alamat FTP baru ditambahkan: ${newVal}`);
                showFtp(currentSelectedUser);
            })
            .catch((err) => console.error("Gagal menambahkan FTP:", err));
        }
        }
    });
    });
});

// ========== FUNGSI POPUP SINGKAT (NOTIF) ==========
function showPopup(message) {
    const popupOverlay = document.getElementById('popup-message');
    const popupText = document.getElementById('popup-text');

    popupText.textContent = message;
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

// ========== FUNGSI MODAL FORM (TAMBAH/EDIT) ==========
// Memunculkan modal dengan 1 input text
function openModalForm({ title, description, defaultValue, onConfirm }) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalInput = document.getElementById('modal-input');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    // Set isi modal
    modalTitle.textContent = title || 'Form';
    modalDesc.textContent = description || '';
    modalInput.value = defaultValue || '';
    modalInput.style.display = 'block';  // Pastikan input ditampilkan

    // Tampilkan modal
    modalOverlay.style.display = 'flex';

    // Action tombol Batal
    cancelBtn.onclick = () => {
    modalOverlay.style.display = 'none';
    };

    // Action tombol OK
    confirmBtn.onclick = () => {
    const newValue = modalInput.value.trim();
    modalOverlay.style.display = 'none';

    // Panggil callback
    if (typeof onConfirm === 'function') {
        onConfirm(newValue);
    }
    };
}

// ========== FUNGSI MODAL KONFIRMASI (HAPUS) ==========
// Memunculkan modal konfirmasi dengan tombol Ya/Tidak
function openConfirmModal({ title, description, onYes }) {
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmDesc = document.getElementById('confirm-desc');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');

    // Set isi
    confirmTitle.textContent = title || 'Konfirmasi';
    confirmDesc.textContent = description || 'Yakin?';

    confirmOverlay.style.display = 'flex';

    // Batal / Tutup
    cancelBtn.onclick = () => {
    confirmOverlay.style.display = 'none';
    };

    // OK / Ya
    okBtn.onclick = () => {
    confirmOverlay.style.display = 'none';
    if (typeof onYes === 'function') {
        onYes();
    }
    };
}

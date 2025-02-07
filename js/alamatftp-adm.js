document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const nameListContainer = document.getElementById('name-list');
    const ftpDisplay = document.getElementById('ftp-display');
    const rightPanel = document.querySelector('.right-panel');
    const motorContainer = document.querySelector('.motor-container');
    const addFtpBtn = document.getElementById('addFtpBtn');

    let allUsers = [];
    let currentSelectedUser = null;

    // Ambil data Firestore
    db.collection("ftpUsers").get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
        const userData = doc.data();
        if (!userData.name || typeof userData.name !== "string") {
            console.warn("Skipping doc with missing name field:", doc.id, userData);
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
        copyBtn.textContent = 'COPY';
        copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(ftpAddress)
            .then(() => showPopup(`FTP berhasil disalin: ${ftpAddress}`))
            .catch((err) => console.error('Gagal menyalin:', err));
        });

        // Tombol edit
        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'EDIT';
        editBtn.addEventListener('click', () => {
        // Modal form
        openModalForm({
            title: 'Edit Alamat FTP',
            description: 'Ubah alamat FTP di bawah:',
            defaultValue: ftpAddress,
            onConfirm: (newVal) => {
            if (newVal && newVal !== ftpAddress) {
                const idx = user.ftp.indexOf(ftpAddress);
                if (idx !== -1) {
                user.ftp[idx] = newVal;
                db.collection("ftpUsers").doc(user.docId)
                    .update({ ftp: user.ftp })
                    .then(() => {
                    showPopup(`Alamat FTP berhasil diubah: ${newVal}`);
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
        // Konfirmasi pertama
        openConfirmModal({
            title: 'Konfirmasi Hapus',
            description: `Yakin ingin menghapus alamat FTP: "${ftpAddress}"?`,
            onYes: () => {
            // Buka captcha modal (barier kedua)
            openCaptchaModal({
                onSuccess: () => {
                // Jika captcha benar, baru hapus
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

    // Tambah FTP
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

// ========== POPUP SINGKAT (NOTIF) ==========
function showPopup(message) {
    const popupOverlay = document.getElementById('popup-message');
    const popupText = document.getElementById('popup-text');

    popupText.textContent = message;
    popupOverlay.style.display = 'flex';

    // Tutup jika klik di luar konten
    popupOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'popup-message') {
        popupOverlay.style.display = 'none';
    }
    });
}

// ========== MODAL FORM (TAMBAH/EDIT) ==========
function openModalForm({ title, description, defaultValue, onConfirm }) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalInput = document.getElementById('modal-input');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    modalTitle.textContent = title || 'Form';
    modalDesc.textContent = description || '';
    modalInput.value = defaultValue || '';
    modalInput.style.display = 'block';

    modalOverlay.style.display = 'flex';

    // Klik di luar konten => tutup modal
    modalOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        modalOverlay.style.display = 'none';
    }
    });

    // Batal
    cancelBtn.onclick = () => {
    modalOverlay.style.display = 'none';
    };

    // OK
    confirmBtn.onclick = () => {
    const newValue = modalInput.value.trim();
    modalOverlay.style.display = 'none';
    if (typeof onConfirm === 'function') {
        onConfirm(newValue);
    }
    };
}

// ========== MODAL KONFIRMASI (LANGKAH 1 DELETE) ==========
function openConfirmModal({ title, description, onYes }) {
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmDesc = document.getElementById('confirm-desc');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');

    confirmTitle.textContent = title || 'Konfirmasi';
    confirmDesc.textContent = description || 'Yakin?';
    confirmOverlay.style.display = 'flex';

    // Klik di luar => tutup
    confirmOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'confirm-overlay') {
        confirmOverlay.style.display = 'none';
    }
    });

    // Batal
    cancelBtn.onclick = () => {
    confirmOverlay.style.display = 'none';
    };

    // Ya
    okBtn.onclick = () => {
    confirmOverlay.style.display = 'none';
    if (typeof onYes === 'function') {
        onYes();
    }
    };
}

// ========== MODAL CAPTCHA (LANGKAH 2 DELETE) ==========
function openCaptchaModal({ onSuccess }) {
    const captchaOverlay = document.getElementById('captcha-overlay');
    const captchaTextEl = document.getElementById('captcha-text');
    const captchaInput = document.getElementById('captcha-input');
    const captchaCancelBtn = document.getElementById('captcha-cancel-btn');
    const captchaOkBtn = document.getElementById('captcha-ok-btn');

    // Buat captcha random (contoh 5 huruf/angka)
    const captcha = generateRandomCaptcha(5);
    captchaTextEl.textContent = `Ketik: ${captcha}`;
    captchaInput.value = '';

    captchaOverlay.style.display = 'flex';

    // Klik di luar => tutup
    captchaOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'captcha-overlay') {
        captchaOverlay.style.display = 'none';
    }
    });

    // Batal
    captchaCancelBtn.onclick = () => {
    captchaOverlay.style.display = 'none';
    };

    // OK
    captchaOkBtn.onclick = () => {
    const userInput = captchaInput.value.trim();
    if (userInput === captcha) {
        // Tutup overlay
        captchaOverlay.style.display = 'none';
        // Lanjutkan hapus
        if (typeof onSuccess === 'function') {
        onSuccess();
        }
    } else {
        showPopup('Captcha salah, coba lagi!');
    }
    };
}

// ========== FUNGSI BANTU GENERATE CAPTCHA ==========
function generateRandomCaptcha(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

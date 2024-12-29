document.addEventListener('DOMContentLoaded', () => {
    const marquee = document.getElementById('marquee');
    const marqueeText = document.getElementById('marqueeText');

    // Tab items
    const tabItems = document.querySelectorAll('.tab-item');
    const nameListContainer = document.getElementById('name-list');
    const searchInput = document.getElementById('searchInput');
    
    // Bagian output email
    const emailDisplay = document.getElementById('email-display');
    const copyBtn = document.getElementById('copy-btn');
    const selectAllBtn = document.getElementById('selectAllBtn');

    // Variabel global data
    let allData = {};
    // Menampung nama-nama (lintas divisi) yang dipilih
    let selectedNames = [];
    // Divisi yang sedang aktif
    let currentDivision = 'division1';

    // Status "Select All" per divisi (untuk toggle)
    let isAllSelected = {
        division1: false,
        division2: false,
        division3: false,
        division4: false
    };

    // Fetch data dari JSON
    fetch('../assets/list/cabangdata.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            displayNames(currentDivision, '');
        })
        .catch(error => console.error('Error loading JSON:', error));

    // Fungsi untuk menampilkan nama-nama karyawan di panel kiri
    function displayNames(divisionKey, filter) {
        // Bersihkan name-list
        nameListContainer.innerHTML = '';

        // Jika data divisionKey tidak ada, berhenti
        if (!allData[divisionKey]) return;

        // Filter berdasarkan teks pencarian
        const filteredData = allData[divisionKey].filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase())
        );

        // Render item
        filteredData.forEach(item => {
            const nameItem = document.createElement('div');
            nameItem.classList.add('name-item');
            nameItem.textContent = item.name;
            nameItem.setAttribute('data-email', item.email);

            // Tandai jika sudah terpilih di selectedNames
            if (selectedNames.find(sel => sel.name === item.name && sel.email === item.email)) {
                nameItem.classList.add('selected');
            }

            // Klik item => toggle pilih/batal
            nameItem.addEventListener('click', () => {
                if (nameItem.classList.contains('selected')) {
                    nameItem.classList.remove('selected');
                    removeSelectedName(item);
                } else {
                    nameItem.classList.add('selected');
                    addSelectedName(item);
                }
                displayEmails();
            });

            nameListContainer.appendChild(nameItem);
        });
    }

    function addSelectedName(item) {
        // Hindari duplikasi
        const exists = selectedNames.find(sel => sel.name === item.name && sel.email === item.email);
        if (!exists) {
            selectedNames.push(item);
        }
    }

    function removeSelectedName(item) {
        selectedNames = selectedNames.filter(sel => {
            return sel.name !== item.name || sel.email !== item.email;
        });
    }

    function displayEmails() {
        // Gabung semua email terpilih
        const emailList = selectedNames.map(obj => obj.email);
        emailDisplay.textContent = emailList.join('; ');
    }

    // Event listener: pencarian
    searchInput.addEventListener('input', () => {
        const filterValue = searchInput.value.trim();
        displayNames(currentDivision, filterValue);
    });

    // Event listener: tab divisi
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Nonaktifkan tab lama
            document.querySelector('.tab-item.active').classList.remove('active');
            // Aktifkan tab baru
            tab.classList.add('active');

            // Perbarui currentDivision
            currentDivision = tab.getAttribute('data-division');

            // Set teks pada tombol Select All
            updateSelectAllButtonText(currentDivision);

            // Reset pencarian
            searchInput.value = '';
            displayNames(currentDivision, '');
        });
    });

    // Tombol "Select All" / "Unselect All"
    selectAllBtn.addEventListener('click', () => {
        toggleSelectAll(currentDivision);
    });

    // Fungsi toggling "Select All" untuk satu divisi tertentu
    function toggleSelectAll(divisionKey) {
        // Jika data tidak ada, berhenti
        if (!allData[divisionKey]) return;

        if (!isAllSelected[divisionKey]) {
            // Saat ini belum select all -> kita select semua item di divisi ini
            allData[divisionKey].forEach(item => {
                addSelectedName(item);
            });
            isAllSelected[divisionKey] = true;
        } else {
            // Sudah di-select-all -> kita unselect semua item di divisi ini
            allData[divisionKey].forEach(item => {
                removeSelectedName(item);
            });
            isAllSelected[divisionKey] = false;
        }

        // Update tampilan di panel kiri (agar item ter-check atau tidak)
        displayNames(divisionKey, searchInput.value);
        // Update tampilan email di panel kanan
        displayEmails();
        // Perbarui teks tombol
        updateSelectAllButtonText(divisionKey);
    }

    // Fungsi untuk update teks di tombol (Select All / Unselect All)
    function updateSelectAllButtonText(divisionKey) {
        if (isAllSelected[divisionKey]) {
            selectAllBtn.textContent = 'Unselect All';
        } else {
            selectAllBtn.textContent = 'Select All';
        }
    }

    // Fungsi copy ke clipboard
    copyBtn.addEventListener('click', copyToClipboard);
    function copyToClipboard() {
        const textToCopy = emailDisplay.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('Email berhasil disalin!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    }

});

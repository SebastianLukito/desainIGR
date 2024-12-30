document.addEventListener('DOMContentLoaded', () => {
    const marquee = document.getElementById('marquee');
    const marqueeText = document.getElementById('marqueeText');

    // Tab items (SUP IGR, SAM IGR, SM IGR, MSJM IGR)
    const tabItems = document.querySelectorAll('.tab-item');
    // Kontainer list nama email di panel kiri
    const nameListContainer = document.getElementById('name-list');
    // Input pencarian
    const searchInput = document.getElementById('searchInput');
    
    // Bagian output email di panel kanan
    const emailDisplay = document.getElementById('email-display');
    const copyBtn = document.getElementById('copy-btn');
    const selectAllBtn = document.getElementById('selectAllBtn');

    // Di sini kita siapkan container untuk sub tab
    // Pastikan di emailcabang.html sudah ada elemen <div class="sub-tab-section">
    const subTabSection = document.querySelector('.sub-tab-section');

    // ---------------------------------------------
    // DATA SUB TAB
    // ---------------------------------------------
    // Anda bisa menyesuaikan isi sub-tab sesuai kebutuhan
    // Contohnya:
    const subTabData = {
    // division1 = SUP
    division1: [
        {
        key: 'jawa',
        label: 'SUP JAWA',
        members: [
            { name: 'SUP YOG', email: 'support@yog.indogrosir.co.id' },
            { name: 'SUP SBY', email: 'support@sby.indogrosir.co.id' },
            // tambahkan lagi...
        ]
        },
        {
        key: 'dki',
        label: 'SUP DKI',
        members: [
            { name: 'SUP TGR', email: 'support@tgr.indogrosir.co.id' },
            { name: 'SUP BKS', email: 'support@bks.indogrosir.co.id' },
            // tambahkan lagi...
        ]
        },
        {
        key: 'kalimantan',
        label: 'SUP KAL',
        members: [
            { name: 'SUP BMS', email: 'support@bms.indogrosir.co.id' },
            { name: 'SUP SMD', email: 'support@smd.indogrosir.co.id' },
            { name: 'SUP PTK', email: 'support@ptk.indogrosir.co.id' },
        ]
        },
        {
        key: 'sulawesi',
        label: 'SUP SUL',
        members: [
            { name: 'SUP KRI', email: 'support@kri.indogrosir.co.id' },
            { name: 'SUP MDO', email: 'support@mdo.indogrosir.co.id' },
            { name: 'SUP MKS', email: 'support@mks.indogrosir.co.id' },
        ]
        },
    ],

    // division2 = SAM
    division2: [
        {
        key: 'jawa',
        label: 'SAM JAWA',
        members: [
            { name: 'SAM YOG', email: 'sam@yog.indogrosir.co.id' },
            { name: 'SAM SMG', email: 'sam@smg.indogrosir.co.id' },
            // dst...
        ]
        },
        {
        key: 'kalimantan',
        label: 'SAM KALIMANTAN',
        members: [
            { name: 'SAM BMS', email: 'sam@bms.indogrosir.co.id' },
            { name: 'SAM SMD', email: 'sam@smd.indogrosir.co.id' },
            { name: 'SAM PTK', email: 'sam@ptk.indogrosir.co.id' },
        ]
        },
        // tambahkan sub-tab lain (Sumatra, Sulawesi, dsb.) sesuai kebutuhan
    ],

    // division3 = SM
    division3: [
        {
        key: 'jawa',
        label: 'SM JAWA',
        members: [
            { name: 'SM YOG', email: 'sm@yog.indogrosir.co.id' },
            { name: 'SM BDG', email: 'sm@bdg.indogrosir.co.id' },
            // dst...
        ]
        },
        // tambahkan sub-tab lain
    ],

    // division4 = MSJM
    division4: [
        {
        key: 'jawa',
        label: 'MSJM JAWA',
        members: [
            { name: 'MSJM YOG', email: 'msjm@yog.indogrosir.co.id' },
            { name: 'MSJM SMG', email: 'msjm@smg.indogrosir.co.id' },
            // dst...
        ]
        },
        // tambahkan sub-tab lain
    ]
    };

    // ---------------------------------------------
    // Variabel global data
    // ---------------------------------------------
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

    // ---------------------------------------------
    // Fetch data dari JSON (data utama)
    // ---------------------------------------------
    fetch('../assets/list/cabangdata.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            displayNames(currentDivision, '');
        })
        .catch(error => console.error('Error loading JSON:', error));

    // ---------------------------------------------
    // Fungsi menampilkan sub-tab (dinamis)
    // ---------------------------------------------
    // Membuat <ul> sub-tab untuk setiap divisionKey
    function createSubTabsForDivision(divisionKey) {
    const ul = document.createElement('ul');
    ul.classList.add('sub-tab-list');
    ul.id = `sub-tab-${divisionKey}`;
    // Default: disembunyikan dulu, akan ditampilkan saat tab-nya aktif
    ul.style.display = 'none';

    // Ambil array sub-tab dari subTabData
    const subTabs = subTabData[divisionKey];
    if (subTabs) {
        subTabs.forEach(sub => {
        const li = document.createElement('li');
        li.classList.add('sub-tab-item');
        li.textContent = sub.label; // e.g. 'SUP JAWA'
        li.setAttribute('data-subKey', sub.key);

        // Saat sub-tab di-klik
        li.addEventListener('click', () => {
            // 1. Tandai sub-tab mana yg aktif
            const siblings = ul.querySelectorAll('.sub-tab-item');
            siblings.forEach(item => item.classList.remove('active'));
            li.classList.add('active');

            // 2. Tampilkan data "members" di panel kiri
            displaySubTabMembers(sub.members);
        });

        ul.appendChild(li);
        });
    }

    return ul;
    }

    // Menampilkan data members dari sub-tab di panel kiri
    function displaySubTabMembers(members) {
    // Bersihkan name-list
    nameListContainer.innerHTML = '';

    // Render setiap item
    members.forEach(item => {
        const nameItem = document.createElement('div');
        nameItem.classList.add('name-item');
        nameItem.textContent = item.name;
        nameItem.setAttribute('data-email', item.email);

        // Jika sudah terpilih, tandai
        if (selectedNames.find(sel => sel.name === item.name && sel.email === item.email)) {
        nameItem.classList.add('selected');
        }

        // Klik untuk toggle
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

    // ---------------------------------------------
    // Generate sub-tab secara dinamis untuk semua division
    // ---------------------------------------------
    Object.keys(subTabData).forEach(divisionKey => {
    const subTabUl = createSubTabsForDivision(divisionKey);
    subTabSection.appendChild(subTabUl);
    });

    // ---------------------------------------------
    // Fungsi untuk menampilkan data (jika user belum pilih sub-tab)
    // atau menampilkan data lengkap dari JSON (original)
    // ---------------------------------------------
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

    // ---------------------------------------------
    // Fungsi menambah dan menghapus item dari selectedNames
    // ---------------------------------------------
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

    // ---------------------------------------------
    // Menampilkan email terpilih di panel kanan
    // ---------------------------------------------
    function displayEmails() {
        const emailList = selectedNames.map(obj => obj.email);
        emailDisplay.textContent = emailList.join('; ');
    }

    // ---------------------------------------------
    // Pencarian
    // ---------------------------------------------
    searchInput.addEventListener('input', () => {
        const filterValue = searchInput.value.trim();
        displayNames(currentDivision, filterValue);
    });

    // ---------------------------------------------
    // Event listener: Tab utama (SUP, SAM, SM, MSJM)
    // ---------------------------------------------
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Nonaktifkan tab lama
            document.querySelector('.tab-item.active').classList.remove('active');
            // Aktifkan tab baru
            tab.classList.add('active');

            // Perbarui currentDivision
            currentDivision = tab.getAttribute('data-division');

            // Reset pencarian
            searchInput.value = '';

            // Ganti teks tombol Select All
            updateSelectAllButtonText(currentDivision);

            // Tampilkan data default (dari JSON) di panel kiri
            displayNames(currentDivision, '');

            // Sembunyikan semua sub-tab
            const allSubTabLists = document.querySelectorAll('.sub-tab-list');
            allSubTabLists.forEach(ul => {
            ul.style.display = 'none';
            // Reset highlight sub-tab
            ul.querySelectorAll('.sub-tab-item').forEach(item => item.classList.remove('active'));
            });

            // Tampilkan sub-tab milik division yg aktif
            const activeSubTabUl = document.getElementById(`sub-tab-${currentDivision}`);
            if (activeSubTabUl) {
                activeSubTabUl.style.display = 'flex'; // atau 'block'
            }
        });
    });

    // ---------------------------------------------
    // Tombol "Select All" / "Unselect All"
    // ---------------------------------------------
    selectAllBtn.addEventListener('click', () => {
        toggleSelectAll(currentDivision);
    });

    function toggleSelectAll(divisionKey) {
        if (!allData[divisionKey]) return;

        if (!isAllSelected[divisionKey]) {
            // Belum select all -> select semua item di divisi ini
            allData[divisionKey].forEach(item => {
                addSelectedName(item);
            });
            isAllSelected[divisionKey] = true;
        } else {
            // Sudah select all -> unselect semua item
            allData[divisionKey].forEach(item => {
                removeSelectedName(item);
            });
            isAllSelected[divisionKey] = false;
        }

        // Update tampilan di panel kiri
        displayNames(divisionKey, searchInput.value);
        // Update email di panel kanan
        displayEmails();
        // Perbarui teks tombol
        updateSelectAllButtonText(divisionKey);
    }

    function updateSelectAllButtonText(divisionKey) {
        if (isAllSelected[divisionKey]) {
            selectAllBtn.textContent = 'Unselect All';
        } else {
            selectAllBtn.textContent = 'Select All';
        }
    }

    // ---------------------------------------------
    // Fungsi Copy ke Clipboard
    // ---------------------------------------------
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

    // Seleksi tombol Clear All
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', clearAllSelections);

    // Fungsi untuk Clear All
    function clearAllSelections() {
        // Kosongkan array selectedNames
        selectedNames = [];

        // Pastikan "Select All" toggle reset (opsional)
        isAllSelected = {
            division1: false,
            division2: false,
            division3: false,
            division4: false
        };

        // Bersihkan tampilan email di panel kanan
        displayEmails();

        // Bersihkan highlight 'selected' di panel kiri
        // (panggil ulang displayNames dengan filter kosong, 
        //  agar nameList di-refresh)
        displayNames(currentDivision, searchInput.value);
    }


});

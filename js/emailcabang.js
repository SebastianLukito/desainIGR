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
    const clearBtn = document.getElementById('clear-btn'); // Pastikan ini sudah ada di HTML

    // Di sini kita siapkan container untuk sub tab
    const subTabSection = document.querySelector('.sub-tab-section');

    // ---------------------------------------------
    // DATA SUB TAB (Contoh)
    // ---------------------------------------------
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
    // Sub tab yang sedang aktif (null = tidak ada)
    let currentSubTab = null;

    // ---------------------------------------------
    // Fetch data dari JSON (data utama)
    // ---------------------------------------------
    fetch('../assets/list/cabangdata.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            // Tampilkan data default (tanpa sub tab)
            displayNames(currentDivision, '');
        })
        .catch(error => console.error('Error loading JSON:', error));

    // ---------------------------------------------
    // Fungsi menampilkan sub-tab (dinamis)
    // ---------------------------------------------
    function createSubTabsForDivision(divisionKey) {
    const ul = document.createElement('ul');
    ul.classList.add('sub-tab-list');
    ul.id = `sub-tab-${divisionKey}`;
    ul.style.display = 'none';

    const subTabs = subTabData[divisionKey];
    if (subTabs) {
        subTabs.forEach(sub => {
        const li = document.createElement('li');
        li.classList.add('sub-tab-item');
        li.textContent = sub.label;
        li.setAttribute('data-subKey', sub.key);

        // Saat sub-tab di-klik
        li.addEventListener('click', () => {
            // 1. Tandai sub-tab mana yang aktif
            const siblings = ul.querySelectorAll('.sub-tab-item');
            siblings.forEach(item => item.classList.remove('active'));
            li.classList.add('active');

            // 2. Simpan sub tab aktif di variable global
            currentSubTab = sub; 
            // 3. Tampilkan data sub-tab ini di panel kiri
            displaySubTabMembers(sub.members);
        });

        ul.appendChild(li);
        });
    }

    return ul;
    }

    function displaySubTabMembers(members) {
    // Bersihkan name-list
    nameListContainer.innerHTML = '';

    members.forEach(item => {
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

    // Generate sub-tab untuk semua division
    Object.keys(subTabData).forEach(divisionKey => {
    const subTabUl = createSubTabsForDivision(divisionKey);
    subTabSection.appendChild(subTabUl);
    });

    // ---------------------------------------------
    // Fungsi untuk menampilkan data bawaan JSON
    // ---------------------------------------------
    function displayNames(divisionKey, filter) {
    currentSubTab = null; // reset sub-tab active
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
    // Tambah/hapus item dari selectedNames
    // ---------------------------------------------
    function addSelectedName(item) {
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
    // Tampilkan email terpilih di panel kanan
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
    // Jika sedang ada sub-tab aktif, tampilkan sub-tab data
    if (currentSubTab) {
        // Filter data sub-tab
        const filtered = currentSubTab.members.filter(item =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
        );
        displaySubTabMembers(filtered);
    } else {
        // Jika tidak ada sub-tab, gunakan data main
        displayNames(currentDivision, filterValue);
    }
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

        // Tampilkan data default (dari JSON) di panel kiri
        displayNames(currentDivision, '');

        // Sembunyikan semua sub-tab
        const allSubTabLists = document.querySelectorAll('.sub-tab-list');
        allSubTabLists.forEach(ul => {
            ul.style.display = 'none';
            ul.querySelectorAll('.sub-tab-item').forEach(item => item.classList.remove('active'));
        });

        // Tampilkan sub-tab milik division yg aktif
        const activeSubTabUl = document.getElementById(`sub-tab-${currentDivision}`);
        if (activeSubTabUl) {
            activeSubTabUl.style.display = 'flex';
        }
    });
    });

    // ---------------------------------------------
    // Tombol "Select All" / "Unselect All" (hanya tab atau sub-tab aktif)
    // ---------------------------------------------
    selectAllBtn.addEventListener('click', () => {
    // Jika ada sub-tab aktif, select/unselect data sub-tab saja
    if (currentSubTab) {
        toggleSelectAllSubTab(currentDivision, currentSubTab);
    } else {
        // Jika tidak ada sub-tab, select/unselect data main tab
        toggleSelectAllMain(currentDivision);
    }
    });

    // Fungsi select/unselect di sub-tab aktif
    function toggleSelectAllSubTab(divisionKey, sub) {
    // Cek apakah semua item sub-tab sudah diselected
    const subEmails = sub.members.map(m => m.email);
    const allSelected = sub.members.every(m =>
        selectedNames.some(sel => sel.email === m.email)
    );

    if (!allSelected) {
        // Jika belum semua dipilih -> pilih semua
        sub.members.forEach(item => addSelectedName(item));
    } else {
        // Jika sudah semua dipilih -> unselect semua
        sub.members.forEach(item => removeSelectedName(item));
    }

    // Refresh panel kiri (sub-tab) dan panel kanan
    displaySubTabMembers(sub.members);
    displayEmails();
    }

    // Fungsi select/unselect di main tab
    function toggleSelectAllMain(divisionKey) {
    // data main tab
    const dataTab = allData[divisionKey] || [];
    // Cek apakah semua item main tab sudah diselected
    const allSelected = dataTab.every(m =>
        selectedNames.some(sel => sel.email === m.email)
    );

    if (!allSelected) {
        // Belum semua -> select all
        dataTab.forEach(item => addSelectedName(item));
    } else {
        // Sudah semua -> unselect all
        dataTab.forEach(item => removeSelectedName(item));
    }

    // Refresh panel kiri (main tab) dan panel kanan
    displayNames(divisionKey, searchInput.value);
    displayEmails();
    }

    // ---------------------------------------------
    // Tombol Clear All
    // ---------------------------------------------
    clearBtn.addEventListener('click', clearAllSelections);

    function clearAllSelections() {
    selectedNames = [];
    // Reset tampilan email
    displayEmails();

    // Jika sedang lihat sub-tab, refresh sub-tab
    if (currentSubTab) {
        displaySubTabMembers(currentSubTab.members);
    } else {
        displayNames(currentDivision, searchInput.value);
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

});

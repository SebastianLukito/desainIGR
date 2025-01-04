// Variabel global
let visitorData = [];
let chartInstance = null;
let currentPage = 1; // Halaman saat ini
const rowsPerPage = 10; // Jumlah baris per halaman

// Fungsi menambahkan data pengunjung secara otomatis
function addVisitor(username) {
    if (!username) return; // Pastikan username tidak kosong
    db.collection("visitors")
        .add({
            username: username,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Timestamp otomatis
        })
        .then(() => {
            console.log(`Pengunjung "${username}" berhasil ditambahkan!`);
        })
        .catch((error) => {
            console.error("Error menambahkan pengunjung:", error);
        });
}

// Ambil data pengunjung dari Firebase
function fetchVisitorData() {
    db.collection("visitors")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            visitorData = snapshot.docs.map((doc, index) => ({
                no: index + 1,
                username: doc.data().username,
                timestamp: doc.data().timestamp
                    ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
                    : "Waktu tidak tersedia",
            }));
            updateTable();
            updateChart(document.getElementById("timeRange").value);
        });
}

// Update tabel pengunjung
function updateTable() {
    const tableBody = document.querySelector("#visitorTable tbody");
    tableBody.innerHTML = "";

    // Hitung indeks data berdasarkan halaman
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = visitorData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="3" style="text-align: center;">Tidak ada data pengunjung</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    // Tampilkan data sesuai halaman
    pageData.forEach((visitor) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${visitor.no}</td>
            <td>${visitor.username}</td>
            <td>${visitor.timestamp}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

// Update tombol paginasi
function updatePagination() {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(visitorData.length / rowsPerPage);

    // Tombol Previous
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Nomor halaman
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? "active" : "";
        pageButton.addEventListener("click", () => {
            currentPage = i;
            updateTable();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Tombol Next
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Update grafik pengunjung
function updateChart(timeRange) {
    const groupedData = groupDataByTimeRange(timeRange);

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById("visitorChart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: groupedData.labels,
            datasets: [{
                label: `Pengunjung (${timeRange})`,
                data: groupedData.data,
                borderColor: "rgb(33, 34, 34)",
                tension: 0.1,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Waktu" } },
                y: { title: { display: true, text: "Jumlah Pengunjung" }, beginAtZero: true },
            },
        },
    });
}

// Grupkan data berdasarkan rentang waktu
function groupDataByTimeRange(timeRange) {
    const labels = [];
    const data = [];
    const now = new Date();

    if (timeRange === "daily") {
        for (let i = 6; i >= 0; i--) {
            const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dayString = day.toLocaleDateString();
            labels.push(dayString);

            const count = visitorData.filter((visitor) => {
                const visitDate = new Date(visitor.timestamp);
                return visitDate.toLocaleDateString() === dayString;
            }).length;
            data.push(count);
        }
    } else if (timeRange === "weekly") {
        // Iterasi 4 minggu terakhir
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - i * 7); // Awal minggu
            weekStart.setHours(0, 0, 0, 0);
    
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Akhir minggu
            weekEnd.setHours(23, 59, 59, 999);
    
            const label = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
            labels.push(label);
    
            // Hitung jumlah pengunjung dalam rentang minggu
            const count = visitorData.filter((visitor) => {
                const visitDate = new Date(visitor.timestamp);
                return visitDate >= weekStart && visitDate <= weekEnd;
            }).length;
    
            data.push(count);
        }
    } else if (timeRange === "monthly") {
        for (let i = 2; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i);
            const monthString = `${month.toLocaleString("default", { month: "long" })} ${month.getFullYear()}`;
            labels.push(monthString);

            const count = visitorData.filter((visitor) => {
                const visitDate = new Date(visitor.timestamp);
                return visitDate.getMonth() === month.getMonth() &&
                    visitDate.getFullYear() === month.getFullYear();
            }).length;
            data.push(count);
        }
    } else if (timeRange === "yearly") {
        for (let i = 4; i >= 0; i--) {
            const year = now.getFullYear() - i;
            labels.push(year.toString());

            const count = visitorData.filter((visitor) => {
                const visitDate = new Date(visitor.timestamp);
                return visitDate.getFullYear() === year;
            }).length;
            data.push(count);
        }
    }

    return { labels, data };
}



// Event listener untuk dropdown rentang waktu
document.getElementById("timeRange").addEventListener("change", (event) => {
    const timeRange = event.target.value;
    updateChart(timeRange);
});

// Muat data awal
fetchVisitorData();

// Fungsi untuk menghitung frekuensi akses berdasarkan tanggal
function calculateAccessFrequency() {
    const frequencyMap = {};

    visitorData.forEach((visitor) => {
        const date = new Date(visitor.timestamp).toLocaleDateString(); // Ambil tanggal
        if (!frequencyMap[visitor.username]) {
            frequencyMap[visitor.username] = {};
        }
        if (!frequencyMap[visitor.username][date]) {
            frequencyMap[visitor.username][date] = 0;
        }
        frequencyMap[visitor.username][date]++;
    });

    // Ubah menjadi array untuk Excel
    const excelData = [];
    let no = 1;

    for (const username in frequencyMap) {
        for (const date in frequencyMap[username]) {
            excelData.push({
                No: no++,
                Username: username,
                "Frekuensi Akses": frequencyMap[username][date],
                Tanggal: date,
            });
        }
    }

    return excelData;
}

// Fungsi untuk mengunduh file Excel
function exportToExcel() {
    const frequencyData = calculateAccessFrequency();
    const worksheet = XLSX.utils.json_to_sheet(frequencyData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik Pengunjung");

    // Unduh file Excel
    XLSX.writeFile(workbook, "visitor_statistics.xlsx");

    console.log("File Excel berhasil diunduh!");
}

// Event listener untuk tombol Export to Excel
document.getElementById("exportExcelBtn").addEventListener("click", exportToExcel);


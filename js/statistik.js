// Variabel global
let visitorData = [];   // data asli dari Firestore
let filteredData = [];  // data setelah difilter
let chartInstance = null;
let currentPage = 1; // Halaman saat ini
const rowsPerPage = 14; // Jumlah baris per halaman
let top5ChartInstance = null;

// Variabel global untuk menyimpan date range
let globalStartDate = null;
let globalEndDate = null;

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

            // Pastikan filteredData langsung diisi data utama
            filteredData = visitorData;  

            // Update tabel
            updateTable();

            // Update grafik
            updateChart(document.getElementById("timeRange").value);

            // Update chart Top 5 Visitors
            const top5Mode = document.getElementById("top5Mode").value; // ambil value dropdown
            updateTop5Chart(top5Mode);

            // Panggil ringkasan
            updateSummary();

            updateMaxDayMonth();
        });
}

/* -------------------------------------------
FUNGSI FILTER 
------------------------------------------- */
function applyFilter() {
    // Ambil nilai dari input pencarian (username)
    const usernameQuery = document.getElementById("searchUsername").value.trim().toLowerCase();

    filteredData = visitorData.filter((v) => {
        // 1) Filter username
        let userOk = true;
        if (usernameQuery) {
            userOk = v.username.toLowerCase().includes(usernameQuery);
        }

        // 2) Filter date range
        let dateOk = true;
        if (globalStartDate || globalEndDate) {
            const visitDateObj = new Date(v.timestamp);
            if (globalStartDate && visitDateObj < globalStartDate) dateOk = false;
            if (globalEndDate && visitDateObj > globalEndDate) dateOk = false;
        }

        return userOk && dateOk;
    });

    currentPage = 1;
    updateTable();
}

/* -------------------------------------------
EVENT LISTENER
------------------------------------------- */
// 1) Pencarian username otomatis saat mengetik
document.getElementById("searchUsername").addEventListener("input", applyFilter);

// 2) Tombol Filter untuk menerapkan rentang tanggal
document.getElementById("filterBtn").addEventListener("click", () => {
    let startDateVal = document.getElementById("startDate").value;  // "" jika belum diisi
    let endDateVal = document.getElementById("endDate").value;      // "" jika belum diisi

    // Konversi ke Date hanya jika tidak kosong
    globalStartDate = startDateVal ? new Date(startDateVal) : null;
    globalEndDate = endDateVal ? new Date(endDateVal) : null;

    if (globalEndDate) {
        // Pastikan endDate mencakup akhir hari
        globalEndDate.setHours(23, 59, 59, 999);
    }

    // Panggil applyFilter() lagi, supaya gabung dengan pencarian username
    applyFilter();
});

// 3) Tombol Reset untuk menghapus semua filter
document.getElementById("resetFilterBtn").addEventListener("click", () => {
    // Kosongkan input
    document.getElementById("searchUsername").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    // Kembalikan date range
    globalStartDate = null;
    globalEndDate = null;

    // Kembalikan data
    filteredData = visitorData;
    currentPage = 1;
    updateTable();
});

/* -------------------------------------------
FUNGSI updateTable()
------------------------------------------- */
function updateTable() {
    const tableBody = document.querySelector("#visitorTable tbody");
    tableBody.innerHTML = "";

    // Gunakan filteredData sebagai sumber data untuk tabel
    const dataToShow = filteredData;

    // Hitung total pages
    const totalItems = dataToShow.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    // Pastikan currentPage tidak melebihi totalPages
    if (currentPage > totalPages && totalPages !== 0) {
        currentPage = totalPages;
    }

    // Hitung indeks data berdasarkan halaman
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const pageData = dataToShow.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="3" style="text-align: center;">Tidak ada data pengunjung</td>`;
        tableBody.appendChild(emptyRow);
    } else {
        pageData.forEach((visitor) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${visitor.no}</td>
                <td>${visitor.username}</td>
                <td>${visitor.timestamp}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    updatePagination(totalPages);
}

/* -------------------------------------------
FUNGSI updatePagination()
------------------------------------------- */
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

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

    // Batasi jumlah tombol halaman
    const maxPagesToShow = 9;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPagesToShow) {
        const half = Math.floor(maxPagesToShow / 2);
        startPage = currentPage - half;
        endPage = currentPage + (maxPagesToShow - half - 1);

        if (startPage < 1) {
            startPage = 1;
            endPage = maxPagesToShow;
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxPagesToShow + 1;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
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

/* -------------------------------------------
FUNGSI updateChart(timeRange)
------------------------------------------- */
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
        // Misalnya, mau menampilkan 5 bulan terakhir
        const monthsToShow = 5;
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            
            const monthString = monthDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
            });
            labels.push(monthString);
    
            const count = visitorData.filter((visitor) => {
                const visitDate = new Date(visitor.timestamp);
                return (
                    visitDate.getMonth() === monthDate.getMonth() &&
                    visitDate.getFullYear() === monthDate.getFullYear()
                );
            }).length;
            data.push(count);
        }
    } else if (timeRange === "yearly") {
        // Misalnya, mau menampilkan 5 tahun terakhir
        const yearsToShow = 5;
        for (let i = yearsToShow - 1; i >= 0; i--) {
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

/* -------------------------------------------
FUNGSI EXPORT TANPA GROUPING
(Setiap baris data difilterData diekspor apa adanya)
------------------------------------------- */
function exportAllRows(data) {
// data = filteredData
const excelData = data.map((visitor, index) => {
    return {
    No: index + 1,
    Username: visitor.username,
    Timestamp: visitor.timestamp
    };
});

const worksheet = XLSX.utils.json_to_sheet(excelData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "All Visitor Data");
XLSX.writeFile(workbook, "visitor_statistics.xlsx");

console.log("File Excel berhasil diunduh (filtered, tanpa grouping)!");
}

// Event listener untuk tombol Export to Excel
document.getElementById("exportExcelBtn").addEventListener("click", () => {
    // Gunakan filteredData
    exportAllRows(filteredData);
});

// Misalnya setelah Anda definisikan event untuk exportExcelBtn:
document.getElementById("exportCSVBtn").addEventListener("click", () => {
    exportToCSV(filteredData);
});

document.getElementById("exportPDFBtn").addEventListener("click", () => {
    exportToPDF(filteredData);
});

function exportToCSV(data) {
    // Data: array of object, misalnya: [ {no, username, timestamp}, ... ]

    // 1. Definisikan header
    const headers = ["No", "Username", "Timestamp"];

    // 2. Array untuk menampung semua baris CSV
    const csvRows = [];

    // 3. Masukkan baris header ke csvRows
    csvRows.push(headers.join(",")); // "No,Username,Timestamp"

    // 4. Loop data -> bentuk array string -> gabung pakai "," -> push ke csvRows
    data.forEach((visitor, index) => {
    const row = [
        index + 1,          // atau visitor.no, tergantung preferensi
        visitor.username,
        visitor.timestamp
    ];
    csvRows.push(row.join(",")); // misalnya "1,jody,1/24/2025, 8:24:09 PM"
    });

    // 5. Gabungkan semua baris dengan newline
    const csvString = csvRows.join("\n");

    // 6. Buat Blob & generate object URL
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    // 7. Buat elemen <a> tersembunyi untuk memicu download
    const link = document.createElement("a");
    link.href = url;
    link.download = "visitor_statistics.csv"; // nama file
    link.click();

    // 8. Hapus url dari memori
    window.URL.revokeObjectURL(url);
    console.log("File CSV berhasil diunduh (filtered)!");
}

function exportToPDF(data) {
    // 1. Buat instance jsPDF
    const { jsPDF } = window.jspdf; // jika memakai versi modular
    const doc = new jsPDF();

    // 2. Tambahkan judul
    doc.setFontSize(14);
    doc.text("Visitor Statistics", 10, 10);

    // 3. Tulis data satu-per-satu (sederhana)
    //    - Kita akan tulis: "No. username - timestamp"
    let yPos = 20;
    data.forEach((visitor, idx) => {
    const line = `${idx + 1}. ${visitor.username} - ${visitor.timestamp}`;
    doc.text(line, 10, yPos);

    yPos += 10;

    // Jika baris melebihi halaman, buat halaman baru
    if (yPos > 280) {
        doc.addPage();
        yPos = 20;
    }
    });

    // 4. Download PDF
    doc.save("visitor_statistics.pdf");
    console.log("File PDF berhasil diunduh (filtered)!");
}


/* -------------------------------------------
FUNGSI RINGKASAN
-------------------------------------------*/
function updateSummary() {
    // Elemen HTML tempat menampilkan ringkasan
    const totalVisitorsEl = document.getElementById("totalVisitors");
    const uniqueVisitorsEl = document.getElementById("uniqueVisitors");
    const newVsReturningEl = document.getElementById("newVsReturning");
    const avgPerDayEl = document.getElementById("avgPerDay");

    // 1) Hitung Total Pengunjung
    const totalVisitors = visitorData.length;

    // 2) Hitung Pengunjung Unik
    const uniqueUsernames = new Set(visitorData.map(v => v.username));
    const uniqueVisitors = uniqueUsernames.size;

    // 3) Pengunjung Baru vs. Kembali
    let newCount = 0;
    let returningCount = 0;
    const countPerUser = {};

    visitorData.forEach((v) => {
        countPerUser[v.username] = (countPerUser[v.username] || 0) + 1;
    });

    for (const user in countPerUser) {
        if (countPerUser[user] === 1) {
            newCount++;
        } else {
            returningCount++;
        }
    }

    // 4) Rata-rata Pengunjung per Hari
    if (visitorData.length > 0) {
        const timestamps = visitorData.map(v => new Date(v.timestamp));
        const minDate = new Date(Math.min(...timestamps));
        const maxDate = new Date(Math.max(...timestamps));
        const oneDay = 24 * 60 * 60 * 1000; // ms in a day
        const diffDays = Math.floor((maxDate - minDate) / oneDay) + 1;
        const averagePerDay = (totalVisitors / diffDays).toFixed(2); 
        avgPerDayEl.textContent = averagePerDay;
    } else {
        avgPerDayEl.textContent = "0";
    }

    // Tampilkan ke HTML
    totalVisitorsEl.textContent = totalVisitors;
    uniqueVisitorsEl.textContent = uniqueVisitors;
    newVsReturningEl.textContent = `${newCount} vs. ${returningCount}`;
}

/* -------------------------------------------
FUNGSI UNTUK TOP 5 CHART
-------------------------------------------*/
document.getElementById("top5Mode").addEventListener("change", (event) => {
    const mode = event.target.value; // "total" atau "unique"
    updateTop5Chart(mode);
});

function updateTop5Chart(mode = "total") {
    const userCountMap = {};
    visitorData.forEach((item) => {
        const username = item.username;
        userCountMap[username] = (userCountMap[username] || 0) + 1;
    });

    let userCountArray = Object.entries(userCountMap).map(([username, count]) => ({ username, count }));

    if (mode === "total") {
        // Sort descending
        userCountArray.sort((a, b) => b.count - a.count);
        userCountArray = userCountArray.slice(0, 5);
    } else if (mode === "unique") {
        // Filter user dengan 1-5 kunjungan
        const filtered = userCountArray.filter(item => item.count >= 1 && item.count <= 5);
        filtered.sort((a, b) => b.count - a.count);
        userCountArray = filtered.slice(0, 5);
    }

    // TRUNCATE LABEL untuk sumbu X
    const labels = userCountArray.map(item => {
    const originalName = item.username;
    return (originalName.length > 8)
        ? originalName.substring(0, 8) + "..."
        : originalName;
    });

    const data = userCountArray.map(item => item.count);

    // Warna untuk bar chart
    const colorPalette = [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 205, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)"
    ];
    const borderPalette = [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)"
    ];

    const backgroundColors = data.map((_, i) => colorPalette[i % colorPalette.length]);
    const borderColors = data.map((_, i) => borderPalette[i % borderPalette.length]);

    // Hancurkan chart sebelumnya jika ada
    if (top5ChartInstance) top5ChartInstance.destroy();

    // Buat chart
    const ctx = document.getElementById("top5Chart").getContext("2d");
    top5ChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: (mode === "total")
                    ? "Top 5 by Total Frequency"
                    : "Top 5 (1–5 visits)",
                data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Pengunjung" } },
                y: { title: { display: true, text: "Jumlah Kunjungan" }, beginAtZero: true }
            }
        }
    });
}

function updateDateTime() {
    const now = new Date();

    const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const monthNames = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
    ];

    const dayName = dayNames[now.getDay()];      // Misal: "Sabtu"
    const dayNumber = now.getDate();             // Misal: 25
    const monthName = monthNames[now.getMonth()];// Misal: "Januari"
    const year = now.getFullYear();              // Misal: 2025

    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    if (hour < 10)   hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;

    // Format: "Sabtu, 25 Januari 2025 Pukul 05:17:32"
    const formattedString = 
    `${dayName}, ${dayNumber} ${monthName} ${year}<br>Pukul ${hour}:${minute}:${second}`;

    document.getElementById("currentDateTime").innerHTML = formattedString;
}

// Panggil pertama kali
updateDateTime();

// Update setiap 1 detik (1000 ms)
setInterval(updateDateTime, 1000);

function updateMaxDayMonth() {
    // --- 1) Hitung HARI dengan pengunjung terbanyak ---
    const dayMap = {};  // { "YYYY-MM-DD": count }

    visitorData.forEach(visitor => {
        const dateObj = new Date(visitor.timestamp);
        const yyyy = dateObj.getFullYear();
        let mm = dateObj.getMonth() + 1;
        let dd = dateObj.getDate();

        if (mm < 10) mm = "0" + mm;
        if (dd < 10) dd = "0" + dd;

        const dateKey = `${yyyy}-${mm}-${dd}`;
        dayMap[dateKey] = (dayMap[dateKey] || 0) + 1;
    });

    // Cari key dengan count terbesar
    let maxDayKey = null;
    let maxDayCount = 0;
    for (const key in dayMap) {
        if (dayMap[key] > maxDayCount) {
            maxDayCount = dayMap[key];
            maxDayKey = key;
        }
    }

    // Konversi jadi format "Sabtu, 4 Januari 2025"
    let dayLabel = "";
    if (maxDayKey) {
        const [y, m, d] = maxDayKey.split("-");
        const dateObj = new Date(+y, +m - 1, +d);

        const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
        const monthNames = [
            "Januari","Februari","Maret","April","Mei","Juni",
            "Juli","Agustus","September","Oktober","November","Desember"
        ];

        const dayName = dayNames[dateObj.getDay()];
        const monthName = monthNames[+m - 1];
        dayLabel = `${dayName}, ${+d} ${monthName} ${+y}`; 
    }

    // Tampilkan di DOM
    document.getElementById("maxDayLabel").textContent = dayLabel || "-";
    document.getElementById("maxDayCount").textContent = maxDayCount || "0";

    // --- 2) Hitung BULAN dengan pengunjung terbanyak ---
    const monthMap = {}; // { "YYYY-MM": count }

    visitorData.forEach(visitor => {
        const dateObj = new Date(visitor.timestamp);
        const yyyy = dateObj.getFullYear();
        let mm = dateObj.getMonth() + 1;
        if (mm < 10) mm = "0" + mm;

        const monthKey = `${yyyy}-${mm}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    });

    let maxMonthKey = null;
    let maxMonthCount = 0;
    for (const key in monthMap) {
        if (monthMap[key] > maxMonthCount) {
            maxMonthCount = monthMap[key];
            maxMonthKey = key;
        }
    }

    // Konversi ke format "Januari 2025"
    let monthLabel = "";
    if (maxMonthKey) {
        const [y2, m2] = maxMonthKey.split("-");
        const dateObj = new Date(+y2, +m2 - 1, 1);

        const monthNames = [
            "Januari","Februari","Maret","April","Mei","Juni",
            "Juli","Agustus","September","Oktober","November","Desember"
        ];
        monthLabel = `${monthNames[+m2 - 1]} ${+y2}`;
    }

    // Tampilkan di DOM
    document.getElementById("maxMonthLabel").textContent = monthLabel || "-";
    document.getElementById("maxMonthCount").textContent = maxMonthCount || "0";

    // --- 3) Pasang event listener untuk animasi scramble ---
    // (Jika data berubah, kita update event listener agar memakai finalValue terbaru)
    const dayBox = document.getElementById("maxDayBox");
    const monthBox = document.getElementById("maxMonthBox");

    // Ganti ke .onclick = ... agar tidak menumpuk listener
    dayBox.onclick = () => {
        scrambleCount("maxDayCount", maxDayCount, 1000);
    };
    monthBox.onclick = () => {
        scrambleCount("maxMonthCount", maxMonthCount, 1000);
    };
}

/**
 * Animasi “scramble” angka selama `duration` ms,
 * lalu menampilkan `finalValue` di element .info-count.
 */
function scrambleCount(elementId, finalValue, duration = 1000) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();

    const interval = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;

        if (elapsed < duration) {
            // Tampilkan angka acak antara 0 sampai finalValue
            let randomVal = Math.floor(Math.random() * (finalValue + 1));
            element.textContent = randomVal;
        } else {
            clearInterval(interval);
            element.textContent = finalValue;
        }
    }, 50);
}
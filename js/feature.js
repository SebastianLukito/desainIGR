let featureData = [];

// Fungsi untuk mencatat penggunaan fitur ke Firestore
function recordFeatureUsage(featureName) {
    // Ambil username dari cookie (misalnya sesuai login Anda)
    const username = getCookie("username") || "anonymous";

    // Kita pakai serverTimestamp agar waktu dicatat oleh server Firestore
    const ts = firebase.firestore.FieldValue.serverTimestamp();

    db.collection("featureLogs").add({
        username: username,
        feature: featureName,
        timestamp: ts
    })
    .then(() => {
        console.log("Berhasil mencatat penggunaan fitur:", featureName);
    })
    .catch((error) => {
        console.error("Gagal mencatat penggunaan fitur:", error);
    });
}

// Fungsi untuk mengambil data "featureLogs" berdasarkan username dan timestamp (tanggal)
function fetchFeatureDataByUsername(username, timestamp) {
    const selectedDate = new Date(timestamp).toLocaleDateString(); // Ambil tanggal saja

    db.collection("featureLogs")
        .where("username", "==", username)
        .get()
        .then((snapshot) => {
            let featureData = snapshot.docs
                .map((doc) => {
                    const data = doc.data();
                    const featureDate = data.timestamp
                        ? new Date(data.timestamp.toDate()).toLocaleDateString()
                        : null;

                    // Hanya tampilkan fitur jika tanggalnya sama
                    if (featureDate === selectedDate) {
                        return {
                            feature: data.feature,
                            timestamp: data.timestamp
                                ? new Date(data.timestamp.toDate()).toLocaleString()
                                : "N/A"
                        };
                    }
                    return null; // Jika tanggal berbeda, return null
                })
                .filter((item) => item !== null); // Hapus data yang null

            // Urutkan secara default dari yang terbaru ke yang terlama (descending)
            featureData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Tambahkan nomor urut setelah sorting
            featureData = featureData.map((item, index) => ({
                no: index + 1,
                ...item
            }));

            updateFeaturePopup(featureData, username);
        })
        .catch((error) => {
            console.error("Gagal mengambil data fitur:", error);
        });
}


// Fungsi untuk menampilkan data fitur ke dalam pop-up
function updateFeaturePopup(featureData, username) {
    const popupContent = document.querySelector("#featurePopupContent");
    
    popupContent.innerHTML = `<h3>Fitur Website yang digunakan oleh ${username}</h3>`;

    if (featureData.length === 0) {
        popupContent.innerHTML += `<p>User belum menggunakan fitur apapun.</p>`;
    } else {
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Fitur Website</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${featureData.map(item => `
                    <tr>
                        <td>${item.no}</td>
                        <td>${item.feature}</td>
                        <td>${item.timestamp}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        popupContent.appendChild(table);
    }

    // Tampilkan popup dengan animasi
    showFeaturePopup();
}

// Event listener untuk menutup pop-up
document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("popupOverlays").style.display = "none";
    document.getElementById("featurePopup").style.display = "none";
});

// Tambahkan event listener ke tabel pengunjung untuk menampilkan pop-up fitur dengan filter tanggal
function attachClickEventToUsers() {
    document.querySelectorAll("#visitorTable tbody tr").forEach((row) => {
        row.addEventListener("click", function () {
            const username = this.children[1].textContent;
            const timestamp = this.children[2].textContent; // Ambil timestamp dari kolom tabel
            fetchFeatureDataByUsername(username, timestamp);
        });
    });
}

// Panggil fungsi untuk menambahkan event listener setelah tabel diperbarui
updateTable = (() => {
    const originalUpdateTable = updateTable;
    return function () {
        originalUpdateTable();
        attachClickEventToUsers();
    };
})();

// Pastikan updateTable sudah ada sebelum dipanggil
if (typeof updateTable === "function") {
    updateTable();
} else {
    console.warn("updateTable() tidak ditemukan. Pastikan statistik.js dimuat lebih dahulu.");
}

// Fungsi untuk menampilkan popup dengan animasi zoom
function showFeaturePopup() {
    const popups = document.getElementById("featurePopup");
    const overlays = document.getElementById("popupOverlays");

    popups.style.display = "block"; // Pastikan popup terlihat sebelum animasi berjalan
    overlays.style.display = "block"; // Tampilkan overlay
    setTimeout(() => {
        popups.classList.remove("hide"); // Hapus animasi keluar jika ada
        popups.classList.add("active");  // Tambahkan animasi masuk
    }, 10); // Beri sedikit delay agar display: block diterapkan lebih dulu
}

// Fungsi untuk menutup popup dengan animasi zoom
function hideFeaturePopup() {
    const popups = document.getElementById("featurePopup");
    const overlays = document.getElementById("popupOverlays");

    popups.classList.remove("active"); // Hapus animasi masuk
    popups.classList.add("hide"); // Tambahkan animasi keluar

    // Tunggu animasi selesai sebelum menyembunyikan elemen
    setTimeout(() => {
        popups.style.display = "none";
        overlays.style.display = "none";
        popups.classList.remove("hide"); // Reset class agar bisa digunakan kembali
    }, 300); // Durasi animasi keluar harus sama dengan CSS (0.3s)
}

// Event listener untuk tombol tutup
document.getElementById("closePopup").addEventListener("click", hideFeaturePopup);

// Fungsi registrasi pengguna baru ke Firestore
document.getElementById('registrasiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Cek apakah username sudah ada
        const userDoc = await db.collection("users").doc(username).get();
        if (userDoc.exists) {
            document.getElementById('errorMessage').innerText = 'Username sudah terdaftar. Silakan pilih username lain.';
        } else {
            // Tambahkan pengguna baru ke Firestore
            await db.collection("users").doc(username).set({ password });
            alert('Registrasi berhasil! Silakan login.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Error adding user:", error);
        document.getElementById('errorMessage').innerText = 'Error during registration. Please try again later.';
    }
});

// Animasi gambar motor
const motorAnimation = document.querySelector('.motor-animation');
const motorBaruteks = document.querySelector('.motor-baruteks');

motorAnimation.addEventListener('mouseover', () => {
    motorAnimation.style.display = 'none';
    motorBaruteks.style.display = 'block';
});

motorBaruteks.addEventListener('mouseout', () => {
    motorBaruteks.style.display = 'none';
    motorAnimation.style.display = 'block';
});

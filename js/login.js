console.log("Firebase DB instance:", db);

// Fungsi login dengan Firebase Firestore
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Cek jika login sebagai admin
        if (username === "admin" && password === "sebastian") {
            setCookie('loggedIn', 'true', 1440);
            window.location.href = 'main_admin.html';
            return;
        }

        if (username === "naufal" && password === "123456") {
            setCookie('loggedIn', 'true', 1440);
            window.location.href = 'admin.html';
            return;
        }

        if (username === "sebastian" && password === "123456") {
            setCookie('loggedIn', 'true', 1440);
            window.location.href = 'admin.html';
            return;
        }

        // Dapatkan dokumen pengguna berdasarkan username dari Firestore
        const userDoc = await db.collection("users").doc(username).get();

        if (userDoc.exists && userDoc.data().password === password) {
            // Jika username dan password cocok untuk pengguna biasa, buat cookie login
            setCookie('loggedIn', 'true', 1440);
            window.location.href = 'loading.html';
        } else {
            document.getElementById('errorMessage').innerText = 'Salah bosku, anda karyawan mana?';
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('errorMessage').innerText = 'Error logging in. Please try again later.';
    }
});

function togglePasswordVisibility() {
    var passwordInput = document.getElementById('password');
    var openEye = document.querySelector('.open-eye');
    var closedEye = document.querySelector('.closed-eye');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        openEye.style.display = 'block';
        closedEye.style.display = 'none';
    } else {
        passwordInput.type = "password";
        openEye.style.display = 'none';
        closedEye.style.display = 'block';
    }
}


// Fungsi untuk menyetel cookie
function setCookie(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

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

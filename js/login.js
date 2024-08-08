document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('assets/list/data.json')
        .then(response => response.json())
        .then(data => {
            if (data[username] && data[username] === password) {
                window.location.href = 'loading.html';
            } else {
                document.getElementById('errorMessage').innerText = 'Salah bosku, anda karyawan mana?';
            }
        })
        .catch(error => {
            console.error('Error fetching the JSON file:', error);
            document.getElementById('errorMessage').innerText = 'Error logging in. Please try again later.';
        });
});

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

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('assets/list/data.json')
        .then(response => response.json())
        .then(data => {
            if (data[username] && data[username] === password) {
                setCookie('loggedIn', 'true', 1);
                window.location.href = 'main.html';
            } else {
                document.getElementById('errorMessage').innerText = 'Salah bosku, anda karyawan mana?';
            }
        })
        .catch(error => {
            console.error('Error fetching the JSON file:', error);
            document.getElementById('errorMessage').innerText = 'Error logging in. Please try again later.';
        });
});

function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}


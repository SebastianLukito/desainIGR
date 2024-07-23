document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('assets/list/data.json')
        .then(response => response.json())
        .then(data => {
            if (data[username] && data[username] === password) {
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

// JavaScript to handle hover effect for motor animation and bubble teks
const motorAnimation = document.querySelector('.motor-container');
const bubbleTeks = document.querySelector('.bubble-teks');

motorAnimation.addEventListener('mouseover', () => {
    bubbleTeks.style.display = 'block';
    const motorRect = motorAnimation.getBoundingClientRect();
    const bubbleWidth = bubbleTeks.offsetWidth;
    bubbleTeks.style.left = `${motorRect.left - bubbleWidth + 50}px`;
    bubbleTeks.style.top = `${motorRect.top - 40}px`;
});

motorAnimation.addEventListener('mouseout', () => {
    bubbleTeks.style.display = 'none';
});
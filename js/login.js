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

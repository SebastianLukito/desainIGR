const API_KEY = 'AIzaSyBYWQ9dm5RQXNCMaBQZ-gpgLUe6WX3GshQ'; 
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const videoPlayer = document.getElementById('videoPlayer');

let nextPageToken = null; // Token untuk halaman berikutnya
let currentQuery = ''; // Menyimpan query saat ini
let isLoading = false; // Mencegah permintaan berulang

// Fungsi untuk mencari video
function searchVideos(query, pageToken = '') {
    if (isLoading) return; // Cegah pengiriman permintaan ganda
    isLoading = true;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10&pageToken=${pageToken}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            nextPageToken = data.nextPageToken; // Simpan token untuk halaman berikutnya

            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                const thumbnail = item.snippet.thumbnails.medium.url;

                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.innerHTML = `
                    <img src="${thumbnail}" alt="${title}">
                    <p>${title}</p>
                `;

                resultItem.addEventListener('click', () => {
                    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
                });

                searchResults.appendChild(resultItem);
            });

            isLoading = false;
        })
        .catch(error => {
            console.error('Error:', error);
            isLoading = false;
        });
}

// Fungsi untuk inisialisasi pencarian baru
function startSearch() {
    currentQuery = searchInput.value.trim();
    if (!currentQuery) return;

    searchResults.innerHTML = ''; // Bersihkan hasil sebelumnya
    nextPageToken = null; // Reset token halaman berikutnya
    searchVideos(currentQuery); // Pencarian awal
}

// Event listener untuk tombol Search
searchBtn.addEventListener('click', startSearch);

// Event listener untuk tombol Enter di input pencarian
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        startSearch();
    }
});

// Event listener untuk infinite scroll
searchResults.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = searchResults;

    if (scrollTop + clientHeight >= scrollHeight - 10 && nextPageToken) {
        // Jika scroll mencapai akhir dan ada halaman berikutnya
        searchVideos(currentQuery, nextPageToken);
    }
});

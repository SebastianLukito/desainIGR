document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'AIzaSyBYWQ9dm5RQXNCMaBQZ-gpgLUe6WX3GshQ'; 
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');

    let nextPageToken = null; // Token untuk halaman berikutnya
    let currentQuery = ''; // Menyimpan query saat ini
    let isLoading = false; // Mencegah permintaan berulang

    // Fungsi untuk menampilkan loading
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Fungsi untuk menyembunyikan loading
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

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
                        // Set warna abu-abu untuk kolom yang dipilih
                        document.querySelectorAll('.result-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        resultItem.classList.add('selected');

                        // Tampilkan loading di panel kanan
                        showLoading();

                        // Ubah src video
                        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
                        videoPlayer.onload = () => {
                            // Sembunyikan loading setelah video muncul
                            hideLoading();
                        };
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

    // Fungsi untuk memeriksa apakah input adalah URL YouTube dan mengembalikan videoId
    function extractVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Fungsi untuk mendapatkan detail video menggunakan videoId
        function fetchVideoDetails(videoId) {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.items.length > 0) {
                        const video = data.items[0].snippet;
                        return {
                            title: video.title,
                            thumbnail: video.thumbnails.medium.url,
                        };
                    } else {
                        return null; // Tidak ada data video
                    }
                })
                .catch(error => {
                    console.error('Error fetching video details:', error);
                    return null;
                });
        }

        // Fungsi untuk menampilkan video di search result
        async function displaySingleVideo(videoId) {
            const videoDetails = await fetchVideoDetails(videoId);

            if (!videoDetails) {
                console.error('Video details not found');
                return;
            }

            const { title, thumbnail } = videoDetails;

            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = `
                <img src="${thumbnail}" alt="${title}">
                <p>${title}</p>
            `;

            resultItem.addEventListener('click', () => {
                // Set warna abu-abu untuk kolom yang dipilih
                document.querySelectorAll('.result-item').forEach(item => {
                    item.classList.remove('selected');
                });
                resultItem.classList.add('selected');

                // Tampilkan loading di panel kanan
                showLoading();

                // Ubah src video
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
                videoPlayer.onload = () => {
                    // Sembunyikan loading setelah video muncul
                    hideLoading();
                };
            });

            searchResults.innerHTML = ''; // Bersihkan hasil sebelumnya
            searchResults.appendChild(resultItem);
        }

        // Fungsi untuk inisialisasi pencarian baru
        function startSearch() {
            const input = searchInput.value.trim();
            if (!input) return;

            // Periksa apakah input adalah URL YouTube
            const videoId = extractVideoId(input);
            if (videoId) {
                // Tampilkan video di panel kanan dan search result jika input adalah URL
                displaySingleVideo(videoId);
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
                return;
            }

            // Jika bukan URL, lakukan pencarian biasa
            searchResults.innerHTML = ''; // Bersihkan hasil sebelumnya
            nextPageToken = null; // Reset token halaman berikutnya
            searchVideos(input); // Pencarian awal
        }

    // Elemen komentar
    const commentsContainer = document.getElementById('commentsContainer');

    // Fungsi untuk mendapatkan komentar dari API
    function fetchComments(videoId) {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=10`;
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Comment API Response:', data); // Debug respon API
                commentsContainer.innerHTML = ''; // Kosongkan komentar sebelumnya
    
                if (data.items && data.items.length === 0) {
                    commentsContainer.innerHTML = '<p>No comments available.</p>';
                    return;
                }
    
                data.items.forEach(item => {
                    const comment = item.snippet.topLevelComment.snippet;
                    const author = comment.authorDisplayName;
                    const text = comment.textDisplay;
    
                    const commentItem = document.createElement('div');
                    commentItem.classList.add('comment-item');
                    commentItem.innerHTML = `
                        <p class="comment-author">${author}</p>
                        <p class="comment-text">${text}</p>
                    `;
    
                    commentsContainer.appendChild(commentItem);
                });
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
                commentsContainer.innerHTML = '<p>Failed to load comments.</p>';
            });
    }
    
    

    // Perbarui fungsi untuk menampilkan video
    function displaySingleVideo(videoId) {
        fetchVideoDetails(videoId).then(videoDetails => {
            if (!videoDetails) {
                console.error('Video details not found');
                return;
            }

            const { title, thumbnail } = videoDetails;

            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = `
                <img src="${thumbnail}" alt="${title}">
                <p>${title}</p>
            `;

            resultItem.addEventListener('click', () => {
                document.querySelectorAll('.result-item').forEach(item => {
                    item.classList.remove('selected');
                });
                resultItem.classList.add('selected');

                showLoading();

                videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
                videoPlayer.onload = () => {
                    hideLoading();
                    fetchComments(videoId); // Ambil komentar saat video dimuat
                };
            });

            searchResults.innerHTML = ''; // Kosongkan hasil sebelumnya
            searchResults.appendChild(resultItem);

            // Tampilkan video di player dan komentar saat ini
            videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
            fetchComments(videoId); // Ambil komentar
        });
}


});

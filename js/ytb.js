document.addEventListener('DOMContentLoaded', () => {
    const API_KEYS = [
        'AIzaSyBYWQ9dm5RQXNCMaBQZ-gpgLUe6WX3GshQ', 
        'AIzaSyBUa1x2BO3OE6upcxVVur0EtmCTJ3_EMsU',
        'AIzaSyBXdWCUZPb3HVxBbAoPo6XWHS3Zdtrg4R0',
        'AIzaSyBwQ-PzU9VhprlFqTUYuHb48fUjqt2EVPQ',
        'AIzaSyBNX_zWA8r8Xbf9zvZt3pIJHESoGI_376A',
        'AIzaSyCNBG-PMQVP-b7b1mDQciDW-lBXe4fW4',
        'AIzaSyA6W928MmYgIp_yASfDPYizt5ZJfp8kGJ4'
    ];
    let currentKeyIndex = 0;

    // Channel yang ditampilkan saat loadPopularVideos() dipanggil
    const scienceChannels = [
        'UC2mP7il3YV7TxM_5bxBUVkg', // Sepulang Sekolah
        'UCZfqKXBw8jzFnfxpFt2aNlg', // Kok Bisa
        'UCsXVk37bltHxD1rDPwtNM8Q', // Kurzgesagt
        'UCHnyfMqiRRG1u-2MsSQLbXA'  // Veritasium
    ];

    // Elemen-elemen di halaman
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const commentsContainer = document.getElementById('commentsContainer');

    // Tambahan: elemen select untuk sort
    const sortSelect = document.getElementById('sortSelect');

    // BAGIAN FILTER: tambahkan elemen select filter di HTML, lalu tangkap di JS
    const filterSelect = document.getElementById('filterSelect'); // Pastikan ada di HTML

    let nextPageToken = null;
    let nextCommentsPageToken = null;
    let currentQuery = '';
    let isLoading = false;
    let isLoadingComments = false;

    // Variabel untuk menyimpan pilihan urutan (sort)
    // Default-nya "relevance"
    let sortOrder = 'relevance';

    // BAGIAN FILTER: variabel untuk menyimpan pilihan filter durasi (any, short, long, dsb.)
    let videoDurationFilter = 'any'; // default-nya tampilkan semua

    // Fungsi mendapatkan API key yang sedang dipakai
    const getCurrentApiKey = () => {
        return API_KEYS[currentKeyIndex];
    };

    // Fungsi menggeser ke API key berikutnya
    const rotateApiKey = () => {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    };

    // Tampilkan/hilangkan loading overlay
    const showLoading = () => {
        loadingOverlay.style.display = 'flex';
    };
    const hideLoading = () => {
        loadingOverlay.style.display = 'none';
    };
    hideLoading();

    // Logika toggle panel kiri
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const toggleLeftPanelButton = document.createElement('button');
    toggleLeftPanelButton.textContent = '<';
    toggleLeftPanelButton.classList.add('toggle-left-panel');
    document.body.appendChild(toggleLeftPanelButton);

    toggleLeftPanelButton.addEventListener('click', () => {
        if (leftPanel.style.display === 'none') {
            leftPanel.style.display = 'block';
            rightPanel.style.margin = '0';
            toggleLeftPanelButton.textContent = '<';

            videoPlayer.style.transition = 'height 0.3s ease';
            videoPlayer.style.height = '415px';
        } else {
            leftPanel.style.display = 'none';
            rightPanel.style.margin = '0 auto';
            toggleLeftPanelButton.textContent = '>';

            videoPlayer.style.transition = 'height 0.3s ease';
            videoPlayer.style.height = '600px';
            videoPlayer.style.marginTop = '10px';
        }
    });

    // ---------------------
    // FUNGSI LOAD VIDEO POPULER (untuk channel-channel science di atas)
    // ---------------------
    const loadPopularVideos = async () => {
        showLoading();
        searchResults.innerHTML = '';
        for (let i = 0; i < scienceChannels.length; i++) {
            const channelId = scienceChannels[i];
            const apiKey = getCurrentApiKey();
            // order tidak di-set, default akan "relevance" untuk search by channel
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&key=${apiKey}&maxResults=10`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                data.items.forEach(item => renderSearchResult(item));
            } catch (error) {
                console.error(`Error fetching popular videos from channel ${channelId}:`, error);
                rotateApiKey();
            }
        }
        hideLoading();
    };

    // ---------------------
    // FUNGSI SEARCH VIDEO
    // ---------------------
    const searchVideos = async (query, pageToken = '') => {
        if (isLoading) return;
        isLoading = true;

        showLoading();
        let success = false;

        // BAGIAN FILTER: siapkan parameter durasi
        let videoDurationParam = '';
        if (videoDurationFilter !== 'any') {
            // misalnya "short" untuk reels, "long", dsb.
            videoDurationParam = `&videoDuration=${videoDurationFilter}`;
        }

        for (let i = 0; i < API_KEYS.length; i++) {
            const apiKey = getCurrentApiKey();

            // Tambah parameter &order=sortOrder
            // Nilai sortOrder bisa 'relevance', 'viewCount', atau 'date'
            // Juga tambahkan videoDurationParam
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&order=${sortOrder}&key=${apiKey}&maxResults=10&pageToken=${pageToken}${videoDurationParam}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                nextPageToken = data.nextPageToken || null;

                // Jika tidak ada item, tampilkan info
                if (data.items.length === 0 && !pageToken) {
                    searchResults.innerHTML = '<p>No videos found.</p>';
                }

                data.items.forEach(item => renderSearchResult(item));
                success = true;
                break;
            } catch (error) {
                console.error(`Error with API key ${apiKey}:`, error);
                rotateApiKey();
            }
        }

        if (!success) {
            searchResults.innerHTML = '<p>All API keys failed. Please try again later.</p>';
        }

        hideLoading();
        isLoading = false;
    };

    // Render satu item (thumbnail + judul) ke panel kiri
    const renderSearchResult = (item) => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.medium.url;

        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <p>${title}</p>
        `;

        // Event ketika user klik salah satu video
        resultItem.addEventListener('click', () => {
            // Hilangkan 'selected' di item lain
            document.querySelectorAll('.result-item').forEach(el => el.classList.remove('selected'));
            resultItem.classList.add('selected');
            loadVideo(videoId);
        });

        searchResults.appendChild(resultItem);
    };

    // Memuat video ke iframe dan memanggil fetchComments
    const loadVideo = (videoId) => {
        showLoading();
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
        videoPlayer.onload = () => {
            hideLoading();
            // Reset pagination untuk komentar
            nextCommentsPageToken = null;
            commentsContainer.innerHTML = '';
            fetchComments(videoId);
        };
    };

    // Ambil komentar
    const fetchComments = async (videoId, pageToken = '') => {
        if (isLoadingComments) return;
        isLoadingComments = true;

        let success = false;
        for (let i = 0; i < API_KEYS.length; i++) {
            const apiKey = getCurrentApiKey();
            const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&maxResults=10&pageToken=${pageToken}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                nextCommentsPageToken = data.nextPageToken || null;

                if (!data.items || data.items.length === 0) {
                    if (!pageToken) {
                        commentsContainer.innerHTML = '<p>No comments available.</p>';
                    }
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
                success = true;
                break;
            } catch (error) {
                console.error(`Error with API key ${apiKey}:`, error);
                rotateApiKey();
            }
        }

        if (!success) {
            commentsContainer.innerHTML = '<p>Pengunggah menonaktifkan komentar</p>';
        }

        isLoadingComments = false;
    };

    // Ambil metadata video (dipakai saat user paste link)
    const fetchVideoMetadata = async (videoId) => {
        const apiKey = getCurrentApiKey();
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.items.length > 0) {
                return data.items[0].snippet;
            }
        } catch (error) {
            console.error('Error fetching video metadata:', error);
        }
        return null;
    };

    // Fungsi utama pencarian
    const startSearch = async () => {
        const input = searchInput.value.trim();
        if (!input) {
            // Kalau input kosong, tampilkan popular videos
            loadPopularVideos();
            return;
        }

        const videoId = extractVideoId(input);
        if (videoId) {
            // Kalau user langsung paste link
            const metadata = await fetchVideoMetadata(videoId);
            if (metadata) {
                loadVideo(videoId);
                searchResults.innerHTML = '';
                renderSearchResult({
                    id: { videoId },
                    snippet: metadata,
                });
            }
            return;
        }

        currentQuery = input;
        searchResults.innerHTML = '';
        nextPageToken = null;
        searchVideos(currentQuery);
    };

    // Helper untuk extract video ID dari URL
    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Event pada tombol Search & enter di input
    searchBtn.addEventListener('click', startSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') startSearch();
    });

    // Infinite scroll untuk search results
    searchResults.addEventListener('scroll', () => {
        if (
            searchResults.scrollTop + searchResults.clientHeight >= 
            searchResults.scrollHeight - 10 &&
            nextPageToken
        ) {
            searchVideos(currentQuery, nextPageToken);
        }
    });

    // Infinite scroll untuk comments
    commentsContainer.addEventListener('scroll', () => {
        if (
            commentsContainer.scrollTop + commentsContainer.clientHeight >=
            commentsContainer.scrollHeight - 10 &&
            nextCommentsPageToken
        ) {
            const videoId = videoPlayer.src.split('/embed/')[1]?.split('?')[0];
            if (videoId) fetchComments(videoId, nextCommentsPageToken);
        }
    });

    // EVENT: ketika user mengubah pilihan sort
    sortSelect.addEventListener('change', () => {
        sortOrder = sortSelect.value;  // relevance, viewCount, atau date
        // Jika ada query yang sedang dicari, ulangi pencarian dengan sort baru
        if (currentQuery) {
            searchResults.innerHTML = '';
            nextPageToken = null;
            searchVideos(currentQuery);
        }
    });

    // BAGIAN FILTER: event listener untuk dropdown filter
    filterSelect.addEventListener('change', () => {
        // Baca value, misal: "any" atau "short"
        videoDurationFilter = filterSelect.value;
        if (currentQuery) {
            searchResults.innerHTML = '';
            nextPageToken = null;
            searchVideos(currentQuery);
        }
    });

    // Saat pertama load, tampilkan video populer
    loadPopularVideos();
});

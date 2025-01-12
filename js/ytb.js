document.addEventListener('DOMContentLoaded', () => {
    const API_KEYS = [
        'AIzaSyBYWQ9dm5RQXNCMaBQZ-gpgLUe6WX3GshQ', 
        'AIzaSyBUa1x2BO3OE6upcxVVur0EtmCTJ3_EMsU',
        'AIzaSyBXdWCUZPb3HVxBbAoPo6XWHS3Zdtrg4R0'
    ];
    let currentKeyIndex = 0;

    const scienceChannels = [
        'UC2mP7il3YV7TxM_5bxBUVkg', // Sepulang Sekolah
        'UCZfqKXBw8jzFnfxpFt2aNlg', // Kok Bisa
        'UCsXVk37bltHxD1rDPwtNM8Q', // Kurzgesagt
        'UCHnyfMqiRRG1u-2MsSQLbXA' // Veritasium
    ];

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const commentsContainer = document.getElementById('commentsContainer');

    let nextPageToken = null;
    let nextCommentsPageToken = null;
    let currentQuery = '';
    let isLoading = false;
    let isLoadingComments = false;

    const getCurrentApiKey = () => {
        return API_KEYS[currentKeyIndex];
    };

    const rotateApiKey = () => {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    };

    const showLoading = () => {
        loadingOverlay.style.display = 'flex';
    };

    const hideLoading = () => {
        loadingOverlay.style.display = 'none';
    };

    hideLoading();

    const leftPanel = document.querySelector('.left-panel'); // Panel kiri
    const rightPanel = document.querySelector('.right-panel'); // Panel kanan
    const toggleLeftPanelButton = document.createElement('button');
    toggleLeftPanelButton.textContent = '<'; // Teks awal tombol
    toggleLeftPanelButton.classList.add('toggle-left-panel'); // Tambahkan kelas untuk styling tombol
    document.body.appendChild(toggleLeftPanelButton); // Tambahkan tombol ke dalam body

    // Tambahkan event listener untuk tombol toggle
    toggleLeftPanelButton.addEventListener('click', () => {
        if (leftPanel.style.display === 'none') {
            leftPanel.style.display = 'block';
            rightPanel.style.margin = '0';
            toggleLeftPanelButton.textContent = '<';

            // Ubah tinggi video player saat left panel di-expand
            videoPlayer.style.transition = 'height 0.3s ease';
            videoPlayer.style.height = '415px'; // Tinggi default
        } else {
            leftPanel.style.display = 'none';
            rightPanel.style.margin = '0 auto';
            toggleLeftPanelButton.textContent = '>'; 

            // Ubah tinggi video player saat left panel di-hide
            videoPlayer.style.transition = 'height 0.3s ease';
            videoPlayer.style.height = '600px'; // Tinggi lebih besar saat panel kiri disembunyikan
            videoPlayer.style.marginTop = '10px'
        }
    });

    const loadPopularVideos = async () => {
        showLoading();
        searchResults.innerHTML = '';
        for (let i = 0; i < scienceChannels.length; i++) {
            const channelId = scienceChannels[i];
            const apiKey = getCurrentApiKey();
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

    const searchVideos = async (query, pageToken = '') => {
        if (isLoading) return;
        isLoading = true;

        let success = false;
        for (let i = 0; i < API_KEYS.length; i++) {
            const apiKey = getCurrentApiKey();
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10&pageToken=${pageToken}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                nextPageToken = data.nextPageToken || null;

                if (data.items.length === 0) {
                    searchResults.innerHTML = '<p>No videos found.</p>';
                    return;
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

        isLoading = false;
    };

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

        resultItem.addEventListener('click', () => {
            document.querySelectorAll('.result-item').forEach(item => item.classList.remove('selected'));
            resultItem.classList.add('selected');
            loadVideo(videoId);
        });

        searchResults.appendChild(resultItem);
    };

    const loadVideo = (videoId) => {
        showLoading();
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
        videoPlayer.onload = () => {
            hideLoading();
            nextCommentsPageToken = null;
            commentsContainer.innerHTML = '';
            fetchComments(videoId);
        };
    };

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
                    if (!pageToken) commentsContainer.innerHTML = '<p>No comments available.</p>';
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

    const startSearch = () => {
        const input = searchInput.value.trim();
        if (!input) {
            loadPopularVideos();
            return;
        }

        const videoId = extractVideoId(input);
        if (videoId) {
            loadVideo(videoId);
            searchResults.innerHTML = '';
            renderSearchResult({
                id: { videoId },
                snippet: { title: 'Video', thumbnails: { medium: { url: '' } } },
            });
            return;
        }

        currentQuery = input;
        searchResults.innerHTML = '';
        nextPageToken = null;
        searchVideos(currentQuery);
    };

    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    searchBtn.addEventListener('click', startSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') startSearch();
    });
    searchResults.addEventListener('scroll', () => {
        if (searchResults.scrollTop + searchResults.clientHeight >= searchResults.scrollHeight - 10 && nextPageToken) {
            searchVideos(currentQuery, nextPageToken);
        }
    });

    commentsContainer.addEventListener('scroll', () => {
        if (commentsContainer.scrollTop + commentsContainer.clientHeight >= commentsContainer.scrollHeight - 10 && nextCommentsPageToken) {
            const videoId = videoPlayer.src.split('/embed/')[1]?.split('?')[0];
            if (videoId) fetchComments(videoId, nextCommentsPageToken);
        }
    });

    loadPopularVideos(); // Tampilkan video populer saat halaman dimuat
});

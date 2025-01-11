document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'AIzaSyBYWQ9dm5RQXNCMaBQZ-gpgLUe6WX3GshQ';
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const commentsContainer = document.getElementById('commentsContainer');

    let nextPageToken = null;
    let nextCommentsPageToken = null; // Token untuk halaman berikutnya komentar
    let currentQuery = '';
    let isLoading = false;
    let isLoadingComments = false; // Status untuk mencegah pengambilan komentar ganda

    // Fungsi untuk menampilkan dan menyembunyikan loading
    const showLoading = () => (loadingOverlay.style.display = 'flex');
    const hideLoading = () => (loadingOverlay.style.display = 'none');

    // Fungsi untuk menangani pencarian video
    const searchVideos = async (query, pageToken = '') => {
        if (isLoading) return;
        isLoading = true;

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10&pageToken=${pageToken}`;

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
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            isLoading = false;
        }
    };

    // Fungsi untuk merender hasil pencarian
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

    // Fungsi untuk memuat video
    const loadVideo = (videoId) => {
        showLoading();
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
        videoPlayer.onload = () => {
            hideLoading();
            nextCommentsPageToken = null; // Reset token halaman komentar
            commentsContainer.innerHTML = ''; // Kosongkan komentar sebelumnya
            fetchComments(videoId);
        };
    };

    // Fungsi untuk mendapatkan komentar
    const fetchComments = async (videoId, pageToken = '') => {
        if (isLoadingComments) return;
        isLoadingComments = true;

        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=10&pageToken=${pageToken}`;

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
        } catch (error) {
            console.error('Error fetching comments:', error);
            if (!pageToken) commentsContainer.innerHTML = '<p> Pengunggah tidak mengizinkan untuk mengakses komentar.</p>';
        } finally {
            isLoadingComments = false;
        }
    };

    // Fungsi untuk memulai pencarian baru
    const startSearch = () => {
        const input = searchInput.value.trim();
        if (!input) return;

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

    // Fungsi untuk mengekstrak video ID dari URL
    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Event listeners
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
});
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

    // Channel yang ditampilkan
    const scienceChannels = [
        'UCpdwWrQYnGSyWJSRy-eGhCg',  // Tekotok
        'UCfQHaUbD0oEBH_FRYHE5qIg',  // Sepulang Sekolah
        'UCY_QJ_qZWOIOJKAiBKatFaQ',  // Kok Bisa
        'UCwRH985XgMYXQ6NxXDo8npw',  // Kurzgesagt
        'UCin0m13qWv3-051xlWlHamA',  // Veritasium
        'UCaPa78XJgS-BrTxsVYHPA6',   // Gadgetin
        'UCAuUUnT6oDeKwE6v1NGQxug',  // TedEd
        'UCC_OYI6VZtuEZuq49Ht-cQQ',  // Ferry Irwandi
        'UCA19mAJURyYHbJzhfpqhpCA',  // Action Lab
        'UCEIwxahdLz7bap-VDs9h35A',  // Steve Mould
        'UCzI8ArgVBHXN3lSz-dI0yRw',  // Narasi Newsroom
        'UCkzbfqQmXyAPY_XEsJvkcWg',  // Gerrard Wijaya
        'UCFP8lCYY-qRchUhFQzieMjQ',  // NatGeo Indonesia
        'UC-DgB27DyWZDrA9J37-HP_Q',  // Tretan Universe
        'UC513PdAP2-jWkJunTh5kXRw',  // Mark Rober
        'UCBREMSD-melGOMVONey64Lg',  // Asumsi
        'UCVSB96sHYiHMlAkMfjl0Wzw',  // Alam Semenit
        'UC1_uAIS3r8Vu6JjXWvastJg',  // 3Blue1Brown
        'UCshVTOdmZLdLj8LTV1j_0uw',  // TED
        'UCvNkERNo3eAT59vzqE4-3Vg',  // Banda Neira Topic
    ];

    // Elemen-elemen di halaman
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const commentsContainer = document.getElementById('commentsContainer');
    const sortSelect = document.getElementById('sortSelect');
    const filterSelect = document.getElementById('filterSelect');
    
    // Variabel penunjang
    let nextPageToken = null;
    let nextCommentsPageToken = null;
    let currentQuery = '';
    let isLoading = false;
    let isLoadingComments = false;

    // Set default sort ke "date" (video terbaru)
    let sortOrder = 'date';

    // Set default filter ke "medium" (4-20 menit) untuk memprioritaskan video biasa
    let videoDurationFilter = 'medium';

    // Fungsi mendapatkan API key yang sedang dipakai
    const getCurrentApiKey = () => {
        return API_KEYS[currentKeyIndex];
    };

    // Fungsi menggeser ke API key berikutnya
    const rotateApiKey = () => {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    };

    // Loading overlay
    const showLoading = () => {
        loadingOverlay.style.display = 'flex';
    };
    const hideLoading = () => {
        loadingOverlay.style.display = 'none';
    };
    hideLoading();

    // Toggle panel kiri (tidak berubah)
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

    // Fungsi ini menghasilkan tanggal 1 tahun ke belakang dalam format ISO8601
    function getOneYearAgoDate() {
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return oneYearAgo.toISOString(); 
    }

    // Fungsi untuk mengacak urutan array (menggunakan Fisher-Yates Shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // ---------------------
    // FUNGSI LOAD VIDEO "POPULER" / REKOMENDASI PADA CHANNEL
    // ---------------------
    const loadPopularVideos = async () => {
        showLoading(); // Tampilkan loading spinner
        searchResults.innerHTML = ''; // Kosongkan hasil pencarian sebelumnya
    
        // Acak urutan channel sebelum memulai
        shuffleArray(scienceChannels);
    
        const publishedAfter = getOneYearAgoDate(); // Tanggal 1 tahun ke belakang
        const videoMap = {}; // Tempat menyimpan video dari setiap channel (key: channelId)
    
        // Ambil 10 video dari setiap channel
        for (let i = 0; i < scienceChannels.length; i++) {
            const channelId = scienceChannels[i];
            const apiKey = getCurrentApiKey();
    
            const url = `https://www.googleapis.com/youtube/v3/search
                ?part=snippet
                &type=video
                &channelId=${channelId}
                &key=${apiKey}
                &maxResults=10
                &order=viewCount
                &publishedAfter=${publishedAfter}
                &videoDuration=${videoDurationFilter}
                &regionCode=US
                &relevanceLanguage=en`
                .replace(/\s+/g, ''); // Hapus spasi tambahan
    
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
    
                if (data.items.length > 0) {
                    videoMap[channelId] = data.items; // Simpan 10 video dari setiap channel
                }
            } catch (error) {
                console.error(`Error fetching videos from channel ${channelId}:`, error);
                rotateApiKey(); // Gunakan API key berikutnya jika gagal
            }
        }
    
        // Round-robin: Ambil satu video dari setiap channel secara bergantian
        const videoPool = [];
        let finished = false;
        let index = 0;
    
        while (!finished) {
            finished = true; // Asumsi selesai kecuali ada video yang tersisa
            for (const channelId of scienceChannels) {
                const videos = videoMap[channelId];
                if (videos && videos[index]) {
                    videoPool.push(videos[index]); // Ambil video ke-n dari channel ini
                    finished = false; // Masih ada video yang bisa diambil
                }
            }
            index++; // Lanjut ke video berikutnya di setiap channel
        }
    
        // Render video yang telah diatur ulang
        videoPool.forEach((video) => {
            renderSearchResult(video);
        });
    
        hideLoading(); // Sembunyikan loading spinner
    };
    
    

    // ---------------------
    // FUNGSI SEARCH VIDEO (saat user mengetik di search bar)
    // ---------------------
    const searchVideos = async (query, pageToken = '') => {
        if (isLoading) return;
        isLoading = true;
        showLoading();
        let success = false;

        // Param durasi
        let videoDurationParam = '';
        if (videoDurationFilter !== 'any') {
            videoDurationParam = `&videoDuration=${videoDurationFilter}`;
        }

        for (let i = 0; i < API_KEYS.length; i++) {
            const apiKey = getCurrentApiKey();

            const url = `https://www.googleapis.com/youtube/v3/search
                ?part=snippet
                &type=video
                &q=${encodeURIComponent(query)}
                &order=${sortOrder}
                &key=${apiKey}
                &maxResults=10
                &pageToken=${pageToken}
                ${videoDurationParam}`
                .replace(/\s+/g, '');

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                nextPageToken = data.nextPageToken || null;

                // Jika tidak ada item
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

    // Menampilkan hasil pencarian di panel kiri
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

        // Klik salah satu hasil => load video
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

        const videoPlaceholder = document.getElementById('videoPlaceholder');
        const videoPlayer = document.getElementById('videoPlayer');
    
        // Sembunyikan placeholder, tampilkan iframe
        videoPlaceholder.style.display = 'none';
        videoPlayer.style.display = 'block';
    
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
            const url = `https://www.googleapis.com/youtube/v3/commentThreads
                ?part=snippet
                &videoId=${videoId}
                &key=${apiKey}
                &maxResults=10
                &pageToken=${pageToken}`
                .replace(/\s+/g, '');

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
        const url = `https://www.googleapis.com/youtube/v3/videos
            ?part=snippet
            &id=${videoId}
            &key=${apiKey}`
            .replace(/\s+/g, '');
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
            // Kalau input kosong, langsung load rekomendasi (video terbaru channel)
            loadPopularVideos();
            return;
        }

        const videoId = extractVideoId(input);
        if (videoId) {
            // Kalau user paste link
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

    // Ketika user mengubah pilihan sort
    sortSelect.addEventListener('change', () => {
        sortOrder = sortSelect.value;  // relevance, viewCount, date
        if (currentQuery) {
            // Jika sedang ada query, ulangi pencarian
            searchResults.innerHTML = '';
            nextPageToken = null;
            searchVideos(currentQuery);
        } else {
            // Jika tidak ada query, reload rekomendasi
            loadPopularVideos();
        }
    });

    // Ketika user mengubah pilihan filter
    filterSelect.addEventListener('change', () => {
        videoDurationFilter = filterSelect.value;  // any, short, long, dsb.
        if (currentQuery) {
            // Jika sedang ada query, ulangi pencarian
            searchResults.innerHTML = '';
            nextPageToken = null;
            searchVideos(currentQuery);
        } else {
            // Jika tidak ada query, reload rekomendasi
            loadPopularVideos();
        }
    });

    // Klik logo => refresh
    const logoYtb = document.querySelector('.logoYtb');
    logoYtb.addEventListener('click', () => {
        window.location.reload();
    });

    // Saat pertama load, tampilkan video "populer" (rekomendasi channel)
    loadPopularVideos();

    // Tambahkan komentar default
    const defaultCommentItem = document.createElement('div');
    defaultCommentItem.classList.add('comment-item');
    defaultCommentItem.innerHTML = `
        <p class="comment-author">Sebastian The Developer Guy</p>
        <p class="comment-text">Nanti komentarnya juga muncul di sini ya guys</p>
    `;
    commentsContainer.appendChild(defaultCommentItem);
});

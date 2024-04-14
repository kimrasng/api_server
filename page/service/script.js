document.addEventListener('DOMContentLoaded', function () {
    const songList = document.getElementById('song-list');
    const paginationContainer = document.getElementById('pagination');
    let currentPage = 1;
    let songsPerPage = 10;
    let currentSongIndex = 0;
    let isPlaying = false; // 노래가 실행 여부

    const playNextSong = () => {
        const songs = songList.querySelectorAll('li');
        const nextSongIndex = (currentSongIndex + 1) % songs.length;
        const nextSong = songs[nextSongIndex];

        if (nextSongIndex === 0) {
            currentPage++;
            fetchAndRenderSongs();
        }

        nextSong.click();
    };

    const playSong = (song) => {
        const audioPlayer = document.getElementById('audio-player');
        const songTitle = document.getElementById('song-title');
        const artistName = document.getElementById('artist-name');
        const songImage = document.getElementById('song-image');

        audioPlayer.src = `https://api.kimrasng.kro.kr/api/music-server/music/${song.filename}`;
        songTitle.textContent = `${song.title}`;
        artistName.textContent = `Artist: ${song.artist_name}`;

        if (song.image_filename) {
            songImage.src = `https://api.kimrasng.kro.kr/api/music-server/img/song/${song.image_filename}`;
        } else {
            songImage.src = 'placeholder_image.jpg';
        }

        audioPlayer.play();
        isPlaying = true; // 노래가 재생 중
    };

    const renderSongs = (songs) => {
        songList.innerHTML = '';
        const startIndex = (currentPage - 1) * songsPerPage;
        const endIndex = startIndex + songsPerPage;
        const currentSongs = songs.slice(startIndex, endIndex);
        currentSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = `${song.title}`;
            const artistSpan = document.createElement('span');
            artistSpan.textContent = `${song.artist_name}`;
            li.appendChild(artistSpan);
            li.addEventListener('click', () => {
                currentSongIndex = index + startIndex;
                playSong(song);
            });
            songList.appendChild(li);
        });
        renderPagination(songs.length);
    };

    const renderPagination = (totalSongs) => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalSongs / songsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                fetchAndRenderSongs();
            });
            paginationContainer.appendChild(button);
        }
    };

    const fetchAndRenderSongs = () => {
        fetch(`https://api.kimrasng.kro.kr/api/music-server/songs`)
            .then(response => response.json())
            .then(data => {
                renderSongs(data.songs);
                const audioPlayer = document.getElementById('audio-player');
                audioPlayer.addEventListener('ended', () => {
                    isPlaying = false; // 노래가 끝났으므로 재생 중이 아님을 표시
                    playNextSong();
                });
            })
            .catch(error => console.error('Error fetching songs:', error));
    };

    fetchAndRenderSongs();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        currentPage = 1;
        fetch(`https://api.kimrasng.kro.kr/api/music-server/songs`)
            .then(response => response.json())
            .then(data => {
                const filteredSongs = data.songs.filter(song => {
                    return song.title.toLowerCase().includes(searchValue) || song.artist_name.toLowerCase().includes(searchValue);
                });
                renderSongs(filteredSongs);
            })
            .catch(error => console.error('Error searching songs:', error));
    });

    // 이미지 회전 처리
    const songImage = document.getElementById('song-image');
    setInterval(() => {
        if (isPlaying) {
            songImage.style.transform = `rotate(${(parseInt(getComputedStyle(songImage).getPropertyValue('transform').split(',')[1]) + 0.1)}deg)`;
        }
    }, 100);
});

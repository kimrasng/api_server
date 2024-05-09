let songTitle = "No Song";
let artistName = "None";
let songImage = "";
let songList = [];
let songListBack = [];
let songAudio;
let searchValue = "";
let now;
let currentSort = 'title';
let currentOrder = 'asc';

const playSong = async () => {
    const res = await fetch('https://api.kimrasng.kro.kr/api/music-server/songs/artist/asc');
    const data = await res.json();
    songList = data.songs;
    songListBack = [...songList];
    await sortSongs(currentSort, currentOrder);
};

const click = async (id) => {
    const song = songList.find(song => song.id === id);
    if (song) {
        songAudio = `https://api.kimrasng.kro.kr/api/music-server/music/${song.filename}`;
        songImage = `https://api.kimrasng.kro.kr/api/music-server/img/song/${song.image_filename}`;
        songTitle = song.title;
        artistName = song.artist_name;
        renderCurrentSong();
    }
};

const audioPlayer = document.getElementById("audio-player");
if(audioPlayer) {
    audioPlayer.addEventListener("ended", async () => {
        if (now === undefined) {
            now = 0;
        }
        if (now < songList.length) {
            await click(songList[now].id);
            now++;
        } else {
            now = 0;
        }
    });
}

const search = async () => {
    songList = songListBack.filter(song => song.title.toLowerCase().includes(searchValue.toLowerCase()));
    songList = songList.concat(songListBack.filter(song => song.artist_name.toLowerCase().includes(searchValue.toLowerCase())));
    await renderSongList();
};

const sortSongs = async (sort, order) => {
    let sortedSongs = [...songList];
    sortedSongs.sort((a, b) => {
        const x = a[sort].toLowerCase();
        const y = b[sort].toLowerCase();
        if (x < y) {
            return order === 'asc' ? -1 : 1;
        }
        if (x > y) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
    songList = sortedSongs;
    await renderSongList();
};

const renderCurrentSong = () => {
    document.getElementById("song-title").innerText = songTitle;
    document.getElementById("artist-name").innerText = artistName;
    document.getElementById("song-image").src = songImage;
    document.getElementById("audio-player").src = songAudio;
};

const renderSongList = async () => {
    const songListContainer = document.getElementById("song-list");
    if(!songListContainer) return;

    songListContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("song-table");

    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const thTitle = document.createElement("th");
    thTitle.textContent = "Title";
    const thArtist = document.createElement("th");
    thArtist.textContent = "Artist";
    const thDate = document.createElement("th");
    thDate.textContent = "Date";
    headerRow.appendChild(thTitle);
    headerRow.appendChild(thArtist);
    headerRow.appendChild(thDate);

    await songList.forEach(song => {
        const row = table.insertRow();
        const cellTitle = row.insertCell();
        cellTitle.textContent = song.title;
        const cellArtist = row.insertCell();
        cellArtist.textContent = song.artist_name;
        const cellDate = row.insertCell();
        cellDate.textContent = song.release_date.split('T')[0];
        row.addEventListener("click", () => click(song.id));
    });

    songListContainer.appendChild(table);
};



playSong();

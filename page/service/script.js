let songTitle = "No Song";
let artistName = "None";
let songImage = "";
let songList = [];
let songAudio;
let searchValue = "";
let now;
let currentSort = 'artist';
let currentOrder = 'asc';

const fetchSongs = async () => {
    const res = await fetch('https://api.kimrasng.me/api/music-server/songs/artist/asc');
    const data = await res.json();
    songList = data.songs;
    renderSongList();
};

const click = (id) => {
    const song = songList.find(song => song.id === id);
    if (song) {
        songAudio = `https://api.kimrasng.me/api/music-server/music/${song.filename}`;
        songImage = `https://api.kimrasng.me/api/music-server/img/song/${song.image_filename}`;
        songTitle = song.title;
        artistName = song.artist_name;
        renderCurrentSong();
    }
};

const audioPlayer = document.getElementById("audio-player");
if(audioPlayer) {
    audioPlayer.addEventListener("ended", () => {
        if (now === undefined) {
            now = 0;
        }
        if (now < songList.length) {
            click(songList[now].id);
            now++;
        } else {
            now = 0;
        }
    });
}

const search = async () => {
    const filteredSongs = songList.filter(song => 
        song.title.toLowerCase().includes(searchValue.toLowerCase()) || 
        song.artist_name.toLowerCase().includes(searchValue.toLowerCase())
    );
    renderSongList(filteredSongs);
};

const sortSongs = async (sort, order) => {
    const res = await fetch(`https://api.kimrasng.me/api/music-server/songs/${sort}/${order}`);
    const data = await res.json();
    songList = data.songs;
    renderSongList();
};

const renderCurrentSong = () => {
    document.getElementById("song-title").innerText = songTitle;
    document.getElementById("artist-name").innerText = artistName;
    document.getElementById("song-image").src = songImage;
    document.getElementById("audio-player").src = songAudio;
};

const renderSongList = (songs = songList) => {
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

    songs.forEach(song => {
        const row = table.insertRow();
        const cellTitle = row.insertCell();
        cellTitle.textContent = song.title;
        const cellArtist = row.insertCell();
        cellArtist.textContent = song.artist_name;
        const cellDate = row.insertCell();
        cellDate.textContent = new Date(song.release_date).toLocaleDateString();
        row.addEventListener("click", () => click(song.id));
    });

    songListContainer.appendChild(table);
};

fetchSongs();

let songTitle = "No Song"
let artistName = "None"
let songImage = ""
let songList = []
let songAudio
let searchValue = ""
let now
let currentSort = 'artist'
let currentOrder = 'desc'
let currentSongIndex = -1

const fetchSongs = async () => {
    const res = await fetch('https://api.kimrasng.me/api/music-server/songs/artist/asc')
    const data = await res.json()
    songList = data.songs
    renderSongList()
}

const click = (id) => {
    const songIndex = songList.findIndex(song => song.id === id)
    if (songIndex !== -1) {
        currentSongIndex = songIndex
        const song = songList[songIndex]
        songAudio = `https://api.kimrasng.me/api/music-server/music/${song.filename}`
        songImage = `https://api.kimrasng.me/api/music-server/img/song/${song.image_filename}`
        songTitle = song.title
        artistName = song.artist_name
        renderCurrentSong()
    }
}

const audioPlayer = document.getElementById("audio-player")
if (audioPlayer) {
    audioPlayer.addEventListener("ended", () => {
        if (currentSongIndex !== -1 && currentSongIndex < songList.length - 1) {
            currentSongIndex++
            const nextSong = songList[currentSongIndex]
            songAudio = `https://api.kimrasng.me/api/music-server/music/${nextSong.filename}`
            songImage = `https://api.kimrasng.me/api/music-server/img/song/${nextSong.image_filename}`
            songTitle = nextSong.title
            artistName = nextSong.artist_name
            renderCurrentSong()
        }
    })
}

const search = async () => {
    const filteredSongs = songList.filter(song => 
        song.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        (song.title_eng && song.title_eng.toLowerCase().includes(searchValue.toLowerCase())) ||
        (song.title_korean && song.title_korean.toLowerCase().includes(searchValue.toLowerCase()))
    )
    renderSongList(filteredSongs)
}

const sortSongs = async (sort, order) => {
    const res = await fetch(`https://api.kimrasng.me/api/music-server/songs/${sort}/${order}`)
    const data = await res.json()
    songList = data.songs
    renderSongList()
}

const renderCurrentSong = () => {
    document.getElementById("song-title").innerText = songTitle
    document.getElementById("artist-name").innerText = artistName
    document.getElementById("song-image").src = songImage
    document.getElementById("audio-player").src = songAudio
}

const renderSongList = (songs = songList) => {
    const songListContainer = document.getElementById("song-list")
    if (!songListContainer) return

    songListContainer.innerHTML = ""

    const table = document.createElement("table")
    table.classList.add("song-table")

    const tableHeader = table.createTHead()
    const headerRow = tableHeader.insertRow()
    const thTitle = document.createElement("th")
    thTitle.textContent = "Title"
    thTitle.addEventListener("click", () => sortSongs('title', currentOrder === 'asc' ? 'desc' : 'asc'))
    const thArtist = document.createElement("th")
    thArtist.textContent = "Artist"
    thArtist.addEventListener("click", () => sortSongs('artist', currentOrder === 'asc' ? 'desc' : 'asc'))
    const thDate = document.createElement("th")
    thDate.textContent = "Date"
    thDate.addEventListener("click", () => sortSongs('date', currentOrder === 'asc' ? 'desc' : 'asc'))
    headerRow.appendChild(thTitle)
    headerRow.appendChild(thArtist)
    headerRow.appendChild(thDate)

    const tableBody = table.createTBody()

    songs.forEach((song) => {
        const row = tableBody.insertRow()
        const cellTitle = row.insertCell()
        cellTitle.textContent = song.title
        const cellArtist = row.insertCell()
        cellArtist.textContent = song.artist_name
        const cellDate = row.insertCell()
        cellDate.textContent = new Date(song.release_date).toLocaleDateString()
        row.addEventListener("click", () => click(song.id))
    })

    songListContainer.appendChild(table)
}

document.getElementById("search-input").addEventListener("input", (event) => {
    searchValue = event.target.value
    search()
})

fetchSongs()

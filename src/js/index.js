const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songName = document.getElementById('song-name');

const songs = [
//   { name: 'Canción 1', src: 'music/canción1.mp3' },
//   { name: 'Canción 2', src: 'music/canción2.mp3' },
];

let currentSong = 0;

// Cargar canción actual
function loadSong(index) {
  audio.src = songs[index].src;
  songName.textContent = songs[index].name;
}

// Play / Pause
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸️';
  } else {
    audio.pause();
    playBtn.textContent = '▶️';
  }
});

// Siguiente canción
nextBtn.addEventListener('click', () => {
  currentSong = (currentSong + 1) % songs.length;
  loadSong(currentSong);
  audio.play();
  playBtn.textContent = '⏸️';
});

// Canción anterior
prevBtn.addEventListener('click', () => {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  loadSong(currentSong);
  audio.play();
  playBtn.textContent = '⏸️';
});

// Inicializar
loadSong(currentSong);

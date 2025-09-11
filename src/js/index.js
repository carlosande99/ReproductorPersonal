const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songName = document.getElementById('song-name');
const form = document.getElementById('form');
const songs = [
  
];

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('url').value;
    try {
        await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });
    } catch (err) {
        console.error("Error en la petición:", err);
    }
});
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songName = document.getElementById('song-name');
const form = document.getElementById('form');
const list = document.getElementById('playlist');

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

fetch("/songs")
    .then(response => response.json())
    .then(serverData => {
        console.log("Datos recibidos del servidor:", serverData);
        serverData.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.datos.artist;
            list.appendChild(li);
        })
    })
    .catch(err => console.error("Error al obtener las canciones:", err));

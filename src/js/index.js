const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songName = document.getElementById('song-name');
const form = document.getElementById('form');
const list = document.getElementById('songList');
const progress = document.getElementById('progress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
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
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const td4 = document.createElement('td');
            const div = document.createElement('div');

            const img = document.createElement('img');
            const title = document.createElement('span');
            const artist = document.createElement('span');
            
            img.src = item.datos.caractula;

            td1.textContent = item.id;

            title.textContent = item.datos.title;

            artist.textContent = item.datos.artist;

            td3.textContent = item.datos.album;
            td4.textContent = calcularDuracion(item.datos.duracion);

            td2.appendChild(img);
            div.appendChild(title);
            div.appendChild(artist);
            td2.appendChild(div);

            tr.onclick = () => {
                const songDuration = calcularDuracion(item.datos.duracion);
                durTime.textContent = songDuration;

                let audio = document.getElementById('audio');
                audio.src = `/musica/${item.idCancion}.mp3`;
                audio.play();
            };

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            list.appendChild(tr);
        })
    })
    .catch(err => console.error("Error al obtener las canciones:", err));

// pasa de ms a mm:ss
function calcularDuracion(duracion) {
     // Convertir a segundos totales
  let totalSeconds = Math.floor(duracion / 1000);

  // Calcular minutos y segundos
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  // Formatear con 2 dígitos
  let minStr = String(minutes).padStart(2, '0');
  let secStr = String(seconds).padStart(2, '0');

  return `${minStr}:${secStr}`;
}

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    curTime.textContent = calcularDuracion(audio.currentTime * 1000);

});

progress.addEventListener("click", (e) => {
    const rect = progress.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const totalWidth = rect.width;
    const porcentaje = offsetX / totalWidth;
    audio.currentTime = porcentaje * audio.duration;
});
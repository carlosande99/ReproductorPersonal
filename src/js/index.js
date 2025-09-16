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
const play = document.getElementById('play');
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const datosReproductor = document.getElementById("datosReproductor");
const volumen = document.getElementById("volumenRango");
const volumeSVG = document.getElementById("volume")

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
                const div2 = document.createElement('div');
                const songDuration = calcularDuracion(item.datos.duracion);
                durTime.textContent = songDuration;

                let audio = document.getElementById('audio');
                audio.src = `/musica/${item.idCancion}.mp3`;
                iconPlay.style.display = "none";
                iconPause.style.display = "inline";
                datosReproductor.replaceChildren();
                div2.appendChild(title.cloneNode(true));
                div2.appendChild(artist.cloneNode(true));
                datosReproductor.appendChild(img.cloneNode(true));
                datosReproductor.appendChild(div2);
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

let ishover = false;

function actualizarRelleno() {
    const val = progress.value;
    const porcentaje = val * 100; // porque min=0 y max=1
    const color = ishover ? "#1DB954" : "#ccc";
    progress.style.background = `linear-gradient(to right, ${color} ${porcentaje}%, rgb(71, 71, 71) ${porcentaje}%)`;
}

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration);
    curTime.textContent = calcularDuracion(audio.currentTime * 1000);
    actualizarRelleno();
});

progress.addEventListener("input", () => actualizarRelleno());
progress.addEventListener("mouseenter", () => {ishover = true; actualizarRelleno()});
progress.addEventListener("mouseleave", () => {ishover = false; actualizarRelleno()});
actualizarRelleno();

progress.addEventListener("click", (e) => {
    const rect = progress.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const totalWidth = rect.width;
    const porcentaje = offsetX / totalWidth;
    audio.currentTime = porcentaje * audio.duration;
});

play.addEventListener("click", togglePlayPause);

document.addEventListener("keydown", (e) => {
    // Verifica si la tecla es espacio y no está escribiendo en un input
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault(); // evita que la página haga scroll
        togglePlayPause();
    }
});

function togglePlayPause() {
    if (audio.paused) {
        audio.play();
        iconPlay.style.display = "none";
        iconPause.style.display = "inline";
    } else {
        audio.pause();
        iconPlay.style.display = "inline";
        iconPause.style.display = "none";
    }
}

volumen.addEventListener("input", (e) => modificarVolumen(e));

function modificarVolumen(e, valor=null){
    const vol = valor !== null ? valor : e.target.value;
    audio.volume = vol;
    volumen.textContent = Math.round(vol * 100) + "%";
    if(vol > 0.66){
        volumeSVG.src = "../svg/volume-max-svgrepo-com.svg"
    }
    if(vol < 0.66 && vol > 0.33){
        volumeSVG.src = "../svg/volume-mid-svgrepo-com.svg"
    }
    if(vol < 0.33 && vol > 0){
        volumeSVG.src = "../svg/volume-min-svgrepo-com.svg"
    }
    if(vol == 0){
        volumeSVG.src = "../svg/volume-xmark-svgrepo-com.svg"
    }
};

let audioInicio = 0;
let audioColor =  0;
volumeSVG.addEventListener("click", (e) => {
    if(audio.volume > 0){
        audioInicio = audio.volume;
        audioColor = volumen.value;
        audio.volume = 0;
        volumen.value = 0;
        modificarVolumen(null, 0);
        actualizarColorVolumen(true);
    }else{
        audio.volume = audioInicio;
        volumen.value = audioColor;
        modificarVolumen(null, audioInicio);
        actualizarColorVolumen(true);
    }
});

function actualizarColorVolumen(hover = false){
    const val = volumen.value;
    const porcentaje = (val - volumen.min) / (volumen.max - volumen.min) * 100;
    const color = hover ? "#1DB954" : "#ccc";
    volumen.style.background = `linear-gradient(to right, ${color} ${porcentaje}%, rgb(71, 71, 71) ${porcentaje}%)`;
}

volumen.addEventListener("input", () => actualizarColorVolumen(true));
volumen.addEventListener("mouseenter", () => actualizarColorVolumen(true));
volumen.addEventListener("mouseleave", () => actualizarColorVolumen(false));
volumeSVG.addEventListener("mouseenter", () => actualizarColorVolumen(true));
volumeSVG.addEventListener("mouseleave", () => actualizarColorVolumen(false));
actualizarColorVolumen(false);
import fs from 'fs';
import playdl from 'play-dl';
import ytdl from '@distube/ytdl-core';

// Crear carpeta 'descargas' si no existe
const carpetaDescargas = './src/music';
export let duration_ms = 0;
if (!fs.existsSync(carpetaDescargas)) fs.mkdirSync(carpetaDescargas);

async function buscarCancionEnYoutube(titulo, artista) {
  const query = `${titulo} ${artista}`;
  const resultados = await playdl.search(query, { limit: 1 });

  if (!resultados || !resultados.length) throw new Error('No se encontró la canción en YouTube');

  const video = resultados[0];

  if (!video.url && video.link) {
    // Algunas versiones devuelven .link en lugar de .url
    video.url = video.link;
  }

  if (!video.url) throw new Error('No se pudo obtener la URL del video');

  console.log('URL encontrada en YouTube:', video.url);
  return video.url;
}

async function descargarAudio(url, nombreArchivo) {
    try{
        return new Promise((resolve, reject) => {
        const archivo = fs.createWriteStream(nombreArchivo);
        ytdl(url, { filter: 'audioonly' })
            .pipe(archivo)
            .on('finish', () => {
                console.log('Descarga completada');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error al descargar el audio:', err);
                reject(err);
            });
    });
    }catch(err){
        console.error('Error al descargar el audio:', err);
    }
}

export async function descargarCancion(titulo, artista, id) {
  try {
    console.log(`Buscando "${titulo}" de ${artista} en YouTube...`);
    const url = await buscarCancionEnYoutube(titulo, artista);
    
    duration_ms = await obtenerDuracion(url);
    console.log(`Duración en ms: ${duration_ms}`);

    const nombreArchivo = `${carpetaDescargas}/${id}.mp3`;
    console.log('Descargando audio...');

    await descargarAudio(url, nombreArchivo);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function obtenerDuracion(url){
  try{
    const info = await ytdl.getInfo(url);
    const duracionSeg = parseInt(info.videoDetails.lengthSeconds); // duración en segundos
    const duracionMs = duracionSeg * 1000; // duración en milisegundos
    console.log(`Duración: ${duracionSeg} s / ${duracionMs} ms`);
    return duracionMs;
  }catch(err){
    console.error('Error al obtener la duración:', err);
  }
}

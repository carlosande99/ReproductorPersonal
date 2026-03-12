import fs from 'fs';
import path from 'path';
import playdl from 'play-dl';
import ytdl from '@distube/ytdl-core';
import {exec} from "child_process";

const carpetaDescargas = process.env.RUTAMUSICA;

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
    const rutaSalida = `${nombreArchivo}.%(ext)s`;

    try {

        console.log("Descargando audio con yt-dlp...");

        await new Promise((resolve, reject) => {

        const comando = `yt-dlp -x --audio-format mp3 -o "${rutaSalida}" "${url}"`;

        exec(comando, (error, stdout, stderr) => {

            if (error) {
            console.log("Error yt-dlp:", error.message);
            reject("fallback");
            return;
            }

            console.log(stdout);
            resolve("success");

        });

        });

        console.log("Descarga completada");
    } catch (err) {
        console.log("Error general:", err.message);
    }finally{
        limpiarArchivosTemporales();
    }
}
export async function descargarCancion(titulo, artista, id) {
  try {
    console.log(`Buscando "${titulo}" de ${artista} en YouTube...`);
    const url = await buscarCancionEnYoutube(titulo, artista);
    
    duration_ms = await obtenerDuracion(url);
    console.log(`Duración en ms: ${duration_ms}`);

    const nombreArchivo = `${carpetaDescargas}/${id}`;
    console.log('Descargando audio...');

    await descargarAudio(url, nombreArchivo);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function obtenerDuracion(url){
  try{
    const info = await ytdl.getBasicInfo(url);
    const duracionSeg = parseInt(info.videoDetails.lengthSeconds); // duración en segundos
    const duracionMs = duracionSeg * 1000; // duración en milisegundos
    console.log(`Duración: ${duracionSeg} s / ${duracionMs} ms`);
    return duracionMs;
  }catch(err){
    console.error('Error al obtener la duración:', err);
  }
}

function limpiarArchivosTemporales() {
  const carpetaActual = process.cwd();
  const archivos = fs.readdirSync(carpetaActual);

  archivos.forEach((archivo) => {
    if (archivo.endsWith("-player-script.js")) {
      try {
        fs.unlinkSync(path.join(carpetaActual, archivo));
        console.log(`Borrado archivo temporal: ${archivo}`);
      } catch (err) {
        console.warn(`No se pudo borrar ${archivo}:`, err.message);
      }
    }
  });
}

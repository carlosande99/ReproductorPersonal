import fs from 'fs';
import path from 'path';
import playdl from 'play-dl';
import ytdl from '@distube/ytdl-core';
import {exec} from "child_process"
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
  const TIMEOUT = 10000; // 10 segundos
  const rutaArchivo = nombreArchivo + ".mp3";
  const tempFile = nombreArchivo;
  try {
    console.log("Intentando descargar con ytdl-core...");

    await new Promise((resolve) => {
      const archivo = fs.createWriteStream(rutaArchivo);
      const stream = ytdl(url, { filter: "audioonly" });
      let terminado = false;

      const timer = setTimeout(() => {
        if (!terminado) {
          console.warn("ytdl-core tardó demasiado, cancelando...");
          stream.destroy();
          archivo.close(() => {
            // 🔥 BORRAR el archivo incompleto
            fs.unlink(rutaArchivo, (err) => {
              if (err) console.error("Error al borrar archivo incompleto:", err);
              resolve("fallback");
            });
          });
          terminado = true;
          resolve("fallback");
        }
      }, TIMEOUT);

      stream.pipe(archivo)
        .on("finish", () => {
          terminado = true;
          clearTimeout(timer);
          console.log("Descarga completada con ytdl-core");
          resolve("success");
        })
        .on("error", (err) => {
          terminado = true;
          clearTimeout(timer);
          archivo.close();
          console.warn("ytdl-core falló, pasando a yt-dlp...");
          resolve("fallback");
        });
    }).then(async (resultado) => {
      if (resultado === "fallback") {
        console.log("Usando yt-dlp como respaldo...");
        await new Promise((resolve, reject) => {
          const comando = `yt-dlp -x --audio-format mp3 -o "${tempFile}.%(ext)s" "${url}"`;
          exec(comando, (error, stdout, stderr) => {
            if (error) {
              console.error("Error al descargar con yt-dlp:", error.message);
              return reject(error);
            }
            console.log("✅ Descarga completada con yt-dlp:", tempFile);
            resolve();
          });
        });
      }
    });
  } catch (err) {
    console.error("Error inesperado al descargar el audio:", err);
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
    const info = await ytdl.getInfo(url);
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

import { spotifyApi } from './autentificacion.js';
import { descargarCancion } from './descargarAudio.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'src','datos.json');


// Función para buscar una canción por ID
export async function obtenerCancion(trackId) {
  try {
    const track = await spotifyApi.getTrack(trackId);
    console.log('Título:', track.body.name);
    console.log('Artista:', track.body.artists.map(a => a.name).join(', '));
    console.log('Álbum:', track.body.album.name);
    console.log('Carátula:', track.body.album.images[0].url);
    console.log('Duración (ms):', track.body.duration_ms);
    console.log('id:', track.body.id);

    let datos = [];
    let newId = 1;
    if (fs.existsSync(jsonPath)) {
      const file = fs.readFileSync(jsonPath, 'utf-8');
      datos = JSON.parse(file);
    }
    if(datos.length > 0){
      newId = datos[datos.length - 1].id + 1;
    }
    const song = {
      id: newId,
      datos: {
        id: track.body.id,
        title: track.body.name,
        artist: track.body.artists.map(a => a.name).join(', '),
        album: track.body.album.name,
        caractula: track.body.album.images[0].url,
        duracion: track.body.duration_ms
      }
    };

    // Agregar la nueva canción
    datos.push(song);
    fs.writeFileSync(jsonPath, JSON.stringify(datos, null, 2), 'utf-8');

    await descargarCancion(track.body.name, track.body.artists[0].name, track.body.id);
  } catch (err) {
    console.error('Error al obtener canción:', err);
  }
}

export function extraerIdDeUrl(url) {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}
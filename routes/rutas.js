import {authenticate} from '../services/autentificacion.js';
import {obtenerCancion, extraerIdDeUrl} from '../controllers/cancionId.js';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../server.js';
async function main(trackId) {
  await authenticate();
  const song = await obtenerCancion(trackId);
  return song;
}

export const añadirCancion = async (req, res) => {
  try {
    const { url } = req.body;
    console.log("URL recibida:", url);
    if (!url) {
      return res.status(400).send("Falta la URL de la canción");
    }

    const trackId = extraerIdDeUrl(url);
    console.log("Track ID:", trackId);
    const song  = await main(trackId)
    res.json(song);
  } catch (error) {
    console.error("Error en añadirCancion:", error);
    res.status(500).send("Hubo un error al procesar la canción");
  }
}

export const siguienteCancion = async(req, res) => {
  try{
    const {idCancion} = req.body;
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src','datos.json'), 'utf8'))
    
    const index = data.findIndex(song => song.idCancion === idCancion);

    if(index === -1){
      return res.status(404).json({error: "Canción no encontrada"});
    }

    const nextIndex = (index + 1) % data.length;
    const nextSong =  data[nextIndex];

    res.json(nextSong);
  }catch(error){
    console.error("Error en poner la siguiente cancion:", error);
    res.status(500).send("Hubo un error al procesar la siguiente canción");
  }
}

export const anteriorCancion = async(req, res) => {
  try{
    const {idCancion} = req.body;
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src','datos.json'), 'utf8'))
    
    const index = data.findIndex(song => song.idCancion === idCancion);

    if(index === -1){
      return res.status(404).json({error: "Canción no encontrada"});
    }

    const prevIndex = (index - 1 + data.length) % data.length;
    const prevSong =  data[prevIndex];

    res.json(prevSong);
  }catch(error){
    console.error("Error en poner la siguiente cancion:", error);
    res.status(500).send("Hubo un error al procesar la anterior canción");
  }
}
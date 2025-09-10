import {authenticate} from '../services/autentificacion.js';
import {obtenerCancion, extraerIdDeUrl} from '../controllers/cancionId.js';


async function main(trackId) {
  await authenticate();
  await obtenerCancion(trackId);
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

    await main(trackId);

    res.send("Canción descargada");
  } catch (error) {
    console.error("Error en añadirCancion:", error);
    res.status(500).send("Hubo un error al procesar la canción");
  }
}
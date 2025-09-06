import {authenticate} from './autentificacion.js';
import {obtenerCancion} from './cancionId.js';
import {extraerIdDeUrl} from './cancionId.js';


async function main(trackId) {
  await authenticate();

  // Ejemplo de ID de canción
//   const trackId = '5xPgLR8hKsPWlOBnurBi20';
  await obtenerCancion(trackId);
}

const url = 'https://open.spotify.com/intl-es/track/6sMPwcpYtxm1mlgYbp1B0t?si=e2656f7605f0458f';
const trackId = extraerIdDeUrl(url);
console.log(trackId);

main(trackId);
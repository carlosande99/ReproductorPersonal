import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 8888; // puerto local

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // ej: https://abcd1234.ngrok.io/callback

const SCOPES = 'user-library-read';

app.get('/', (req, res) => {
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) return res.send('No se recibió código de autorización');

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': authHeader } }
    );

    const access_token = tokenRes.data.access_token;

    const resTracks = await axios.get('https://api.spotify.com/v1/me/tracks', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { limit: 50 }
    });

    const lista = resTracks.data.items.map(item => ({
      nombre: item.track.name,
      artista: item.track.artists.map(a => a.name).join(', '),
      album: item.track.album.name,
      url: item.track.external_urls.spotify,
    }));

    res.json(lista);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send('Error obteniendo canciones.');
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

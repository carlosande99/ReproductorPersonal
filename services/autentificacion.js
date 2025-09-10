import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
dotenv.config();
let tokenExpiration = 0;
export const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function authenticate() {
    const now = Date.now();
    if (!spotifyApi.getAccessToken() || now >= tokenExpiration) {
        try {
            const data = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(data.body['access_token']);
            tokenExpiration = now + 5 * 60 * 1000;
            console.log('Autenticación exitosa');
        } catch (err) {
            console.error('Error al autenticar', err);
        }
    }
}
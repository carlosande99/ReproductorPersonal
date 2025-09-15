import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { añadirCancion } from './routes/rutas.js';
import fs from 'fs';
const app = express();
const PORT = 8888;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'src')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src','html','index.html'));
});

app.post('/', añadirCancion);

app.get('/songs', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src','datos.json'), 'utf8'))
  res.json(data)
});

app.use("/musica", express.static(path.join(__dirname, 'src','music')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
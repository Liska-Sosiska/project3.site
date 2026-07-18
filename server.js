import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const distDir = path.resolve(__dirname, 'dist');
const rootDir = __dirname;
const staticDir = existsSync(distDir) ? distDir : rootDir;

app.use(express.static(staticDir, {
  index: 'index.html',
  extensions: ['html'],
}));

app.get('*', (req, res, next) => {
  if (req.path.includes('.')) {
    return next();
  }

  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Site available at http://127.0.0.1:${port}/`);
});

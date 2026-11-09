import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/', ['index.html', 'text/html']], ['/src/app.js', ['src/app.js', 'text/javascript']], ['/src/engine.js', ['src/engine.js', 'text/javascript']], ['/style.css', ['style.css', 'text/css']]]);
createServer(async (req, res) => {
  const file = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1] + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Unable to read file'); }
}).listen(3000, '127.0.0.1', () => console.log('Solo RP Engine: http://localhost:3000'));

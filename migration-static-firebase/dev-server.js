const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT) || 8000;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { 'Cache-Control': 'no-store' }).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Length': stats.size,
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`YUGANTAR preview: http://127.0.0.1:${port}/index.html (cache disabled)`);
});

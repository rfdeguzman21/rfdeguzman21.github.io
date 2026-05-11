/**
 * server.js
 *
 * Development server for the CV site. Features:
 *   - Serves all files from the project root on the configured port (default 3000)
 *   - Runs an initial build of main.md on startup
 *   - Watches for file changes and triggers a live reload in the browser via SSE
 *   - Rebuilds HTML fragments automatically when main.md is saved
 *
 * Usage: node utils/server.js [port]   (or `npm start` which passes port 8000)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.argv[2] ?? 3000;

/** Content-Type lookup by file extension */
const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.md':   'text/plain',
    '.ico':  'image/x-icon',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.eot':  'application/vnd.ms-fontobject',
};

/**
 * Script injected at the end of every HTML response.
 * Opens a persistent SSE connection to /__reload and reloads the page on any message.
 */
const RELOAD_SCRIPT = `
<script>
    new EventSource('/__reload').onmessage = () => location.reload();
</script>`;

/** Active SSE response objects — one per open browser tab */
const clients = new Set();

build();

// Debounce rapid file-system events (e.g. editor writing multiple temp files on save)
let reloadTimer;
fs.watch(ROOT, { recursive: true }, (_, filename) => {
    if (!filename) return;
    // Skip noisy directories that never affect the served output
    if (filename.startsWith('.git') || filename.startsWith('node_modules') || filename.startsWith('public/download')) return;
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
        if (filename.endsWith('main.md')) build();
        clients.forEach(res => res.write('data: reload\n\n'));
    }, 50);
});

http.createServer((req, res) => {
    // SSE endpoint — browser tabs subscribe here and reload when they receive any message
    if (req.url === '/__reload') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.write(':\n\n'); // initial keepalive comment
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return;
    }

    let urlPath = new URL(req.url, 'http://localhost').pathname;
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    const filePath = path.join(ROOT, urlPath);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        let body = data;
        // Inject the live-reload script before </body> in every HTML response
        if (ext === '.html') {
            body = data.toString().replace('</body>', RELOAD_SCRIPT + '\n</body>');
        }

        res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
        res.end(body);
    });
}).listen(PORT, () => {
    console.log(`Serving at http://localhost:${PORT}`);
});

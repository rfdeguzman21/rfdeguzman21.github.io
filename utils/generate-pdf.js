/**
 * generate-pdf.js
 *
 * Generates public/download/RobinDeGuzman_CV.pdf from public/main.md.
 *
 * Process:
 *   1. Rebuilds the HTML fragments from main.md via build.js
 *   2. Assembles them into a self-contained HTML page (Bootstrap 5, Inter font)
 *   3. Writes the page to a temporary file so Puppeteer can load it via file:// URL,
 *      which allows relative asset paths (e.g. img/id-md.jpg) to resolve correctly
 *      and CDN stylesheets to load fully before printing
 *   4. Prints the page to A4 PDF and removes the temporary file
 *
 * Usage: `npm run pdf`
 */

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

build();

// Strip any <p> containing only a PDF download link — the link is only useful on the
// web page, not inside the PDF itself
const header = fs.readFileSync(path.join(ROOT, 'public/header.html'), 'utf8')
    .replace(/<p[^>]*>\s*<a[^>]*href="[^"]*\.pdf"[^>]*>.*?<\/a>\s*<\/p>/gi, '');
const left   = fs.readFileSync(path.join(ROOT, 'public/left.html'),   'utf8');
const right  = fs.readFileSync(path.join(ROOT, 'public/right.html'),  'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; font-size: 0.82rem; }
    .card-body h2:first-child { margin-top: 0 !important; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body class="bg-white">
  <div class="container-fluid py-3 px-4">
    <div class="card border-0 shadow-sm rounded-3 mb-3">
      <div class="card-body p-4">${header}</div>
    </div>
    <div class="row g-3">
      <div class="col-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-body p-3">${left}</div>
        </div>
      </div>
      <div class="col-8">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-body p-3">${right}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// Write to a temp file at the project root so the file:// URL resolves img/ correctly
const tmpFile = path.join(ROOT, 'RobinDeGuzman_CV.html');
fs.writeFileSync(tmpFile, html);

async function main() {
    // --no-sandbox is required in WSL2 / containerised environments
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        // Use networkidle0 so Bootstrap CSS and Google Fonts are fully loaded before printing
        await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0', timeout: 60000 });

        const outDir = path.join(ROOT, 'public/download');
        fs.mkdirSync(outDir, { recursive: true });

        const outFile = path.join(outDir, 'RobinDeGuzman_CV.pdf');
        await page.pdf({
            path: outFile,
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        });

        console.log(`PDF saved → ${outFile}`);
    } finally {
        await browser.close();
        // Always remove the temp file, even if PDF generation failed
        fs.rmSync(tmpFile, { force: true });
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

/**
 * Builds the site and generates a PDF from the rendered page.
 *
 * Usage: npm run pdf
 */

import { build, preview } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = path.join(ROOT, 'public/download/RobinDeGuzman_CV.pdf');
const PORT = 5050;

async function main() {
    console.log('Building site...');
    await build({ logLevel: 'warn' });

    console.log('Starting preview server...');
    const server = await preview({ preview: { port: PORT, open: false } });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.emulateMediaType('screen');
        await page.goto(`http://localhost:${PORT}`, {
            waitUntil: 'networkidle0',
            timeout: 60000,
        });

        await page.addStyleTag({ content: `
            * { font-family: Arial, sans-serif !important; }

            /* Hide footer */
            footer { display: none !important; }

            /* Render skill badges as bulleted lines */
            .badge {
                display: block;
                background: none !important;
                border: none !important;
                color: inherit !important;
                padding: 0 !important;
                margin: 0 0 2px 0 !important;
                border-radius: 0 !important;
                font-size: inherit !important;
                font-weight: normal !important;
            }
            .badge::before { content: '• '; }
        ` });

        // Move Profile card to appear before Experiences
        await page.evaluate(() => {
            const expCard = [...document.querySelectorAll('.card-header')]
                .find(h => h.textContent.trim() === 'Experience')
                ?.closest('.card');
            const profileCard = [...document.querySelectorAll('.card')]
                .find(c => c.querySelector('img') && !c.querySelector('.card-header'));

            if (expCard && profileCard) {
                expCard.parentElement.insertBefore(profileCard, expCard);
            }
        });

        fs.mkdirSync(path.dirname(OUT), { recursive: true });

        await page.pdf({
            path: OUT,
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        });

        console.log(`PDF saved → ${OUT}`);
    } finally {
        await browser.close();
        server.httpServer.close();
    }
}

main().catch(err => { console.error(err); process.exit(1); });

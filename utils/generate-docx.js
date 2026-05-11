/**
 * generate-docx.js
 *
 * Generates public/download/RobinDeGuzman_CV.docx from public/main.md.
 *
 * Process:
 *   Parses main.md with markdown-it, walks the flat token array, and builds
 *   a docx Document directly — no HTML middleman, which guarantees a valid file.
 *
 *   Supported markdown elements:
 *     - Headings h1–h4 (mapped to Word heading styles)
 *     - Paragraphs with bold, italic, and inline code
 *     - External hyperlinks (PDF/DOCX download links are intentionally excluded)
 *     - Bullet lists (tight and loose markdown-it token layouts)
 *     - Horizontal rules (rendered as an empty paragraph spacer)
 *
 * Usage: `npm run docx`
 */

import MarkdownIt from 'markdown-it';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, ExternalHyperlink } from 'docx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Maps markdown-it heading tag names to Word heading levels */
const HEADING_MAP = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
    h4: HeadingLevel.HEADING_4,
};

// html: false — we don't need HTML pass-through in the DOCX output
const md = new MarkdownIt({ html: false, linkify: true });
const src = fs.readFileSync(path.join(ROOT, 'public/main.md'), 'utf8');
const tokens = md.parse(src, {});

/**
 * Converts a markdown-it `inline` token and its children into an array of
 * docx-compatible child objects (TextRun, ExternalHyperlink).
 *
 * Tracks bold/italic state across open/close tokens and buffers link children
 * until the closing link_close token, at which point an ExternalHyperlink is emitted.
 * PDF and DOCX download links are skipped — they are irrelevant inside the document.
 *
 * @param {import('markdown-it/lib/token').Token} inlineToken
 * @returns {(TextRun | ExternalHyperlink)[]}
 */
function inlineToChildren(inlineToken) {
    const out = [];
    let bold = false;
    let italic = false;
    let linkHref = null; // non-null while inside a link_open…link_close pair
    let linkRuns = [];   // TextRuns accumulated for the current link

    for (const t of inlineToken.children ?? []) {
        switch (t.type) {
            case 'strong_open':  bold = true;    break;
            case 'strong_close': bold = false;   break;
            case 'em_open':      italic = true;  break;
            case 'em_close':     italic = false; break;

            case 'link_open':
                linkHref = t.attrGet('href') ?? '';
                linkRuns = [];
                break;

            case 'link_close':
                // Skip file download links — they only make sense on the web page
                if (linkHref && !linkHref.endsWith('.pdf') && !linkHref.endsWith('.docx')) {
                    out.push(new ExternalHyperlink({
                        link: linkHref,
                        children: linkRuns.length ? linkRuns : [new TextRun({ text: linkHref })],
                    }));
                }
                linkHref = null;
                linkRuns = [];
                break;

            case 'text':
            case 'code_inline': {
                const run = new TextRun({ text: t.content, bold, italics: italic });
                if (linkHref !== null) linkRuns.push(run);
                else out.push(run);
                break;
            }

            case 'softbreak':
            case 'hardbreak':
                out.push(new TextRun({ break: 1 }));
                break;
        }
    }

    return out;
}

/**
 * Walk the top-level token array and build the flat list of docx Paragraph objects.
 * markdown-it tokens form a mostly flat stream with open/close pairs and inline tokens
 * nested as children — we advance the index manually to consume related token groups.
 */
const paragraphs = [];
let i = 0;

while (i < tokens.length) {
    const token = tokens[i];

    // heading_open → inline (content) → heading_close
    if (token.type === 'heading_open') {
        const inline = tokens[i + 1];
        const children = inlineToChildren(inline);
        if (children.length) {
            paragraphs.push(new Paragraph({
                children,
                heading: HEADING_MAP[token.tag] ?? HeadingLevel.HEADING_2,
                spacing: { before: token.tag === 'h1' ? 0 : 240 },
            }));
        }
        i += 3; // heading_open + inline + heading_close
        continue;
    }

    // paragraph_open → inline (content) → paragraph_close
    if (token.type === 'paragraph_open') {
        const inline = tokens[i + 1];
        const children = inlineToChildren(inline);
        if (children.length) {
            paragraphs.push(new Paragraph({ children }));
        }
        i += 3;
        continue;
    }

    // bullet_list_open → list_item_open* → bullet_list_close
    if (token.type === 'bullet_list_open') {
        i++;
        while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
            const t = tokens[i];
            if (t.type === 'list_item_open') {
                i++;
                // Tight list (no blank lines): inline is a direct child of list_item_open
                // Loose list (blank lines between items): inline is wrapped in paragraph_open
                let inline = null;
                if (tokens[i]?.type === 'paragraph_open') {
                    inline = tokens[i + 1];
                    i += 3; // paragraph_open + inline + paragraph_close
                } else if (tokens[i]?.type === 'inline') {
                    inline = tokens[i];
                    i++;
                }
                if (inline) {
                    const children = inlineToChildren(inline);
                    if (children.length) {
                        paragraphs.push(new Paragraph({ children, bullet: { level: 0 } }));
                    }
                }
                if (tokens[i]?.type === 'list_item_close') i++;
            } else {
                i++;
            }
        }
        i++; // bullet_list_close
        continue;
    }

    // Render horizontal rules as an empty spacer paragraph
    if (token.type === 'hr') {
        paragraphs.push(new Paragraph({ text: '' }));
        i++;
        continue;
    }

    i++;
}

const doc = new Document({
    creator: 'Robin F. De Guzman',
    title: 'Robin F. De Guzman — CV',
    styles: {
        default: {
            document: {
                run: { font: 'Arial' },
            },
        },
    },
    sections: [{ children: paragraphs }],
});

async function main() {
    const outDir = path.join(ROOT, 'public/download');
    fs.mkdirSync(outDir, { recursive: true });

    const outFile = path.join(outDir, 'RobinDeGuzman_CV.docx');
    fs.writeFileSync(outFile, await Packer.toBuffer(doc));
    console.log(`DOCX saved → ${outFile}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

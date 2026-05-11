/**
 * build.js
 *
 * Converts public/main.md into three Bootstrap-styled HTML fragments:
 *   public/header.html  — name, photo, summary, and intro content before the first h2
 *   public/left.html    — left column sections (Strengths, Contact Information, Skills)
 *   public/right.html   — right column sections (Experience)
 *
 * These fragments are fetched at runtime by public/main.js and injected into index.html.
 * Run directly via `npm run build`, or imported by server.js for auto-rebuild on save.
 */

import MarkdownIt from 'markdown-it';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Maps h2 section names from main.md to their target output column.
 * Sections not listed here are silently dropped from all outputs.
 * Update this when adding or renaming h2 sections in main.md.
 */
const COLUMN_MAP = {
    'Contact Information':  'left',
    'Strengths':            'left',
    'Skills':               'left',
    'Experience':           'right',
};

const md = new MarkdownIt({ html: true, linkify: true });
const r  = md.renderer.rules;

// Override heading renderers to inject Bootstrap utility classes.
// h1 also wraps in a flex container with the profile photo.
r.heading_open = (tokens, idx) => {
    const tag = tokens[idx].tag;
    if (tag === 'h1') return '<div class="border-bottom pb-4 mb-2 d-flex align-items-center gap-3"><img src="img/id-md.jpg" alt="Robin F. De Guzman" class="rounded-circle flex-shrink-0" style="width:72px;height:72px;object-fit:cover;"><h1 class="display-6 fw-bold text-dark mb-0">';
    if (tag === 'h2') return '<h2 class="fw-semibold text-uppercase text-primary border-start border-3 border-primary ps-2 mt-4 mb-3" style="font-size:.7rem;letter-spacing:.1em">';
    if (tag === 'h3') return '<h3 class="fw-semibold fs-6 text-dark mt-3 mb-0">';
    if (tag === 'h4') return '<h4 class="small fw-semibold text-muted mb-1">';
    return `<${tag}>`;
};

r.heading_close = (tokens, idx) => {
    const tag = tokens[idx].tag;
    // h1 needs to close both the heading and the flex wrapper div
    return tag === 'h1' ? '</h1></div>\n' : `</${tag}>\n`;
};

// Bootstrap utility classes for common inline elements
r.paragraph_open    = () => '<p class="text-secondary mb-2">';
r.bullet_list_open  = () => '<ul class="text-secondary ps-3 mb-2">';
r.ordered_list_open = () => '<ol class="text-secondary ps-3 mb-2">';
r.list_item_open    = () => '<li class="mb-1">';
r.hr                = () => '<hr class="my-4 border-light-subtle">\n';
r.strong_open       = () => '<strong class="text-dark fw-semibold">';

// Add Bootstrap link styles and open external links in a new tab
r.link_open = (tokens, idx, options, _env, self) => {
    const href = tokens[idx].attrGet('href') ?? '';
    tokens[idx].attrSet('class', 'text-primary text-decoration-none');
    if (!/^(#|\/)/.test(href)) {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noopener');
    }
    return self.renderToken(tokens, idx, options);
};

/**
 * Splits a flat markdown-it token array into named buckets based on h2 section headings.
 * Tokens before the first h2 go into `header`. Subsequent tokens are routed via COLUMN_MAP.
 *
 * @param {import('markdown-it/lib/token').Token[]} allTokens
 * @returns {{ header: Token[], left: Token[], right: Token[] }}
 */
function splitTokens(allTokens) {
    const buckets = { header: [], left: [], right: [] };
    let currentKey = 'header';

    for (let i = 0; i < allTokens.length; i++) {
        const token = allTokens[i];

        if (token.type === 'heading_open' && token.tag === 'h2') {
            const name = allTokens[i + 1]?.content ?? '';
            currentKey = COLUMN_MAP[name] ?? 'skip';
        }

        if (currentKey === 'skip') continue;

        // Drop hr tokens from the header (avoids double-separator after the h1 wrapper border)
        if (currentKey === 'header' && token.type === 'hr') continue;

        buckets[currentKey].push(token);
    }

    // Drop any trailing hr tokens from column buckets (they were section separators in main.md
    // but are meaningless at the end of a card — the hr between Skills and Education stays
    // because it is internal to the right bucket, not trailing)
    for (const key of ['left', 'right']) {
        while (buckets[key].at(-1)?.type === 'hr') buckets[key].pop();
    }

    return buckets;
}

/**
 * Parses public/main.md and writes the three HTML fragment files.
 * Exported so server.js can call it on startup and on main.md changes.
 */
export function build() {
    const src    = path.join(ROOT, 'public/main.md');
    const tokens = md.parse(fs.readFileSync(src, 'utf8'), {});
    const buckets = splitTokens(tokens);

    const outputs = {
        'public/header.html': buckets.header,
        'public/left.html':   buckets.left,
        'public/right.html':  buckets.right,
    };

    for (const [file, bucket] of Object.entries(outputs)) {
        fs.writeFileSync(path.join(ROOT, file), md.renderer.render(bucket, md.options, {}));
    }

    console.log('built header.html + left.html + right.html');
}

// Allow running directly: node utils/build.js
if (process.argv[1] === fileURLToPath(import.meta.url)) build();

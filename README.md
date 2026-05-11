# rfdeguzman21.github.io

Personal CV / portfolio site for Robin F. De Guzman, hosted on GitHub Pages.

The single source of truth is `public/main.md`. The build step converts it into HTML fragments served by the site, and the export scripts generate downloadable PDF and DOCX versions.

## Project structure

```
├── index.html              # Site entry point
├── img/                    # Profile photo and favicon
├── public/
│   ├── main.md             # CV content (edit this)
│   ├── main.js             # Loads generated HTML fragments into the page
│   ├── header.html         # Generated — name, summary, download links
│   ├── left.html           # Generated — strengths, contact, skills
│   ├── right.html          # Generated — experience
│   └── download/
│       ├── RobinDeGuzman_CV.pdf
│       └── RobinDeGuzman_CV.docx
└── utils/
    ├── build.js            # Converts main.md → HTML fragments
    ├── server.js           # Dev server with live reload
    ├── generate-pdf.js     # Exports main.md → PDF
    └── generate-docx.js    # Exports main.md → DOCX
```

## Setup

```bash
npm install
```

## Usage

| Command | Description |
|---|---|
| `npm start` | Start dev server at http://localhost:8000 with live reload |
| `npm run build` | Rebuild HTML fragments from `public/main.md` |
| `npm run pdf` | Generate `public/download/RobinDeGuzman_CV.pdf` |
| `npm run docx` | Generate `public/download/RobinDeGuzman_CV.docx` |

## Updating the CV

1. Edit `public/main.md`
2. Run `npm run build` (or just `npm start` — it builds on startup and watches for changes)
3. Run `npm run pdf` and `npm run docx` to regenerate the downloadable files

## Deployment

Pushing to `master` deploys automatically via GitHub Pages.

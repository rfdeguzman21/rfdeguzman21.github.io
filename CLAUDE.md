# rfdeguzman21.github.io

Personal portfolio/CV site for Robin F. De Guzman. Built with Vite + React and Bootstrap 5 (CDN). Deployed to GitHub Pages via the `master` branch.

## Stack

- **Vite + React** — SPA, no routing needed
- **Bootstrap 5.3** — loaded via CDN in `index.html`, no npm package
- **react-markdown + remark-gfm** — used only in `Summary` component to render the bold-formatted summary field
- **js-yaml** (devDep) — Vite plugin in `vite.config.js` transforms `.yaml` imports into JS objects at build time

## Content

All CV data lives in one file: **`src/data/resume.yaml`**. Edit this to update the portfolio.

Top-level keys: `title`, `name`, `summary`, `cv`, `strengths`, `contact`, `skills`, `experiences`

- `summary` supports `**bold**` markdown syntax
- `cv` has `label` and `url` fields; rendered in `Profile` after contact info
- `contact` items use a `type` field: `email`, `phone`, or `social`
- `skills[].items` is an array (rendered as badges)
- `experiences[].bullets` supports YAML folded scalars (`>`)

## Layout

Two-column grid (`col-md-8` left, `col-md-4` right):

**Left column** — `RightColumn.jsx` (wider, 8 cols):
- `Summary` — title as card-header, summary text in card-body
- `Experiences` — one card, companies separated by border-bottom

**Right column** — `LeftColumn.jsx` (narrow, 4 cols):
- `Profile` — circle photo + name + contact info
- `Strengths` — card with card-header
- `Skills` — card with card-header, items rendered as badges

## Components

```
src/
  App.jsx
  main.jsx
  data/
    resume.yaml        ← edit this to update content
  components/
    LeftColumn.jsx     ← composes: Profile, Strengths, Skills
    RightColumn.jsx    ← composes: Summary, Experiences
    Profile.jsx        ← photo + name + contact
    Summary.jsx        ← title + summary (uses react-markdown)
    Strengths.jsx
    Skills.jsx
    Experiences.jsx
```

## Scripts

```
npm run dev       # Vite dev server on port 3000
npm run build     # production build → dist/
npm run preview   # preview dist/ locally
npm run deploy    # build + push dist/ to master branch (gh-pages)
npm run pdf       # generate PDF → public/download/RobinDeGuzman_CV.pdf
```

The `pdf` script (`utils/generate-pdf.js`) builds the site, spins up a Vite preview server on port 5050, and uses Puppeteer to capture the page. It injects PDF-specific overrides before capture:
- Arial font throughout
- Footer hidden
- Skill badges converted to bulleted lines
- Profile card moved before Experiences via DOM manipulation

## Static assets

```
public/
  img/
    favicon.ico
    id-sm.jpg     ← profile photo used in Profile component
  download/
    RobinDeGuzman_CV.pdf
```

## Notes

- No CSS overrides — use only Bootstrap utility classes
- `js-yaml` is a devDependency (build-time only, not shipped to browser)
- `LeftColumn` / `RightColumn` naming is historical — visually, RightColumn is on the left (wider) and LeftColumn is on the right (narrower)

# Vidhina Singhal — Portfolio

Personal UI/UX design portfolio, hand-built from the Figma design as a static site and hosted on GitHub Pages: **https://vidhina05.github.io/**

## Pages
| Page | File |
|---|---|
| Landing (hero, projects, education & experience, how I like to work, milestones, outside design, contact) | `index.html` |
| Breathe Safe — chronic asthma app case study | `breathe-safe.html` |
| Banarasi Silk Saree — Resham Riwayat case study | `banarasi-silk.html` |
| Banarasi Silk — detailed competitor study | `banarasi-competitors.html` |
| Indian Fruit & Vegetable Carts — frugal design case study | `fruit-vegetable-carts.html` |

## Stack
Plain HTML, CSS and vanilla JavaScript — no build step, no dependencies.
- `css/style.css` — design tokens, layout, responsive rules and the motion system (`.reveal`, `.reveal-img`, `.line-mask`, `[data-stagger]`)
- `js/script.js` — scroll reveals (IntersectionObserver), page transitions, sticky header + progress, active-section nav, mobile menu (focus-trapped), lightbox, custom cursor, subtle parallax, count-up numbers
- `assets/fonts` — self-hosted Poppins, Inter, Roboto, Lexend Deca, Syne and Material Icons (woff2)
- `assets/images` — WebP exports of the Figma assets

Motion respects `prefers-reduced-motion`; the custom cursor is disabled on touch devices.

## Local preview
```
python3 -m http.server 8000
```
then open http://localhost:8000.

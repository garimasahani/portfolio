# Garima Sahani · Magical Academy portfolio

A static website: plain HTML, CSS and JavaScript, with no build step and nothing to install. All the words, numbers and photos live in `content/`, so you can change the site without touching code.

## Run it on your computer

The pages read `content/*.json`, and browsers only allow that from a web server. From this folder run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Put it online

Upload the whole folder to any static host: Netlify (drag and drop), GitHub Pages, Vercel or Cloudflare Pages. Most of them pick up `404.html` automatically.

## Folder map

| Path | What it is |
|---|---|
| `index.html` | The one-page academy: Entrance, Map, Sorting Hat, Library, Potion Room, Chamber of Creations, Common Room and Pensieve, Owlery |
| `case.html` | Case study template (Challenge, Role, Research, Strategy, Execution, Results). Opens as `case.html#project-slug` |
| `404.html` | Lost-in-the-castle page |
| `content/site.json` | Hero copy, map destinations, email, socials, resume link |
| `content/about.json` | About story, the four houses for the Sorting Ceremony, portraits, facts |
| `content/career.json` | Library books: org, role, responsibilities, impact, skills (`spine` is the short label on the book) |
| `content/potions.json` | The nine skill potions: expertise, tools, where it was applied, linked projects |
| `content/projects.json` | Every project and spec campaign (cards, case studies, search) |
| `content/pensieve.json` | Memory orbs: milestones, with optional photo |
| `public/assets/icons`, `crests`, `ornaments` | Clay illustrations cut from the Magical Academy brand kit, as transparent PNGs |
| `public/assets/photos` | Photos |
| `public/assets/backgrounds` | Parchment texture |
| `assets/css/academy.css` | Design system: colour and font tokens, buttons, nav, ornaments |
| `assets/css/sections.css` | Each section's layout and animations |
| `assets/js/core.js` | Shared: menu, Nox wand-light mode, Accio search (press `/`), sparkles |
| `assets/js/home.js`, `case.js` | Render the pages from `content/` |

## Editing

- Anything starting with `TODO:` shows on the site as a purple placeholder. Search the `content/` folder for `TODO` to find them all.
- Contact form: set `FORM_ENDPOINT` at the top of `assets/js/home.js` to a Formspree (or similar) URL to receive letters directly. While it's empty, the form opens the visitor's email app with the letter filled in.
- Resume: put the PDF in `public/assets/` and set `resume.url` in `content/site.json`. The download link appears automatically.
- Colours and fonts are the variables at the top of `assets/css/academy.css`.
- Motion respects the visitor's reduced-motion setting.

## Pages

- `index.html` is only the map. On the first visit of a session a wax-sealed leather cover ("Welcome to Magical", "Portfolio of Garima") fills the screen; tapping the seal opens it onto a full-screen parchment map composed from the illustrated pieces in `public/assets/map/els/`. The Great Hall castle sits in the centre (About); the other places link to their rooms, and phones get a tall layout. The top bar has only search, night mode and the menu.
- Each room is its own page: `about.html`, `experience.html`, `skills.html`, `projects.html` (with the presentations shelf), `spec-lab.html`, `common-room.html`, `contact.html`. Case studies stay in `case.html#<slug>`.
- Map positions live in `assets/js/landing.js` (`WIDE` for landscape, `TALL` for phones); room names and links come from `locations` in `content/site.json`.
- `public/assets/map/cover.jpg` and the pieces in `public/assets/map/els/` are cut from Garima's own reference designs; the cover's original wording was painted out and the new title is live text.

## Sound

Two effects only, both synthesised in the browser with the Web Audio API (`assets/js/core.js`, the `FX` table), so there are no audio files: a wand whoosh on every click, and a paper flip while the cover opens onto the map. Nothing plays until the visitor's first tap or key press, and the menu has a Sound on/off switch that is remembered.

## Where each project lives

Every project in `content/projects.json` appears in exactly one place:

- it has a `workex` field naming a job in `content/career.json` -> shown as a card on that job's book in Experience
- otherwise, if its categories include `spec` -> the Spec Lab (concepts with a live mock are linked from their mock's tab, the rest are cards under it)
- otherwise -> the Chamber of Creations (Projects)

Decks in `content/decks.json` follow the same rule: `workex` puts a deck on that job's book, `lab` puts it in the Spec Lab, and the rest (the published paper) stay in Projects.

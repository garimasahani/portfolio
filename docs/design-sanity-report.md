# Design sanity report

Branch: `design-sanity` (nothing here changes the live site; `main` is untouched)
Scope: all 12 pages, desktop (1280px) and phone (320, 360, 375, 414px)
Mode: advisory. There is no Figma design system or `.napa/` context pack for this project, so this is a code and browser audit, not a Figma audit.

## Verdict

The site is visually consistent and holds together well: one token set, one frame pattern, no broken images, no console errors, no horizontal scroll on any page at any tested width. The real risks are **unfinished placeholder text that can still be reached**, **missing page-level headings**, and **touch targets that are a little small**. Nothing here is a blocker for sharing the site.

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1 | Case pages still show purple `TODO:` placeholders and are reachable through search and old links | High | Medium |
| 2 | Only 3 of 12 pages have an `h1` | Medium | Small |
| 3 | Touch targets under 44px (nav buttons, back links, potions, text links) | Medium | Small |
| 4 | Videos have no captions or transcript | Medium | Medium |
| 5 | About page "weekly ritual", "story of taking on something new", patronus, spell and wand are still TODO | Medium | Content |
| 6 | The gold accent (#D4A84A) is too light for text on parchment | Low | Small |
| 7 | About 35KB of dead Spec Lab CSS, plus dead Pensieve code and data | Low | Small |
| 8 | 26MB of video on the Spec Lab and CRAN pages | Low | Medium |
| 9 | `TODO.md` is out of date | Low | Small |

## 1. Placeholders still reachable (High)

- Project cards in the job books are no longer links, but their case pages (`case.html#slug`) still exist. The site search ("Accio") still lists them, and anyone with an old link lands there.
- 31 of 33 projects carry `TODO` fields. Examples: Coohom India GTM shows "list the channels", "shareable budget, or remove this line", "what building India from scratch taught you". Vastu AI, Growth OS, PICEPay, Windowseat and Finlens have 4 to 8 each.
- **Fix, pick one:** (a) stop indexing case pages in search for projects that have TODOs, or (b) fill them in, or (c) make the case template hide any section whose text is a TODO (recommended, about 10 lines in `case.js`).

## 2. Heading structure (Medium)

- `index`, `case` and `404` have an `h1`. The other nine pages start at `h2`.
- Screen-reader users get no page title heading, and the outline skips a level.
- **Fix:** make each page's big title (the plaque on `.shead`) an `h1`, with the same look. Visual change: none.

## 3. Touch targets (Medium)

Measured on desktop and phone with a 44 x 44px minimum (WCAG 2.5.5 AAA, a good practice for fingers):

- Search, theme and menu buttons: 42 x 42px.
- "Back to the map" link: 34px tall.
- Skill potions: 41px tall.
- Inline text links in the footer and pager: about 21px tall.
- Cover "skip" link: 57 x 22px.
- **Fix:** `min-height:44px` on `.navbtn`, `.backmap`, `.potion`, `.footnav a`, `.doorskip`, with extra padding. Layout changes are small.

## 4. Video accessibility (Medium)

- Four self-hosted videos (CRAN, Harry Potter, Sarvam, Navbeats) have controls but no caption track.
- **Fix:** add `.vtt` captions or a short transcript under each video.

## 5. About page placeholders (Medium, needs your content)

- Traits "Courage" and "Determination" and "Chivalry" stories, patronus, favourite spell, and the wand details are TODO in `about.json`. Only some of them are shown today, but they are in the data.

## 6. Colour contrast (Low)

Computed from the palette tokens against the parchment background:

- Passes (4.5:1 or better): ink, brown, brown-deep, gold-text (5.4), red, red-deep, green, blue, plum, the map sign text, nav and footer text.
- **Fails:** the plain gold `#D4A84A` is 1.8:1 on parchment. It's used for decoration (borders, stars) where that's fine, but it must not carry text. Check any text set in that colour and switch it to `--gold-text`.
- I could not do a pixel-level check of text on the textured parchment, so treat this as palette-level only.

## 7. Dead code (Low)

- `speclab.css` is 45KB; the interactive mock styles it carries (`.bars`, `.art`, `.dl`, `.loop`, `.habits`, `.stat`, `.stage`, `.ccard`) no longer appear in `spec-lab.html`. Most of the file can go.
- The Pensieve code in `home.js`, its CSS in `sections.css` and `content/pensieve.json` are unused.
- The old `#specdecks` and `#speccards` handlers in `home.js` target elements that no longer exist.
- `speclab.css` has animations with no `prefers-reduced-motion` guard. Harmless today only because that CSS is unused.

## 8. Page weight (Low)

- `public/assets/video` is 26MB. The Spec Lab pages load video metadata only (`preload=metadata`), so first paint is fine, but each play is 5 to 13MB. Consider a 480p version for phones.
- Photos are 2.3MB in total, well sized.

## 9. Housekeeping (Low)

- `TODO.md` still lists the About "What I'm chasing next" line, which is done, and describes the form setup, which was replaced by the mailto buttons.

## What is working well

- No broken images, no missing `alt`, no iframes without titles, every external link has `rel="noopener"`.
- Zero console errors on every page.
- No horizontal overflow at 320, 360, 375 or 414px after the mobile fixes.
- `prefers-reduced-motion` is respected on the map, the hat, the floating photos and the cover.
- Focus rings exist (`:focus-visible`) and the custom wand cursor falls back to a pointer.
- Palette: text colours pass AA on parchment, nav and footer.
- One frame system (parchment card, gold border, ornament) across every page.

## Suggested order

1. Hide TODO sections on case pages (finding 1).
2. Promote page titles to `h1` and enlarge touch targets (2 and 3).
3. Captions for the four videos (4).
4. Delete dead CSS and JS (7), refresh `TODO.md` (9).

## Method

Every page was loaded at 1280px and at 320, 360, 375 and 414px with the job books, skill potions and Spec Lab rows opened. A script checked missing alt text, button names, iframe titles, link `rel`, heading levels, target sizes, horizontal overflow and visible TODO text. Contrast was computed from the design tokens. Assets and dead code were checked with file searches.

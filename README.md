# TrainICSI — trainicsi.com

Single-page static marketing site. Plain HTML, CSS and JavaScript — no build
step, no framework, no backend, no database. Upload the folder and it runs.

```
trainicsi/
  index.html
  css/styles.css, css/tools.css
  js/main.js, js/kpi.js, js/articles.js
  tools/  articles/  scripts/  ivf-kpi-calculator/
  _headers, _redirects
  robots.txt
  sitemap.xml
  assets/
    logo/          trainicsi-logo.png/.svg, favicon.svg, favicon-32.png,
                   favicon-256.png  — already in place
    product/       showcase-scrub.mp4, solution-loop.mp4, hero-photo.jpg,
                   control-detail.jpg, microscope-unit.jpg,
                   microscope-closeup.jpg + poster-*.jpg — real product
                   photography and b-roll, already in place, see §2
    software/      dashboard / UI screenshots              (optional)
    procedures/    procedure-<name>.jpg × 6, see §6a        (needed)
    conferences/   demo-1.jpg … demo-6.jpg, flat, see §6    (optional)
    founders/      founder portraits                       (needed)
    testimonials/  headshots for quotes                    (optional)
```

---

## 0. Latest change: Tools and Articles

```
tools/index.html                      Tools list (currently one item)
tools/ivf-kpi-calculator/index.html   trainicsi.com/tools/ivf-kpi-calculator/
ivf-kpi-calculator/index.html         alias for the old URL (+ 301 in _redirects)
articles/index.html                   Articles list, reads articles/articles-data.js
articles/_template.html               copy this to start a new article
articles/articles-data.js            generated — do not edit by hand
css/tools.css, js/kpi.js, js/articles.js
scripts/build-articles.js             builds articles-data.js + sitemap.xml
```

**Adding an article:** copy `articles/_template.html` to e.g.
`articles/my-first-article.html` (keep it directly inside `articles/`), edit the `<title>`, description, keywords (shown as tags), published date and
body, then run `node scripts/build-articles.js` from the site root and deploy.
Files starting with `_` and `index.html` are ignored. With no articles, the
Articles page shows its "No articles yet" state.

**Adding a tool:** build the page under `tools/<name>/index.html` and copy the
`<a class="row">` block in `tools/index.html`. Add the URL to
`scripts/build-articles.js` so it lands in the sitemap.

**Local preview:** every internal link points at a real `index.html`, so the
site works when opened straight from disk as well as on a server.

---

## 0a. Previous change: calmer ambient backgrounds

The dense pentagon grid is gone. Sections now use a **few hairline pentagon
outlines** (no fill, 1px stroke, 26-50% opacity, masked out behind the text
column) declared per section as `.pent-o` inside `.pent-field` in
`index.html`. Only Problem and Intelligence carry them; Procedures and
Mistakes keep just a soft colour wash. Interaction is a gentle depth-based
parallax plus a slight brighten near the cursor (`main.js`). Founder photos
now also accept `.jpeg`, `.png` and `.webp`.

---

## 0b-prev. What changed in the previous revision

**A larger pass: a new decorative background system, a redesigned
Procedures section, a restructured "How It Works" section, a tone-of-voice
pass, and a batch of smaller fixes (contact icons, a founder social link,
the Showcase tag's contrast, the FLAGGED badge, the "world's first" claim,
and a simplified Conferences section).**

- **Ambient backgrounds are now a pentagon grid, not a dot grid.** The
  faint dot texture behind Problem, Procedures, Intelligence and Mistakes
  (`.dotgrid`) was "too small to be seen," so it's replaced by a grid of
  small pentagon outlines echoing the logo's pentagon (`.pentgrid`/`.pent`,
  built by `initPentGrid` in `main.js`), at a visibly higher opacity.
  Pentagons near the cursor **bulge outward** and spring back smoothly when
  the cursor moves away — a `mousemove` + `requestAnimationFrame` loop
  computes each pentagon's distance from the cursor and applies a
  `transform` with inverse-distance falloff, clamped to a 140px radius; the
  layer itself stays `pointer-events:none` so it never blocks clicks, and
  `prefers-reduced-motion` turns the interaction off entirely. See §6b.
- **Procedures section (06) redesigned.** New heading, "One platform,
  multiple procedures." The six procedures now live in a left-hand list;
  hovering, focusing or tapping one feather-crossfades its image into the
  right-hand display and overlays its description as a bold white caption
  over a diagonal scrim. No real procedure photography exists yet, so each
  image is a placeholder path with the same graceful-fallback pattern used
  for testimonial/founder photos — see §3 for the exact filenames.
- **"How It Works" (03) now holds what used to be Cloud & Dashboards.** The
  old six-step How It Works grid (Control/Simulate/See/Practice/
  Analyse/Improve) didn't explain the product well; the Cloud section's
  5-node flow (practice → instant metrics → cloud sync → AI analysis →
  dashboards) does, so it was moved into the How It Works slot and the old
  Cloud slot was removed outright. `id="how"` was kept on the relocated
  content, so every `#how` link (nav, footer) still resolves with no
  change needed there; `id="cloud"` no longer exists and nothing on the
  site still points at it. **Every eyebrow number after the old Cloud slot
  shifted down by one** — what was 11–18 is now 10–17; double-checked
  sequentially end to end.
- **Contact section:** a WhatsApp icon now sits next to each phone number
  — clicking it (or the number) opens a `wa.me/91…` chat for that specific
  person, built alongside the existing `tel:` link by the same decode step
  in `main.js`. A location-pin icon precedes the address, an email icon
  precedes the email line. The "We usually reply within two to three
  working days" line is gone. The Mistakes section's "Illustrative event
  log. Names and data throughout this site are fictional." line is gone
  too.
- **FLAGGED badge blinks three times, then settles.** A CSS keyframe
  (`animation-iteration-count:3; animation-fill-mode:forwards`) blinks the
  red FLAGGED chip on load/reveal, then holds its normal flagged-red state
  — no JS involved.
- **New hero headline, at your explicit instruction:** "TrainICSI, the
  world's first micromanipulation training simulator." See §8 — this
  supersedes the earlier note that the "world's first" phrase was being
  deliberately withheld pending your sign-off; you've now given it.
  **"Explore TrainICSI"'s hover state** now also flips its background to
  white and its text to dark (previously only the border changed).
- **Showcase section (right under Hero):** the "THE WORKSTATION" tag had
  no scrim behind it in the brighter upper part of the frame, so it read
  as washed out — it now sits on its own small blurred chip with its own
  text-shadow, clearly on top regardless of what's playing behind it. The
  three overlay captions now each appear in a **different screen corner**
  as they cycle (bottom-left → top-right → bottom-right) instead of always
  reusing the same spot, with a matching slide-in direction per corner.
  The underlying scroll-scrub/timer logic that decides *when* each line
  turns on didn't need to change.
- **Apratim Arora's Instagram** (`instagram.com/apratim.arora`) is now
  linked on his founder card, alongside LinkedIn.
- **Conferences section simplified.** Replaced the per-event
  collage-and-lightbox system (JSON image arrays, album counts, a
  multi-photo paged lightbox) with a flat grid of individual team/
  demonstration photos and a plain single-image lightbox. See §6.
- **A site-wide tone pass** toward more clinical, descriptive language —
  e.g. the Problem heading now states the actual constraint (regulatory
  restriction on practising on real embryos, plus the capital cost of
  traditional training setups) instead of a vaguer line, the Training
  Modes copy drops "training wheels", and "Practice → Analyse → Improve"
  reads "Practice → Measure → Improve." Where it read naturally, "analyse"
  became "measure"; the "AI analysis" and "Performance Analysis" labels
  stayed, since those are standard technical terms that already read
  clinically. Throughout, small rewrites lean a little more on what
  already differentiates the product — AI-driven feedback, objective
  metrics and scoring, zero biological risk, and unlimited repeatable
  practice — without restructuring anything.

---

## 0a. Previous revision

**A round of correctness and content fixes from your notes: wrong control
labels, a flow that didn't reflect how the product actually works, real
testimonials and founder bios, social links, and a single consistent CTA.**

- **One CTA, not two.** Nav and Hero both had a "Contact" and a separate
  "Book a Demo" button doing the same job — since the enquiry form already
  asks what kind of thing someone wants, every button site-wide now reads
  "Contact Us" (highlighted, so it still reads as the primary action).
- **Showcase section copy rewritten** to plainly describe what's being
  shown instead of trying to be clever about it, and its **scroll video no
  longer crops to a sliver on phones** — narrow viewports now letterbox
  the video (show the whole frame, bars top/bottom) instead of cropping
  it to the centre third.
- **Problem section** got a visible connection between "the path today"
  and "with TrainICSI" (one bordered flow with a down-arrow and
  "TrainICSI turns this into" between them, instead of two floating
  blocks that looked unrelated), a less sales-y lede, and a soft drifting
  background (see §7).
- **All five Controls hotspot labels were wrong and are now corrected**
  to what they actually are: syringe/pressure control, stage movement,
  3-axis coarse pipette control, 3-axis precise pipette control, and
  coarse/fine focus adjustment — per your corrections. **Double-check
  these against the hardware yourself** before this goes live; I don't
  have independent means to verify control function against the physical
  unit, only against what you told me.
- **Mistakes section** heading and copy rewritten, the "does not certify
  clinical competence" line dropped as off-topic, and the event log now
  uses the real mistake types you gave (needle breaking, oocyte damage
  from excess holding pressure, sperm aspirated before immobilisation,
  two sperm too close in the needle, over-deaspiration/bubbling, oocyte
  lost) plus a background texture matching Problem's — see §6b.
- **Cloud & dashboards flow corrected** to the real sequence: practice →
  local metrics shown instantly → synced to cloud → AI-guided cumulative
  analysis → trainer scoring and a student readiness record. Trainer/
  student dashboard blurbs rewritten to match.
- **Institutions, Philosophy and the final CTA line rewritten** — scale
  without lakhs in extra lab setup; "practice all of it" (handling,
  pressure, sequencing, dos and don'ts), not just "movements"; and a
  final line about what the site is actually for, replacing the generic
  one that was there.
- **Real testimonials (7) and founder bios are live**, with photos set up
  to auto-pull from `assets/` — see §3 and §5.
- **Social links added** — founders' LinkedIn/Instagram on their cards,
  TrainICSI's LinkedIn/Instagram in the footer. One link you sent
  (Apratim's "Instagram") was actually the TrainICSI company LinkedIn URL
  repeated — I left that one out rather than publish a wrong link; see the
  chat reply for the exact mismatch.
- **Contact form switched to your Tally.so form**, embedded inline;
  Web3Forms removed. Email and phone (lightly obfuscated) are live — see
  §4.
- Company name now reads **"Shreeji MedTech Pvt. Ltd."** at every point
  this revision touched (Contact, About, footer tagline), matching what
  you sent.

---

## 0b. Two revisions back

**Switched from CAD-rendered placeholders to your real product photography
and b-roll, redesigned the Hero and added a new scroll-driven Showcase
section, and trimmed the copy throughout.**

- **Real assets replace every CAD render.** The two turntable b-roll clips
  and the studio photo of the full assembly are now the Hero background,
  the Solution loop, the Controls close-up and the Microscope section's
  photography — nothing on the page is a render anymore.
- **New cinematic Hero.** Full-bleed real photo, a dark gradient for
  legible type, condensed headline and one-line lede. A subtle parallax
  drift on the background image as you scroll past it.
- **New Showcase section**, directly under the Hero: the first b-roll
  clip (its built-in wide → push-in-on-the-eyepieces → pull-back-out
  move) runs inside a pinned, full-bleed stage, with `video.currentTime`
  driven by scroll position instead of autoplay — so scrolling through
  it feels like scrubbing a camera move. Three short overlay lines
  advance with it. On touch devices and under reduced-motion it falls
  back automatically to a plain autoplay loop — scrubbing adds seek cost
  there without adding clarity.
- **Everything below the Showcase stays deliberately calm** — the
  original fade-up `.reveal` animation and nothing heavier, per the
  brief to keep the theatrics upper and the rest modest.
  - **Copy condensed throughout.** Every section's heading and lede were
  shortened; the bullet list in the Problem section and the entire
  former "Why simulation-based training" section were cut as repeats of
  points made elsewhere (Problem, Institutions). Content is unchanged in
  substance, just said once instead of two or three times.

---

## 1. Brand

Colour is taken straight from the trademarked mark, sampled from the supplied
SVG:

| | Hex | Used for |
|---|---|---|
| TrainICSI blue | `#1DA7D3` | the mark, hotspots, live data, active states |
| TrainICSI green | `#2FCB9E` | the target glyph, secondary data, "in development" tags |
| Blue (text-safe) | `#12718F` | CTA buttons and any blue carrying text — the pure blue fails contrast at body sizes |
| Green (text-safe) | `#1A8465` | green used in body text |

Both trademarked colours appear at full strength only in small, deliberate
places — the mark itself, data points, one button state. Everything else is
paper white, near-black ink and hairline greys, so the brand colour reads as
precision rather than decoration.

The logo's circle-and-arrow is reused across the page as the bullet/precision
glyph (`<symbol id="g-target">` at the top of `index.html`) instead of generic
dots. The pentagon appears once more, at 4% opacity, behind the Vision
section.

**Two things to send when convenient:** a version of the horizontal logo with
a genuinely transparent background (the supplied SVG has an opaque white
rectangle behind it, so the site uses a cropped PNG for now), and a 1200×630
share image for `assets/logo/og-image.jpg`.

---

## 2. The product photography and video — what's used where, and how to update it

Everything in `assets/product/` now comes from the real hardware — two
studio turntable b-roll clips and one studio photo of the full assembly —
not a render. Nothing here is invented; all of it is cropped, trimmed or
re-encoded from what you supplied.

| Where | Asset | What it is |
|---|---|---|
| Hero | `assets/product/hero-photo.jpg` | The full-assembly studio photo, used as a full-bleed background behind a dark gradient. |
| Showcase (new, right under Hero) | `assets/product/showcase-scrub.mp4` + `poster-showcase.jpg` | The b-roll clip with the wide → push-in-on-the-eyepieces → pull-back-out move, scroll-scrubbed (see §2b). Re-encoded with a short keyframe interval (`-g 3`) specifically so `video.currentTime` seeks smoothly when JS sets it dozens of times a second. |
| Solution | `assets/product/solution-loop.mp4` + `poster-solution.jpg` | The second b-roll clip (opposite rotation), a plain muted autoplay loop — normal keyframe spacing, since it's never scrubbed. |
| Controls | `assets/product/control-detail.jpg` | A crop of the studio photo isolating one control unit — all five controls visible and well separated, with hotspots over it. |
| Microscope | `assets/product/microscope-unit.jpg`, `microscope-closeup.jpg` | A crop of the studio photo isolating the centre microscope unit, and a frame pulled from the b-roll at its sharpest, best-centred moment on the eyepieces. |

**Re-encoding commands**, if you ever swap in new source footage:

```bash
# Scroll-scrubbed video — short GOP for smooth seeking
ffmpeg -i SOURCE.mp4 -vf "scale=1440:-2" -an -c:v libx264 -preset slow \
  -crf 21 -g 3 -keyint_min 3 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart showcase-scrub.mp4

# Plain autoplay loop — normal GOP
ffmpeg -i SOURCE.mp4 -vf "scale=1280:-2" -an -c:v libx264 -preset slow \
  -crf 23 -pix_fmt yuv420p -movflags +faststart solution-loop.mp4

# Poster frame (first frame) for either
ffmpeg -i FILE.mp4 -vframes 1 -q:v 3 poster-name.jpg
```

**Controls hotspots are matched to this exact crop, not to the product in
general.** The five marker positions (`left`/`top` percentages on each
`.hotspot` button in the Controls section of `index.html`) were placed
against `control-detail.jpg` at its native 644×734 and verified by
rendering the page and checking the markers land on the right knob. If
that image is ever re-cropped or replaced, these five percentages need
re-checking against the new image — they're tied to this exact crop, not
computed from any 3D data.

---

## 2b. How the scroll-scrub works

`js/main.js` reads how far the `#showcase` section has scrolled past the
top of the viewport, turns that into a 0–1 progress value, and sets
`scrubVideo.currentTime = progress * video.duration` on every scroll
frame (throttled with `requestAnimationFrame`, and only while the section
is actually on screen, via `IntersectionObserver`). The three overlay
lines advance the same way, keyed to thirds of that same progress value.

On a coarse pointer (touch) or under `prefers-reduced-motion`, this is
skipped entirely — the video just autoplays on loop instead, and the
overlay lines cycle on a timer. Scrubbing is a precision interaction best
suited to a mouse wheel or trackpad; on a phone it mostly adds jank and
battery drain for no real benefit, which is why it's gated this way
rather than attempted everywhere.

If you want to change the overlay copy, edit the three
`<p class="showcase-line">` elements directly in `index.html` — no JS
changes needed, the script just toggles `.is-on` between whichever
elements exist.

---

## 3. Photographs to supply

Testimonial and founder photos now **auto-pull** — drop a correctly-named
file into the right folder and it appears on the live page with no HTML
edit needed. Until a photo is there, the site shows a plain styled
placeholder (initials circle for testimonials, an empty grey box for
founders) instead of a broken image, so it's safe to publish before every
photo is in hand.

| Priority | What | Exact filename |
|---|---|---|
| **High** | Founder portraits ×2 | `assets/founders/apratim-arora.jpg`, `assets/founders/lokesh-sureliya.jpg` |
| High | Testimonial headshots ×7 | `assets/testimonials/sanjay-shukla.jpg`, `vijay-kumar-chelur.jpg`, `ved-prakash.jpg`, `sujatha-ramakrishnan.jpg`, `sanketh-dhumal-satya.jpg`, `rahul-sen.jpg`, `ms-gaur.jpg` |
| Optional | Dashboard screenshot | `assets/software/session-review.png` — replaces the illustrative dashboard once the real UI is final |
| **Needed** | Procedure photography/video ×6 | `assets/procedures/procedure-icsi.jpg`, `procedure-embryo-biopsy.jpg`, `procedure-polar-body-biopsy.jpg`, `procedure-laser-hatching.jpg`, `procedure-micromanipulator-adjustment.jpg`, `procedure-alignment-needle-positioning.jpg` — see §6a |
| Optional | Conference/demo photos ×6 | `assets/conferences/demo-1.jpg` … `demo-6.jpg` — see §6 |

Founder portraits: square, ~600×600, consistent lighting between the two.
Testimonial headshots: square works best, ~400×400 is plenty — these
display small. Export everything as JPG at roughly 1600px on the long
edge, quality ~80, to keep the site fast.

To add a *new* person beyond these, copy one `<figure class="tcard">` (for
a testimonial) or `.founder` block (for a founder) in `index.html`, point
its `src` at a new filename, and fill in the text — the fallback behaviour
comes along automatically, nothing in `main.js` needs touching.

---

## 4. The enquiry form

The form is now an **embedded Tally.so form** (`https://tally.so/r/0QNMjj`),
shown inline via an iframe in the Contact section, with a plain "open in a
new tab" link underneath in case the iframe is ever blocked by a visitor's
browser settings. Tally handles hosting, spam protection and where
submissions land — there's nothing to configure on the site itself.

**To change the form's fields or where submissions go:** edit the form at
tally.so directly. The embed on the site updates automatically — no
re-deploy needed.

**Phone numbers** in the Contact section (§info) are written into the page
as a lightly obfuscated, non-digit string and decoded by `js/main.js` only
once the page actually renders in a browser — see the comment above
`#phoneOut` in `index.html` and the matching block in `main.js`. This stops
the simplest kind of scraper (one that just regexes the raw HTML for
10-digit runs) from harvesting the numbers; it is not, and can't be, proof
against anything more deliberate — client-side obfuscation never fully is.
If that trade-off (some protection, not perfect protection) isn't the one
you want, the alternative is to drop phone numbers from the page entirely
and route everyone through the Tally form instead.

---

## 5. Testimonials

Seven real quotes are live, each with name, designation and institution
exactly as supplied — nothing paraphrased or invented. They're ordered as
given; reorder by moving the `<figure class="tcard">` blocks within
`index.html` if you'd rather lead with different names.

The section is a horizontal carousel with arrows and dot pagination, so it
holds as many as you add without a redesign. To add another, copy one
`<figure class="tcard">` block and fill it in — see §3 for the photo
convention. Never paraphrase someone into a quote they didn't say.

---

## 6a. Procedures section imagery

The Procedures section (06) is now a left-hand list of six procedures
driving a right-hand image display: hover, focus or tap a procedure in the
list and its image feather-crossfades in on the right, with its
description as a caption. **No real procedure photography or video exists
yet**, so each list item's image points at an expected filename in
`assets/procedures/`:

```
assets/procedures/
  procedure-icsi.jpg
  procedure-embryo-biopsy.jpg
  procedure-polar-body-biopsy.jpg
  procedure-laser-hatching.jpg
  procedure-micromanipulator-adjustment.jpg
  procedure-alignment-needle-positioning.jpg
```

Same graceful-fallback convention as testimonials/founders (see §3): drop a
correctly-named image into that folder and it just appears — until then, a
plain "PROCEDURE PHOTOGRAPHY NOT YET ADDED" placeholder shows instead of a
broken image. A 16:11-ish crop (the stage is `aspect-ratio:16/11`) works
best; ~1600px on the long edge, JPG, quality ~80. If you'd rather use short
video clips instead of stills for some procedures, say so and I'll swap the
`<img>` tags for muted autoplay `<video>` loops — the crossfade and caption
logic carries over unchanged.

---

## 6. Conferences — simplified to a flat photo grid

**Changed from the per-event album approach to a small, flat grid of
individual photos** — your call, and it keeps the section (and the page)
lighter: no per-event JSON image arrays, no album/collage markup, no
multi-photo paged lightbox to maintain.

The section now shows a simple 3-column grid of up to six photos of the
team demonstrating TrainICSI (not grouped by conference or event).
Clicking any photo opens a plain single-image lightbox — no prev/next, no
photo count, nothing else to wire up.

Structure:

```
assets/conferences/
  demo-1.jpg
  demo-2.jpg
  demo-3.jpg
  demo-4.jpg
  demo-5.jpg
  demo-6.jpg
```

Drop photos in with those exact names and they appear; the same graceful
fallback as elsewhere on the site shows "PHOTO NOT YET ADDED" for any that
aren't there yet. To add or remove a tile, copy or delete one
`<button class="conf-tile">` block in `index.html` and point `data-src`
(and the `<img src>` inside it) at the filename — nothing in `main.js`
needs touching. Pick photos that actually show someone using the product,
not just the booth or signage; four to six is the right amount — this is
supporting evidence, not a photo album.

---

## 6b. Ambient section backgrounds — pentagon grid

A few of the quieter, text-only sections (Problem, Procedures, Intelligence,
Mistakes) carry a soft decorative background: a slow-drifting blurred
colour wash in the brand blue/green, plus a grid of small pentagon
outlines (`.pentgrid`/`.pent`) echoing the logo's pentagon — replacing the
original dot-grid texture, which read as too faint to notice. Both layers
are purely `aria-hidden` and sit behind the content (`pointer-events:none`
on the whole layer, so nothing decorative can ever intercept a click).

**The pentagons are interactive.** `initPentGrid` in `main.js` builds the
grid of `.pent` elements to fill each `.pentgrid` layer, then a single
page-wide `mousemove` listener (throttled with `requestAnimationFrame`)
pushes any pentagon within ~140px of the cursor outward from it, with the
push strength falling off with distance; move the cursor away and each
pentagon's own CSS `transition` eases it back to its resting position.
Everything is skipped under `prefers-reduced-motion`.

To add either layer to another section, wrap it with class `has-ambient`
and drop this just inside, before `.container`:

```html
<div class="ambient" aria-hidden="true">
  <span class="blob blue" style="width:34vw;height:34vw;top:-14%;right:-8%" data-parallax="0.05"></span>
  <span class="pentgrid"></span>
</div>
```

`blob` takes a `blue` or `green` modifier and any size/position you want
via inline `style`; `data-parallax` (optional) gives it a slow drift as
the section scrolls, reusing the same mechanism as the Hero's background
parallax. `pentgrid` needs no configuration — it sizes itself to fill
whichever `.has-ambient` section it's in. One blob is usually enough —
Problem and Mistakes use two (one of each colour, opposite corners)
because those sections are taller. Deliberately not used on Solution,
Controls, Modes or the testimonial/conference sections — those already
have strong visual content (photos, video, the dashboard) and didn't need
it.

---

## 7. Deploying to Cloudflare Pages

1. Push this folder to a GitHub repo, or use Cloudflare's direct upload.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages**.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`
4. Deploy. You get a `*.pages.dev` URL immediately.
5. **Custom domain:** project → **Custom domains → Set up a custom domain** →
   `trainicsi.com`. Add `www.trainicsi.com` too and let Cloudflare redirect
   one to the other. If the domain's nameservers already point at Cloudflare,
   the DNS records are added for you; otherwise add the CNAME/A records it
   shows you at your registrar.
6. **HTTPS** is provisioned and renewed automatically. Nothing to do.
7. After the domain is live, submit `https://trainicsi.com/sitemap.xml` in
   Google Search Console.

Netlify, GitHub Pages or Vercel work identically — same settings, no build
command, output the repo root.

**The `_headers` file** at the repo root is picked up automatically by
Cloudflare Pages — no extra configuration needed. It sets long cache
lifetimes for the video and image assets in `assets/product/`, since
they're versioned by filename and never need re-fetching once cached. If
you switch to Netlify, the equivalent is a `_headers` file in the same
format (Netlify supports the identical syntax); Vercel needs a small
`vercel.json` `headers` block instead — say if you end up there and I'll
write it.

---

## 8. Claims

Per your brief, nothing is invented: no clinical validation, regulatory
approvals, certifications, customer counts, institution names, improvement
percentages, awards, patents or testimonials. The dashboard and event log are
labelled illustrative and use fictional names. Procedure modules are framed as
varying by release. Roadmap items are tagged "In development" / "Coming soon".

**Update:** the claim *"TrainICSI, the world's first micromanipulation
training simulator"* is now live, as the hero H1 — at your explicit
instruction this revision. Earlier revisions held this phrase back
deliberately, pending your sign-off; that sign-off is now given, so it's
implemented directly, verbatim, exactly where you asked. If you ever want
it softened, moved (e.g. to the eyebrow line instead of the H1) or removed,
it's one line in `index.html` to change.

---

## 9. Accessibility & performance

Semantic HTML, a skip link, visible focus rings, keyboard-operable hotspots,
carousel and gallery, `aria-label`s on icon-only buttons, live-region form
status, and `prefers-reduced-motion` honoured everywhere. Contrast meets WCAG
AA — which is why the text-safe colour variants in §1 exist.

The whole site is three files plus images and loads three web fonts. There are
no JavaScript libraries. Keep it fast by exporting images as described in §3.

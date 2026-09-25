# TrainICSI — trainicsi.com

Single-page static marketing site. Plain HTML, CSS and JavaScript — no build
step, no framework, no backend, no database. Upload the folder and it runs.

```
trainicsi/
  index.html
  css/styles.css
  js/main.js
  _headers
  robots.txt
  sitemap.xml
  assets/
    logo/          trainicsi-logo.png/.svg, favicon.svg, favicon-32.png,
                   favicon-256.png  — already in place
    product/       hero-loop.mp4, solution-loop.mp4, control-cluster.jpg,
                   poster-hero.jpg, poster-pair.jpg — all rendered from the
                   real hardware model, already in place, see §2
    microscope/    microscope simulator photography        (needed)
    software/      dashboard / UI screenshots              (optional)
    conferences/   event photos, one sub-folder per event  (optional)
    founders/      founder portraits                       (needed)
    testimonials/  headshots for quotes                    (optional)
```

---

## 0. What changed in this revision

**Reverted the live in-browser 3D and went with pre-rendered video instead —
same source model, far more reliable.** The previous revision ran your
actual CAD model live in the browser via WebGL, with the camera driven by
scroll. Two real problems with that, both fixed by removing it:

1. **It broke on every browser, always**, because of a genuine bug (a
   missing "import map" that three.js requires since r120). It always fell
   back to static images with no indication why.
2. **Even fixed, it was the wrong trade-off here.** A full-viewport WebGL
   canvas meant the Hero/Solution/Controls sections had to give up their
   background to it, which pushed those sections to a dark full-bleed
   look — a real departure from the rest of the site's design, and it added
   a stack of moving parts (an import map, a CDN dependency, WebGL feature
   detection, a `file://` restriction that trips up any local preview) for
   a marketing site that should above all be simple to trust.

**What's here now, and it's been fixed twice more since the first video
attempt:**

- The very first video pass had two real bugs of its own, both caught by
  actually rendering test frames rather than assuming: the hero/solution
  cameras were orbiting a full 360° around an object that isn't
  round — the C-shaped arm extends further from its own centre than a
  fixed-radius circle accounts for, so parts of that loop swung the camera
  through the geometry. Fixed by swinging back and forth across a narrow,
  verified-safe arc (±14–16°) instead of a full orbit — still reads as
  continuous motion, never clips.
- The first framing was also rendered at a narrow portrait aspect, which
  crops far more tightly on the sides than the vertical field-of-view
  suggests for a wide subject like this hardware — that's what produced
  the oddly-cropped look. Re-rendered at aspects that actually fit the
  object's real proportions.
- The fallback still images also had harsh, blown-out lighting the first
  time (no tone-mapping applied offline, unlike what a real-time renderer
  would have done automatically). Re-rendered with a proper filmic tone
  curve — softer, more accurate contrast.

**End result:** Hero and Solution each play a short, silent, looping video
— rendered directly from the same textured CAD model, so it's still real
product geometry, not stock footage — inside the same contained boxes the
original design used. Controls uses one more still from that render pass,
with hotspot markers over it. All three sections are back to the site's
normal light background and layout. No WebGL, no external script
dependency, no import map, nothing that can silently fail — `<video>` and
`<img>` tags, exactly as robust as the rest of the page.

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

## 2. The product renders — how they were made, and how to update them

Three sections use real imagery generated from the CAD model you supplied
(`ICSI_All_dummy.3mf`), textured to match what your thumbnail showed (cream
body, black knurled knobs, a brushed-metal shaft split out of the main
casting, a teal accent collar, small red indicator pins) — nothing
invented. Camera angle is held in a narrow band (~10–13° above the
horizon) across every shot, so the base plate never appears, per your
instruction.

| Where | Asset | What it is |
|---|---|---|
| Hero | `assets/product/hero-loop.mp4` | ~4s silent loop, close on the shaft/cap detail, swinging gently across a ~16° arc. Seamless — start and end frames match exactly. `poster="poster-hero.jpg"` shows instantly while it buffers. |
| Solution | `assets/product/solution-loop.mp4` | ~4s silent loop, pulled back to show the matched pair, swinging across a ~14° arc. |
| Controls | `assets/product/control-cluster.jpg` | Still — close on the knob cluster (all four controls visible in-frame), with hotspots over it |

**Why video instead of live 3D:** it's the same visual quality (same model,
same lighting, same camera work) with none of the fragility — a `<video>`
tag works in every browser, needs no CDN, no feature detection, nothing
that can fail silently. If real product photography or footage becomes
available later, dropping it in is a straightforward swap — same
filenames, same spot in the layout.

**Why a gentle swing instead of a full spin:** the hardware isn't round —
the C-arm extends well beyond a simple circle centred on the object. A
full 360° orbit at a radius sized for the "front" of the object swings the
camera straight through the arm on the far side. A limited, verified arc
avoids that entirely while still reading as continuous, cinematic motion.

**Controls hotspots are precisely placed, not eyeballed.** The four marker
positions (`left`/`top` percentages on each `.hotspot` button in the
Controls section of `index.html`) were computed by projecting the actual 3D
coordinates of those knobs through the exact camera parameters used to
render `control-cluster.jpg` — then verified by drawing the computed points
back onto the render and checking them by eye before committing to the
numbers. If `control-cluster.jpg` is ever re-rendered from a different
angle, these four percentages need recalculating to match — they won't
transfer to a new image automatically.

**If you want to regenerate or extend these renders** (a different angle,
a longer loop, additional stills), that needs the same offline pipeline
used to make them — not something to redo by hand. Ask, and it can be
redone the same way.

---

## 3. Photographs to supply

Each placeholder in `index.html` is marked with an `ASSET:` comment giving the
exact path. Replace the `<div class="slot">…</div>` with an `<img>`:

| Priority | What | Path | Notes |
|---|---|---|---|
| **High** | Eyepiece view or unit | `assets/microscope/eyepiece-view.jpg` | Square. Either a screen capture of the real simulated field, or a photo of the physical eyepiece unit — whichever exists first. |
| **High** | Founder portraits ×2 | `assets/founders/apratim-arora.jpg`, `lokesh-sureliya.jpg` | Square, ~600×600, consistent lighting between the two. |
| Optional | Dashboard screenshot | `assets/software/session-review.png` | Replaces the illustrative dashboard once the real UI is final. |
| Optional | Conference photos | `assets/conferences/event-1/01.jpg` … | See §6. |
| Optional | Testimonial headshots | `assets/testimonials/name.jpg` | See §5. |

**If a photo is hard to arrange:** every slot degrades gracefully — a
labelled placeholder rather than a broken image. Get the microscope and
founder photos first; the rest can launch as placeholders.

Export photos as JPG at roughly 1600px on the long edge, quality ~80. That
keeps the site fast without visible loss.

---

## 4. The enquiry form

Posts to **Web3Forms** — free, no account wall, comfortably above the 15–20
submissions/month you asked for, and it works on a purely static host.

1. Go to https://web3forms.com, enter the TrainICSI contact email, and it
   emails you an access key.
2. In `index.html`, replace `YOUR_ACCESS_KEY_HERE`.

Done. Submissions arrive in that inbox; nothing is stored on the site. The
form submits without a page reload and shows inline success and error states.
It includes a hidden honeypot field for spam, and asks only for what's needed
to reply.

To use Tally or Formspree instead, swap the form's `action` URL and their
hidden fields — the markup and styling stay as they are.

---

## 5. Testimonials — the recommendation you asked for

**Use photographs, not text alone.** A quote with a face, a name, a
designation and an institution reads as evidence. The same quote without a
face reads as copywriting. For a young company borrowing credibility from
established names, the photo is doing most of the work — it's worth chasing
even a modest-quality headshot, or using the person's public conference/
LinkedIn photo with their permission.

**Show a few, not all of them.** You mentioned having a lot. Resist putting
them all on the page. Pick **4 to 6** with the most institutional or
reputational weight and lead with those. Volume signals *"we collected
feedback"*; the right five names signal *"serious people have used this."*
Ten good testimonials genuinely dilute three great ones, because a visitor
skims the first two and judges the rest by them.

The section is a horizontal carousel with arrows and dot pagination, so it
will hold as many as you add without any redesign — but treat that as
headroom, not a target.

If you want the rest visible somewhere, the honest option is a short line
under the carousel linking to a separate page or PDF of collected feedback.
Happy to add that if useful.

To add one, copy the commented `<figure class="tcard">` template inside the
testimonials section of `index.html`. Leave the dashed placeholders until a
real, approved quote replaces each — never paraphrase someone into a quote
they didn't say.

---

## 6. Conferences — the recommendation you asked for

**One card per event, not one card per photo**, and definitely not every
photo you have.

The section is built that way already: each card shows three preview tiles
plus a "+N" count, and clicking opens a gallery that pages through that
event's photos with arrow keys or on-screen buttons.

**Curate 6–10 photos per event.** Not fifty. A wall of every photo taken
reads as a personal event album; a tight, well-chosen set reads as a company
with a track record. For each event, aim for a mix of: the stand or setup,
someone actually using TrainICSI, a wide shot showing the crowd or scale, and
one or two good candid shots of conversations. Skip near-duplicates, blurry
frames, and photos where nobody's face is clear.

**Don't pre-make collages in an image editor.** The site builds the collage
from individual photos, so keeping them separate means the gallery works and
you can reorder them later. A pre-flattened collage can't be zoomed or paged
through.

Structure:

```
assets/conferences/
  event-1/01.jpg 02.jpg 03.jpg …
  event-2/01.jpg 02.jpg …
```

Then in each `<button class="conf">`, update `data-title`, the `data-images`
JSON array, the caption and the `+N` count, and put the three best photos in
as `<img>` inside `.collage`. Number the files in the order you want them
shown.

Three to five events on the strip is plenty — it's meant to be supporting
evidence, not the main event.

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

The phrase *"world's first and only micromanipulation simulation system"* is
**not** currently on the site. If you decide to use it, the natural home is
the hero eyebrow line (`<span class="coord">` under the mark) — one line, one
place, easy to change or remove later.

---

## 9. Accessibility & performance

Semantic HTML, a skip link, visible focus rings, keyboard-operable hotspots,
carousel and gallery, `aria-label`s on icon-only buttons, live-region form
status, and `prefers-reduced-motion` honoured everywhere. Contrast meets WCAG
AA — which is why the text-safe colour variants in §1 exist.

The whole site is three files plus images and loads three web fonts. There are
no JavaScript libraries. Keep it fast by exporting images as described in §3.

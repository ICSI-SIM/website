/* TrainICSI — interactions.
   No dependencies. Every animation checks prefers-reduced-motion. */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SMOOTH = REDUCED ? "auto" : "smooth";

  /* ---------- brand mark draws itself in, once, on load ---------- */
  const badge = $("#badge");
  if (badge) setTimeout(() => badge.classList.add("is-drawn"), 260);

  /* ---------- nav ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const panel = $("#navPanel");

  addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", scrollY > 8);
  }, { passive: true });

  const closePanel = () => {
    panel.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  toggle.addEventListener("click", () => {
    const open = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", panel).forEach(a => a.addEventListener("click", closePanel));
  addEventListener("keydown", e => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel();
  });

  /* ---------- current-section highlight in nav ---------- */
  const navLinks = $$(".nav-links a");
  const sections = navLinks
    .map(a => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a =>
          a.classList.toggle("is-current", a.getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- scroll reveal ---------- */
  const reveals = $$(".reveal");
  if (REDUCED || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(el => io.observe(el));
    // Failsafe: nothing should stay invisible if the observer misfires.
    setTimeout(() => reveals.forEach(el => el.classList.add("is-in")), 4000);
  }

  /* ---------- pentagon accents (a few hairline outlines per section) ----------
     Each `.pent-o` (declared per section in index.html) gets an outline-only
     pentagon SVG. Interaction is deliberately gentle: on pointer move each
     shape drifts a few px with its own depth (parallax) and brightens
     slightly when the cursor is near, easing back when it leaves. Only
     sections currently on screen are processed; nothing runs on touch
     devices or under prefers-reduced-motion. */
  const PENT = '<svg viewBox="0 0 100 100" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M50 3 97 37 79 95H21L3 37Z"/>';
  const PENT_ECHO = '<path class="inner" vector-effect="non-scaling-stroke" d="M50.0 22.8 80.1 44.6 68.6 81.7 31.4 81.7 19.9 44.6Z"/><path class="inner inner2" vector-effect="non-scaling-stroke" d="M50.0 40.4 65.0 51.3 59.3 69.8 40.7 69.8 35.0 51.3Z"/>';
  const pentEls = $$(".pent-o");
  pentEls.forEach(el => { el.innerHTML = PENT + (el.classList.contains("is-echo") ? PENT_ECHO : "") + "</svg>"; });

  if (pentEls.length && !REDUCED && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const MAX_SHIFT = 22;   // px at depth 1
    const NEAR_R = 260;     // px — proximity brightening radius
    const state = new Map(); // el -> { x, y, near }
    const visible = new Set();
    pentEls.forEach(el => state.set(el, { x: 0, y: 0, near: 0 }));
    const vio = new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? visible.add(en.target) : visible.delete(en.target));
    }, { rootMargin: "100px" });
    pentEls.forEach(el => vio.observe(el.closest(".has-ambient") || el));

    let mx = innerWidth / 2, my = innerHeight / 2, active = false, raf = 0;
    const tick = () => {
      raf = 0;
      let moving = false;
      pentEls.forEach(el => {
        const host = el.closest(".has-ambient") || el;
        if (!visible.has(host) && !visible.has(el)) return;
        const st = state.get(el), depth = parseFloat(el.dataset.depth) || 0.5;
        const nx = active ? (mx / innerWidth - 0.5) * 2 : 0;
        const ny = active ? (my / innerHeight - 0.5) * 2 : 0;
        const tx = nx * MAX_SHIFT * depth, ty = ny * MAX_SHIFT * depth;
        let tn = 0;
        if (active) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
          tn = Math.max(0, 1 - d / (NEAR_R + r.width / 2));
        }
        st.x += (tx - st.x) * 0.06; st.y += (ty - st.y) * 0.06; st.near += (tn - st.near) * 0.08;
        if (Math.abs(tx - st.x) > 0.05 || Math.abs(ty - st.y) > 0.05 || Math.abs(tn - st.near) > 0.005) moving = true;
        el.style.setProperty("--px", st.x.toFixed(2) + "px");
        el.style.setProperty("--py", st.y.toFixed(2) + "px");
        el.style.setProperty("--near", st.near.toFixed(3));
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; active = true; kick(); }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { active = false; kick(); });
  }

  /* ---------- hero parallax drift (upper, "theatrical" zone only) ---------- */
  const parallaxEls = $$("[data-parallax]");
  if (parallaxEls.length && !REDUCED) {
    let pTicking = false;
    const updateParallax = () => {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const host = el.closest("section") || el.parentElement;
        const rect = host.getBoundingClientRect();
        // Only move while the hero is at least partly on screen.
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        el.style.transform = `translate3d(0, ${rect.top * speed}px, 0) scale(1.06)`;
      });
      pTicking = false;
    };
    addEventListener("scroll", () => {
      if (!pTicking) { requestAnimationFrame(updateParallax); pTicking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- showcase: scroll-scrubbed product video ----------
     Real b-roll (not a render) mapped to scroll position inside a tall,
     pinned track. Falls back to a plain muted autoplay loop on touch
     devices and under reduced-motion, where frame-accurate scrubbing adds
     seek cost without adding clarity. */
  const showcase = $("#showcase");
  const scrubVideo = $("#scrubVideo");
  if (showcase && scrubVideo) {
    const lines = $$(".showcase-line", showcase);
    const COARSE = matchMedia("(pointer:coarse)").matches;

    const cycleLines = () => {
      if (!lines.length) return;
      let i = 0;
      setInterval(() => {
        lines[i].classList.remove("is-on");
        i = (i + 1) % lines.length;
        lines[i].classList.add("is-on");
      }, 2600);
    };

    if (REDUCED || COARSE || !("IntersectionObserver" in window)) {
      scrubVideo.autoplay = true;
      scrubVideo.loop = true;
      scrubVideo.play?.().catch(() => {});
      if (!REDUCED) cycleLines();
    } else {
      let active = false;
      const io = new IntersectionObserver(entries => {
        active = entries[0]?.isIntersecting ?? false;
      }, { threshold: 0 });
      io.observe(showcase);

      /* A scrubbed video can only show a frame it has already downloaded, and
         browsers don't buffer a whole <video> on their own. So fetch the file
         up front (right after first paint, not on scroll), hand it to the
         player as an in-memory blob, and only then enable scrubbing. Until
         it lands the poster image stays visible. If fetch isn't possible
         (e.g. opening index.html straight from disk) fall back to the plain
         <source>. */
      let ready = false;
      const markReady = () => { ready = true; updateScrub(); };
      const src = scrubVideo.querySelector("source")?.getAttribute("src");
      const useDirect = () => {
        scrubVideo.preload = "auto";
        if (scrubVideo.readyState >= 1) markReady();
        else scrubVideo.addEventListener("loadedmetadata", markReady, { once: true });
        scrubVideo.load();
      };
      const loadBlob = () => {
        fetch(src).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => {
          scrubVideo.addEventListener("loadeddata", markReady, { once: true });
          scrubVideo.preload = "auto";
          scrubVideo.src = URL.createObjectURL(b);
          scrubVideo.load();
        }).catch(useDirect);
      };

      let sTicking = false;
      const updateScrub = () => {
        sTicking = false;
        if (!active || !ready) return;
        const rect = showcase.getBoundingClientRect();
        const total = rect.height - innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
        if (scrubVideo.duration) scrubVideo.currentTime = progress * scrubVideo.duration;
        if (lines.length) {
          const idx = Math.min(lines.length - 1, Math.floor(progress * lines.length));
          lines.forEach((l, i) => l.classList.toggle("is-on", i === idx));
        }
      };
      addEventListener("scroll", () => {
        if (!sTicking) { requestAnimationFrame(updateScrub); sTicking = true; }
      }, { passive: true });
      addEventListener("resize", updateScrub);
      updateScrub();
      if (src && location.protocol !== "file:") loadBlob(); else useDirect();
    }
  }

  /* ---------- control hotspots (on the static rendered image) ---------- */
  const rig = $("#rig");
  if (rig) {
    const tip = $("#tip"), tipT = $("#tipT"), tipD = $("#tipD");
    const spots = $$(".hotspot", rig);

    const show = spot => {
      spots.forEach(s => s.classList.remove("is-on"));
      spot.classList.add("is-on");
      tipT.textContent = spot.dataset.t || "";
      tipD.textContent = spot.dataset.d || "";
      const r = rig.getBoundingClientRect(), h = spot.getBoundingClientRect();
      const w = 210;
      let x = h.left - r.left + h.width / 2 + 16;
      if (x + w > r.width) x = h.left - r.left - w - 4;
      tip.style.left = `${Math.max(x, 4)}px`;
      tip.style.top = `${Math.max(h.top - r.top - 6, 4)}px`;
      tip.classList.add("is-on");
    };
    const hide = () => {
      tip.classList.remove("is-on");
      spots.forEach(s => s.classList.remove("is-on"));
    };

    spots.forEach(s => {
      s.addEventListener("mouseenter", () => show(s));
      s.addEventListener("focus", () => show(s));
      s.addEventListener("click", e => { e.preventDefault(); show(s); });
    });
    rig.addEventListener("mouseleave", hide);
    rig.addEventListener("focusout", (e) => {
      if (!rig.contains(e.relatedTarget)) hide();
    });
  }

  /* ---------- procedures: hover/click swaps the right-hand image ----------
     Two stacked <img> layers (#procImg0/#procImg1) crossfade via opacity +
     a radial mask (the "feather" look is in CSS), so there's always one
     fading out underneath the one fading in — no hard cut. The active
     list item's caption becomes the overlay caption, and the sliding
     indicator bar tracks its position. */
  const procDisplay = $("#procDisplay");
  if (procDisplay) {
    const items = $$(".proc-item", procDisplay);
    const indicator = $("#procIndicator", procDisplay);
    const imgs = [$("#procImg0", procDisplay), $("#procImg1", procDisplay)];
    const caption = $("#procCaption", procDisplay);
    let onIdx = 0; // which of imgs[] is currently the visible layer

    const moveIndicator = item => {
      if (!indicator) return;
      const listRect = item.parentElement.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      indicator.style.top = `${r.top - listRect.top}px`;
      indicator.style.height = `${r.height}px`;
    };

    // One persistent fallback tile, shown only while the active procedure's
    // image is missing. (The old version hid an <img> layer for good after its
    // first error, which is why every other item went blank.)
    const stage = $("#procStage");
    const fallback = document.createElement("div");
    fallback.className = "procimg-fallback";
    fallback.textContent = "PROCEDURE PHOTOGRAPHY NOT YET ADDED";
    fallback.hidden = true;
    stage?.prepend(fallback);

    const loaded = new Set(), missing = new Set();
    items.forEach(it => {            // warm the cache so hover swaps are instant
      const src = it.dataset.img;
      const im = new Image();
      im.onload = () => loaded.add(src);
      im.onerror = () => missing.add(src);
      im.src = src;
    });

    let token = 0;
    const activate = item => {
      items.forEach(i => i.classList.toggle("is-active", i === item));
      moveIndicator(item);
      if (caption) caption.textContent = item.dataset.caption || "";
      const src = item.dataset.img, my = ++token;
      const show = ok => {
        if (my !== token) return;    // a newer hover has taken over
        fallback.hidden = ok;
        if (!ok) { imgs.forEach(i => i.classList.remove("is-on")); return; }
        const next = imgs[1 - onIdx], cur = imgs[onIdx];
        if (next.getAttribute("src") !== src) next.src = src;
        next.alt = `${item.querySelector(".pn")?.textContent || "Procedure"}, simulated.`;
        next.classList.add("is-on");
        cur.classList.remove("is-on");
        onIdx = 1 - onIdx;
      };
      if (loaded.has(src)) return show(true);
      if (missing.has(src)) return show(false);
      const probe = new Image();
      probe.onload = () => { loaded.add(src); show(true); };
      probe.onerror = () => { missing.add(src); show(false); };
      probe.src = src;
    };

    items.forEach(item => {
      item.addEventListener("mouseenter", () => activate(item));
      item.addEventListener("focus", () => activate(item));
      item.addEventListener("click", () => activate(item));
    });

    // Default state: first item active, positioned once the section has
    // laid out (so the indicator's getBoundingClientRect is accurate).
    requestAnimationFrame(() => { moveIndicator(items[0]); activate(items[0]); });
    addEventListener("resize", () => {
      const active = procDisplay.querySelector(".proc-item.is-active") || items[0];
      moveIndicator(active);
    });
  }

  /* ---------- tutorial chain cycles ---------- */
  const chain = $("#chain");
  if (chain && !REDUCED) {
    const items = $$("span", chain);
    let i = 0;
    setInterval(() => {
      items[i].classList.remove("is-on");
      i = (i + 1) % items.length;
      items[i].classList.add("is-on");
    }, 1500);
  }

  /* ---------- dashboard animates in ---------- */
  const dash = $(".dash");
  if (dash && "IntersectionObserver" in window) {
    const dio = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        $$("[data-fill]", dash).forEach(b => { b.style.width = `${b.dataset.fill}%`; });
        $("#spark")?.classList.add("is-drawn");
        obs.unobserve(dash);
      });
    }, { threshold: 0.35 });
    dio.observe(dash);
  }

  /* ---------- photo placeholders: graceful fallback if the file isn't in place yet ----------
     Testimonial and founder <img>s point straight at their expected
     filenames in assets/. Drop a correctly-named photo there and it just
     appears — nothing else to wire up. Until then, show a plain styled
     placeholder instead of a broken-image icon. */
  $$(".tavatar").forEach(img => {
    img.addEventListener("error", () => {
      const div = document.createElement("div");
      div.className = "tavatar-fallback";
      div.textContent = img.dataset.initials || "";
      img.replaceWith(div);
    }, { once: true });
  });
  $$(".fphoto").forEach(img => {
    // Accept .jpg, .jpeg, .png or .webp (e.g. lokesh-sureliya.jpeg) before giving up.
    const exts = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"];
    let i = 0;
    img.addEventListener("error", () => {
      const base = img.dataset.base;
      if (base && i < exts.length) { img.src = base + exts[i++]; return; }
      const div = document.createElement("div");
      div.className = "fphoto fphoto-fallback";
      img.replaceWith(div);
    });
  });
  $$(".confimg").forEach(img => {
    img.addEventListener("error", () => {
      const div = document.createElement("div");
      div.className = "confimg-fallback";
      div.textContent = "PHOTO NOT YET ADDED";
      img.replaceWith(div);
    }, { once: true });
  });

  /* ---------- testimonial carousel (scales to any number of cards) ---------- */
  const track = $("#ttrack");
  if (track) {
    const cards = Array.from(track.children);
    const dots = $("#tDots");

    cards.forEach((card, i) => {
      const d = document.createElement("span");
      if (i === 0) d.classList.add("is-on");
      d.addEventListener("click", () =>
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: SMOOTH }));
      dots.appendChild(d);
    });
    const allDots = Array.from(dots.children);

    const sync = () => {
      let best = 0, bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs((c.offsetLeft - track.offsetLeft) - track.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      });
      allDots.forEach((d, i) => d.classList.toggle("is-on", i === best));
    };
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });

    const nudge = dir => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      track.scrollBy({ left: dir * (cards[0].getBoundingClientRect().width + gap), behavior: SMOOTH });
    };
    $("#tPrev").addEventListener("click", () => nudge(-1));
    $("#tNext").addEventListener("click", () => nudge(1));
  }

  /* ---------- conference photo lightbox (simplified: single image, no album) ---------- */
  const lb = $("#lb");
  if (lb) {
    const stage = $("#lbStage");
    let opener = null;

    const open = tile => {
      const src = tile.dataset.src;
      if (!src) return;
      stage.textContent = "";
      const img = new Image();
      img.alt = tile.querySelector("img")?.alt || "";
      img.onload = () => { stage.textContent = ""; stage.appendChild(img); };
      img.onerror = () => { stage.textContent = "PHOTO NOT YET ADDED"; };
      img.src = src;
      opener = tile;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $("#lbClose").focus();
    };
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = "";
      opener?.focus();
    };

    $$(".conf-tile").forEach(t => t.addEventListener("click", () => open(t)));
    $("#lbClose").addEventListener("click", close);
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
    });
  }

  /* ---------- magnetic CTA ---------- */
  if (!REDUCED && matchMedia("(pointer:fine)").matches) {
    $$("[data-magnet]").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.1}px`);
        btn.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.25}px`);
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- contact phone numbers: lightly obfuscated in the markup ----------
     Each number is stored as a non-digit, shifted-character string (data-enc)
     rather than as plain digits, so a basic regex scrape of the page source
     won't turn up a phone number to harvest. Decoded here, at render time,
     for real visitors. Not bulletproof — nothing client-side ever is — but
     enough to stop the casual scraper that just reads the HTML. */
  const phoneOut = $("#phoneOut");
  if (phoneOut) {
    const OFFSET = 49;
    const decode = enc => enc.split("").map(c => String.fromCharCode(c.charCodeAt(0) - OFFSET)).join("");
    $$(".phone-row", phoneOut).forEach(row => {
      const digits = decode(row.dataset.enc || "");
      if (digits.length !== 10) return;
      const pretty = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

      const wa = document.createElement("a");
      wa.className = "wa-link";
      wa.href = `https://wa.me/91${digits}`;
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.setAttribute("aria-label", `Message ${row.dataset.name} on WhatsApp`);
      wa.innerHTML = '<svg class="glyph"><use href="#i-whatsapp"/></svg>';
      row.appendChild(wa);

      const a = document.createElement("a");
      a.href = `tel:+91${digits}`;
      a.textContent = `${row.dataset.name} — ${pretty}`;
      row.appendChild(a);
    });
  }

  /* ---------- year ---------- */
  const yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();

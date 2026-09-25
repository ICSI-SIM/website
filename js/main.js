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

  /* ---------- conference gallery lightbox ---------- */
  const lb = $("#lb");
  if (lb) {
    const stage = $("#lbStage"), titleEl = $("#lbTitle"), countEl = $("#lbCount");
    let imgs = [], title = "", i = 0, opener = null;

    const draw = () => {
      stage.textContent = "";
      const img = new Image();
      img.alt = `${title} — photo ${i + 1} of ${imgs.length}`;
      img.onload = () => { stage.textContent = ""; stage.appendChild(img); };
      img.onerror = () => { stage.textContent = `PHOTO ${i + 1} OF ${imgs.length} — NOT YET ADDED`; };
      img.src = imgs[i];
      titleEl.textContent = title;
      countEl.textContent = `${String(i + 1).padStart(2, "0")} / ${String(imgs.length).padStart(2, "0")}`;
    };
    const open = card => {
      try { imgs = JSON.parse(card.dataset.images || "[]"); } catch { imgs = []; }
      if (!imgs.length) return;
      title = card.dataset.title || "";
      i = 0; opener = card;
      draw();
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $("#lbClose").focus();
    };
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = "";
      opener?.focus();
    };
    const step = d => { if (imgs.length) { i = (i + d + imgs.length) % imgs.length; draw(); } };

    $$(".conf").forEach(c => c.addEventListener("click", () => open(c)));
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => step(-1));
    $("#lbNext").addEventListener("click", () => step(1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
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

  /* ---------- enquiry form ---------- */
  const form = $("#form");
  if (form) {
    const status = $("#fstatus");
    const say = (msg, state = "") => { status.dataset.s = state; status.textContent = msg; };

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const key = form.elements.access_key.value;
      if (!key || key === "YOUR_ACCESS_KEY_HERE") {
        say("Form not connected yet — add your Web3Forms access key (README §4).", "err");
        return;
      }
      say("Sending…");
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form)
        });
        const data = await res.json();
        if (data.success) {
          say("Thank you — we'll be in touch shortly.", "ok");
          form.reset();
        } else {
          say("That didn't send. Please try again, or email us directly.", "err");
        }
      } catch {
        say("Network problem. Please try again, or email us directly.", "err");
      }
    });
  }

  /* ---------- year ---------- */
  const yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();

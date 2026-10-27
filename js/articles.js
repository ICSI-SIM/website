/* TrainICSI — articles list.
   A static site can't list a folder, so articles/articles-data.js is the index.
   It is generated from the .html files in /articles by
   `node scripts/build-articles.js` (see README). It is a plain <script> (not
   fetch), so it also works when the site is opened straight from disk. If it
   is empty the page shows its "no articles yet" state. */
(() => {
  "use strict";
  const list  = document.getElementById("articleList");
  const empty = document.getElementById("articleEmpty");
  if (!list || !empty) return;

  const base = location.href.split(/[?#]/)[0].replace(/[^/]*$/, "");
  const showEmpty = () => { list.hidden = true; empty.hidden = false; };

  const fmt = iso => {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const items = window.TRAINICSI_ARTICLES;
  if (!Array.isArray(items) || !items.length) return showEmpty();
  items.forEach((a, i) => {
    const row = el("a", "row");
    row.href = base + a.url;
    row.appendChild(el("span", "idx", String(i + 1).padStart(2, "0")));

    const mid = el("div");
    mid.appendChild(el("h3", null, a.title));
    if (a.description) mid.appendChild(el("p", null, a.description));
    const tags = [fmt(a.date)].concat(a.tags || []).filter(Boolean);
    if (tags.length) {
      const t = el("div", "tags");
      tags.forEach(x => t.appendChild(el("span", "tag", x)));
      mid.appendChild(t);
    }
    row.appendChild(mid);

    const go = el("span", "go", "READ");
    go.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    row.appendChild(go);
    list.appendChild(row);
  });
  list.hidden = false;
  empty.hidden = true;
})();

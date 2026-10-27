#!/usr/bin/env node
/* TrainICSI — build the articles index.
 *
 * A static site cannot list a folder in the browser, so this script does it
 * ahead of time. Run it from the site root whenever you add, edit or remove
 * an article, then deploy:
 *
 *     node scripts/build-articles.js
 *
 * It scans  articles/*.html  (ignoring index.html and any file starting
 * with "_", such as _template.html), reads
 * each page's <title>, <meta name="description">, <meta name="keywords">
 * and <meta property="article:published_time">, then writes:
 *
 *     articles/articles-data.js (what the Articles page reads)
 *     sitemap.xml              (home, tools, articles and every article)
 *
 * No dependencies — just Node 14+.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ART = path.join(ROOT, "articles");
const SITE = "https://trainicsi.com";

const meta = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ""; };
const decode = s => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const metaContent = (html, attr, name) => {
  const a = new RegExp('<meta[^>]*' + attr + '=["\']' + name + '["\'][^>]*content=["\']([^"\']*)["\']', "i");
  const b = new RegExp('<meta[^>]*content=["\']([^"\']*)["\'][^>]*' + attr + '=["\']' + name + '["\']', "i");
  return meta(html, a) || meta(html, b);
};

const files = [];
if (fs.existsSync(ART)) {
  for (const name of fs.readdirSync(ART)) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const full = path.join(ART, name);
    const st = fs.statSync(full);
    if (st.isFile() && name.endsWith(".html") && name !== "index.html") files.push({ url: name, full, st });

  }
}

const items = files.map(f => {
  const html = fs.readFileSync(f.full, "utf8");
  const title = decode(meta(html, /<title[^>]*>([^<]*)<\/title>/i)).replace(/\s*[|–—-]\s*TrainICSI\s*$/i, "")
    || f.url.replace(/\.html$|\/$/g, "");
  const published = metaContent(html, "property", "article:published_time");
  const date = /^\d{4}-\d{2}-\d{2}/.test(published) ? published.slice(0, 10) : f.st.mtime.toISOString().slice(0, 10);
  const tags = decode(metaContent(html, "name", "keywords")).split(",").map(s => s.trim()).filter(Boolean);
  return { url: f.url, title, description: decode(metaContent(html, "name", "description")), date, tags };
}).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

fs.mkdirSync(ART, { recursive: true });
fs.writeFileSync(path.join(ART, "articles-data.js"), "window.TRAINICSI_ARTICLES = " + JSON.stringify(items, null, 2) + ";\n");

const today = new Date().toISOString().slice(0, 10);
const urls = [
  [SITE + "/", "monthly", "1.0", today],
  [SITE + "/tools/", "monthly", "0.7", today],
  [SITE + "/tools/ivf-kpi-calculator/", "monthly", "0.8", today],
  [SITE + "/articles/", "weekly", "0.7", today],
  ...items.map(a => [SITE + "/articles/" + a.url.replace(/index\.html$/, ""), "monthly", "0.6", a.date]),
];
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([loc, cf, pr, lm]) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lm}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`).join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);

console.log(items.length ? `Indexed ${items.length} article(s):` : "No articles found — the Articles page will show its empty state.");
items.forEach(a => console.log(`  ${a.date}  ${a.url}  —  ${a.title}`));
console.log("Wrote articles/articles-data.js and sitemap.xml");

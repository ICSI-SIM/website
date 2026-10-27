/* TrainICSI — IVF KPI calculator.
   Logic carried over unchanged from the original calculator (same inputs,
   validation, thresholds and remarks). Markup lives in
   tools/ivf-kpi-calculator/index.html; each card's button carries its own
   competency/benchmark values as data-* attributes. */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const errorNode = card => {
    let n = $(".calc-error", card);
    if (!n) {
      n = document.createElement("div");
      n.className = "calc-error";
      n.setAttribute("role", "alert");
      $(".calc-btn", card).insertAdjacentElement("afterend", n);
    }
    return n;
  };
  const fail = (card, msg, focusEl) => {
    const n = errorNode(card);
    n.textContent = msg;
    n.classList.add("show");
    if (focusEl) focusEl.focus();
  };

  // Remark bands. `lower` = lower is better (damage / failed-fertilization rates).
  const verdict = (rate, comp, bench, lower, strict) => {
    if (lower && strict) {   // hard cut-off KPI (failed fertilization): target is "< 5%", alert is ">= 5%"
      if (rate < bench)       return ["excellent", "Excellent"];
      if (rate <= comp * 1.5) return ["fair", "Needs Improvement"];
      return ["poor", "High Risk — Review Protocol"];
    }
    if (lower) {
      if (rate <= bench)      return ["excellent", "Excellent"];
      if (rate <= comp)        return ["good", "Within Competency"];
      if (rate <= comp * 1.5)  return ["fair", "Needs Improvement"];
      return ["poor", "High Risk — Review Protocol"];
    }
    if (rate >= bench)         return ["excellent", "Benchmark Achieved"];
    if (rate >= comp)          return ["good", "Meets Competency"];
    if (rate >= comp * 0.75)   return ["fair", "Below Competency"];
    return ["poor", "Significantly Below Target"];
  };
  const COLORS = { excellent: "var(--brand-green)", good: "var(--brand-blue)", fair: "#D99A2B", poor: "var(--danger)" };

  const calculate = btn => {
    const card = btn.closest(".kpi-card");
    if (!card) return;
    const id = btn.dataset.calc;
    const numIn = $("#" + id + "_num"), denIn = $("#" + id + "_den");
    const err = errorNode(card);
    err.textContent = ""; err.classList.remove("show");

    const nT = numIn.value.trim(), dT = denIn.value.trim();
    const num = nT === "" ? NaN : Number(nT), den = dT === "" ? NaN : Number(dT);
    if (!Number.isFinite(num) || !Number.isFinite(den)) return fail(card, "Enter both values to calculate the KPI.", nT === "" ? numIn : denIn);
    if (num < 0 || den < 0)  return fail(card, "Values cannot be negative.", num < 0 ? numIn : denIn);
    if (den <= 0)            return fail(card, "The total/denominator must be greater than zero.", denIn);
    if (num > den)           return fail(card, "The numerator cannot be greater than the total/denominator.", numIn);

    const comp = Number(btn.dataset.competency), bench = Number(btn.dataset.benchmark);
    const lower = btn.dataset.lowerBetter === "true", strict = btn.dataset.strict === "true";
    const rate = (num / den) * 100;
    const [cls, text] = verdict(rate, comp, bench, lower, strict);

    $("#val_" + id).textContent = rate.toFixed(1) + "%";
    const fill = $("#bar_" + id);
    fill.style.transition = "none";
    fill.style.width = "0%";
    fill.style.setProperty("--c", COLORS[cls]);
    void fill.offsetWidth;
    fill.style.transition = "";
    requestAnimationFrame(() => { fill.style.width = Math.max(0, Math.min(rate, 100)) + "%"; });

    const pill = $("#pill_" + id);
    pill.textContent = "";
    const v = document.createElement("span");
    v.className = "verdict " + cls;
    v.textContent = text;
    pill.appendChild(v);
    $("#res_" + id).classList.add("show");
  };

  // Category filter
  const chips = $$(".chip[data-filter]");
  const cards = $$(".kpi-card");
  chips.forEach(chip => chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    cards.forEach(c => { c.hidden = !(f === "all" || c.dataset.cat === f); });
  }));

  $$(".calc-btn[data-calc]").forEach(b => b.addEventListener("click", () => calculate(b)));
  $$(".field input").forEach(inp => {
    inp.setAttribute("inputmode", "decimal");
    inp.addEventListener("input", () => {
      const e = $(".calc-error", inp.closest(".kpi-card"));
      if (e) { e.textContent = ""; e.classList.remove("show"); }
    });
    inp.addEventListener("keydown", ev => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      const b = $(".calc-btn[data-calc]", inp.closest(".kpi-card"));
      if (b) calculate(b);
    });
  });
})();

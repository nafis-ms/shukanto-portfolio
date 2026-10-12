/* Hero tagline: one line, typed in character by character, then it stays.
   Load after cinematic.js. Self-contained (injects its own CSS). */
(function () {
  var p = document.querySelector(".hero .sub p");
  if (!p) return;

  var text = p.textContent.replace(/\s+/g, " ").trim();
  var chars = Array.from(text);
  var still = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- tweak these ---- */
  var START_DELAY = 1300;   /* ms after the intro finishes, before typing begins */
  var SPEED = 55;           /* ms per character (a little random jitter is added) */
  var CARET_HIDE = 2200;    /* ms the blinking caret stays after typing ends (0 = hide at once) */

  var st = document.createElement("style");
  st.textContent =
    ".hero .sub p.typed{position:relative;max-width:none;white-space:nowrap;min-height:1.6em;font-size:clamp(11px,3.5vw,19px)}" +
    ".typed .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
    ".typed .cur{display:inline-block;width:2px;height:1.05em;margin-left:3px;vertical-align:-.15em;background:var(--blue);animation:tcur .8s steps(1) infinite;transition:opacity .6s}" +
    ".typed .cur.typing{animation:none}" +
    ".typed .cur.off{opacity:0;animation:none}" +
    "@keyframes tcur{50%{opacity:0}}";
  document.head.appendChild(st);

  /* real text stays in the DOM for screen readers; the typed copy is decorative */
  var sr = document.createElement("span"), tx = document.createElement("span"), cur = document.createElement("span");
  sr.className = "sr"; sr.textContent = text;
  tx.setAttribute("aria-hidden", "true");
  cur.className = "cur typing"; cur.setAttribute("aria-hidden", "true");
  p.classList.add("typed");
  p.textContent = "";
  p.appendChild(sr); p.appendChild(tx);

  if (still) { tx.textContent = text; return; }
  p.appendChild(cur);

  function type() {
    var i = 0;
    (function next() {
      if (i >= chars.length) {
        cur.classList.remove("typing");
        setTimeout(function () { cur.classList.add("off"); }, CARET_HIDE);
        return;
      }
      var ch = chars[i++];
      tx.textContent += ch;
      setTimeout(next, SPEED * (0.7 + Math.random() * 0.6) + (ch === "\u2022" ? 140 : 0));
    })();
  }

  function boot() { setTimeout(type, START_DELAY); }
  var b = document.body;
  if (b.classList.contains("revealed")) boot();
  else {
    var mo = new MutationObserver(function () {
      if (b.classList.contains("revealed")) { mo.disconnect(); boot(); }
    });
    mo.observe(b, { attributes: true, attributeFilter: ["class"] });
  }
})();
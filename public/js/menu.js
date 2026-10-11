/* Mobile menu: the hamburger opens the full-screen link list (see css/mobile.css, max-width 900px). */
(function () {
  var h = document.querySelector("header"), b = document.getElementById("menuBtn"), L = document.getElementById("navLinks");
  if (!h || !b || !L) return;
  var mq = matchMedia("(max-width:900px)");
  function set(open) {
    h.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    b.setAttribute("aria-expanded", open ? "true" : "false");
    b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  b.addEventListener("click", function () { set(!h.classList.contains("menu-open")); });
  L.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", function (e) {
    if (e.key === "Escape" && h.classList.contains("menu-open")) { set(false); b.focus(); }
  });
  function onChange() { if (!mq.matches) set(false); } /* rotating or resizing to a wide screen closes it */
  if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
})();
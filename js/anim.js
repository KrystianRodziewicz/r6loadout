// Animacje (anime.js v3). Wszystko tu jest opcjonalne: bez biblioteki albo przy
// "prefers-reduced-motion" strona działa identycznie, tylko bez ruchu.

window.Anim = (function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ok = () => !reduce && typeof anime !== "undefined";

  // po animacji czyścimy inline transform, żeby hover z CSS znów działał
  const clear = (targets) => () => targets.forEach((t) => { t.style.transform = ""; t.style.opacity = ""; });

  function tiles(root) {
    if (!ok()) return;
    const t = [...root.querySelectorAll(".op-tile")];
    if (!t.length) return;
    anime({ targets: t, opacity: [0, 1], translateY: [18, 0], scale: [0.92, 1],
      delay: anime.stagger(14, { start: 40 }), duration: 420, easing: "easeOutCubic", complete: clear(t) });
  }

  function page(root) {
    if (!ok()) return;
    const icon = root.querySelector(".op-hero");
    const head = [...root.querySelectorAll(".page-head .grow > *")];
    const cards = [...root.querySelectorAll(".cards .card")];
    const rows = [...root.querySelectorAll(".setup-row, .setup-group h3, .map-card")];
    const tl = anime.timeline({ easing: "easeOutCubic" });
    if (icon) tl.add({ targets: icon, scale: [0.6, 1], rotate: [-8, 0], opacity: [0, 1], duration: 520, easing: "easeOutBack", complete: clear([icon]) });
    if (head.length) tl.add({ targets: head, translateX: [-18, 0], opacity: [0, 1], delay: anime.stagger(60), duration: 420, complete: clear(head) }, "-=380");
    if (cards.length) tl.add({ targets: cards, translateY: [14, 0], opacity: [0, 1], delay: anime.stagger(50), duration: 380, complete: clear(cards) }, "-=260");
    if (rows.length) tl.add({ targets: rows, translateY: [10, 0], opacity: [0, 1], delay: anime.stagger(30), duration: 320, complete: clear(rows) }, "-=240");
  }

  function markers(wrap) {
    if (!ok()) return;
    const t = [...wrap.querySelectorAll(".marker")];
    if (!t.length) return;
    anime({ targets: t, scale: [0, 1], opacity: [0, 1], delay: anime.stagger(45, { start: 120 }), duration: 420, easing: "easeOutBack", complete: clear(t) });
  }

  function setupView(el) {
    if (!ok()) return;
    anime({ targets: el, translateY: [16, 0], opacity: [0, 1], duration: 380, easing: "easeOutCubic", complete: clear([el]) });
  }

  function pulse(el) {
    if (!ok() || !el) return;
    anime({ targets: el, scale: [1, 1.45, 1.25], duration: 420, easing: "easeOutQuad", complete: clear([el]) });
  }

  function sidebar(root) {
    if (!ok()) return;
    const t = [...root.querySelectorAll(".op-item, .map-item")];
    if (!t.length || t.length > 120) return;
    anime({ targets: t, translateX: [-10, 0], opacity: [0, 1], delay: anime.stagger(8), duration: 260, easing: "easeOutQuad", complete: clear(t) });
  }

  return { tiles, page, markers, setupView, pulse, sidebar };
})();

// Animacje (anime.js v3) + animowane tło (Vanta NET na three.js).
// Wszystko opcjonalne: bez bibliotek albo przy "prefers-reduced-motion" strona działa bez ruchu.

window.Anim = (function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ok = () => !reduce && typeof anime !== "undefined";
  const clear = (targets) => () => targets.forEach((t) => { t.style.transform = ""; t.style.opacity = ""; });

  function tiles(root) {
    if (!ok()) return;
    const t = [...root.querySelectorAll(".op-tile")];
    if (!t.length) return;
    anime({ targets: t, opacity: [0, 1], translateY: [18, 0], scale: [0.92, 1],
      delay: anime.stagger(12, { start: 40 }), duration: 400, easing: "easeOutCubic", complete: clear(t) });
  }

  function page(root) {
    if (!ok()) return;
    const icon = root.querySelector(".op-hero");
    const head = [...root.querySelectorAll(".page-head .grow > *")];
    const cards = [...root.querySelectorAll(".anim-card")];
    const tl = anime.timeline({ easing: "easeOutCubic" });
    if (icon) tl.add({ targets: icon, scale: [0.6, 1], rotate: [-8, 0], opacity: [0, 1], duration: 520, easing: "easeOutBack", complete: clear([icon]) });
    if (head.length) tl.add({ targets: head, translateX: [-18, 0], opacity: [0, 1], delay: anime.stagger(60), duration: 420, complete: clear(head) }, "-=380");
    if (cards.length) tl.add({ targets: cards, translateY: [16, 0], opacity: [0, 1], delay: anime.stagger(70), duration: 420, complete: clear(cards) }, "-=260");
  }

  // Rysowanie broni: obrys "kreśli się", potem linie do dodatków i etykiety.
  function weapons(root) {
    if (!ok()) return;
    const cards = [...root.querySelectorAll(".wcard")];
    cards.forEach((card, ci) => {
      const shapes = [...card.querySelectorAll(".wpn > *")];
      const lines = [...card.querySelectorAll(".callout .ln")];
      const pts = [...card.querySelectorAll(".callout .pt")];
      const texts = [...card.querySelectorAll(".callout text")];
      const base = 120 + ci * 160;
      if (shapes.length) {
        anime({ targets: shapes, strokeDashoffset: [anime.setDashoffset, 0], duration: 900, delay: anime.stagger(25, { start: base }), easing: "easeInOutSine" });
        anime({ targets: shapes, fillOpacity: [0, 1], duration: 500, delay: base + 500, easing: "linear" });
      }
      if (lines.length) {
        anime({ targets: lines, strokeDashoffset: [anime.setDashoffset, 0], duration: 500, delay: anime.stagger(120, { start: base + 700 }), easing: "easeOutQuad" });
        anime({ targets: pts, scale: [0, 1], duration: 300, delay: anime.stagger(120, { start: base + 700 }), easing: "easeOutBack" });
        anime({ targets: texts, opacity: [0, 1], translateY: [6, 0], duration: 350, delay: anime.stagger(120, { start: base + 1050 }), easing: "easeOutQuad" });
      }
    });
  }

  function sidebar(root) {
    if (!ok()) return;
    const t = [...root.querySelectorAll(".op-item")];
    if (!t.length || t.length > 120) return;
    anime({ targets: t, translateX: [-10, 0], opacity: [0, 1], delay: anime.stagger(6), duration: 240, easing: "easeOutQuad", complete: clear(t) });
  }

  function rows(root) {
    if (!ok()) return;
    const t = [...root.querySelectorAll(".lrow")];
    if (!t.length) return;
    anime({ targets: t, translateY: [8, 0], opacity: [0, 1], delay: anime.stagger(10, { start: 30 }), duration: 300, easing: "easeOutQuad", complete: clear(t) });
  }

  // ---- animowane tło (Vanta NET) ----
  let vantaInstance = null;
  function vanta(el) {
    vantaDestroy();
    if (reduce || !el || typeof VANTA === "undefined" || typeof THREE === "undefined") return;
    try {
      vantaInstance = VANTA.NET({
        el, mouseControls: true, touchControls: true, gyroControls: false,
        minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
        color: 0xf5a524, backgroundColor: 0x0e1014, points: 9, maxDistance: 22, spacing: 18, showDots: true,
      });
    } catch { vantaInstance = null; }
  }
  function vantaDestroy() {
    if (vantaInstance) { try { vantaInstance.destroy(); } catch { /* ignoruj */ } vantaInstance = null; }
  }

  return { tiles, page, weapons, sidebar, rows, vanta, vantaDestroy };
})();

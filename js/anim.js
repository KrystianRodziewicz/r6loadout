// Animacje (anime.js v3) + animowane tło (Vanta NET na three.js).
// Wszystko opcjonalne: bez bibliotek, przy "prefers-reduced-motion" albo gdy karta jest w tle,
// strona od razu pokazuje stan końcowy.

window.Anim = (function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ok = () => !reduce && typeof anime !== "undefined" && !document.hidden;
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
    const icon = root.querySelector(".page-head .op-icon.xl");
    const head = [...root.querySelectorAll(".page-head .grow > *, .map-hero-in > *")];
    const cards = [...root.querySelectorAll(".anim-card")];
    const tl = anime.timeline({ easing: "easeOutCubic" });
    if (icon) tl.add({ targets: icon, scale: [0.6, 1], rotate: [-8, 0], opacity: [0, 1], duration: 480, easing: "easeOutBack", complete: clear([icon]) });
    if (head.length) tl.add({ targets: head, translateX: [-18, 0], opacity: [0, 1], delay: anime.stagger(60), duration: 400, complete: clear(head) }, icon ? "-=360" : 0);
    if (cards.length) tl.add({ targets: cards, translateY: [14, 0], opacity: [0, 1], delay: anime.stagger(35), duration: 380, complete: clear(cards) }, "-=260");
  }

  // Karty broni: broń wjeżdża, potem linie "kreślą się" do dodatków i pojawiają się etykiety.
  function weapons(root) {
    if (!ok()) return;
    [...root.querySelectorAll(".wcard")].forEach((card, ci) => {
      const base = 100 + ci * 140;
      const gun = card.querySelector(".wimg, .wsil");
      const lines = [...card.querySelectorAll(".callout .ln")];
      const pts = [...card.querySelectorAll(".callout .pt")];
      const labels = [...card.querySelectorAll(".callout .aico, .callout text")];
      anime({ targets: card, opacity: [0, 1], translateY: [14, 0], duration: 380, delay: base - 100, easing: "easeOutCubic", complete: clear([card]) });
      if (gun) anime({ targets: gun, opacity: [0, 1], translateX: [-26, 0], duration: 520, delay: base, easing: "easeOutCubic", complete: clear([gun]) });
      if (lines.length) {
        anime({ targets: lines, strokeDashoffset: [anime.setDashoffset, 0], duration: 460, delay: anime.stagger(110, { start: base + 380 }), easing: "easeOutQuad",
          complete: () => lines.forEach((l) => { l.style.strokeDasharray = ""; l.style.strokeDashoffset = ""; }) });
        anime({ targets: pts, opacity: [0, 1], duration: 240, delay: anime.stagger(110, { start: base + 380 }), easing: "linear", complete: clear(pts) });
        anime({ targets: labels, opacity: [0, 1], duration: 320, delay: anime.stagger(40, { start: base + 700 }), easing: "easeOutQuad", complete: clear(labels) });
      }
    });
  }

  // Sylwetka operatora: wjeżdża z prawej, nazwa w tle pojawia się wolniej.
  function figure(root) {
    if (!ok()) return;
    const img = root.querySelector(".fig-img, .op-figure.nofig .fig-fallback");
    const name = root.querySelector(".fig-name");
    if (img) anime({ targets: img, opacity: [0, 1], translateX: [50, 0], duration: 700, delay: 120, easing: "easeOutCubic", complete: clear([img]) });
    if (name) anime({ targets: name, opacity: [0, 1], translateY: [-20, 0], duration: 900, delay: 200, easing: "easeOutCubic", complete: clear([name]) });
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

  return { tiles, page, weapons, figure, sidebar, rows, vanta, vantaDestroy };
})();

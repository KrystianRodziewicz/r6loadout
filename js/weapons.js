// Karta broni jak w ekranie wyposażenia: grafika broni, linie do miejsc montażu dodatków,
// przy każdej linii ikona dodatku, nazwa slotu i wartość. Pod spodem "kiedy brać".
// Gdy brakuje grafiki broni (nowsze modele), rysujemy stylizowany schemat wg klasy.

window.Weapons = (function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const T = (k, v) => I18n.t(k, v);

  // ---------- schematy zapasowe (własny układ ~400x150, skalowany do płótna 290x100) ----------
  const SIL_T = { dx: 16, dy: 8, s: 0.62 };
  const SIL = {
    ar: { shapes: `<path d="M0 44 L72 40 L72 70 L0 76 Z"/><rect x="70" y="34" width="140" height="34" rx="3"/><rect x="76" y="28" width="130" height="6"/><rect x="208" y="36" width="96" height="28" rx="4"/><rect x="302" y="44" width="80" height="10"/><rect x="380" y="41" width="18" height="16" rx="2"/><path d="M118 68 L146 68 L140 108 L116 108 Z"/><path d="M160 68 L198 68 L194 112 L166 112 Z"/>`,
      anchors: { sight: [148, 28], barrel: [398, 49], grip: [245, 64], under: [311, 64] } },
    smg: { shapes: `<path d="M0 40 L60 40 M0 40 L0 72 L60 72" class="hollow"/><rect x="58" y="32" width="112" height="34" rx="4"/><rect x="168" y="36" width="60" height="26" rx="4"/><rect x="228" y="44" width="48" height="9"/><rect x="274" y="41" width="16" height="15" rx="2"/><path d="M96 66 L124 66 L118 108 L94 108 Z"/><path d="M132 66 L158 66 L156 128 L134 128 Z"/>`,
      anchors: { sight: [120, 32], barrel: [290, 48], grip: [196, 62], under: [240, 53] } },
    shotgun: { shapes: `<path d="M0 42 L70 38 L70 70 L0 78 Z"/><rect x="68" y="34" width="100" height="30" rx="3"/><rect x="168" y="38" width="200" height="10"/><rect x="168" y="50" width="150" height="8"/><rect x="210" y="46" width="56" height="18" rx="3"/><path d="M100 64 L128 64 L122 100 L98 100 Z"/>`,
      anchors: { sight: [130, 34], barrel: [368, 43], grip: [238, 64], under: [300, 58] } },
    lmg: { shapes: `<path d="M0 44 L72 40 L72 72 L0 78 Z"/><rect x="70" y="32" width="150" height="38" rx="3"/><rect x="218" y="36" width="90" height="30" rx="4"/><rect x="306" y="44" width="80" height="12"/><rect x="384" y="41" width="18" height="18" rx="2"/><path d="M120 70 L148 70 L142 108 L118 108 Z"/><rect x="156" y="70" width="60" height="44" rx="4"/>`,
      anchors: { sight: [146, 32], barrel: [402, 50], grip: [257, 66], under: [300, 66] } },
    pistol: { shapes: `<rect x="110" y="40" width="170" height="26" rx="4"/><rect x="110" y="62" width="150" height="14"/><rect x="278" y="46" width="22" height="12" rx="2"/><path d="M164 76 L206 76 L196 134 L150 134 Z"/>`,
      anchors: { sight: [215, 40], barrel: [300, 52], under: [240, 76], grip: [264, 66] } },
  };
  SIL.dmr = SIL.sniper = SIL.ar;
  SIL.mp = SIL.revolver = SIL.pistol;

  const SLOTS = ["sight", "barrel", "grip", "under"];

  function classOf(name, fallback) {
    if (!name) return fallback;
    if (WEAPONS[name]) return WEAPONS[name];
    const key = Object.keys(WEAPONS).find((k) => k.toLowerCase() === String(name).toLowerCase());
    return key ? WEAPONS[key] : fallback;
  }

  function imageFor(name) {
    if (typeof WEAPON_IMAGES === "undefined") return null;
    const key = (typeof WEAPON_IMAGE_ALIAS !== "undefined" && WEAPON_IMAGE_ALIAS[name]) || slug(name);
    return WEAPON_IMAGES[key] || null;
  }

  function attachments(w, cls, side) {
    const d = DEFAULT_ATTACHMENTS[cls] || {};
    const pick = (k) => {
      if (w[k] !== undefined && w[k] !== null && w[k] !== "") return w[k];
      const v = d[k];
      if (!v) return "—";
      return typeof v === "object" ? (v[side] || v.atak) : v;
    };
    return { sight: pick("sight"), barrel: pick("barrel"), grip: pick("grip"), under: pick("under") };
  }

  // Ikona dodatku (img/attachments/...) dobrana po nazwie wartości.
  function iconFor(slot, value) {
    const v = String(value || "").toLowerCase();
    const p = "img/attachments/";
    if (slot === "sight") {
      if (v.includes("iron")) return p + "sights/iron-sight.svg";
      if (v.includes("holo")) return p + "sights/holo-a.svg";
      if (v.includes("red dot c")) return p + "sights/red-dot-c.svg";
      if (v.includes("red dot")) return p + "sights/red-dot-a.svg";
      if (v.includes("reflex")) return p + "sights/reflex-a.svg";
      if (v.includes("telescop") || /\dx/.test(v)) return p + "sights/telescopic-a.svg";
      if (v.includes("magnif")) return p + "sights/magnified-a.svg";
      return p + "slots/sight.svg";
    }
    if (slot === "barrel") {
      if (v.includes("flash")) return p + "barrels/flash-hider.svg";
      if (v.includes("muzzle")) return p + "barrels/muzzle-brake.svg";
      if (v.includes("compens")) return p + "barrels/compensator.svg";
      if (v.includes("suppress")) return p + "barrels/suppressor.svg";
      if (v.includes("extend")) return p + "barrels/extended-barrel.svg";
      return p + "slots/barrel.svg";
    }
    if (slot === "grip") {
      if (v.includes("vertical")) return p + "grips/vertical-grip.svg";
      if (v.includes("angled")) return p + "grips/angled-grip.svg";
      if (v.includes("horizontal")) return p + "grips/horizontal-grip.svg";
      return p + "slots/grip.svg";
    }
    return v.includes("laser") ? p + "under/laser.svg" : p + "slots/under-barrel.svg";
  }

  function gadgetIcon(name) {
    const key = (typeof GADGET_ICONS !== "undefined") && GADGET_ICONS[String(name || "").toLowerCase()];
    return key ? `img/gadgets/${key}.svg` : null;
  }

  // ---------- linie do dodatków ----------
  // Układ w jednostkach płótna broni (zwykle 290x100). Etykiety siedzą w pasach nad i pod płótnem:
  // góra: celownik i lufa, dół: chwyt i podlufowe. Kierunek etykiety dobieramy tak, żeby się nie nachodziły.
  const ROW_TOP = -16, ROW_BOT = 116, ELBOW = 8, ICON = 20, GAP = 3, CHAR = 5.9;

  function callouts(att, A, W) {
    const has = (k) => A && A[k] && att[k] && att[k] !== "—";
    const need = (k) => Math.max(String(att[k]).length, T(k).length * 0.7) * CHAR;
    const reach = ELBOW + GAP + ICON + GAP;   // od linii do początku tekstu
    const plan = [];

    if (has("sight")) plan.push({ k: "sight", top: true, dir: -1 });
    if (has("barrel")) {
      const bx = A.barrel[0];
      let dir = (bx + reach + need("barrel") <= W + 12) ? 1 : -1;
      if (dir === -1 && has("sight") && bx - reach - need("barrel") < A.sight[0] + 6) dir = 1;
      plan.push({ k: "barrel", top: true, dir });
    }
    const low = ["grip", "under"].filter(has).sort((p, q) => A[p][0] - A[q][0]);
    if (low.length === 2) {
      plan.push({ k: low[0], top: false, dir: -1 }, { k: low[1], top: false, dir: 1 });
    } else if (low.length === 1) {
      const x = A[low[0]][0];
      plan.push({ k: low[0], top: false, dir: (x + reach + need(low[0]) <= W + 12) ? 1 : -1 });
    }

    return plan.map(({ k, top, dir }) => {
      const [ax, ay] = A[k];
      const row = top ? ROW_TOP : ROW_BOT;
      const ex = ax + dir * ELBOW;
      const ix = dir > 0 ? ex + GAP : ex - GAP - ICON;
      const tx = dir > 0 ? ix + ICON + GAP : ix - GAP;
      return `<g class="callout">
        <polyline class="ln" points="${ax},${ay} ${ax},${row} ${ex},${row}"/>
        <circle class="pt" cx="${ax}" cy="${ay}" r="2.4"/>
        <rect class="aibg" x="${ix}" y="${row - ICON / 2}" width="${ICON}" height="${ICON}" rx="3"/>
        <image class="aico" href="${esc(iconFor(k, att[k]))}" x="${ix + 1.5}" y="${row - ICON / 2 + 1.5}" width="${ICON - 3}" height="${ICON - 3}"/>
        <text class="lab" x="${tx}" y="${row - 3}" text-anchor="${dir > 0 ? "start" : "end"}">${esc(T(k))}</text>
        <text class="val" x="${tx}" y="${row + 8.5}" text-anchor="${dir > 0 ? "start" : "end"}">${esc(att[k])}</text>
      </g>`;
    }).join("");
  }

  // ---------- "kiedy brać" ----------
  function when(w, slot, op) {
    if (w.when) return I18n.tx(w.when);
    const txt = T("when_txt");
    const lo = (op && op.loadout) || {};
    if (slot === "alt" && lo.primary && lo.primary.weapon === w.weapon) return txt.variant;
    const cls = classOf(w.weapon, slot === "secondary" ? "pistol" : "ar");
    const isSlug = typeof SLUG_SHOTGUNS !== "undefined" && SLUG_SHOTGUNS.includes(w.weapon);
    if (slot === "secondary") {
      if (w.weapon === "Bailiff 410") return txt.s_bailiff;
      return txt["s_" + cls] || txt.s_pistol;
    }
    const pre = slot === "primary" ? "p_" : "a_";
    if (isSlug) return txt[pre + "slug"];
    if (cls === "sniper" && slot === "alt") return txt.a_dmr;
    return txt[pre + cls] || txt[pre + "ar"];
  }

  // ---------- karta ----------
  // w: { weapon, sight, barrel, grip, under, note, when }, slot: "primary" | "alt" | "secondary"
  function card(w, side, slot, slotLabel, op, extraClass) {
    if (!w || !w.weapon) return "";
    const cls = classOf(w.weapon, slot === "secondary" ? "pistol" : "ar");
    const att = attachments(w, cls, side);
    const img = imageFor(w.weapon);
    const hasAtt = SLOTS.some((k) => att[k] && att[k] !== "—");

    let W = 290, H = 100, body, anchors;
    if (img) {
      W = img.w; H = img.h; anchors = img.a;
      body = `<img class="wimg" src="${esc(img.src)}" alt="${esc(w.weapon)}" loading="lazy">`;
    } else {
      const sil = SIL[cls];
      if (sil) {
        const { dx, dy, s } = SIL_T;
        anchors = {};
        for (const k of Object.keys(sil.anchors)) anchors[k] = [Math.round(sil.anchors[k][0] * s + dx), Math.round(sil.anchors[k][1] * s + dy)];
        body = `<svg class="wsil" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(w.weapon)}"><g class="wpn" transform="translate(${dx},${dy}) scale(${s})">${sil.shapes}</g></svg>`;
      } else {
        anchors = {};
        body = `<div class="wnone">${esc(w.weapon)}</div>`;
      }
    }

    const note = I18n.tx(w.note);
    const whenTxt = [when(w, slot, op), note].filter(Boolean).join(" ");

    return `
      <div class="wcard ${slot} ${extraClass || ""}">
        <div class="wcard-head">
          <span class="wslot">${esc(slotLabel)}</span>
          <h3>${esc(w.weapon)}</h3>
          <span class="wclass">${esc(T("cls")[cls] || cls)}</span>
        </div>
        <div class="wfig">
          <div class="wbox" style="aspect-ratio:${W}/${H}">
            ${body}
            <svg class="wco" viewBox="0 0 ${W} ${H}" aria-hidden="true">${hasAtt ? callouts(att, anchors, W) : ""}</svg>
          </div>
          ${hasAtt ? "" : `<span class="wnoatt">${esc(T("no_att"))}</span>`}
        </div>
        <p class="wwhen"><span class="ibadge" aria-hidden="true">i</span><span><b>${esc(T("when"))}:</b> ${esc(whenTxt)}</span></p>
      </div>`;
  }

  // wiersz do listy: "556XI · Magnified · Flash hider · Vertical grip · Laser"
  function line(w, side, slot) {
    if (!w || !w.weapon) return "";
    const cls = classOf(w.weapon, slot === "secondary" ? "pistol" : "ar");
    const att = attachments(w, cls, side);
    const parts = SLOTS.map((k) => att[k]).filter((v) => v && v !== "—");
    return `<b>${esc(w.weapon)}</b>${parts.length ? ` <span class="muted">· ${parts.map(esc).join(" · ")}</span>` : ""}`;
  }

  function thumb(name) {
    const img = imageFor(name);
    return img ? `<img class="wthumb" src="${esc(img.src)}" alt="" loading="lazy">` : `<span class="wthumb"></span>`;
  }

  return { card, line, thumb, classOf, attachments, imageFor, gadgetIcon, when };
})();

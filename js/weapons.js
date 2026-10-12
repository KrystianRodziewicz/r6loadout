// Rysowanie broni: schemat "blueprint" w SVG + linie wskazujące dodatki (celownik, lufa, chwyt, laser),
// w stylu ekranu loadoutu z gry. Sylwetki są stylizowane wg klasy broni, nie są modelami z gry.

window.Weapons = (function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Sylwetki w układzie lokalnym ~400x150. anchors = punkty, z których wychodzą linie do opisów.
  const SIL = {
    ar: {
      shapes: `<path d="M0 44 L72 40 L72 70 L0 76 Z"/><rect x="70" y="34" width="140" height="34" rx="3"/><rect x="76" y="28" width="130" height="6"/>
        <rect x="208" y="36" width="96" height="28" rx="4"/><rect x="302" y="44" width="80" height="10"/><rect x="380" y="41" width="18" height="16" rx="2"/>
        <path d="M118 68 L146 68 L140 108 L116 108 Z"/><path d="M150 68 h26 v10 h-26 z" class="hollow"/><path d="M160 68 L198 68 L194 112 L166 112 Z"/>
        <rect x="238" y="64" width="14" height="24" rx="3" class="acc"/><rect x="300" y="58" width="22" height="10" rx="2" class="acc"/><rect x="120" y="14" width="56" height="16" rx="3" class="acc"/>`,
      anchors: { sight: [148, 14], barrel: [398, 49], grip: [245, 88], under: [311, 68] },
    },
    smg: {
      shapes: `<path d="M0 40 L60 40 M0 40 L0 72 L60 72" class="hollow"/><rect x="58" y="32" width="112" height="34" rx="4"/><rect x="64" y="26" width="100" height="6"/>
        <rect x="168" y="36" width="60" height="26" rx="4"/><rect x="228" y="44" width="48" height="9"/><rect x="274" y="41" width="16" height="15" rx="2"/>
        <path d="M96 66 L124 66 L118 108 L94 108 Z"/><path d="M132 66 L158 66 L156 128 L134 128 Z"/>
        <rect x="190" y="62" width="12" height="22" rx="3" class="acc"/><rect x="230" y="56" width="20" height="9" rx="2" class="acc"/><rect x="96" y="12" width="48" height="16" rx="3" class="acc"/>`,
      anchors: { sight: [120, 12], barrel: [290, 48], grip: [196, 84], under: [240, 65] },
    },
    shotgun: {
      shapes: `<path d="M0 42 L70 38 L70 70 L0 78 Z"/><rect x="68" y="34" width="100" height="30" rx="3"/><rect x="168" y="38" width="200" height="10"/>
        <rect x="168" y="50" width="150" height="8"/><rect x="210" y="46" width="56" height="18" rx="3"/><path d="M100 64 L128 64 L122 100 L98 100 Z"/>
        <rect x="110" y="18" width="40" height="14" rx="3" class="acc"/><rect x="300" y="60" width="20" height="9" rx="2" class="acc"/>`,
      anchors: { sight: [130, 18], barrel: [368, 43], grip: [238, 64], under: [310, 69] },
    },
    dmr: {
      shapes: `<path d="M0 40 L76 38 L76 72 L0 80 Z"/><rect x="8" y="30" width="50" height="10" rx="3"/><rect x="74" y="34" width="150" height="34" rx="3"/><rect x="80" y="28" width="140" height="6"/>
        <rect x="222" y="37" width="90" height="26" rx="4"/><rect x="310" y="45" width="100" height="8"/><rect x="400" y="42" width="20" height="14" rx="2"/>
        <path d="M124 68 L152 68 L146 106 L122 106 Z"/><path d="M166 68 L204 68 L200 100 L170 100 Z"/>
        <rect x="240" y="63" width="36" height="10" rx="3" class="acc"/><rect x="110" y="8" width="90" height="20" rx="6" class="acc"/><rect x="100" y="12" width="12" height="12" class="acc"/><rect x="198" y="12" width="12" height="12" class="acc"/>
        <rect x="312" y="57" width="22" height="9" rx="2" class="acc"/>`,
      anchors: { sight: [155, 8], barrel: [420, 49], grip: [258, 73], under: [323, 66] },
    },
    lmg: {
      shapes: `<path d="M0 44 L72 40 L72 72 L0 78 Z"/><rect x="70" y="32" width="150" height="38" rx="3"/><rect x="76" y="26" width="140" height="6"/>
        <rect x="218" y="36" width="90" height="30" rx="4"/><rect x="306" y="44" width="80" height="12"/><rect x="384" y="41" width="18" height="18" rx="2"/>
        <path d="M120 70 L148 70 L142 108 L118 108 Z"/><rect x="156" y="70" width="60" height="44" rx="4"/><path d="M300 66 L288 110 M310 66 L322 110" class="hollow"/>
        <rect x="250" y="66" width="14" height="22" rx="3" class="acc"/><rect x="118" y="12" width="56" height="16" rx="3" class="acc"/><rect x="300" y="60" width="22" height="9" rx="2" class="acc"/>`,
      anchors: { sight: [146, 12], barrel: [402, 50], grip: [257, 88], under: [311, 69] },
    },
    sniper: {
      shapes: `<path d="M0 36 L80 34 L80 76 L0 84 Z"/><rect x="10" y="26" width="56" height="10" rx="3"/><rect x="78" y="36" width="130" height="30" rx="3"/><path d="M150 36 L160 20 L172 20" class="hollow"/>
        <rect x="208" y="44" width="180" height="8"/><rect x="386" y="40" width="26" height="16" rx="3"/><path d="M118 66 L146 66 L140 104 L116 104 Z"/><rect x="160" y="66" width="36" height="20" rx="3"/>
        <path d="M250 52 L238 100 M262 52 L274 100" class="hollow"/>
        <rect x="104" y="6" width="110" height="22" rx="8" class="acc"/><rect x="92" y="10" width="14" height="14" class="acc"/><rect x="212" y="10" width="14" height="14" class="acc"/>`,
      anchors: { sight: [160, 6], barrel: [412, 48], grip: [256, 100], under: [300, 52] },
    },
    pistol: {
      shapes: `<rect x="110" y="40" width="170" height="26" rx="4"/><rect x="110" y="62" width="150" height="14"/><rect x="278" y="46" width="22" height="12" rx="2"/>
        <path d="M164 76 L206 76 L196 134 L150 134 Z"/><path d="M212 76 h28 v14 h-28 z" class="hollow"/>
        <rect x="200" y="30" width="30" height="10" rx="2" class="acc"/><rect x="236" y="76" width="30" height="10" rx="2" class="acc"/>`,
      anchors: { sight: [215, 30], barrel: [300, 52], under: [251, 86] },
    },
    mp: {
      shapes: `<path d="M110 50 L40 50 L40 90 L80 90" class="hollow"/><rect x="110" y="40" width="160" height="28" rx="4"/><rect x="268" y="46" width="24" height="12" rx="2"/>
        <path d="M160 68 L200 68 L192 120 L148 120 Z"/><path d="M170 120 L190 120 L186 150 L166 150 Z"/>
        <rect x="190" y="28" width="36" height="12" rx="2" class="acc"/><rect x="226" y="68" width="30" height="10" rx="2" class="acc"/>`,
      anchors: { sight: [208, 28], barrel: [292, 52], under: [241, 78] },
    },
    revolver: {
      shapes: `<rect x="120" y="44" width="160" height="22" rx="4"/><circle cx="196" cy="60" r="18"/><rect x="214" y="46" width="80" height="14" rx="3"/>
        <path d="M150 66 L188 66 L176 124 L134 124 Z"/><path d="M128 44 L118 30 L130 30" class="hollow"/>
        <rect x="250" y="36" width="30" height="8" rx="2" class="acc"/>`,
      anchors: { sight: [265, 36], barrel: [294, 53], under: [240, 70] },
    },
    shield: {
      shapes: `<rect x="110" y="6" width="180" height="128" rx="14"/><rect x="170" y="26" width="60" height="26" rx="3" class="acc"/><rect x="60" y="60" width="50" height="14" rx="4"/>
        <path d="M130 100 h140 M130 112 h140" class="hollow"/>`,
      anchors: {},
    },
    launcher: {
      shapes: `<rect x="90" y="40" width="240" height="34" rx="8"/><rect x="328" y="44" width="30" height="26" rx="4"/><path d="M190 74 L222 74 L214 116 L184 116 Z"/>
        <rect x="250" y="74" width="20" height="24" rx="3"/><rect x="150" y="28" width="30" height="12" rx="2" class="acc"/>`,
      anchors: {},
    },
  };

  const SLOTS = {
    sight:  { label: "Celownik", pos: "top-left" },
    barrel: { label: "Lufa", pos: "top-right" },
    grip:   { label: "Chwyt", pos: "bottom-left" },
    under:  { label: "Podlufowe", pos: "bottom-right" },
  };

  function classOf(name, fallback) {
    if (!name) return fallback;
    if (WEAPONS[name]) return WEAPONS[name];
    const key = Object.keys(WEAPONS).find((k) => k.toLowerCase() === String(name).toLowerCase());
    return key ? WEAPONS[key] : fallback;
  }

  // Zwraca { sight, barrel, grip, under } – wartości z wpisu albo domyślne wg klasy.
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

  // w: { weapon, sight, barrel, grip, under, note }, slot: "primary" | "alt" | "secondary"
  function card(w, side, slot, slotLabel) {
    if (!w || !w.weapon) return "";
    const cls = classOf(w.weapon, slot === "secondary" ? "pistol" : "ar");
    const sil = SIL[cls] || SIL.ar;
    const att = attachments(w, cls, side);
    const W = 560, H = 270, ox = 70, oy = 68;

    const callouts = Object.entries(SLOTS).map(([k, s]) => {
      const a = sil.anchors[k];
      const val = att[k];
      if (!a || !val || val === "—") return "";
      const x = a[0] + ox, y = a[1] + oy;
      const top = s.pos.startsWith("top");
      const right = s.pos.endsWith("right");
      const ly = top ? 30 : H - 28;           // linia bazowa etykiety
      const lx = right ? x + 46 : x - 46;     // koniec linii
      const tx = right ? lx + 6 : lx - 6;
      const anchor = right ? "start" : "end";
      return `<g class="callout">
        <circle cx="${x}" cy="${y}" r="4" class="pt"/>
        <polyline points="${x},${y} ${x},${top ? ly + 10 : ly - 22} ${lx},${ly - 12}" class="ln"/>
        <text x="${tx}" y="${ly - 16}" text-anchor="${anchor}" class="lab">${esc(s.label)}</text>
        <text x="${tx}" y="${ly + 2}" text-anchor="${anchor}" class="val">${esc(val)}</text>
      </g>`;
    }).join("");

    const hasAtt = Object.values(att).some((v) => v && v !== "—");
    return `
      <div class="wcard ${slot}">
        <div class="wcard-head">
          <span class="wslot">${esc(slotLabel)}</span>
          <h3>${esc(w.weapon)}</h3>
          <span class="wclass">${esc((WEAPON_CLASSES[cls] || {}).label || cls)}</span>
        </div>
        <svg class="wbp" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(w.weapon)}">
          <defs><pattern id="bpgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" stroke-opacity=".06"/></pattern></defs>
          <rect width="${W}" height="${H}" fill="url(#bpgrid)"/>
          <g class="wpn" transform="translate(${ox},${oy})">${sil.shapes}</g>
          ${callouts}
          ${!hasAtt ? `<text x="${W / 2}" y="${H - 20}" text-anchor="middle" class="lab">bez dodatków</text>` : ""}
        </svg>
        ${w.note ? `<p class="wnote">${esc(w.note)}</p>` : ""}
      </div>`;
  }

  // mały wiersz do tabeli / listy: "556XI · 2.5x · Flash hider · Vertical grip · Laser"
  function line(w, side, slot) {
    if (!w || !w.weapon) return "";
    const cls = classOf(w.weapon, slot === "secondary" ? "pistol" : "ar");
    const att = attachments(w, cls, side);
    const parts = [att.sight, att.barrel, att.grip, att.under].filter((v) => v && v !== "—");
    return `<b>${esc(w.weapon)}</b>${parts.length ? ` <span class="muted">· ${parts.map(esc).join(" · ")}</span>` : ""}`;
  }

  return { card, line, classOf, attachments };
})();

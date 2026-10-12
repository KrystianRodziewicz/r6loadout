// R6 Loadout: wybór operatora → najlepszy loadout. Routing po hashu, bez backendu.

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const main = $("#main");
  const sideList = $("#sidebar-list");
  const search = $("#search");

  // metadane z opmeta.js (statystyki, jednostka, kraj) doklejamy do operatorów
  const OPS = OPERATORS.map((o) => {
    const m = (typeof OP_META !== "undefined" && OP_META[o.id]) || {};
    return { ...o, speed: m.speed || o.speed || 2, health: m.health || o.health || 2, difficulty: m.difficulty || 0,
      org: m.org || "", squad: m.squad || "", country: m.country || "", season: m.season || "", realName: m.realName || "", birthplace: m.birthplace || "" };
  });

  const opById = (id) => OPS.find((o) => o.id === id);
  const initials = (name) => name.replace(/[^A-Za-zÀ-ž]/g, "").slice(0, 2).toUpperCase();
  const iconSrc = (op) => (typeof OPERATOR_ICON_BASE === "string" ? OPERATOR_ICON_BASE : "") + op.id + ".svg";
  const icon = (op, cls = "") =>
    `<span class="op-icon ${op.side} ${cls}"><span class="ini">${esc(initials(op.name))}</span><img src="${esc(iconSrc(op))}" alt="" loading="lazy" onerror="this.hidden=true"></span>`;
  const hero = (op) =>
    `<span class="op-hero ${op.side}"><span class="ini">${esc(initials(op.name))}</span><img src="${esc(iconSrc(op))}" alt="${esc(op.name)}" onerror="this.hidden=true"></span>`;
  const flag = (op) => {
    if (!op.country) return "";
    const cc = (typeof COUNTRY_FIX !== "undefined" && COUNTRY_FIX[op.country]) || op.country;
    return `<img class="flag" src="https://flagcdn.com/w40/${cc}.png" srcset="https://flagcdn.com/w80/${cc}.png 2x" alt="${esc(op.country)}" loading="lazy" onerror="this.hidden=true">`;
  };
  const dots = (n, label) => `<span class="stat" title="${label}: ${n}/3">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const seasonLabel = (s) => (s === "Release" ? "Od premiery" : s);
  const sideLabel = (s) => (s === "atak" ? "Atak" : "Obrona");

  // ---------- router ----------
  const parse = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);

  function route() {
    Anim.vantaDestroy();
    const p = parse();
    window.scrollTo(0, 0);
    if (p[0] === "op" && opById(p[1])) renderOperator(opById(p[1]));
    else if (p[0] === "lista") renderList();
    else renderHome();
    renderSidebar(true);
  }

  // ---------- sidebar ----------
  function renderSidebar(animate) {
    const p = parse();
    const tab = p[0] === "lista" ? "list" : "ops";
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    const q = search.value.trim().toLowerCase();
    const groups = [["atak", "Atak"], ["obrona", "Obrona"]];
    sideList.innerHTML = groups.map(([side, label]) => {
      const ops = OPS.filter((o) => o.side === side && o.name.toLowerCase().includes(q));
      if (!ops.length) return "";
      return `<div class="side-group"><p class="eyebrow ${side}"><span>${label}</span><span>${ops.length}</span></p>${ops.map((o) =>
        `<a class="op-item ${p[0] === "op" && p[1] === o.id ? "active" : ""}" href="#/op/${o.id}">${icon(o)}<span class="nm">${esc(o.name)}</span><span class="org">${esc(o.org)}</span></a>`
      ).join("")}</div>`;
    }).join("") || `<p class="side-empty">Nie ma takiego operatora.</p>`;
    if (animate) Anim.sidebar(sideList);
  }

  // ---------- home: wybór operatora ----------
  const pick = { side: "", role: "" };

  function renderHome() {
    const roles = [...new Set(OPS.flatMap((o) => o.roles || []))].sort((a, b) => a.localeCompare(b, "pl"));
    main.innerHTML = `
      <section class="hero-wrap">
        <div class="vanta-bg" id="vanta-bg"></div>
        <div class="hero-inner">
          <p class="eyebrow">R6 Loadout · ${OPS.length} operatorów</p>
          <h1>Wybierz operatora,<br>dostaniesz najlepszy loadout</h1>
          <p class="lead">Broń główna, boczna, dodatki i gadżety dla każdego operatora Rainbow Six Siege. Kliknij kafelek albo wpisz nazwę w szukajce.</p>
        </div>
      </section>
      <div class="picker-bar">
        <div class="picker-filters">
          <button type="button" class="chip ${pick.side === "" ? "active" : ""}" data-side="">Wszyscy</button>
          <button type="button" class="chip atak ${pick.side === "atak" ? "active" : ""}" data-side="atak">Atak</button>
          <button type="button" class="chip obrona ${pick.side === "obrona" ? "active" : ""}" data-side="obrona">Obrona</button>
          <select class="filter" id="role-filter">
            <option value="">Każda rola</option>
            ${roles.map((r) => `<option value="${esc(r)}" ${pick.role === r ? "selected" : ""}>${esc(r)}</option>`).join("")}
          </select>
        </div>
        <p class="picker-count" id="picker-count"></p>
      </div>
      <div class="op-tiles" id="op-tiles"></div>`;

    main.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => {
      pick.side = b.dataset.side;
      main.querySelectorAll("[data-side]").forEach((x) => x.classList.toggle("active", x === b));
      renderTiles();
    }));
    $("#role-filter").addEventListener("change", (e) => { pick.role = e.target.value; renderTiles(); });
    renderTiles();
    Anim.vanta($("#vanta-bg"));
  }

  function renderTiles() {
    const grid = $("#op-tiles");
    if (!grid) return;
    const q = search.value.trim().toLowerCase();
    const list = OPS.filter((o) =>
      (!pick.side || o.side === pick.side) &&
      (!pick.role || (o.roles || []).includes(pick.role)) &&
      o.name.toLowerCase().includes(q));
    $("#picker-count").textContent = `${list.length} z ${OPS.length}`;
    grid.innerHTML = list.length ? list.map((o) => `
      <a class="op-tile ${o.side}" href="#/op/${o.id}" title="${esc(o.name)}">
        ${icon(o)}
        <span class="op-name">${esc(o.name)}</span>
        <span class="op-sub">${esc(o.loadout.primary.weapon)}</span>
      </a>`).join("") : `<div class="empty" style="grid-column:1/-1">Nikt nie pasuje do filtrów.</div>`;
    Anim.tiles(grid);
  }

  // ---------- operator ----------
  function renderOperator(op) {
    const lo = op.loadout || {};
    const same = OPS.filter((o) => o.side === op.side);
    const idx = same.findIndex((o) => o.id === op.id);
    const prev = same[(idx - 1 + same.length) % same.length];
    const next = same[(idx + 1) % same.length];

    const gadgets = [lo.gadget, lo.gadgetAlt].filter(Boolean);
    main.innerHTML = `
      <nav class="op-strip" aria-label="Szybki wybór">
        ${same.map((o) => `<a class="strip-item ${o.id === op.id ? "active" : ""}" href="#/op/${o.id}" title="${esc(o.name)}">${icon(o)}</a>`).join("")}
      </nav>

      <div class="page-head">
        ${hero(op)}
        <div class="grow">
          <p class="eyebrow"><span class="c-${op.side}">${sideLabel(op.side)}</span>${op.org ? ` · ${esc(op.org)}` : ""}${op.season ? ` · ${esc(seasonLabel(op.season))}` : ""}</p>
          <h1>${flag(op)}${esc(op.name)}</h1>
          ${op.realName ? `<p class="real">${esc(op.realName)}${op.birthplace ? `, ${esc(op.birthplace)}` : ""}</p>` : ""}
          <div class="stats">
            <span>Szybkość ${dots(op.speed, "Szybkość")}</span>
            <span>Zdrowie ${dots(op.health, "Zdrowie")}</span>
            ${op.difficulty ? `<span>Trudność ${dots(op.difficulty, "Trudność")}</span>` : ""}
          </div>
          <div class="tags">${(op.roles || []).map((r) => `<span class="pill ${op.side}">${esc(r)}</span>`).join("")}</div>
        </div>
        <div class="head-nav">
          <a class="btn ghost" href="#/op/${prev.id}" title="${esc(prev.name)}">← ${esc(prev.name)}</a>
          <a class="btn ghost" href="#/op/${next.id}" title="${esc(next.name)}">${esc(next.name)} →</a>
        </div>
      </div>

      <section class="loadout">
        <h2>Najlepszy loadout</h2>
        <div class="loadout-grid">
          ${Weapons.card(lo.primary, op.side, "primary", "Broń główna")}
          ${lo.alt ? Weapons.card(lo.alt, op.side, "alt", "Alternatywa") : ""}
          ${lo.secondary ? Weapons.card(lo.secondary, op.side, "secondary", "Broń boczna") : ""}
          <div class="card gcard anim-card">
            <p class="eyebrow">Gadżety</p>
            <div class="gadgets">${gadgets.map((g, i) => `<span class="gadget ${i === 0 ? "main" : ""}">${esc(g)}</span>`).join("") || `<span class="muted">brak danych</span>`}</div>
            ${gadgets.length > 1 ? `<p class="muted small">Pierwszy to wybór domyślny, drugi zapasowy.</p>` : ""}
          </div>
          ${lo.notes ? `<div class="card notes anim-card"><p class="eyebrow">Uwagi</p><p>${esc(lo.notes)}</p></div>` : ""}
        </div>
        <p class="muted small src">Dodatki to rekomendacja meta (źródło: skycoach.gg, 10.2026). Zmienisz je w <code>data/operators.js</code>.</p>
      </section>`;

    Anim.page(main);
    Anim.weapons(main);
    const active = $(".strip-item.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
  }

  // ---------- lista: wszystko na jednym ekranie ----------
  const listPick = { side: "" };

  function renderList() {
    main.innerHTML = `
      <div class="page-head compact">
        <div class="grow"><p class="eyebrow">Szybki podgląd</p><h1>Wszystkie loadouty</h1></div>
        <div class="picker-filters">
          <button type="button" class="chip ${listPick.side === "" ? "active" : ""}" data-side="">Wszyscy</button>
          <button type="button" class="chip atak ${listPick.side === "atak" ? "active" : ""}" data-side="atak">Atak</button>
          <button type="button" class="chip obrona ${listPick.side === "obrona" ? "active" : ""}" data-side="obrona">Obrona</button>
        </div>
      </div>
      <div class="list" id="list"></div>`;
    main.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => {
      listPick.side = b.dataset.side;
      main.querySelectorAll("[data-side]").forEach((x) => x.classList.toggle("active", x === b));
      renderListRows();
    }));
    renderListRows();
  }

  function renderListRows() {
    const box = $("#list");
    if (!box) return;
    const q = search.value.trim().toLowerCase();
    const list = OPS.filter((o) => (!listPick.side || o.side === listPick.side) && o.name.toLowerCase().includes(q));
    box.innerHTML = `
      <div class="lrow lhead"><span></span><span>Operator</span><span>Broń główna</span><span>Broń boczna</span><span>Gadżet</span></div>
      ${list.map((o) => {
        const lo = o.loadout || {};
        return `<a class="lrow ${o.side}" href="#/op/${o.id}">
          ${icon(o)}
          <span class="lname"><b>${esc(o.name)}</b><span class="muted">${esc(o.org)}</span></span>
          <span class="lw">${Weapons.line(lo.primary, o.side, "primary")}${lo.alt ? `<span class="alt">alt: ${Weapons.line(lo.alt, o.side, "alt")}</span>` : ""}</span>
          <span class="lw">${lo.secondary ? Weapons.line(lo.secondary, o.side, "secondary") : `<span class="muted">—</span>`}</span>
          <span class="lg">${esc(lo.gadget || "")}${lo.gadgetAlt ? `<span class="muted"> / ${esc(lo.gadgetAlt)}</span>` : ""}</span>
        </a>`;
      }).join("") || `<div class="empty">Nikt nie pasuje.</div>`}`;
    Anim.rows(box);
  }

  // ---------- start ----------
  window.addEventListener("hashchange", route);
  search.addEventListener("input", () => { renderSidebar(false); renderTiles(); renderListRows(); });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = sideList.querySelector(".op-item");
    if (first) location.hash = first.getAttribute("href");
  });
  route();
})();

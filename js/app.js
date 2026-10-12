// R6 Loadout: operator → najlepszy loadout, mapa → najlepsi operatorzy, duety. Routing po hashu, bez backendu, PL/EN.

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const t = (k, v) => I18n.t(k, v);
  const tx = (v) => I18n.tx(v);
  const main = $("#main");
  const sideList = $("#sidebar-list");
  const search = $("#search");
  const langBtn = $("#lang-toggle");

  const OPS = OPERATORS.map((o) => {
    const m = (typeof OP_META !== "undefined" && OP_META[o.id]) || {};
    return { ...o, speed: m.speed || o.speed || 2, health: m.health || o.health || 2, difficulty: m.difficulty || 0,
      org: m.org || "", squad: m.squad || "", country: m.country || "", season: m.season || "", realName: m.realName || "", birthplace: m.birthplace || "" };
  });

  const opById = (id) => OPS.find((o) => o.id === id);
  const mapById = (id) => MAPS.find((m) => m.id === id);
  const initials = (name) => name.replace(/[^A-Za-zÀ-ž]/g, "").slice(0, 2).toUpperCase();
  const iconSrc = (op) => (typeof OPERATOR_ICON_BASE === "string" ? OPERATOR_ICON_BASE : "") + op.id + ".svg";
  const icon = (op, cls = "") =>
    `<span class="op-icon ${op.side} ${cls}"><span class="ini">${esc(initials(op.name))}</span><img src="${esc(iconSrc(op))}" alt="" loading="lazy" onerror="this.hidden=true"></span>`;
  const figureSrc = (op) => {
    const id = (typeof OP_FIGURE_ALIAS !== "undefined" && OP_FIGURE_ALIAS[op.id]) || op.id;
    return (typeof OP_FIGURES !== "undefined" && OP_FIGURES.has(id)) ? ASSET_CDN + "operators/figures/" + id + ".webp" : null;
  };
  const flag = (op) => {
    if (!op.country) return "";
    const cc = (typeof COUNTRY_FIX !== "undefined" && COUNTRY_FIX[op.country]) || op.country;
    return `<img class="flag" src="https://flagcdn.com/w40/${cc}.png" srcset="https://flagcdn.com/w80/${cc}.png 2x" alt="${esc(op.country)}" loading="lazy" onerror="this.hidden=true">`;
  };
  const dots = (n, label) => `<span class="stat" title="${esc(label)}: ${n}/3">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const seasonLabel = (s) => (s === "Release" ? t("since_release") : s);
  const gadget = (name, isMain) => {
    const ico = Weapons.gadgetIcon(name);
    return `<span class="gadget ${isMain ? "main" : ""}">${ico ? `<img src="${esc(ico)}" alt="">` : ""}${esc(name)}</span>`;
  };
  const sideChips = (state) => `
    <button type="button" class="chip ${state.side === "" ? "active" : ""}" data-side="">${esc(t("all"))}</button>
    <button type="button" class="chip atak ${state.side === "atak" ? "active" : ""}" data-side="atak">${esc(t("atak"))}</button>
    <button type="button" class="chip obrona ${state.side === "obrona" ? "active" : ""}" data-side="obrona">${esc(t("obrona"))}</button>`;
  function bindSideChips(state, rerender) {
    main.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => {
      state.side = b.dataset.side;
      main.querySelectorAll("[data-side]").forEach((x) => x.classList.toggle("active", x === b));
      rerender();
    }));
  }

  // pole szukania z lupą na stronach, zsynchronizowane z tym w sidebarze
  const LUPA = `<svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  const searchBox = (id) => `<label class="search-wrap inline">${LUPA}<input type="search" id="${id}" class="search-mirror" placeholder="${esc(t("search_ph"))}" value="${esc(search.value)}" autocomplete="off"></label>`;
  function bindMirror() {
    main.querySelectorAll(".search-mirror").forEach((inp) => {
      inp.addEventListener("input", () => { search.value = inp.value; onSearch(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") openFirst(); });
    });
  }
  function onSearch() {
    renderSidebar(false); renderTiles(); renderListRows();
    document.querySelectorAll(".search-mirror").forEach((i) => { if (i.value !== search.value) i.value = search.value; });
  }
  function openFirst() {
    const first = sideList.querySelector(".op-item");
    if (first) location.hash = first.getAttribute("href");
  }

  // ---------- router ----------
  const parse = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const tabOf = (p) => (p[0] === "lista" || p[0] === "list") ? "list" : (p[0] === "mapy" || p[0] === "maps") ? "maps" : (p[0] === "duo" || p[0] === "duos") ? "duos" : "ops";

  function route() {
    Anim.vantaDestroy();
    const p = parse();
    const tab = tabOf(p);
    window.scrollTo(0, 0);
    if (p[0] === "op" && opById(p[1])) renderOperator(opById(p[1]));
    else if (tab === "list") renderList();
    else if (tab === "maps") (mapById(p[1]) ? renderMap(mapById(p[1])) : renderMaps());
    else if (tab === "duos") renderDuos();
    else renderHome();
    renderSidebar(true);
  }

  function renderChrome() {
    document.documentElement.lang = I18n.get();
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    search.placeholder = t("search_ph");
    $("#foot-note").innerHTML = t("foot");
    langBtn.textContent = I18n.get() === "pl" ? "EN" : "PL";
    langBtn.title = t("lang_switch");
  }

  // ---------- sidebar ----------
  function renderSidebar(animate) {
    const p = parse();
    const tab = tabOf(p);
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    const q = search.value.trim().toLowerCase();
    sideList.innerHTML = ["atak", "obrona"].map((side) => {
      const ops = OPS.filter((o) => o.side === side && o.name.toLowerCase().includes(q));
      if (!ops.length) return "";
      return `<div class="side-group"><p class="eyebrow ${side}"><span>${esc(t(side))}</span><span>${ops.length}</span></p>${ops.map((o) =>
        `<a class="op-item ${p[0] === "op" && p[1] === o.id ? "active" : ""}" href="#/op/${o.id}">${icon(o)}<span class="nm">${esc(o.name)}</span><span class="org">${esc(o.org)}</span></a>`
      ).join("")}</div>`;
    }).join("") || `<p class="side-empty">${esc(t("no_op"))}</p>`;
    if (animate) Anim.sidebar(sideList);
    const act = sideList.querySelector(".op-item.active");
    if (act && animate) act.scrollIntoView({ block: "nearest" });
  }

  // ---------- home ----------
  const pick = { side: "" };
  const HERO_FIGS = ["ash", "sledge", "mute"];

  function renderHome() {
    const figs = HERO_FIGS.map(opById).filter(Boolean).map((o) => figureSrc(o)).filter(Boolean);
    main.innerHTML = `
      <section class="hero-wrap">
        <div class="vanta-bg" id="vanta-bg"></div>
        <div class="hero-figs" aria-hidden="true">${figs.map((src, i) => `<img class="hf hf${i}" src="${esc(src)}" alt="" onerror="this.hidden=true">`).join("")}</div>
        <div class="hero-inner">
          <p class="eyebrow">${esc(t("hero_eyebrow", { n: OPS.length }))}</p>
          <h1>${t("hero_h1")}</h1>
          <p class="lead">${esc(t("hero_lead"))}</p>
        </div>
      </section>
      <div class="picker-bar">
        <div class="picker-filters">${sideChips(pick)}${searchBox("search-home")}</div>
        <p class="picker-count" id="picker-count"></p>
      </div>
      <div class="op-tiles" id="op-tiles"></div>`;
    bindSideChips(pick, renderTiles);
    bindMirror();
    renderTiles();
    Anim.vanta($("#vanta-bg"));
  }

  function renderTiles() {
    const grid = $("#op-tiles");
    if (!grid) return;
    const q = search.value.trim().toLowerCase();
    const list = OPS.filter((o) => (!pick.side || o.side === pick.side) && o.name.toLowerCase().includes(q));
    $("#picker-count").textContent = t("count_of", { a: list.length, b: OPS.length });
    grid.innerHTML = list.length ? list.map((o) => `
      <a class="op-tile ${o.side}" href="#/op/${o.id}" title="${esc(o.name)}">
        ${icon(o)}
        <span class="op-name">${esc(o.name)}</span>
        <span class="op-sub">${esc(o.loadout.primary.weapon)}</span>
      </a>`).join("") : `<div class="empty" style="grid-column:1/-1">${esc(t("no_match"))}</div>`;
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
    const notes = tx(lo.notes);
    const fig = figureSrc(op);
    const lone = (lo.alt ? 1 : 0) + (lo.secondary ? 1 : 0) === 1 ? "wide" : "";

    main.innerHTML = `
      <nav class="op-strip" aria-label="${esc(t("quick_pick"))}">
        ${same.map((o) => `<a class="strip-item ${o.id === op.id ? "active" : ""}" href="#/op/${o.id}" title="${esc(o.name)}">${icon(o)}</a>`).join("")}
      </nav>

      <div class="op-layout ${op.side}">
        <div class="op-main">
          <div class="page-head compact">
            ${icon(op, "xl")}
            <div class="grow">
              <p class="eyebrow"><span class="c-${op.side}">${esc(t(op.side))}</span>${op.org ? ` · ${esc(op.org)}` : ""}${op.season ? ` · ${esc(seasonLabel(op.season))}` : ""}</p>
              <h1>${flag(op)}${esc(op.name)}</h1>
              <div class="meta-row">
                ${op.realName ? `<span class="real">${esc(op.realName)}${op.birthplace ? `, ${esc(op.birthplace)}` : ""}</span>` : ""}
                <span class="stats">
                  <span>${esc(t("speed"))} ${dots(op.speed, t("speed"))}</span>
                  <span>${esc(t("health"))} ${dots(op.health, t("health"))}</span>
                  ${op.difficulty ? `<span>${esc(t("difficulty"))} ${dots(op.difficulty, t("difficulty"))}</span>` : ""}
                </span>
                <span class="tags">${(op.roles || []).map((r) => `<span class="pill ${op.side}">${esc(r)}</span>`).join("")}</span>
              </div>
            </div>
            <div class="head-nav">
              <a class="btn ghost" href="#/op/${prev.id}" title="${esc(prev.name)}">← ${esc(prev.name)}</a>
              <a class="btn ghost" href="#/op/${next.id}" title="${esc(next.name)}">${esc(next.name)} →</a>
            </div>
          </div>

          <section class="loadout">
            <div class="loadout-top">
              <h2>${esc(t("best_loadout"))}</h2>
              <div class="gadgets anim-card">
                <span class="eyebrow">${esc(t("gadgets"))}</span>
                ${gadgets.map((g, i) => gadget(g, i === 0)).join("") || `<span class="muted">${esc(t("no_data"))}</span>`}
              </div>
            </div>
            <div class="loadout-grid">
              ${Weapons.card(lo.primary, op.side, "primary", t("primary"), op)}
              ${lo.alt ? Weapons.card(lo.alt, op.side, "alt", t("alt"), op, lone) : ""}
              ${lo.secondary ? Weapons.card(lo.secondary, op.side, "secondary", t("secondary"), op, lone) : ""}
            </div>
            ${notes ? `<p class="notes-line anim-card"><b>${esc(t("notes"))}:</b> ${esc(notes)}</p>` : ""}
            <p class="muted small src">${esc(t("src_note"))}</p>
          </section>
        </div>

        <aside class="op-figure ${fig ? "" : "nofig"}" aria-hidden="true">
          <span class="fig-name">${esc(op.name)}</span>
          ${fig ? `<img class="fig-img" src="${esc(fig)}" alt="" onerror="this.closest('.op-figure').classList.add('nofig'); this.remove()">` : ""}
          <span class="fig-fallback">${icon(op, "huge")}</span>
        </aside>
      </div>`;

    Anim.page(main);
    Anim.weapons(main);
    Anim.figure(main);
    const active = $(".strip-item.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
  }

  // ---------- lista ----------
  const listPick = { side: "" };

  function renderList() {
    main.innerHTML = `
      <div class="page-head compact">
        <div class="grow"><p class="eyebrow">${esc(t("list_eyebrow"))}</p><h1>${esc(t("list_h1"))}</h1></div>
        <div class="picker-filters">${sideChips(listPick)}${searchBox("search-list")}</div>
      </div>
      <div class="list" id="list"></div>`;
    bindSideChips(listPick, renderListRows);
    bindMirror();
    renderListRows();
  }

  function renderListRows() {
    const box = $("#list");
    if (!box) return;
    const q = search.value.trim().toLowerCase();
    const list = OPS.filter((o) => (!listPick.side || o.side === listPick.side) && o.name.toLowerCase().includes(q));
    box.innerHTML = `
      <div class="lrow lhead"><span></span><span>${esc(t("col_op"))}</span><span>${esc(t("col_primary"))}</span><span>${esc(t("col_secondary"))}</span><span>${esc(t("col_gadget"))}</span></div>
      ${list.map((o) => {
        const lo = o.loadout || {};
        return `<a class="lrow ${o.side}" href="#/op/${o.id}">
          ${icon(o)}
          <span class="lname"><b>${esc(o.name)}</b><span class="muted">${esc(o.org)}</span></span>
          <span class="lw">${Weapons.thumb(lo.primary.weapon)}<span>${Weapons.line(lo.primary, o.side, "primary")}${lo.alt ? `<span class="alt">${esc(t("alt_short"))} ${Weapons.line(lo.alt, o.side, "alt")}</span>` : ""}</span></span>
          <span class="lw">${lo.secondary ? Weapons.thumb(lo.secondary.weapon) + `<span>${Weapons.line(lo.secondary, o.side, "secondary")}</span>` : `<span class="muted">—</span>`}</span>
          <span class="lg">${esc(lo.gadget || "")}${lo.gadgetAlt ? `<span class="muted"> / ${esc(lo.gadgetAlt)}</span>` : ""}</span>
        </a>`;
      }).join("") || `<div class="empty">${esc(t("no_match"))}</div>`}`;
    Anim.rows(box);
  }

  // ---------- mapy ----------
  const thumbUrl = (m) => ASSET_CDN + "maps/thumbnails/" + m.thumb;

  function renderMaps() {
    main.innerHTML = `
      <div class="page-head compact">
        <div class="grow"><p class="eyebrow">${esc(t("maps_eyebrow"))}</p><h1>${esc(t("maps_h1"))}</h1><p class="lead-s">${esc(t("maps_lead"))}</p></div>
      </div>
      <div class="map-grid">
        ${MAPS.map((m) => `
          <a class="map-card anim-card" href="#/mapy/${m.id}" style="background-image:url('${esc(thumbUrl(m))}')">
            <span class="map-shade"></span>
            <span class="map-name">${esc(m.name)}</span>
            <span class="map-ops">${m.attack.slice(0, 3).map((id) => opById(id)).filter(Boolean).map((o) => icon(o)).join("")}<i></i>${m.defense.slice(0, 3).map((id) => opById(id)).filter(Boolean).map((o) => icon(o)).join("")}</span>
          </a>`).join("")}
      </div>
      <p class="muted small src">${esc(t("maps_note"))}</p>`;
    Anim.page(main);
  }

  function pickCard(op, n) {
    const lo = op.loadout || {};
    return `<a class="pick ${op.side} anim-card" href="#/op/${op.id}">
      <span class="pick-n">${n}</span>
      ${icon(op, "md")}
      <span class="pick-body"><b>${esc(op.name)}</b><span class="muted">${esc((op.roles || []).join(" · "))}</span></span>
      <span class="pick-w">${Weapons.thumb(lo.primary.weapon)}<span class="muted">${esc(lo.primary.weapon)}</span></span>
    </a>`;
  }

  function renderMap(m) {
    const col = (ids) => ids.map(opById).filter(Boolean).map((o, i) => pickCard(o, i + 1)).join("");
    main.innerHTML = `
      <nav class="map-strip">
        <a class="chip" href="#/mapy">${esc(t("maps_all"))}</a>
        ${MAPS.map((x) => `<a class="chip ${x.id === m.id ? "active" : ""}" href="#/mapy/${x.id}">${esc(x.name)}</a>`).join("")}
      </nav>
      <section class="map-hero" style="background-image:url('${esc(thumbUrl(m))}')">
        <span class="map-shade"></span>
        <div class="map-hero-in">
          <p class="eyebrow">${esc(t("maps_eyebrow"))}</p>
          <h1>${esc(m.name)}</h1>
          <p class="lead-s">${esc(tx(m.why))}</p>
        </div>
      </section>
      <div class="map-cols">
        <section><h2 class="c-atak">${esc(t("map_attack"))}</h2><div class="picks">${col(m.attack)}</div></section>
        <section><h2 class="c-obrona">${esc(t("map_defense"))}</h2><div class="picks">${col(m.defense)}</div></section>
      </div>
      ${m.own ? `<p class="notes-line">${esc(t("own_pick"))}</p>` : ""}
      <p class="muted small src">${esc(t("maps_note"))}</p>`;
    Anim.page(main);
    const active = $(".map-strip .chip.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
  }

  // ---------- duety ----------
  const duoPick = { side: "" };

  function renderDuos() {
    main.innerHTML = `
      <div class="page-head compact">
        <div class="grow"><p class="eyebrow">${esc(t("duos_eyebrow"))}</p><h1>${esc(t("duos_h1"))}</h1><p class="lead-s">${esc(t("duos_lead"))}</p></div>
        <div class="picker-filters">${sideChips(duoPick)}</div>
      </div>
      <div class="duo-grid" id="duo-grid"></div>
      <p class="muted small src">${esc(t("duos_note"))}</p>`;
    bindSideChips(duoPick, renderDuoCards);
    renderDuoCards();
  }

  function renderDuoCards() {
    const box = $("#duo-grid");
    if (!box) return;
    const list = DUOS.filter((d) => !duoPick.side || d.side === duoPick.side);
    box.innerHTML = list.map((d) => {
      const [a, b] = d.ops.map(opById);
      if (!a || !b) return "";
      return `<article class="duo ${d.side} anim-card">
        <header class="duo-head">
          <a class="duo-op" href="#/op/${a.id}">${icon(a, "lg")}<b>${esc(a.name)}</b></a>
          <span class="duo-plus">+</span>
          <a class="duo-op" href="#/op/${b.id}">${icon(b, "lg")}<b>${esc(b.name)}</b></a>
          <span class="pill ${d.side}">${esc(t(d.side))}</span>
        </header>
        <p class="duo-why">${esc(tx(d.why))}</p>
        <p class="duo-how"><b>${esc(t("how"))}:</b> ${esc(tx(d.how))}</p>
        <p class="duo-src muted small">${esc(t("src_" + d.src))}</p>
      </article>`;
    }).join("");
    Anim.page(box);
  }

  // ---------- start ----------
  window.addEventListener("hashchange", route);
  search.addEventListener("input", onSearch);
  search.addEventListener("keydown", (e) => { if (e.key === "Enter") openFirst(); });
  langBtn.addEventListener("click", () => I18n.toggle());
  document.addEventListener("lang-change", () => { renderChrome(); route(); });
  renderChrome();
  route();
})();

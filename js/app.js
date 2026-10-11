// Główna logika: routing po hashu, sidebar, wybór operatora, strony operatora / mapy.

(function () {
  const esc = (s) => MapView.esc(s);
  const $ = (sel, root = document) => root.querySelector(sel);
  const main = $("#main");
  const sideList = $("#sidebar-list");
  const search = $("#search");
  const editorToggle = $("#editor-toggle");
  const draftLink = $("#draft-link");

  // markery dostają stałe id (potrzebne do zaznaczania)
  SETUPS.forEach((s) => (s.markers || []).forEach((m, i) => { if (!m.id) m.id = s.id + "#" + i; }));

  const opById = (id) => OPERATORS.find((o) => o.id === id);
  const mapById = (id) => MAPS.find((m) => m.id === id);
  const siteName = (map, id) => (map && map.sites.find((s) => s.id === id) || {}).name || "";
  const setupsOf = (fn) => SETUPS.filter(fn);
  const countOp = (id) => setupsOf((s) => s.operator === id).length;
  const initials = (name) => name.replace(/[^A-Za-zÀ-ž]/g, "").slice(0, 2).toUpperCase();
  const iconSrc = (op) => (typeof OPERATOR_ICON_BASE === "string" ? OPERATOR_ICON_BASE : "") + op.id + ".svg";
  const icon = (op, cls = "") =>
    `<span class="op-icon ${op.side} ${cls}"><span class="ini">${esc(initials(op.name))}</span><img src="${esc(iconSrc(op))}" alt="" loading="lazy" onerror="this.hidden=true"></span>`;
  const hero = (op) =>
    `<span class="op-hero ${op.side}"><span class="ini">${esc(initials(op.name))}</span><img src="${esc(iconSrc(op))}" alt="${esc(op.name)}" onerror="this.hidden=true"></span>`;
  const stat = (n) => `<span class="stat">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const plural = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? few : many;
  const setupsWord = (n) => `${n} ${plural(n, "setup", "setupy", "setupów")}`;

  // ---------- router ----------
  const parse = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);

  let currentView = null;
  function route() {
    if (currentView) { currentView.destroy(); currentView = null; }
    const p = parse();
    window.scrollTo(0, 0);
    if (p[0] === "op" && opById(p[1])) renderOperator(opById(p[1]), p[2]);
    else if (p[0] === "map" && mapById(p[1])) renderMap(mapById(p[1]), p[2]);
    else if (p[0] === "maps") renderMapsList();
    else if (p[0] === "edit") Editor.renderEditPage(main);
    else renderHome();
    renderSidebar(true);
  }

  // ---------- sidebar ----------
  function renderSidebar(animate) {
    const p = parse();
    const tab = p[0] === "maps" || p[0] === "map" ? "maps" : "ops";
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    const q = search.value.trim().toLowerCase();

    if (tab === "maps") {
      const maps = MAPS.filter((m) => m.name.toLowerCase().includes(q));
      sideList.innerHTML = maps.length
        ? maps.map((m) => `<a class="map-item ${p[1] === m.id ? "active" : ""}" href="#/map/${m.id}">${esc(m.name)}<span class="cnt">${setupsOf((s) => s.map === m.id).length || ""}</span></a>`).join("")
        : `<p class="side-empty">Brak map.</p>`;
    } else {
      const groups = [["atak", "Atak"], ["obrona", "Obrona"]];
      sideList.innerHTML = groups.map(([side, label]) => {
        const ops = OPERATORS.filter((o) => o.side === side && o.name.toLowerCase().includes(q));
        if (!ops.length) return "";
        return `<div class="side-group"><p class="eyebrow ${side}"><span>${label}</span><span>${ops.length}</span></p>${ops.map((o) =>
          `<a class="op-item ${p[0] === "op" && p[1] === o.id ? "active" : ""}" href="#/op/${o.id}">${icon(o)}${esc(o.name)}<span class="cnt">${countOp(o.id) || ""}</span></a>`
        ).join("")}</div>`;
      }).join("") || `<p class="side-empty">Nie ma takiego operatora.</p>`;
    }
    if (animate) Anim.sidebar(sideList);
  }

  function renderEditorState() {
    const on = Editor.isEnabled();
    editorToggle.textContent = on ? "Edytor: wł." : "Edytor: wył.";
    editorToggle.classList.toggle("on", on);
    draftLink.hidden = !(on && Editor.getDraft());
  }

  // ---------- home: wybór operatora ----------
  const pick = { side: "", role: "" };

  function renderHome() {
    const roles = [...new Set(OPERATORS.flatMap((o) => o.roles || []))].sort((a, b) => a.localeCompare(b, "pl"));
    main.innerHTML = `
      <div class="picker-head">
        <div>
          <p class="eyebrow">Baza setupów · ${SETUPS.length} ${plural(SETUPS.length, "setup", "setupy", "setupów")} · ${MAPS.length} map</p>
          <h1>Wybierz operatora</h1>
          <p>Kliknij operatora, żeby zobaczyć loadout i setupy rozrysowane na planie piętra. Zakładka <a href="#/maps" style="color:var(--accent)">Mapy</a> pokazuje to samo od strony site'u.</p>
        </div>
        <div class="picker-filters">
          <button type="button" class="chip ${pick.side === "" ? "active" : ""}" data-side="">Wszyscy</button>
          <button type="button" class="chip atak ${pick.side === "atak" ? "active" : ""}" data-side="atak">Atak</button>
          <button type="button" class="chip obrona ${pick.side === "obrona" ? "active" : ""}" data-side="obrona">Obrona</button>
          <select class="filter" id="role-filter">
            <option value="">Każda rola</option>
            ${roles.map((r) => `<option value="${esc(r)}" ${pick.role === r ? "selected" : ""}>${esc(r)}</option>`).join("")}
          </select>
        </div>
      </div>
      <p class="picker-count" id="picker-count"></p>
      <div class="op-tiles" id="op-tiles"></div>`;

    main.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => {
      pick.side = b.dataset.side;
      main.querySelectorAll("[data-side]").forEach((x) => x.classList.toggle("active", x === b));
      renderTiles();
    }));
    $("#role-filter").addEventListener("change", (e) => { pick.role = e.target.value; renderTiles(); });
    renderTiles();
  }

  function renderTiles() {
    const grid = $("#op-tiles");
    if (!grid) return;
    const q = search.value.trim().toLowerCase();
    const list = OPERATORS.filter((o) =>
      (!pick.side || o.side === pick.side) &&
      (!pick.role || (o.roles || []).includes(pick.role)) &&
      o.name.toLowerCase().includes(q));
    $("#picker-count").textContent = `${list.length} z ${OPERATORS.length} operatorów`;
    grid.innerHTML = list.length ? list.map((o) => {
      const n = countOp(o.id);
      return `<a class="op-tile ${o.side}" href="#/op/${o.id}" title="${esc(o.name)}">
        ${icon(o)}
        <span class="op-name">${esc(o.name)}</span>
        <span class="op-sub">${n ? setupsWord(n) : "brak setupów"}</span>
      </a>`;
    }).join("") : `<div class="empty" style="grid-column:1/-1">Nikt nie pasuje do filtrów.</div>`;
    Anim.tiles(grid);
  }

  // ---------- mapy ----------
  function renderMapsList() {
    main.innerHTML = `
      <div class="page-head"><div class="grow"><p class="eyebrow">Przeglądaj</p><h1>Mapy</h1></div></div>
      <div class="map-grid">${MAPS.map((m) => {
        const n = setupsOf((s) => s.map === m.id).length;
        const imgs = m.floors.filter((f) => f.image).length;
        return `<a class="map-card" href="#/map/${m.id}"><h3>${esc(m.name)}</h3><p class="meta">${m.floors.length} ${plural(m.floors.length, "piętro", "piętra", "pięter")} · ${m.sites.length} site'y · ${setupsWord(n)}</p>${m.note ? `<p class="meta">${esc(m.note)}</p>` : imgs ? "" : `<p class="meta">brak obrazków pięter</p>`}</a>`;
      }).join("")}</div>`;
    Anim.page(main);
  }

  // ---------- operator ----------
  function renderOperator(op, setupId) {
    const mine = setupsOf((s) => s.operator === op.id);
    const byMap = {};
    mine.forEach((s) => (byMap[s.map] = byMap[s.map] || []).push(s));
    const lo = op.loadout || {};
    const loadout = [["Broń główna", lo.primary], ["Broń boczna", lo.secondary], ["Gadżety", lo.gadget]]
      .filter(([, v]) => v)
      .map(([k, v]) => `<div class="card"><p class="eyebrow">${k}</p><p class="val">${esc(v)}</p></div>`).join("")
      + (lo.notes ? `<div class="card notes"><p class="eyebrow">Notatki</p>${esc(lo.notes)}</div>` : "");

    main.innerHTML = `
      <div class="page-head">
        ${hero(op)}
        <div class="grow">
          <p class="eyebrow"><span class="c-${op.side}">${op.side}</span> &nbsp;·&nbsp; szybkość ${stat(op.speed)} zdrowie ${stat(op.health)}</p>
          <h1>${esc(op.name)}</h1>
          <div class="tags">${(op.roles || []).map((r) => `<span class="pill ${op.side}">${esc(r)}</span>`).join("")}</div>
        </div>
        <div class="editor-bar">${Editor.isEnabled() ? `<button type="button" class="btn primary" id="new-setup">+ Nowy setup</button>` : ""}</div>
      </div>
      <section><h2>Loadout</h2><div class="cards">${loadout || `<div class="empty">Brak loadoutu. Uzupełnij w data/operators.js.</div>`}</div></section>
      <section>
        <h2>Setupy <span class="n">${mine.length}</span></h2>
        ${mine.length ? Object.keys(byMap).map((mid) => {
          const map = mapById(mid);
          return `<div class="setup-group"><h3>${esc(map ? map.name : mid)}</h3>${byMap[mid].map((s) => setupRow(s, `#/op/${op.id}/${s.id}`, s.id === setupId, map, false)).join("")}</div>`;
        }).join("") : `<div class="empty">Jeszcze nie ma setupów dla ${esc(op.name)}.${Editor.isEnabled() ? " Kliknij „Nowy setup” u góry." : " Włącz edytor (lewy dolny róg), żeby dodać."}</div>`}
        <div id="setup-view"></div>
      </section>`;

    const nb = $("#new-setup");
    if (nb) nb.addEventListener("click", () => { Editor.newDraft({ operator: op.id }); location.hash = "#/edit"; });

    Anim.page(main);
    const setup = mine.find((s) => s.id === setupId);
    if (setup) renderSetupView($("#setup-view"), setup);
  }

  function renderMap(map, setupId) {
    const here = setupsOf((s) => s.map === map.id);
    const bySite = {};
    here.forEach((s) => (bySite[s.site || "_"] = bySite[s.site || "_"] || []).push(s));
    const order = [...map.sites.map((s) => s.id), "_"].filter((k) => bySite[k]);

    main.innerHTML = `
      <div class="page-head">
        <div class="grow">
          <p class="eyebrow">Mapa · ${map.floors.length} ${plural(map.floors.length, "piętro", "piętra", "pięter")}</p>
          <h1>${esc(map.name)}</h1>
          ${map.note ? `<p style="color:var(--muted);margin-top:6px">${esc(map.note)}</p>` : ""}
        </div>
        <div class="editor-bar">${Editor.isEnabled() ? `<button type="button" class="btn primary" id="new-setup">+ Nowy setup</button>` : ""}</div>
      </div>
      <section>
        <h2>Site'y</h2>
        <div class="floors">${map.sites.map((s) => `<span class="chip">${esc(s.name)}</span>`).join("") || `<span class="empty">brak</span>`}</div>
      </section>
      <section>
        <h2>Setupy <span class="n">${here.length}</span></h2>
        ${here.length ? order.map((k) => `<div class="setup-group"><h3>${esc(k === "_" ? "Bez site'u" : siteName(map, k))}</h3>${bySite[k].map((s) => setupRow(s, `#/map/${map.id}/${s.id}`, s.id === setupId, map, true)).join("")}</div>`).join("")
          : `<div class="empty">Jeszcze nie ma setupów na tej mapie.</div>`}
        <div id="setup-view"></div>
      </section>`;

    const nb = $("#new-setup");
    if (nb) nb.addEventListener("click", () => { Editor.newDraft({ map: map.id }); location.hash = "#/edit"; });

    Anim.page(main);
    const setup = here.find((s) => s.id === setupId);
    if (setup) renderSetupView($("#setup-view"), setup);
  }

  function setupRow(s, href, active, map, showOp) {
    const op = opById(s.operator);
    const n = (s.markers || []).length;
    return `<a class="setup-row ${active ? "active" : ""}" href="${href}">
      <span class="site">${esc(siteName(map, s.site) || (map && map.floors.find((f) => f.id === s.floor) || {}).name || "")}</span>
      <span class="title">${esc(s.title)}</span>
      <span class="meta">${showOp && op ? icon(op) + esc(op.name) + " · " : ""}${n} ${plural(n, "marker", "markery", "markerów")}${s.author ? " · " + esc(s.author) : ""}</span>
    </a>`;
  }

  // ---------- widok jednego setupu ----------
  function renderSetupView(container, s) {
    const map = mapById(s.map);
    const op = opById(s.operator);
    if (!map) { container.innerHTML = `<div class="empty">Setup wskazuje na nieznaną mapę „${esc(s.map)}”.</div>`; return; }

    container.innerHTML = `
      <div class="setup-view">
        <div class="setup-head">
          ${op ? icon(op, "md") : ""}
          <div class="grow">
            <p class="eyebrow">${esc(map.name)}${s.site ? " · " + esc(siteName(map, s.site)) : ""}</p>
            <h2>${esc(s.title)}</h2>
            <p class="meta">${op ? `<a href="#/op/${op.id}">${esc(op.name)}</a> · ` : ""}${s.author ? esc(s.author) + " · " : ""}${esc(s.updated || "")}</p>
            ${s.description ? `<p class="desc">${esc(s.description)}</p>` : ""}
          </div>
          <div class="editor-bar">${Editor.isEnabled() ? `<button type="button" class="btn" id="edit-copy">Edytuj kopię</button>` : ""}</div>
        </div>
        <div class="setup-body">
          <div class="mapwrap"></div>
          <aside class="marker-panel"></aside>
        </div>
      </div>`;

    const eb = $("#edit-copy", container);
    if (eb) eb.addEventListener("click", () => { Editor.fromSetup(s); location.hash = "#/edit"; });

    const panel = $(".marker-panel", container);
    let selected = null;

    const view = MapView.create($(".mapwrap", container), {
      map, floorId: s.floor, markers: s.markers || [],
      onSelect: (id) => { selected = id; renderPanel(); Anim.pulse(view.el.querySelector(".marker.selected")); },
    });
    currentView = view;
    Anim.setupView(container.firstElementChild);

    function renderPanel() {
      const ms = s.markers || [];
      const m = ms.find((x) => x.id === selected);
      panel.innerHTML = `<h4>Markery <span class="n">${ms.length}</span></h4>
        ${ms.length ? `<ul class="marker-list">${ms.map((x) => {
          const t = MapView.typeOf(x);
          return `<li class="${x.id === selected ? "active" : ""}" data-id="${x.id}"><span class="dot" style="background:${t.color}">${esc(x.label || t.glyph)}</span><span>${esc(x.title || t.label)}</span></li>`;
        }).join("")}</ul>` : `<p class="hint">Ten setup nie ma markerów.</p>`}
        ${m ? `<div class="marker-detail">
          <p class="type">${esc(MapView.typeOf(m).label)}${m.floor ? " · piętro " + esc(m.floor) : ""}</p>
          <h4>${esc(m.title || "")}</h4>
          ${m.desc ? `<p class="desc">${esc(m.desc)}</p>` : ""}
          ${m.image ? `<img src="${esc(m.image)}" alt="" loading="lazy">` : ""}
        </div>` : `<p class="hint" style="margin-top:10px">Najedź na marker, żeby zobaczyć opis. Kliknij, żeby przypiąć go tutaj.</p>`}`;
      panel.querySelectorAll("li[data-id]").forEach((li) => li.addEventListener("click", () => {
        selected = li.dataset.id === selected ? null : li.dataset.id;
        const mk = ms.find((x) => x.id === selected);
        if (mk && mk.floor) view.setFloor(mk.floor);
        view.setSelected(selected);
        renderPanel();
        Anim.pulse(view.el.querySelector(".marker.selected"));
      }));
    }
    renderPanel();
  }

  // ---------- start ----------
  window.addEventListener("hashchange", route);
  search.addEventListener("input", () => { renderSidebar(false); renderTiles(); });
  editorToggle.addEventListener("click", () => { Editor.toggle(); });
  document.addEventListener("editor-change", () => { renderEditorState(); route(); });
  document.addEventListener("draft-change", renderEditorState);
  renderEditorState();
  route();
})();

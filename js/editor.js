// Edytor setupów: szkic trzymany w localStorage, markery stawiane kliknięciem,
// na końcu eksport gotowego wpisu do wklejenia w data/setups.js.

window.Editor = (function () {
  const KEY_DRAFT = "r6setupy.draft";
  const KEY_ON = "r6setupy.editor";
  const esc = (s) => MapView.esc(s);

  let enabled = false;
  try { enabled = localStorage.getItem(KEY_ON) === "1"; } catch { /* brak localStorage */ }

  // ---------- szkic ----------
  function getDraft() {
    try { return JSON.parse(localStorage.getItem(KEY_DRAFT) || "null"); } catch { return null; }
  }
  function saveDraft(d) {
    try { localStorage.setItem(KEY_DRAFT, JSON.stringify(d)); } catch { /* ignoruj */ }
    document.dispatchEvent(new CustomEvent("draft-change"));
  }
  function clearDraft() {
    try { localStorage.removeItem(KEY_DRAFT); } catch { /* ignoruj */ }
    document.dispatchEvent(new CustomEvent("draft-change"));
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function slug(s) {
    return String(s || "").toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c]))
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  let seq = 1;
  const newMarkerId = () => "m" + Date.now().toString(36) + (seq++).toString(36);

  function newDraft(partial) {
    const map = MAPS.find((m) => m.id === partial.map) || MAPS[0];
    const d = {
      id: "",
      operator: partial.operator || OPERATORS[0].id,
      map: map.id,
      floor: partial.floor || map.floors[0].id,
      site: partial.site || (map.sites[0] ? map.sites[0].id : ""),
      title: partial.title || "",
      author: partial.author || "",
      updated: today(),
      description: "",
      markers: [],
    };
    saveDraft(d);
    return d;
  }

  function fromSetup(setup) {
    const d = JSON.parse(JSON.stringify(setup));
    d.id = setup.id + "-v2";
    d.updated = today();
    d.markers = (d.markers || []).map((m) => ({ ...m, id: m.id || newMarkerId() }));
    saveDraft(d);
    return d;
  }

  function autoId(d) {
    const op = d.operator || "op";
    const site = d.site || d.floor || "";
    return [op, d.map, site, slug(d.title)].filter(Boolean).join("-");
  }

  function exportText(d) {
    const out = {
      id: d.id || autoId(d),
      operator: d.operator,
      map: d.map,
      floor: d.floor,
      site: d.site || "",
      title: d.title,
      author: d.author,
      updated: d.updated,
      description: d.description,
      markers: (d.markers || []).map((m) => {
        const o = { x: m.x, y: m.y, type: m.type, title: m.title };
        if (m.desc) o.desc = m.desc;
        if (m.image) o.image = m.image;
        if (m.label) o.label = m.label;
        if (m.floor && m.floor !== d.floor) o.floor = m.floor;
        return o;
      }),
    };
    const lines = Object.entries(out).map(([k, v]) => {
      if (k === "markers") {
        const ms = v.map((m) => "      " + JSON.stringify(m) + ",").join("\n");
        return `    markers: [\n${ms}\n    ],`;
      }
      return `    ${k}: ${JSON.stringify(v)},`;
    });
    return `  {\n${lines.join("\n")}\n  },`;
  }

  // ---------- włącznik ----------
  function isEnabled() { return enabled; }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY_ON, enabled ? "1" : "0"); } catch { /* ignoruj */ }
    document.dispatchEvent(new CustomEvent("editor-change"));
  }

  // ---------- strona edytora ----------
  function renderEditPage(main) {
    let d = getDraft();
    if (!d) {
      main.innerHTML = `
        <div class="page-head"><div class="grow"><p class="eyebrow">Edytor</p><h1>Brak szkicu</h1></div></div>
        <div class="empty">Wejdź na stronę operatora i kliknij <b>Nowy setup</b>, albo otwórz istniejący setup i kliknij <b>Edytuj kopię</b>.<br>Edytor musi być włączony (przycisk w lewym dolnym rogu).</div>`;
      return;
    }
    d.markers = (d.markers || []).map((m) => ({ ...m, id: m.id || newMarkerId() }));

    let selectedId = null;
    let view = null;

    const opOptions = (sel) => OPERATORS.map((o) => `<option value="${o.id}" ${o.id === sel ? "selected" : ""}>${esc(o.name)} (${o.side})</option>`).join("");
    const mapOptions = (sel) => MAPS.map((m) => `<option value="${m.id}" ${m.id === sel ? "selected" : ""}>${esc(m.name)}</option>`).join("");
    const floorOptions = (map, sel) => map.floors.map((f) => `<option value="${f.id}" ${f.id === sel ? "selected" : ""}>${esc(f.name)}</option>`).join("");
    const siteOptions = (map, sel) => `<option value="">— brak —</option>` + map.sites.map((s) => `<option value="${s.id}" ${s.id === sel ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    const typeOptions = (sel) => Object.entries(MARKER_TYPES).map(([k, t]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(t.label)}</option>`).join("");

    function mapOf() { return MAPS.find((m) => m.id === d.map) || MAPS[0]; }

    function renderPage() {
      const map = mapOf();
      main.innerHTML = `
        <div class="page-head">
          <div class="grow"><p class="eyebrow">Edytor</p><h1>${esc(d.title || "Nowy setup")}</h1></div>
          <div class="editor-bar">
            <button type="button" class="btn danger ghost" id="e-clear">Wyrzuć szkic</button>
          </div>
        </div>
        <div class="notice">Kliknij na mapę, żeby postawić marker. Przeciągnij, żeby przesunąć. Kliknij marker, żeby edytować opis. Szkic zapisuje się sam w przeglądarce.</div>

        <div class="editor-form">
          <label>Operator <select id="e-op">${opOptions(d.operator)}</select></label>
          <label>Mapa <select id="e-map">${mapOptions(d.map)}</select></label>
          <label>Piętro (domyślne) <select id="e-floor">${floorOptions(map, d.floor)}</select></label>
          <label>Site <select id="e-site">${siteOptions(map, d.site)}</select></label>
          <label>Tytuł <input id="e-title" value="${esc(d.title)}" placeholder="np. Default obrona CEO"></label>
          <label>Autor <input id="e-author" value="${esc(d.author)}" placeholder="twój nick"></label>
          <label class="wide">Opis <textarea id="e-desc" placeholder="Kilka zdań: co, dlaczego, na co uważać.">${esc(d.description)}</textarea></label>
        </div>

        <div class="setup-body">
          <div class="mapwrap" id="e-mapwrap"></div>
          <aside class="marker-panel" id="e-panel"></aside>
        </div>

        <div class="export">
          <h2>Gotowy wpis</h2>
          <p class="hint">Skopiuj i wklej na końcu listy <code>SETUPS</code> w <code>data/setups.js</code> (przed <code>];</code>). Potem commit i push.</p>
          <button type="button" class="btn primary" id="e-copy">Kopiuj wpis</button>
          <pre id="e-out"></pre>
        </div>`;

      main.querySelector("#e-clear").addEventListener("click", () => {
        if (!main.querySelector("#e-clear").dataset.sure) {
          main.querySelector("#e-clear").textContent = "Na pewno? Kliknij jeszcze raz";
          main.querySelector("#e-clear").dataset.sure = "1";
          return;
        }
        clearDraft();
        location.hash = "#/";
      });

      const bind = (id, key, after) => main.querySelector(id).addEventListener("input", (e) => { d[key] = e.target.value; saveDraft(d); after && after(); updateExport(); });
      bind("#e-op", "operator", () => { main.querySelector("h1").textContent = d.title || "Nowy setup"; });
      bind("#e-title", "title", () => { main.querySelector("h1").textContent = d.title || "Nowy setup"; });
      bind("#e-author", "author");
      bind("#e-desc", "description");
      main.querySelector("#e-map").addEventListener("change", (e) => {
        d.map = e.target.value;
        const m = mapOf();
        d.floor = m.floors[0].id;
        d.site = m.sites[0] ? m.sites[0].id : "";
        d.markers = [];
        selectedId = null;
        saveDraft(d);
        renderPage();
      });
      main.querySelector("#e-floor").addEventListener("change", (e) => { d.floor = e.target.value; saveDraft(d); mountMap(); updateExport(); });
      main.querySelector("#e-site").addEventListener("change", (e) => { d.site = e.target.value; saveDraft(d); updateExport(); });
      main.querySelector("#e-copy").addEventListener("click", async () => {
        const btn = main.querySelector("#e-copy");
        try { await navigator.clipboard.writeText(exportText(d)); btn.textContent = "Skopiowano ✓"; }
        catch { btn.textContent = "Zaznacz i skopiuj ręcznie"; }
        setTimeout(() => (btn.textContent = "Kopiuj wpis"), 1500);
      });

      mountMap();
      renderPanel();
      updateExport();
    }

    function mountMap() {
      const wrap = main.querySelector("#e-mapwrap");
      wrap.innerHTML = "";
      view = MapView.create(wrap, {
        map: mapOf(),
        floorId: d.floor,
        markers: d.markers,
        editable: true,
        selectedId,
        onSelect: (id) => { selectedId = id; renderPanel(); },
        onAdd: ({ x, y, floor }) => {
          const m = { id: newMarkerId(), x, y, type: "gadget", title: "Nowy marker", desc: "" };
          if (floor !== d.floor) m.floor = floor;
          d.markers.push(m);
          selectedId = m.id;
          saveDraft(d);
          view.setMarkers(d.markers);
          view.setSelected(selectedId);
          renderPanel();
          updateExport();
        },
        onMove: () => { saveDraft(d); updateExport(); renderPanel(); },
      });
    }

    function renderPanel() {
      const panel = main.querySelector("#e-panel");
      const m = d.markers.find((x) => x.id === selectedId);
      const list = d.markers.length
        ? `<ul class="marker-list">${d.markers.map((x) => {
            const t = MapView.typeOf(x);
            return `<li class="${x.id === selectedId ? "active" : ""}" data-id="${x.id}"><span class="dot" style="background:${t.color}">${esc(x.label || t.glyph)}</span><span>${esc(x.title || t.label)}</span></li>`;
          }).join("")}</ul>`
        : `<p class="hint">Jeszcze nie ma markerów. Kliknij na mapę.</p>`;

      panel.innerHTML = `<h4>Markery <span class="n">${d.markers.length}</span></h4>${list}` + (m ? `
        <div class="marker-detail marker-form">
          <label>Typ <select id="m-type">${typeOptions(m.type)}</select></label>
          <label>Tytuł <input id="m-title" value="${esc(m.title)}"></label>
          <label>Opis <textarea id="m-desc">${esc(m.desc || "")}</textarea></label>
          <label>Screen (ścieżka, opcjonalnie) <input id="m-image" value="${esc(m.image || "")}" placeholder="setups/nazwa.jpg"></label>
          <div class="row">
            <label>Znak na markerze <input id="m-label" value="${esc(m.label || "")}" maxlength="2" placeholder="auto"></label>
            <label>Pozycja <input value="${m.x}% / ${m.y}%" readonly></label>
          </div>
          <div class="actions">
            <button type="button" class="btn sm danger ghost" id="m-del">Usuń</button>
            <button type="button" class="btn sm" id="m-close">Zamknij</button>
          </div>
        </div>` : `<p class="hint" style="margin-top:10px">Kliknij marker na mapie lub na liście, żeby go edytować.</p>`);

      panel.querySelectorAll("li[data-id]").forEach((li) => li.addEventListener("click", () => {
        selectedId = li.dataset.id;
        view.setSelected(selectedId);
        renderPanel();
      }));
      if (!m) return;
      const upd = (id, key) => panel.querySelector(id).addEventListener("input", (e) => {
        m[key] = e.target.value;
        saveDraft(d);
        view.setMarkers(d.markers); view.setSelected(selectedId);
        updateExport();
        const li = panel.querySelector(`li[data-id="${m.id}"] span:last-child`);
        if (li && key === "title") li.textContent = m.title || MapView.typeOf(m).label;
      });
      upd("#m-title", "title"); upd("#m-desc", "desc"); upd("#m-image", "image"); upd("#m-label", "label");
      panel.querySelector("#m-type").addEventListener("change", (e) => {
        m.type = e.target.value; saveDraft(d);
        view.setMarkers(d.markers); view.setSelected(selectedId);
        renderPanel(); updateExport();
      });
      panel.querySelector("#m-del").addEventListener("click", () => {
        d.markers = d.markers.filter((x) => x.id !== m.id);
        selectedId = null; saveDraft(d);
        view.setMarkers(d.markers); renderPanel(); updateExport();
      });
      panel.querySelector("#m-close").addEventListener("click", () => { selectedId = null; view.setSelected(null); renderPanel(); });
    }

    function updateExport() {
      main.querySelector("#e-out").textContent = exportText(d);
    }

    renderPage();
  }

  return { isEnabled, toggle, getDraft, newDraft, fromSetup, clearDraft, renderEditPage };
})();

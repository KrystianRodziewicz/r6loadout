// Widok mapy: obrazek piętra + markery w procentach + tooltip + (opcjonalnie) edycja.
// Użycie: const view = MapView.create(kontener, { map, floorId, markers, editable, onSelect, onAdd, onMove });

window.MapView = (function () {
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function typeOf(m) {
    return MARKER_TYPES[m.type] || { label: m.type || "?", color: "#ffffff", glyph: "?" };
  }

  function create(root, opts) {
    const state = {
      map: opts.map,
      floorId: opts.floorId || (opts.map.floors[0] && opts.map.floors[0].id),
      defaultFloor: opts.floorId,
      markers: opts.markers || [],
      editable: !!opts.editable,
      selectedId: opts.selectedId ?? null,
      hidden: new Set(),
    };
    const tooltip = document.getElementById("tooltip");
    const el = document.createElement("div");
    el.className = "mapview";
    root.appendChild(el);

    const floor = () => state.map.floors.find((f) => f.id === state.floorId) || state.map.floors[0];
    const markerFloor = (m) => m.floor || state.defaultFloor || state.map.floors[0].id;
    const onFloor = () => state.markers.filter((m) => markerFloor(m) === floor().id);

    function render() {
      const f = floor();
      const floorsHtml = state.map.floors
        .map((fl) => {
          const n = state.markers.filter((m) => markerFloor(m) === fl.id).length;
          return `<button type="button" class="chip ${fl.id === f.id ? "active" : ""}" data-floor="${esc(fl.id)}">${esc(fl.name)}${n ? ` · ${n}` : ""}</button>`;
        })
        .join("");
      const used = [...new Set(onFloor().map((m) => m.type))];
      const legend = Object.keys(MARKER_TYPES)
        .filter((k) => used.includes(k))
        .map((k) => {
          const t = MARKER_TYPES[k];
          return `<button type="button" class="legend-item ${state.hidden.has(k) ? "off" : ""}" data-type="${k}" title="Pokaż / ukryj">
            <span class="dot" style="background:${t.color}">${esc(t.glyph)}</span>${esc(t.label)}</button>`;
        })
        .join("");

      el.innerHTML = `
        <div class="map-toolbar">
          <div class="floors">${floorsHtml}</div>
          <div class="legend">${legend}</div>
        </div>
        <div class="map-stage ${state.editable ? "editable" : ""}">
          <img class="map-img" src="${esc(f.image || "")}" alt="${esc(state.map.name)} ${esc(f.name)}" draggable="false">
          <div class="map-missing" hidden>
            <p>Brak obrazka tego piętra.<br>Wrzuć screen do <code>${esc(f.image || "maps/…")}</code>, strona załaduje go sama.</p>
          </div>
          <div class="markers"></div>
        </div>`;

      const img = el.querySelector(".map-img");
      const missing = el.querySelector(".map-missing");
      if (!f.image) { img.hidden = true; missing.hidden = false; }
      img.addEventListener("error", () => { img.hidden = true; missing.hidden = false; });

      el.querySelectorAll("[data-floor]").forEach((b) => b.addEventListener("click", () => { state.floorId = b.dataset.floor; render(); }));
      el.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
        const t = b.dataset.type;
        state.hidden.has(t) ? state.hidden.delete(t) : state.hidden.add(t);
        render();
      }));

      const stage = el.querySelector(".map-stage");
      if (state.editable) {
        stage.addEventListener("click", (e) => {
          if (e.target.closest(".marker")) return;
          if (suppressClick) { suppressClick = false; return; }
          const p = toPercent(stage, e.clientX, e.clientY);
          opts.onAdd && opts.onAdd({ x: p.x, y: p.y, floor: floor().id });
        });
      }
      renderMarkers();
    }

    let suppressClick = false;

    function toPercent(stage, cx, cy) {
      const r = stage.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((cx - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((cy - r.top) / r.height) * 100));
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    }

    function renderMarkers() {
      const wrap = el.querySelector(".markers");
      const stage = el.querySelector(".map-stage");
      wrap.innerHTML = "";
      onFloor().forEach((m) => {
        const t = typeOf(m);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "marker" + (m.id === state.selectedId ? " selected" : "") + (state.hidden.has(m.type) ? " hidden-type" : "");
        b.style.left = m.x + "%";
        b.style.top = m.y + "%";
        b.style.setProperty("--c", t.color);
        b.textContent = m.label || t.glyph;
        b.dataset.id = m.id;
        b.setAttribute("aria-label", m.title || t.label);

        b.addEventListener("mouseenter", (e) => showTip(m, e));
        b.addEventListener("mousemove", moveTip);
        b.addEventListener("mouseleave", hideTip);
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          if (dragged) { dragged = false; return; }
          state.selectedId = m.id === state.selectedId ? null : m.id;
          renderMarkers();
          opts.onSelect && opts.onSelect(state.selectedId);
        });

        if (state.editable) enableDrag(b, m, stage);
        wrap.appendChild(b);
      });
      if (animateNext) { animateNext = false; window.Anim && Anim.markers(wrap); }
    }
    let animateNext = true;

    let dragged = false;
    function enableDrag(b, m, stage) {
      let start = null;
      b.addEventListener("pointerdown", (e) => {
        start = { x: e.clientX, y: e.clientY };
        b.setPointerCapture(e.pointerId);
        b.classList.add("dragging");
        hideTip();
      });
      b.addEventListener("pointermove", (e) => {
        if (!start) return;
        if (Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) < 3 && !dragged) return;
        dragged = true;
        const p = toPercent(stage, e.clientX, e.clientY);
        b.style.left = p.x + "%";
        b.style.top = p.y + "%";
      });
      const end = (e) => {
        if (!start) return;
        b.classList.remove("dragging");
        if (dragged) {
          const p = toPercent(stage, e.clientX, e.clientY);
          m.x = p.x; m.y = p.y;
          suppressClick = true;
          setTimeout(() => (suppressClick = false), 0);
          opts.onMove && opts.onMove(m.id, p);
        }
        start = null;
      };
      b.addEventListener("pointerup", end);
      b.addEventListener("pointercancel", end);
    }

    function showTip(m, e) {
      const t = typeOf(m);
      tooltip.innerHTML = `<b>${esc(m.title || t.label)}</b>${m.desc ? `<span>${esc(m.desc)}</span>` : `<span>${esc(t.label)}</span>`}`;
      tooltip.hidden = false;
      moveTip(e);
    }
    function moveTip(e) {
      const pad = 14;
      let x = e.clientX + pad, y = e.clientY + pad;
      const r = tooltip.getBoundingClientRect();
      if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - pad;
      if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - pad;
      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
    }
    function hideTip() { tooltip.hidden = true; }

    render();

    return {
      el,
      setFloor(id) { state.floorId = id; animateNext = true; render(); },
      setMarkers(list) { state.markers = list; render(); },
      setSelected(id) { state.selectedId = id; renderMarkers(); },
      getFloor() { return floor().id; },
      destroy() { hideTip(); el.remove(); },
    };
  }

  return { create, typeOf, esc };
})();

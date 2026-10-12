// Tłumaczenia PL / EN. Język zapamiętany w localStorage, przełącznik w sidebarze.
// Użycie: I18n.t("key") albo I18n.t("key", { n: 5 }); I18n.tx(pole) wybiera z { pl, en } albo zwraca string.

window.I18n = (function () {
  const DICT = {
    pl: {
      title: "R6 Loadout",
      tab_ops: "Operatorzy", tab_list: "Lista", tab_maps: "Mapy", tab_duos: "Duety", search_ph: "Szukaj operatora…",
      foot: "Loadouty: meta wg skycoach.gg (10.2026) + własne poprawki.<br>Grafiki: r6data i r6operators (MIT). Flagi: flagcdn.",
      atak: "Atak", obrona: "Obrona", all: "Wszyscy", all_f: "Wszystkie",
      hero_eyebrow: "R6 Loadout · {n} operatorów",
      hero_h1: "Wybierz operatora,<br>dostaniesz najlepszy loadout",
      hero_lead: "Broń główna, boczna, dodatki i gadżety dla każdego operatora Rainbow Six Siege. Kliknij kafelek albo wpisz nazwę w szukajce.",
      count_of: "{a} z {b}", no_match: "Nikt nie pasuje do filtrów.", no_op: "Nie ma takiego operatora.",
      quick_pick: "Szybki wybór", since_release: "Od premiery",
      speed: "Szybkość", health: "Zdrowie", difficulty: "Trudność",
      best_loadout: "Najlepszy loadout", primary: "Broń główna", alt: "Alternatywa", secondary: "Broń boczna",
      gadgets: "Gadżety", notes: "Uwagi", no_data: "brak danych",
      src_note: "Dodatki to rekomendacja meta (skycoach.gg, 10.2026), sprawdzona z danymi broni. Zmienisz je w pliku data/operators.js.",
      list_eyebrow: "Szybki podgląd", list_h1: "Wszystkie loadouty",
      col_op: "Operator", col_primary: "Broń główna", col_secondary: "Broń boczna", col_gadget: "Gadżet", alt_short: "alt:",
      sight: "Celownik", barrel: "Lufa", grip: "Chwyt", under: "Podlufowe", no_att: "bez dodatków",
      when: "Kiedy brać",
      maps_eyebrow: "Mapy", maps_h1: "Najlepsi operatorzy na mapę", maps_lead: "Wybierz mapę, zobaczysz po pięciu operatorów na atak i obronę. Kliknij operatora, żeby przejść do jego loadoutu.",
      maps_all: "← Wszystkie mapy", map_attack: "Najlepsi w ataku", map_defense: "Najlepsi w obronie",
      maps_note: "Skąd to jest: zestawienie GamersDecide (07.2022) poprawione o wzmianki z poradników 2026. To punkt wyjścia, nie statystyki win rate.",
      own_pick: "Dobór własny: dla tej mapy nie znalazłem zestawienia, wziąłem operatorów z topu tier list 2026.",
      duos_eyebrow: "Duety", duos_h1: "Najlepsze duety operatorów", duos_lead: "Pary, które razem robią więcej niż osobno: co dają i jak to zagrać.",
      how: "Jak grać", src_gd: "GamersDecide 05.2023", src_guide: "poradniki 2026", src_classic: "klasyczne combo",
      duos_note: "Balans gry się zmienia. Opisy pochodzą z zestawień z lat 2023–2026 i ze znanych od dawna zagrań, sprawdźcie je po każdym patchu.",
      cls: { ar: "Karabin szturmowy", smg: "Pistolet maszynowy", shotgun: "Strzelba", dmr: "Karabin wyborowy", lmg: "Karabin maszynowy",
        sniper: "Karabin snajperski", pistol: "Pistolet", mp: "Pistolet automatyczny", revolver: "Rewolwer", shield: "Tarcza", launcher: "Wyrzutnia" },
      when_txt: {
        variant: "Ten sam model w innej konfiguracji.",
        p_ar: "Domyślny wybór. Uniwersalny karabin na średni i daleki dystans, sprawdza się w każdej rundzie.",
        p_smg: "Domyślny wybór. Szybkostrzelny, najlepszy na bliski i średni dystans, czyli większość walk w budynku.",
        p_dmr: "Gdy grasz z dystansu i trzymasz długie linie. Duże obrażenia na strzał, ale wymaga celności.",
        p_lmg: "Duży magazynek do prefire'ów oraz niszczenia gadżetów i podłóg. Wolniej się z nim celuje.",
        p_shotgun: "Gdy masz mocną broń boczną. Strzelbą robisz rotacje i dziury na site, a walczysz boczną.",
        p_slug: "Strzelba na pociski slug, gra się nią jak karabinem wyborowym: mocny pojedynczy strzał, mały magazynek.",
        p_sniper: "Jeden strzał w tułów powala. Graj z dystansu i nie wchodź pierwszy.",
        p_shield: "Idziesz z przodu, zbierasz informacje i osłaniasz plant. Walczysz bronią boczną.",
        a_ar: "Inny odrzut i szybkostrzelność. Weź go, jeśli lepiej ci leży niż broń główna.",
        a_smg: "Gdy grasz blisko i szybko, na krótkie dystanse.",
        a_dmr: "Na mapach z długimi liniami i przy grze z zewnątrz przez okna. Trudniejszy w ciasnych pokojach.",
        a_lmg: "Gdy chcesz więcej amunicji do prefire'ów i niszczenia podłóg lub gadżetów.",
        a_shotgun: "Gdy drużynie brakuje kogoś do otwierania miękkich ścian i hatchy albo grasz bardzo ciasny site.",
        a_slug: "Gdy wolisz pojedyncze, mocne strzały na dystans zamiast serii.",
        s_pistol: "Awaryjna. Wyciągasz ją, gdy skończy się magazynek, bo zmiana broni jest szybsza niż przeładowanie.",
        s_mp: "Twoja broń na bliski dystans, szczególnie gdy główna to strzelba, DMR albo tarcza.",
        s_shotgun: "Narzędzie, nie broń do walki: robi rotacje, otwiera barykady, hatche i miękkie ściany.",
        s_revolver: "Mocny pojedynczy strzał. Awaryjna, gdy skończy się magazynek.",
        s_bailiff: "Mała strzelba w rewolwerze: robi dziury na linie strzału i przejścia do skakania.",
        s_launcher: "Jeden strzał do niszczenia gadżetów: tarcze, lustro Miry, kamery kuloodporne, pułapki.",
      },
      lang_switch: "English",
    },
    en: {
      title: "R6 Loadout",
      tab_ops: "Operators", tab_list: "List", tab_maps: "Maps", tab_duos: "Duos", search_ph: "Search operator…",
      foot: "Loadouts: meta per skycoach.gg (Oct 2026) + own tweaks.<br>Artwork: r6data and r6operators (MIT). Flags: flagcdn.",
      atak: "Attack", obrona: "Defense", all: "All", all_f: "All",
      hero_eyebrow: "R6 Loadout · {n} operators",
      hero_h1: "Pick an operator,<br>get the best loadout",
      hero_lead: "Primary, secondary, attachments and gadgets for every Rainbow Six Siege operator. Click a tile or type a name in the search box.",
      count_of: "{a} of {b}", no_match: "Nobody matches the filters.", no_op: "No such operator.",
      quick_pick: "Quick pick", since_release: "Since launch",
      speed: "Speed", health: "Health", difficulty: "Difficulty",
      best_loadout: "Best loadout", primary: "Primary", alt: "Alternative", secondary: "Secondary",
      gadgets: "Gadgets", notes: "Notes", no_data: "no data",
      src_note: "Attachments are a meta recommendation (skycoach.gg, Oct 2026), checked against weapon data. Edit them in data/operators.js.",
      list_eyebrow: "Quick view", list_h1: "All loadouts",
      col_op: "Operator", col_primary: "Primary", col_secondary: "Secondary", col_gadget: "Gadget", alt_short: "alt:",
      sight: "Sight", barrel: "Barrel", grip: "Grip", under: "Underbarrel", no_att: "no attachments",
      when: "When to take",
      maps_eyebrow: "Maps", maps_h1: "Best operators per map", maps_lead: "Pick a map to see five operators for attack and for defense. Click an operator to open their loadout.",
      maps_all: "← All maps", map_attack: "Best attackers", map_defense: "Best defenders",
      maps_note: "Where this comes from: the GamersDecide roundup (Jul 2022) adjusted with mentions from 2026 guides. A starting point, not win-rate statistics.",
      own_pick: "Own pick: I found no roundup for this map, so I took operators from the top of 2026 tier lists.",
      duos_eyebrow: "Duos", duos_h1: "Best operator duos", duos_lead: "Pairs that do more together than apart: what they give you and how to play it.",
      how: "How to play", src_gd: "GamersDecide May 2023", src_guide: "2026 guides", src_classic: "classic combo",
      duos_note: "Game balance changes. Descriptions come from 2023–2026 roundups and long-known plays, so re-check them after each patch.",
      cls: { ar: "Assault rifle", smg: "Submachine gun", shotgun: "Shotgun", dmr: "Marksman rifle", lmg: "Light machine gun",
        sniper: "Sniper rifle", pistol: "Handgun", mp: "Machine pistol", revolver: "Revolver", shield: "Shield", launcher: "Launcher" },
      when_txt: {
        variant: "The same weapon in a different setup.",
        p_ar: "Default pick. An all-round rifle for mid and long range that works every round.",
        p_smg: "Default pick. Fast-firing and best at close to mid range, which is most indoor fights.",
        p_dmr: "When you play at range and hold long angles. High damage per shot, but it rewards accuracy.",
        p_lmg: "A big magazine for prefiring and destroying gadgets and floors. Slower to aim.",
        p_shotgun: "When you have a strong sidearm. The shotgun makes rotations and holes on site, you fight with the sidearm.",
        p_slug: "A slug shotgun that plays like a marksman rifle: a strong single shot and a small magazine.",
        p_sniper: "One body shot downs. Play at range and do not go in first.",
        p_shield: "You go in front, gather intel and cover the plant. You fight with the sidearm.",
        a_ar: "Different recoil and fire rate. Take it if it suits you better than the primary.",
        a_smg: "When you play close and fast, at short range.",
        a_dmr: "On maps with long sightlines and when playing from outside through windows. Harder in tight rooms.",
        a_lmg: "When you want more ammo for prefiring and destroying floors or gadgets.",
        a_shotgun: "When the team lacks someone to open soft walls and hatches, or the site is very tight.",
        a_slug: "When you prefer strong single shots at range over bursts.",
        s_pistol: "A backup. Draw it when the magazine runs dry, because swapping is faster than reloading.",
        s_mp: "Your close-range weapon, especially when the primary is a shotgun, DMR or shield.",
        s_shotgun: "A tool, not a fighting weapon: it makes rotations and opens barricades, hatches and soft walls.",
        s_revolver: "A strong single shot. A backup for when the magazine runs dry.",
        s_bailiff: "A small shotgun in a revolver: it makes murder holes and vault-sized openings.",
        s_launcher: "One shot for destroying gadgets: shields, Mira windows, bulletproof cameras, traps.",
      },
      lang_switch: "Polski",
    },
  };

  let lang = "pl";
  try {
    const saved = localStorage.getItem("r6loadout.lang");
    if (saved && DICT[saved]) lang = saved;
    else if (navigator.language && !navigator.language.toLowerCase().startsWith("pl")) lang = "en";
  } catch { /* brak localStorage */ }

  function t(key, vars) {
    const v = DICT[lang][key] ?? DICT.pl[key] ?? key;
    if (typeof v !== "string") return v;
    return vars ? v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? "")) : v;
  }
  function tx(v) {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v[lang] || v.pl || v.en || "";
  }
  function get() { return lang; }
  function set(l) {
    if (!DICT[l] || l === lang) return;
    lang = l;
    try { localStorage.setItem("r6loadout.lang", l); } catch { /* ignoruj */ }
    document.dispatchEvent(new CustomEvent("lang-change"));
  }
  function toggle() { set(lang === "pl" ? "en" : "pl"); }

  return { t, tx, get, set, toggle };
})();

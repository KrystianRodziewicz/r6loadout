# R6 Loadout

**EN:** The best loadout for every Rainbow Six Siege operator, in seconds. Pick an operator and you get the primary, alternative and secondary weapon drawn like the in-game loadout screen: lines point at the sight, barrel, grip and underbarrel with the attachment's icon and name, plus gadgets and a short "when to take it" for each weapon. There are also tabs for the best operators per map and the best operator duos. Polish / English switch in the sidebar.

**PL:** Najlepszy loadout dla każdego operatora Rainbow Six Siege, w kilka sekund. Wybierasz operatora i dostajesz broń główną, alternatywę i broń boczną narysowane jak w ekranie wyposażenia w grze: linie wskazują celownik, lufę, chwyt i podlufowe z ikoną i nazwą dodatku, do tego gadżety i krótkie „kiedy brać” przy każdej broni. Są też zakładki z najlepszymi operatorami na mapę i najlepszymi duetami. Przełącznik PL / EN w sidebarze.

Pure HTML + CSS + JS, no backend, no build step. Works by double-clicking `index.html` and on GitHub Pages.

## Run it / Uruchomienie

- **Online:** GitHub Pages of this repo (Settings → Pages → branch `main`, folder `/ (root)`).
- **Locally:** Code → Download ZIP, unpack, double-click `index.html`.

Weapon, attachment and gadget graphics are bundled in `img/`. Operator portraits, map thumbnails, operator icons, flags and the animation libraries load from CDNs, so without internet you see initials instead of portraits and no animations.

## Tabs / Zakładki

| Tab | What it shows |
|---|---|
| Operatorzy / Operators | Tile picker, then the operator page: portrait, stats, loadout cards, gadgets |
| Lista / List | Every loadout in one table |
| Mapy / Maps | Five attackers and five defenders per ranked map |
| Duety / Duos | Operator pairs with what they do together and how to play it |

## Files / Pliki

```
index.html            page
favicon.svg           icon
css/style.css         styles
js/app.js             routing, pages, PL/EN
js/weapons.js         weapon card: image + callout lines + "when to take"
js/i18n.js            translations PL / EN
js/anim.js            animations (anime.js) + background (Vanta NET)
data/operators.js     OPERATORS & LOADOUTS            ← edit recommendations here
data/maps.js          best operators per map          ← edit
data/duos.js          operator duos                   ← edit
data/opmeta.js        unit, country, season, ratings (from r6operators)
data/weapons.js       weapon → class map, default attachments
data/weaponImages.js  generated: weapon image + where each callout line attaches
data/config.js        CDN path for portraits and maps, gadget icon map
img/weapons/          weapon images (111)
img/attachments/      sight, barrel, grip, laser icons
img/gadgets/          gadget icons
```

## Edit a loadout / Jak zmienić loadout

Open `data/operators.js`, find the operator, change the fields:

```js
{ id: "thermite", name: "Thermite", side: "atak", roles: ["Hard breach"],
  loadout: {
    primary:   { weapon: "556XI",  sight: "Magnified", barrel: "Flash hider", grip: "Vertical grip", under: "Laser" },
    alt:       null,                                   // or a second object like above
    secondary: { weapon: "ITA12S", sight: "Iron sights", barrel: "—", under: "Laser" },
    gadget: "Flashbang", gadgetAlt: "Smoke",
    notes: { pl: "Uwaga po polsku.", en: "Note in English." },
  } },
```

- `weapon` must match a name in `data/weapons.js`. That decides the weapon class, the image and the "when to take" text.
- `"—"` means no attachment. A missing field gets a default by weapon class and side.
- Sight names the icons understand: `Magnified`, `Telescopic`, `Holo`, `Red Dot`, `Reflex`, `Iron sights`. Barrels: `Flash hider`, `Muzzle brake`, `Compensator`, `Suppressor`, `Extended barrel`. Grips: `Vertical grip`, `Angled grip`, `Horizontal grip`. Underbarrel: `Laser`.
- Add `when: { pl: "...", en: "..." }` to a weapon to replace the generated "when to take" text.

## How reliable is the data / Na ile można ufać danym

- **Loadouts:** the meta roundup at [skycoach.gg](https://skycoach.gg/blog/r6/articles/best-loadouts-for-operators) (10 Oct 2026). Where the article names an attachment, that wins. Slots it does not mention were filled by a simple rule (flash hider or muzzle brake, vertical grip, laser) only when the weapon data in [ISimpForVi/Siege-Data](https://github.com/ISimpForVi/Siege-Data) says the slot exists. A suppressor is never added by default.
- **Not verified:** Reaper MK2, PCX-33, Glaive-12, UZK50GI, POF-9, .44 Vendetta and Rauora's LMG are newer than that weapon data, so their attachments come from the article alone.
- **Maps:** the [GamersDecide per-map list](https://www.gamersdecide.com/articles/r6-best-operators-for-each-map) (Jul 2022) adjusted with mentions from 2026 guides. Lair and Nighthaven Labs are our own pick. A starting point, not win-rate statistics.
- **Duos:** the [GamersDecide duo list](https://www.gamersdecide.com/articles/rainbow-six-siege-best-operator-duos-1) (May 2023), mentions from 2026 guides and long-known community combos. Each card says which.
- **"When to take":** generated from the weapon class and slot, not from a source.

Balance changes every season. Check after each patch.

## Credits / Źródła grafik

- Weapon, attachment, gadget images, operator portraits, map thumbnails: [danielwerg/r6data](https://github.com/danielwerg/r6data) (MIT).
- Operator icons and metadata: [r6operators](https://www.npmjs.com/package/r6operators) (MIT, marcopixel).
- Flags: [flagcdn.com](https://flagcdn.com). Animations: [anime.js](https://animejs.com). Background: [Vanta.js](https://www.vantajs.com) on three.js.

Fan project, not affiliated with Ubisoft. Rainbow Six Siege, its operators, weapons and maps are property of Ubisoft Entertainment; the artwork is used non-commercially.

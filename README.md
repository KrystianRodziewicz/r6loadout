# R6 Loadout

Najlepszy loadout dla każdego operatora Rainbow Six Siege, w kilka sekund.
Wybierasz operatora, dostajesz broń główną, alternatywę, broń boczną, dodatki (celownik, lufa, chwyt, laser)
i gadżety, narysowane jak w ekranie wyposażenia w grze.

Czysty HTML + CSS + JS, bez backendu. Działa z dwukliku na `index.html` i na GitHub Pages.

## Jak uruchomić

**Online:** otwórz stronę GitHub Pages tego repo (Settings → Pages → branch `main`, folder `/ (root)`).

**Lokalnie:** pobierz repo (Code → Download ZIP), rozpakuj, kliknij dwa razy `index.html`.
Ikony operatorów, flagi i animacje dociągają się z internetu. Bez sieci zobaczysz inicjały zamiast ikon i stronę bez animacji.

## Co jest w środku

```
index.html          strona
css/style.css       wygląd
js/app.js           wybór operatora, strona operatora, lista
js/weapons.js       rysowanie broni (schemat) + linie do dodatków
js/anim.js          animacje (anime.js) i tło (Vanta NET)
data/operators.js   OPERATORZY I LOADOUTY   ← tu edytujesz rekomendacje
data/opmeta.js      jednostka, kraj, sezon, statystyki (z paczki r6operators)
data/weapons.js     słownik broń → klasa + domyślne dodatki
```

## Jak zmienić loadout

Otwórz `data/operators.js`, znajdź operatora i popraw pola:

```js
{ id: "thermite", name: "Thermite", side: "atak", roles: ["Hard breach"],
  loadout: {
    primary:   { weapon: "556XI",  sight: "2.5x", barrel: "Flash hider", grip: "Vertical grip", under: "—" },
    alt:       null,                                   // albo drugi obiekt jak wyżej
    secondary: { weapon: "ITA12S", sight: "Iron", barrel: "—", under: "Laser" },
    gadget: "Flashbang", gadgetAlt: "Smoke",
    notes: "Dowolna uwaga, pokaże się pod loadoutem.",
  } },
```

- `weapon` musi być nazwą z `data/weapons.js`, bo od niej zależy rysunek (karabin, SMG, strzelba, pistolet…).
  Nowa broń? Dopisz ją do słownika `WEAPONS` z klasą.
- `"—"` oznacza brak dodatku. Pominięte pole dostaje domyślną wartość wg klasy broni i strony (atak 2.5x, obrona 1.5x).
- Po zmianie: commit + push, GitHub Pages odświeży stronę w minutę.

## Źródła

- Loadouty: zestawienie meta z [skycoach.gg](https://skycoach.gg/blog/r6/articles/best-loadouts-for-operators) (10.10.2026), przepisane do własnej struktury i uzupełnione.
- Ikony operatorów i metadane: [r6operators](https://www.npmjs.com/package/r6operators) (MIT, autor marcopixel). Grafiki operatorów są własnością Ubisoft.
- Flagi: [flagcdn.com](https://flagcdn.com).
- Animacje: [anime.js](https://animejs.com), tło: [Vanta.js](https://www.vantajs.com) na three.js.

Projekt fanowski, nie jest powiązany z Ubisoft. Rysunki broni to stylizowane schematy, nie modele z gry.

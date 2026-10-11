# R6 Setupy

Strona z setupami operatorów Rainbow Six Siege rozrysowanymi na planach pięter.
Wybierasz operatora, widzisz jego loadout i setupy na mapach z markerami (gadżety, pozycje, rotacje, wzmocnienia).
Można też wejść od strony mapy i zobaczyć wszystkie setupy na danym site.

Czysty HTML + CSS + JS, bez backendu. Dane w plikach `.js`, więc `index.html` działa z dwukliku i na GitHub Pages.

## Struktura

```
index.html          strona
css/style.css       wygląd
js/app.js           routing, sidebar, strony operatora / mapy
js/mapview.js       obrazek piętra + markery + tooltip + przeciąganie
js/editor.js        edytor setupów (stawianie markerów, eksport wpisu)
js/anim.js          animacje (anime.js)
data/operators.js   operatorzy i loadouty          ← edytuj
data/maps.js        mapy, piętra, site'y            ← edytuj
data/markers.js     typy markerów (kolory, litery)  ← edytuj
data/setups.js      BAZA SETUPÓW                    ← tu wklejasz nowe wpisy
maps/<mapa>/        obrazki pięter                  ← tu wrzucasz screeny
setups/             (opcjonalnie) screeny do markerów
```

## Skąd wziąć obrazki map

Strona nie zawiera planów prawdziwych map. Grafik z innych stron (np. r6prep) nie wolno kopiować bez zgody autora.
Legalne opcje:

1. **Własne screeny z gry.** Wejdź na mapę w trybie treningowym / custom, otwórz widok drona albo zrób screen z góry
   w fazie przygotowania, przytnij do samego piętra. Zapisz jako `maps/<id mapy>/<id piętra>.jpg`.
2. **Oficjalne blueprinty Ubisoftu** z ich strony map (do użytku fanowskiego).
3. **Własny schemat** (jak `maps/przyklad/1f.svg`), narysowany w dowolnym programie.

Ścieżki do obrazków są w `data/maps.js`. Dopóki pliku nie ma, strona pokazuje komunikat zamiast mapy, ale markery i tak można stawiać.

Ikony operatorów pochodzą z paczki open-source [r6operators](https://www.npmjs.com/package/r6operators) i ładują się z CDN.
Bez internetu zamiast ikon pokażą się inicjały.

## Jak dodać setup

1. Otwórz stronę, w lewym dolnym rogu włącz **Edytor**.
2. Wejdź na operatora, kliknij **+ Nowy setup** (albo na istniejącym setupie **Edytuj kopię**).
3. Wybierz mapę, piętro, site, wpisz tytuł i opis.
4. Klikaj na mapę, żeby stawiać markery. Przeciągnij, żeby przesunąć. Kliknij marker, żeby ustawić typ, tytuł, opis
   i (opcjonalnie) ścieżkę do screena z gry.
5. Na dole kliknij **Kopiuj wpis**.
6. Otwórz `data/setups.js`, wklej wpis **na końcu** listy `SETUPS` (przed `];`).
7. Commit + push:

```bash
git pull
git add data/setups.js
git commit -m "Setup: Mute Bank 2F CEO"
git push
```

Szkic edytora zapisuje się w przeglądarce (localStorage), więc odświeżenie strony go nie kasuje.

## Uruchomienie lokalnie

Dwuklik na `index.html`. Nie potrzeba serwera.

## Hosting na GitHub Pages

1. Repo na GitHubie, push na `main`.
2. **Settings → Pages**, Source: Deploy from a branch, branch `main`, folder `/ (root)`.
3. Po minucie: `https://<nick>.github.io/<repo>/`. Każdy push aktualizuje stronę.

## Format danych

Setup:

```js
{
  id: "mute-bank-2f-ceo-default",
  operator: "mute",            // id z operators.js
  map: "bank",                 // id z maps.js
  floor: "2f",                 // domyślne piętro
  site: "2f-ceo",              // id site'u, może być ""
  title: "Default obrona CEO",
  author: "krystian",
  updated: "2026-10-11",
  description: "Opis.",
  markers: [
    { x: 42.5, y: 31.0, type: "gadget", title: "Jammer 1", desc: "Pod ścianą.", image: "setups/mute-ceo-1.jpg" },
  ],
}
```

`x`, `y` to procenty szerokości i wysokości obrazka, więc rozmiar pliku nie ma znaczenia.
Typy markerów: `gadget`, `position`, `rotate`, `reinforce`, `hole`, `breach`, `drone`, `bomb`, `danger`, `note` (lista w `data/markers.js`).

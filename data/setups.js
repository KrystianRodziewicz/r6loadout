// Setupy. Jeden wpis = jeden setup operatora na jednym site.
// Najłatwiej dodać przez edytor na stronie (przycisk "Edytor" w lewym dolnym rogu),
// potem skopiować wygenerowany wpis i wkleić go NA KOŃCU tej listy.
//
// Pola:
//   id          - unikalne, bez spacji (edytor generuje sam)
//   operator    - id operatora z operators.js
//   map         - id mapy z maps.js
//   floor       - id piętra z maps.js (domyślne piętro dla markerów)
//   site        - id site'u z maps.js (może być puste)
//   title       - nazwa setupu
//   author      - kto dodał
//   updated     - data RRRR-MM-DD
//   description - opis, może być kilka zdań
//   markers     - lista markerów:
//       x, y     - procent szerokości / wysokości obrazka (0–100)
//       type     - klucz z markers.js (gadget, position, rotate, reinforce, hole, breach, drone, bomb, danger, note)
//       title    - krótki tytuł
//       desc     - dłuższy opis (opcjonalnie)
//       image    - ścieżka do screena z gry (opcjonalnie), np. "setups/mute-biuro-jammer1.jpg"
//       floor    - id piętra, jeśli marker jest na innym piętrze niż domyślne (opcjonalnie)
//       label    - własna litera/znak na markerze (opcjonalnie)

const SETUPS = [
  {
    id: "mute-przyklad-biuro-default",
    operator: "mute",
    map: "przyklad",
    floor: "1f",
    site: "1f-biuro",
    title: "Default obrona Biuro / Magazyn",
    author: "przykład",
    updated: "2026-10-11",
    description: "Przykładowy setup na schemacie. Jammery pod ścianami od Holu i Korytarza, rotacja między Biurem a Magazynem, anchor w Magazynie.",
    markers: [
      { x: 55.5, y: 20.0, type: "gadget", title: "Jammer 1", desc: "Pod ścianą Magazyn–Hol, blokuje hard breach i drony z Holu." },
      { x: 55.5, y: 38.0, type: "gadget", title: "Jammer 2", desc: "Drugi jammer na dolnej części tej samej ściany." },
      { x: 30.0, y: 46.0, type: "gadget", title: "Jammer 3", desc: "Przy drzwiach Biuro–Korytarz, żeby drony nie wjeżdżały." },
      { x: 56.0, y: 28.0, type: "reinforce", title: "Wzmocnić", desc: "Cała ściana Magazyn–Hol." },
      { x: 31.0, y: 28.0, type: "rotate", title: "Rotacja", desc: "Dziura na przebiegnięcie między Biurem a Magazynem." },
      { x: 44.0, y: 20.0, type: "position", title: "Anchor", desc: "Róg Magazynu, widok na drzwi od Korytarza." },
      { x: 18.0, y: 53.0, type: "danger", title: "Uwaga", desc: "Drzwi z Korytarza, najczęstsze wejście. Nie stać tu w prepie." },
    ],
  },
  {
    id: "thermite-przyklad-biuro-hol",
    operator: "thermite",
    map: "przyklad",
    floor: "1f",
    site: "1f-biuro",
    title: "Hard breach od Holu",
    author: "przykład",
    updated: "2026-10-11",
    description: "Przykładowy atak na schemacie. Thatcher czyści ścianę, Thermite otwiera Magazyn od Holu, drona w Korytarzu pilnuje flanki.",
    markers: [
      { x: 58.0, y: 28.0, type: "breach", title: "Exo", desc: "Ściana Hol–Magazyn, po EMP od Thatchera." },
      { x: 66.0, y: 28.0, type: "position", title: "Thatcher", desc: "Rzuca EMP przez ścianę zanim Thermite podejdzie." },
      { x: 75.0, y: 20.0, type: "position", title: "Cover", desc: "Ktoś trzyma Hol z tego rogu w czasie breachu." },
      { x: 50.0, y: 50.5, type: "drone", title: "Dron", desc: "W Korytarzu, patrzy na drzwi Biuro i Kuchnia." },
      { x: 44.0, y: 20.0, type: "danger", title: "Anchor", desc: "Typowa pozycja obrońcy po otwarciu ściany." },
      { x: 20.0, y: 27.0, type: "bomb", label: "A", title: "Bomba A", desc: "Biuro" },
      { x: 44.0, y: 35.0, type: "bomb", label: "B", title: "Bomba B", desc: "Magazyn" },
    ],
  },
  {
    id: "jager-bank-2f-ceo-ads",
    operator: "jager",
    map: "bank",
    floor: "2f",
    site: "2f-ceo",
    title: "ADS-y na CEO",
    author: "przykład",
    updated: "2026-10-11",
    description: "Wpis na prawdziwej mapie, ale bez obrazka piętra. Wrzuć screen do maps/bank/2f.jpg i markery pojawią się na nim.",
    markers: [
      { x: 40.0, y: 30.0, type: "gadget", title: "ADS 1", desc: "Za biurkiem CEO." },
      { x: 60.0, y: 45.0, type: "gadget", title: "ADS 2", desc: "Executive, róg przy oknie." },
      { x: 50.0, y: 60.0, type: "gadget", title: "ADS 3", desc: "Korytarz za site'em." },
    ],
  },
];

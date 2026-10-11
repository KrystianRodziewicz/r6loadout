// Mapy, piętra i site'y.
// Obrazek piętra wrzucasz do maps/<id mapy>/<id piętra>.jpg (albo .png / .webp)
// i wpisujesz ścieżkę w polu "image". Jak pliku nie ma, strona pokaże komunikat zamiast mapy.
//
// Site'y spisane z pamięci, popraw jeśli coś się nie zgadza z aktualną wersją gry.

const MAPS = [
  {
    id: "przyklad",
    name: "Przykładowa mapa",
    note: "Schemat do testów. Podmień na własne screeny prawdziwych map.",
    floors: [
      { id: "1f", name: "1F", image: "maps/przyklad/1f.svg" },
    ],
    sites: [
      { id: "1f-biuro", name: "1F Biuro / Magazyn", floor: "1f" },
      { id: "1f-kuchnia", name: "1F Kuchnia / Jadalnia", floor: "1f" },
    ],
  },
  {
    id: "bank",
    name: "Bank",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/bank/b.jpg" },
      { id: "1f", name: "1F", image: "maps/bank/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/bank/2f.jpg" },
    ],
    sites: [
      { id: "b-lockers", name: "B Lockers / CCTV", floor: "b" },
      { id: "1f-tellers", name: "1F Tellers / Archives", floor: "1f" },
      { id: "1f-open", name: "1F Open Area / Staff Room", floor: "1f" },
      { id: "2f-ceo", name: "2F CEO / Executive", floor: "2f" },
    ],
  },
  {
    id: "border",
    name: "Border",
    floors: [
      { id: "1f", name: "1F", image: "maps/border/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/border/2f.jpg" },
    ],
    sites: [
      { id: "1f-customs", name: "1F Customs / Supply", floor: "1f" },
      { id: "1f-bathroom", name: "1F Bathroom / Tellers", floor: "1f" },
      { id: "2f-armory", name: "2F Armory / Archives", floor: "2f" },
      { id: "2f-workshop", name: "2F Workshop / Ventilation", floor: "2f" },
    ],
  },
  {
    id: "chalet",
    name: "Chalet",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/chalet/b.jpg" },
      { id: "1f", name: "1F", image: "maps/chalet/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/chalet/2f.jpg" },
    ],
    sites: [
      { id: "b-wine", name: "B Wine Cellar / Garage", floor: "b" },
      { id: "1f-bar", name: "1F Bar / Gaming Room", floor: "1f" },
      { id: "1f-kitchen", name: "1F Kitchen / Dining", floor: "1f" },
      { id: "2f-master", name: "2F Master Bedroom / Office", floor: "2f" },
    ],
  },
  {
    id: "clubhouse",
    name: "Clubhouse",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/clubhouse/b.jpg" },
      { id: "1f", name: "1F", image: "maps/clubhouse/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/clubhouse/2f.jpg" },
    ],
    sites: [
      { id: "b-church", name: "B Church / Arsenal", floor: "b" },
      { id: "1f-bar", name: "1F Bar / Stock", floor: "1f" },
      { id: "2f-gym", name: "2F Gym / Bedroom", floor: "2f" },
      { id: "2f-cctv", name: "2F CCTV / Cash", floor: "2f" },
    ],
  },
  {
    id: "coastline",
    name: "Coastline",
    floors: [
      { id: "1f", name: "1F", image: "maps/coastline/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/coastline/2f.jpg" },
    ],
    sites: [
      { id: "1f-kitchen", name: "1F Kitchen / Service", floor: "1f" },
      { id: "1f-bars", name: "1F Blue Bar / Sunrise Bar", floor: "1f" },
      { id: "2f-hookah", name: "2F Hookah / Billiards", floor: "2f" },
      { id: "2f-penthouse", name: "2F Penthouse / Theater", floor: "2f" },
    ],
  },
  {
    id: "consulate",
    name: "Consulate",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/consulate/b.jpg" },
      { id: "1f", name: "1F", image: "maps/consulate/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/consulate/2f.jpg" },
    ],
    sites: [
      { id: "b-garage", name: "B Garage / Cafeteria", floor: "b" },
      { id: "1f-lobby", name: "1F Lobby / Press Room", floor: "1f" },
      { id: "1f-piano", name: "1F Piano Room / Antechamber", floor: "1f" },
      { id: "2f-consul", name: "2F Consul Office / Meeting Room", floor: "2f" },
    ],
  },
  {
    id: "kafe",
    name: "Kafe Dostoyevsky",
    floors: [
      { id: "1f", name: "1F", image: "maps/kafe/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/kafe/2f.jpg" },
      { id: "3f", name: "3F", image: "maps/kafe/3f.jpg" },
    ],
    sites: [
      { id: "1f-kitchen", name: "1F Kitchen Service / Kitchen Cooking", floor: "1f" },
      { id: "2f-mining", name: "2F Mining Room / Fireplace Hall", floor: "2f" },
      { id: "2f-reading", name: "2F Reading Room / Fireplace Hall", floor: "2f" },
      { id: "3f-bar", name: "3F Cocktail Lounge / Bar", floor: "3f" },
    ],
  },
  {
    id: "kanal",
    name: "Kanal",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/kanal/b.jpg" },
      { id: "1f", name: "1F", image: "maps/kanal/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/kanal/2f.jpg" },
    ],
    sites: [
      { id: "b-supply", name: "B Supply Room / Kayaks", floor: "b" },
      { id: "1f-coast", name: "1F Coast Guard Meeting / Lounge", floor: "1f" },
      { id: "2f-radar", name: "2F Radar Room / Server Room", floor: "2f" },
      { id: "2f-kitchen", name: "2F Kitchen / Projector Room", floor: "2f" },
    ],
  },
  {
    id: "lair",
    name: "Lair",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/lair/b.jpg" },
      { id: "1f", name: "1F", image: "maps/lair/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/lair/2f.jpg" },
    ],
    sites: [
      { id: "b-bunker", name: "B Bunker / Lab", floor: "b" },
      { id: "1f-control", name: "1F Control Room / Armory", floor: "1f" },
      { id: "2f-rd", name: "2F R&D / Server", floor: "2f" },
    ],
  },
  {
    id: "nighthaven",
    name: "Nighthaven Labs",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/nighthaven/b.jpg" },
      { id: "1f", name: "1F", image: "maps/nighthaven/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/nighthaven/2f.jpg" },
    ],
    sites: [
      { id: "b-tank", name: "B Tank Room / Assembly", floor: "b" },
      { id: "1f-storage", name: "1F Storage / Server", floor: "1f" },
      { id: "2f-command", name: "2F Command Center / Workshop", floor: "2f" },
    ],
  },
  {
    id: "oregon",
    name: "Oregon",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/oregon/b.jpg" },
      { id: "1f", name: "1F", image: "maps/oregon/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/oregon/2f.jpg" },
    ],
    sites: [
      { id: "b-laundry", name: "B Laundry / Supply", floor: "b" },
      { id: "1f-kitchen", name: "1F Kitchen / Dining Hall", floor: "1f" },
      { id: "1f-meeting", name: "1F Meeting Hall / Kitchen", floor: "1f" },
      { id: "2f-dorms", name: "2F Kids' Dorm / Dorm Main Hall", floor: "2f" },
    ],
  },
  {
    id: "outback",
    name: "Outback",
    floors: [
      { id: "1f", name: "1F", image: "maps/outback/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/outback/2f.jpg" },
    ],
    sites: [
      { id: "1f-nature", name: "1F Nature Room / Bushranger Room", floor: "1f" },
      { id: "1f-compressor", name: "1F Compressor Room / Gear Store", floor: "1f" },
      { id: "2f-laundry", name: "2F Laundry / Games Room", floor: "2f" },
      { id: "2f-office", name: "2F Office / Party Room", floor: "2f" },
    ],
  },
  {
    id: "skyscraper",
    name: "Skyscraper",
    floors: [
      { id: "1f", name: "1F", image: "maps/skyscraper/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/skyscraper/2f.jpg" },
    ],
    sites: [
      { id: "1f-kitchen", name: "1F Kitchen / BBQ", floor: "1f" },
      { id: "1f-bedroom", name: "1F Bedroom / Bathroom", floor: "1f" },
      { id: "2f-tea", name: "2F Tea Room / Karaoke", floor: "2f" },
      { id: "2f-exhibition", name: "2F Exhibition / Office", floor: "2f" },
    ],
  },
  {
    id: "themepark",
    name: "Theme Park",
    floors: [
      { id: "1f", name: "1F", image: "maps/themepark/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/themepark/2f.jpg" },
    ],
    sites: [
      { id: "1f-armory", name: "1F Armory / Throne Room", floor: "1f" },
      { id: "1f-lab", name: "1F Lab / Storage", floor: "1f" },
      { id: "2f-bunk", name: "2F Bunk / Day Care", floor: "2f" },
      { id: "2f-initiation", name: "2F Initiation Room / Office", floor: "2f" },
    ],
  },
  {
    id: "villa",
    name: "Villa",
    floors: [
      { id: "b", name: "Piwnica", image: "maps/villa/b.jpg" },
      { id: "1f", name: "1F", image: "maps/villa/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/villa/2f.jpg" },
    ],
    sites: [
      { id: "1f-living", name: "1F Living Room / Library", floor: "1f" },
      { id: "1f-kitchen", name: "1F Kitchen / Dining", floor: "1f" },
      { id: "2f-aviator", name: "2F Aviator Room / Games Room", floor: "2f" },
      { id: "2f-trophy", name: "2F Trophy Room / Statuary Room", floor: "2f" },
    ],
  },
  {
    id: "emerald",
    name: "Emerald Plains",
    floors: [
      { id: "1f", name: "1F", image: "maps/emerald/1f.jpg" },
      { id: "2f", name: "2F", image: "maps/emerald/2f.jpg" },
    ],
    sites: [
      { id: "1f-dining", name: "1F Dining / Kitchen", floor: "1f" },
      { id: "1f-bar", name: "1F Bar / Lounge", floor: "1f" },
      { id: "2f-ceo", name: "2F CEO Office / Administration", floor: "2f" },
      { id: "2f-meeting", name: "2F Meeting Room / Lounge", floor: "2f" },
    ],
  },
];

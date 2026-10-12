// Klasy broni + słownik nazwa → klasa. Na tej podstawie strona dobiera opis "kiedy brać",
// domyślne dodatki i zapasowy schemat (gdy brakuje grafiki). Nieznana broń: "ar" (główna) albo "pistol" (boczna).
// Nazwy klas (PL/EN) są w js/i18n.js pod kluczem "cls".

const WEAPON_CLASSES = { ar: {}, smg: {}, shotgun: {}, dmr: {}, lmg: {}, sniper: {}, pistol: {}, mp: {}, revolver: {}, shield: {}, launcher: {} };

// Strzelby na pociski slug: w praktyce gra się nimi jak karabinem wyborowym.
const SLUG_SHOTGUNS = ["TCSG12", "ACS12", "BOSG.12.2"];

// Domyślne dodatki wg klasy, gdy wpis w operators.js pomija pole. Celownik zależy od strony.
const DEFAULT_ATTACHMENTS = {
  ar:       { sight: { atak: "Magnified", obrona: "Holo" }, barrel: "Flash hider", grip: "Vertical grip", under: "Laser" },
  lmg:      { sight: { atak: "Magnified", obrona: "Holo" }, barrel: "Compensator", grip: "Vertical grip", under: "Laser" },
  smg:      { sight: { atak: "Holo", obrona: "Holo" }, barrel: "Flash hider", grip: "Vertical grip", under: "Laser" },
  dmr:      { sight: { atak: "Magnified", obrona: "Magnified" }, barrel: "Muzzle brake", grip: "Horizontal grip", under: "—" },
  sniper:   { sight: { atak: "5x / 12x scope", obrona: "5x / 12x scope" }, barrel: "—", grip: "—", under: "—" },
  shotgun:  { sight: { atak: "Iron sights", obrona: "Iron sights" }, barrel: "—", grip: "—", under: "Laser" },
  pistol:   { sight: { atak: "—", obrona: "—" }, barrel: "Muzzle brake", grip: "—", under: "Laser" },
  mp:       { sight: { atak: "Holo", obrona: "Holo" }, barrel: "Flash hider", grip: "—", under: "Laser" },
  revolver: { sight: { atak: "—", obrona: "—" }, barrel: "—", grip: "—", under: "—" },
  shield:   {},
  launcher: {},
};

// Nazwa z operators.js → klucz grafiki w data/weaponImages.js, gdy slug nazwy się nie zgadza.
const WEAPON_IMAGE_ALIAS = {
  "P226": "p226-mk-25",
  "M45": "m45-meusoc",
  "POF-9": "pof9",
  "Le Roc (tarcza)": "le-roc-shield",
};

const WEAPONS = {
  // karabiny szturmowe
  "M4": "ar", "L85A2": "ar", "AR33": "ar", "R4-C": "ar", "G36C": "ar", "556XI": "ar", "F2": "ar", "AK-12": "ar",
  "AUG A2": "ar", "AUG A3": "ar", "552 Commando": "ar", "C8-SFW": "ar", "MK17 CQB": "ar", "PARA-308": "ar", "Type-89": "ar",
  "C7E": "ar", "M762": "ar", "V308": "ar", "Spear .308": "ar", "AK-74M": "ar", "ARX200": "ar", "F90": "ar", "SC3000K": "ar",
  "POF-9": "ar", "Commando 9": "ar", "416-C Carbine": "ar", "PCX-33": "ar",
  // pistolety maszynowe
  "9x19VSN": "smg", "FMG-9": "smg", "MP7": "smg", "Mx4 Storm": "smg", "K1A": "smg", "T-5 SMG": "smg", "Vector .45 ACP": "smg", "MPX": "smg",
  "MP5": "smg", "MP5K": "smg", "MP5SD": "smg", "P90": "smg", "UMP45": "smg", "9mm C1": "smg", "Scorpion EVO 3 A1": "smg",
  "M12": "smg", "PDW9": "smg", "UZK50GI": "smg", "P10 RONI": "smg",
  // karabiny wyborowe / snajperskie
  "417": "dmr", "CAMRS": "dmr", "SR-25": "dmr", "Mk 14 EBR": "dmr", "AR-15.50": "dmr", "OTs-03": "dmr", "CSRX 300": "sniper",
  // karabiny maszynowe
  "G8A1": "lmg", "M249": "lmg", "M249 SAW": "lmg", "T-95 LSW": "lmg", "LMG-E": "lmg", "6P41": "lmg", "ALDA 5.56": "lmg", "DP27": "lmg", "LMG": "lmg",
  // strzelby
  "M590A1": "shotgun", "M1014": "shotgun", "M870": "shotgun", "SG-CQB": "shotgun", "SPAS-12": "shotgun", "SPAS-15": "shotgun",
  "SASG-12": "shotgun", "Super 90": "shotgun", "ITA12L": "shotgun", "FO-12": "shotgun", "BOSG.12.2": "shotgun", "TCSG12": "shotgun",
  "ACS12": "shotgun", "SIX12": "shotgun", "SIX12 SD": "shotgun", "Supernova": "shotgun", "ITA12S": "shotgun", "Super Shorty": "shotgun",
  "Glaive-12": "shotgun",
  // pistolety i rewolwery
  "5.7 USG": "pistol", "P226": "pistol", "P9": "pistol", "P12": "pistol", "P229": "pistol", "PMM": "pistol", "GSh-18": "pistol",
  "MK1 9mm": "pistol", "D-50": "pistol", "USP40": "pistol", "Q-929": "pistol", "RG15": "pistol", "1911 TACOPS": "pistol",
  "PRB92": "pistol", "SDP 9mm": "pistol", "P-10C": "pistol", "Luison": "pistol", ".44 Vendetta": "pistol", "M45": "pistol", "Reaper MK2": "pistol",
  ".44 Mag Semi-Auto": "revolver", "Keratos .357": "revolver", "LFP586": "revolver", "Bailiff 410": "revolver",
  // pistolety automatyczne
  "C75 Auto": "mp", "SMG-11": "mp", "SMG-12": "mp", "SPSMG9": "mp", "Bearing 9": "mp",
  // reszta
  "GONNE-6": "launcher",
  "Le Roc (tarcza)": "shield", "G52-Tactical shield": "shield", "CCE Shield": "shield", "Ballistic shield": "shield",
};

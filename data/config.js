// Wspólne ustawienia grafik.
//
// Duże grafiki (sylwetki operatorów, miniatury map) ładujemy z CDN, żeby repo było lekkie.
// Źródło: github.com/danielwerg/r6data (MIT), przypięte do konkretnego commita.
// Chcesz mieć je lokalnie? Pobierz foldery operators/figures i maps/thumbnails z tamtego repo,
// wrzuć do img/ i zmień ASSET_CDN na "img/".
const ASSET_CDN = "https://cdn.jsdelivr.net/gh/danielwerg/r6data@5eaa7e60db422512089e48cd2130a3f00efbe6c6/src/assets/";

// Operatorzy, dla których istnieje sylwetka (operators/figures/<id>.webp).
const OP_FIGURES = new Set((
  "ace,alibi,amaru,aruni,ash,azami,bandit,blackbeard,blitz,brava,buck,capitao,castle,caveira,clash,deimos,doc,dokkaebi," +
  "echo,ela,fenrir,finka,flores,frost,fuze,glaz,goyo,gridlock,grim,hibana,iana,iq,jackal,jager,kaid,kali,kapkan,lesion," +
  "lion,maestro,maverick,melusi,mira,montagne,mozzie,mute,nokk,nomad,oryx,osa,pulse,ram,recruit,rook,sens,sledge,smoke," +
  "solis,tachanka,thatcher,thermite,thorn,thunderbird,tubarao,twitch,valkyrie,vigil,wamai,warden,ying,zero,zofia"
).split(","));

// Rekruci korzystają ze wspólnej grafiki.
const OP_FIGURE_ALIAS = { striker: "recruit", sentry: "recruit" };

// Ikony gadżetów (img/gadgets/*.svg). Klucz = nazwa gadżetu z operators.js małymi literami.
const GADGET_ICONS = {
  "frag": "frag-grenade", "stun": "stun-grenade", "flashbang": "stun-grenade", "smoke": "smoke-grenade",
  "claymore": "claymore", "breach charge": "breach-charge", "hard breach": "hard-breach-charge",
  "emp": "impact-emp-grenade", "impact emp": "impact-emp-grenade",
  "nitro cell": "nitro-cell", "barbed wire": "barbed-wire", "bulletproof camera": "bulletproof-camera",
  "deployable shield": "deployable-shield", "impact": "impact-grenade",
  "observation blocker": "observation-blocker", "proximity alarm": "proximity-alarm",
};

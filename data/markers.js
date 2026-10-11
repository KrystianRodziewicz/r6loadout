// Typy markerów na mapie. Klucz = wartość pola "type" we wpisie markera.
// Możesz dodać własne typy, kolory i litery.
const MARKER_TYPES = {
  gadget:    { label: "Gadżet",         color: "#f5a524", glyph: "G" },
  position:  { label: "Pozycja",        color: "#3ddc84", glyph: "P" },
  rotate:    { label: "Rotacja",        color: "#4cc3ff", glyph: "R" },
  reinforce: { label: "Wzmocnienie",    color: "#b0b8c4", glyph: "W" },
  hole:      { label: "Dziura / line",  color: "#ff5c7a", glyph: "D" },
  breach:    { label: "Wejście",        color: "#ff8a3d", glyph: "B" },
  drone:     { label: "Dron / kamera",  color: "#c58bff", glyph: "K" },
  bomb:      { label: "Bomba",          color: "#ffd84d", glyph: "★" },
  danger:    { label: "Uwaga",          color: "#ff3b3b", glyph: "!" },
  note:      { label: "Notatka",        color: "#e8eaef", glyph: "i" },
};

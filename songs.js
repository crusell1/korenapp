// Startlåtar (från checklistan)
export const defaultSongs = [
  { id: 1, title: "20 th Century Fox" },
  { id: 2, title: "Baba Yetu" },
  { id: 3, title: "Björnes magasin" },
  { id: 4, title: "From Now on" },
  { id: 5, title: "Golden" },
  { id: 6, title: "Holiday Road" },
  { id: 7, title: "Over the rainbow" },
  { id: 8, title: "Pirates of the Caribbean" },
  { id: 9, title: "Raindrops keep falling on my head" },
  { id: 10, title: "Speak softly love" },
  { id: 11, title: "Try everything" },
  { id: 12, title: "Viana" },
  { id: 13, title: "Vueli" },
];

// Statusarna (en per låt)
export const statuses = [
  { key: "practice", label: "Öva mycket!", short: "Öva!", emoji: "🔴" },
  { key: "notes", label: "Kan med noter", short: "Noter", emoji: "🟡" },
  { key: "memory", label: "Kan utantill", short: "Utantill", emoji: "🟢" },
  {
    key: "koreo",
    label: "Kan med koreografi",
    short: "Koreo",
    emoji: "🟣",
  },
];

// Vilka räknas som “klara” i progress?
export const completedStatuses = new Set(["memory", "koreo"]);

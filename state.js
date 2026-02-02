export const state = {
  songs: [],
  ui: {
    query: "",
    filter: "all", // all | practice | notes | memory | koreo
  },
};

export function setSongs(songs) {
  state.songs = songs;
}

export function setQuery(query) {
  state.ui.query = query;
}

export function setFilter(filter) {
  state.ui.filter = filter;
}

export function setStatus(songId, statusKey) {
  const song = state.songs.find((s) => s.id === songId);
  if (!song) return;

  song.status = statusKey || "none";
  song.updatedAt = new Date().toISOString();
}

export function addSong(title) {
  const clean = (title || "").trim();
  if (!clean) return false;

  const maxId = state.songs.reduce((m, s) => Math.max(m, s.id), 0);

  state.songs.push({
    id: maxId + 1,
    title: clean,
    status: "none",
    notes: "", // ✅ anteckningar per låt
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export function updateSongTitle(songId, newTitle) {
  const song = state.songs.find((s) => s.id === songId);
  if (!song) return false;

  const clean = (newTitle || "").trim();
  if (!clean) return false;

  song.title = clean;
  song.updatedAt = new Date().toISOString();
  return true;
}

export function updateSongNotes(songId, notes) {
  const song = state.songs.find((s) => s.id === songId);
  if (!song) return false;

  song.notes = notes ?? "";
  song.updatedAt = new Date().toISOString();
  return true;
}

export function deleteSong(songId) {
  const idx = state.songs.findIndex((s) => s.id === songId);
  if (idx === -1) return false;

  // bara custom-låtar ska gå att radera
  if (!state.songs[idx].isCustom) return false;

  state.songs.splice(idx, 1);
  return true;
}

export function clearAllStatuses() {
  for (const s of state.songs) {
    s.status = "none";
    s.updatedAt = new Date().toISOString();
  }
}

export function getSongById(songId) {
  return state.songs.find((s) => s.id === songId) || null;
}

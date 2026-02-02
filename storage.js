import { defaultSongs } from "./songs.js";
import { setSongs, state, clearAllStatuses } from "./state.js";

const STORAGE_KEY_V2 = "koren-checklist-v3";
const STORAGE_KEY_V1 = "koren-checklist-v1"; // gammal

function makeSong(song) {
  return {
    id: song.id,
    title: song.title,
    status: "none",
    notes: "", // ✅ lägg till
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Migrerar från gamla checkbox-strukturen -> ny status
function migrateFromV1(oldSongs) {
  return oldSongs.map((s) => {
    let status = "none";
    if (s?.checks?.memory) status = "memory";
    else if (s?.checks?.koreo) status = "koreo";
    else if (s?.checks?.notes) status = "notes";
    else if (s?.checks?.practice) status = "practice";

    return {
      id: s.id,
      title: s.title,
      status,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function loadState() {
  const savedV2 = localStorage.getItem(STORAGE_KEY_V2);
  if (savedV2) {
    try {
      const parsed = JSON.parse(savedV2);
      if (!Array.isArray(parsed)) throw new Error("Invalid v2");
      setSongs(parsed);
      return;
    } catch {}
  }

  const savedV1 = localStorage.getItem(STORAGE_KEY_V1);
  if (savedV1) {
    try {
      const parsed = JSON.parse(savedV1);
      if (!Array.isArray(parsed)) throw new Error("Invalid v1");
      setSongs(migrateFromV1(parsed));
      saveState();
      return;
    } catch {}
  }

  setSongs(defaultSongs.map(makeSong));
  saveState();
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state.songs));
}

// ✅ Nollställ = rensa status men behåll alla låtar
export function resetStatuses() {
  clearAllStatuses();
  saveState();
}

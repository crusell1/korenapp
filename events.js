import {
  setStatus,
  setQuery,
  setFilter,
  addSong,
  updateSongTitle,
  updateSongNotes,
  deleteSong,
} from "./state.js";
import { saveState, resetStatuses } from "./storage.js";
import { renderApp } from "./ui.js";

export function initEvents() {
  // Re-render när man byter hash (#song-1 osv)
  window.addEventListener("hashchange", () => {
    renderApp();
  });

  // Byt status (radio) i listan
  document.addEventListener("change", (e) => {
    const el = e.target;

    if (el.matches('input[type="radio"][data-song-id]')) {
      const songId = Number(el.dataset.songId);
      const status = el.dataset.status;

      setStatus(songId, status);
      saveState();
      renderApp();
    }
  });

  // Filter-knappar
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;

    setFilter(btn.dataset.filter);
    renderApp();
  });

  // Sök
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.id === "searchInput") {
      setQuery(el.value);
      renderApp();
      return;
    }

    // Autosave anteckningar på detaljsidan
    if (el.id === "notesInput") {
      const songId = getSongIdFromHash();
      if (!songId) return;

      updateSongNotes(songId, el.value);
      saveState();
      // ingen render behövs, man skriver bara
      return;
    }
  });

  // Lägg till låt
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.id !== "addSongForm") return;

    e.preventDefault();
    const input = document.getElementById("addSongInput");
    const ok = addSong(input.value);

    if (ok) {
      input.value = "";
      saveState();
      renderApp();
    }
  });

  // Detaljsida: tillbaka, spara titel, ta bort
  document.addEventListener("click", (e) => {
    if (e.target?.id === "backBtn") {
      location.hash = "";
      return;
    }

    if (e.target?.id === "saveTitleBtn") {
      const songId = Number(e.target.dataset.songId);
      const titleInput = document.getElementById("titleInput");
      const ok = updateSongTitle(songId, titleInput.value);

      if (ok) {
        saveState();
        renderApp();
      }
      return;
    }

    if (e.target?.id === "deleteSongBtn") {
      const songId = Number(e.target.dataset.songId);
      const ok = confirm("Ta bort låten du lagt till?");
      if (!ok) return;

      const deleted = deleteSong(songId);
      if (deleted) {
        saveState();
        location.hash = "";
      }
      return;
    }
  });

  // Nollställ: rensa status men behåll låtar + anteckningar
  const resetBtn = document.getElementById("resetBtn");
  resetBtn.addEventListener("click", () => {
    const ok = confirm(
      "Nollställ alla statusar? (Låtar och anteckningar behålls)",
    );
    if (!ok) return;

    resetStatuses();
    renderApp();
  });
}

function getSongIdFromHash() {
  const h = (location.hash || "").trim();
  const match = h.match(/^#song-(\d+)$/);
  if (!match) return null;
  return Number(match[1]);
}

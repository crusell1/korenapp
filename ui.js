import { statuses, completedStatuses } from "./songs.js";
import { state, getSongById } from "./state.js";

export function renderApp() {
  const app = document.getElementById("app");

  const songId = getSongIdFromHash();
  if (songId) {
    const song = getSongById(songId);
    if (!song) {
      // om låten inte finns (t.ex raderad) -> tillbaka till listan
      location.hash = "";
      return;
    }
    app.innerHTML = renderSongDetail(song);
    return;
  }

  const rows = getFilteredSongsWithOriginalNumber();
  const stats = getStats();

  app.innerHTML = `
    ${renderTop(stats)}
    ${renderTable(rows)}
    ${renderAddSong()}
  `;
}

/* ---------------------------
   LISTVY
--------------------------- */

function renderTop(stats) {
  return `
    <section class="panel">
      <div class="progressHeader">
        <div class="progressTitle">Progress</div>
        <div class="progressText">${stats.completed}/${stats.total} klara</div>
      </div>

      <div class="progressBar" aria-label="progress">
        <div class="progressFill" style="width:${stats.percent}%"></div>
      </div>

      <div style="margin-top: 12px;">
        <input
          id="searchInput"
          class="textInput"
          type="text"
          placeholder="🔍 Sök låt..."
          value="${escapeHtml(state.ui.query)}"
        />
      </div>

      <div class="filters" style="margin-top: 10px;">
        <button class="chip ${isActive("all")}" data-filter="all">
          Alla <span class="badge">${stats.total}</span>
        </button>

        <button class="chip chip-red ${isActive("practice")}" data-filter="practice">
          🔴 Öva <span class="badge">${stats.counts.practice}</span>
        </button>

        <button class="chip chip-yellow ${isActive("notes")}" data-filter="notes">
          🟡 Noter <span class="badge">${stats.counts.notes}</span>
        </button>

        <button class="chip chip-green ${isActive("memory")}" data-filter="memory">
          🟢 Utantill <span class="badge">${stats.counts.memory}</span>
        </button>

        <button class="chip chip-purple ${isActive("koreo")}" data-filter="koreo">
          🟣 Koreo <span class="badge">${stats.counts.koreo}</span>
        </button>
      </div>
    </section>
  `;
}

function renderTable(rows) {
  return `
    <div class="tableWrap">
      <table>
        <thead>
          <tr>
            <th style="width:70px;">Nr</th>
            <th>Låt</th>
            ${statuses
              .map(
                (s) =>
                  `<th class="center" style="width:160px;">${s.label}</th>`,
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => renderRow(row.song, row.number)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRow(song, number) {
  const currentStatus = song.status || "none";
  const rowClass = `row-${currentStatus}`;

  return `
    <tr class="${rowClass}">
      <td>${number}</td>

      <td class="songTitle">
        <a class="songLink" href="#song-${song.id}">
          ${escapeHtml(song.title)}
        </a>
      </td>

      ${statuses
        .map((s) => {
          const checked = currentStatus === s.key ? "checked" : "";
          return `
            <td class="center">
              <input
                class="radio"
                type="radio"
                name="status-${song.id}"
                data-song-id="${song.id}"
                data-status="${s.key}"
                ${checked}
              />
            </td>
          `;
        })
        .join("")}
    </tr>
  `;
}

function renderAddSong() {
  return `
    <section class="panel" id="addSongSection" style="margin-top:14px;">
      <div class="addTitle">➕ Lägg till låt</div>
      <form id="addSongForm" class="addForm">
        <input id="addSongInput" class="textInput" type="text" placeholder="Skriv låtnamn..." />
        <button class="btn" type="submit">Lägg till</button>
      </form>
    </section>
  `;
}

/* ---------------------------
   DETALJVY (låt-flik)
--------------------------- */

function renderSongDetail(song) {
  return `
    <section class="panel">
      <div class="detailTop">
        <button class="btn" id="backBtn">← Tillbaka</button>
        ${song.isCustom ? `<button class="btn dangerMini" id="deleteSongBtn" data-song-id="${song.id}">🗑️ Ta bort</button>` : ""}
      </div>

      <div class="detailBlock">
        <label class="label">Titel</label>
        <div class="detailRow">
          <input id="titleInput" class="textInput" type="text" value="${escapeHtml(song.title)}" />
          <button class="btn" id="saveTitleBtn" data-song-id="${song.id}">Spara</button>
        </div>
      </div>

      <div class="detailBlock">
        <label class="label">Anteckningar</label>
        <textarea id="notesInput" class="textArea" rows="6" placeholder="Skriv anteckningar här...">${escapeHtml(song.notes || "")}</textarea>
        <div class="muted small" style="margin-top:8px;">Sparas automatiskt när du skriver</div>
      </div>
    </section>
  `;
}

/* ---------------------------
   HELPERS
--------------------------- */

function getSongIdFromHash() {
  const h = (location.hash || "").trim();
  const match = h.match(/^#song-(\d+)$/);
  if (!match) return null;
  return Number(match[1]);
}

function isActive(filter) {
  return state.ui.filter === filter ? "active" : "";
}

function getFilteredSongsWithOriginalNumber() {
  const q = (state.ui.query || "").trim().toLowerCase();
  const filter = state.ui.filter;

  return state.songs
    .map((song, index) => ({ song, number: index + 1 }))
    .filter(({ song }) => {
      const titleOk = q ? song.title.toLowerCase().includes(q) : true;
      const statusOk =
        filter === "all" ? true : (song.status || "none") === filter;
      return titleOk && statusOk;
    });
}

function getStats() {
  const counts = { practice: 0, notes: 0, memory: 0, koreo: 0 };

  for (const s of state.songs) {
    const key = s.status || "none";
    if (counts[key] !== undefined) counts[key]++;
  }

  const total = state.songs.length;
  const completed = state.songs.filter((s) =>
    completedStatuses.has(s.status),
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent, counts };
}

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

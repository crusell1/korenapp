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
  const theme = document.documentElement.dataset.theme || "dark";
  const checkedAttr = theme === "dark" ? "checked" : "";

  return `
    <section class="panel">
      <div class="progressHeader">
        <div class="progressTitle">Progress</div>
        <div class="progressRight">
  <div class="progressText">${stats.completed}/${stats.total} klara</div>

  <label class="switch" title="Byt tema">
    <span class="sun">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g fill="none">
          <circle cx="12" cy="12" r="5" fill="#ffd43b"></circle>
          <path fill="#ffd43b" d="M21 13h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2ZM5 13H3a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Zm14.071 7.071-1.414-1.414a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1-1.414 1.414ZM6.343 6.343 4.929 4.929A1 1 0 0 1 6.343 3.515l1.414 1.414A1 1 0 1 1 6.343 6.343ZM13 21v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0ZM13 5V3a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0Zm-6.657 14.657 1.414-1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414ZM17.657 6.343a1 1 0 0 0 1.414 0l1.414-1.414A1 1 0 0 0 19.071 3.515l-1.414 1.414a1 1 0 0 0 0 1.414Z"></path>
        </g>
      </svg>
    </span>

    <span class="moon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path d="M223.5 32c-123.5 0-223.5 100.3-223.5 224 0 123.5 100.1 224 223.5 224 60.6 0 115.6-24.3 155.1-63.8 8.2-8.2 2.8-22.3-8.9-23.1-6.1-.4-12.2-.9-18.3-1.8-99.8-14.6-176.8-100.1-176.8-204.3 0-50.3 18.2-96.5 48.4-132.1 7.4-8.7 0.5-22-10.9-22.1z"/>
      </svg>
    </span>

    <input id="themeToggle" type="checkbox" class="input" ${checkedAttr}>

    <span class="slider"></span>
  </label>
</div>

      </div>

      <div class="progressBar" aria-label="progress">
        <div class="progressFill" style="width:${stats.percent}%"></div>
      </div>

      <div style="margin-top: 12px;">
      <div class="SearchPill">
        <input
          id="searchInput"
          class="SearchPill__input"
          type="text"
          placeholder="Sök låt..."
          value="${escapeHtml(state.ui.query)}"
        />
      </div>
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
            <th class="colNr">Nr</th>
<th class="colSong">Låt</th>
${statuses
  .map(
    (s) => `
    <th class="center colStatus">
      <span class="thLong">${s.label}</span>
      <span class="thShort">${s.short}</span>
    </th>
  `,
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
      <td class="colNr">${number}</td>

<td class="songTitle colSong">

        <a class="songLink" href="#song-${song.id}">
          ${escapeHtml(song.title)}
        </a>
      </td>

      ${statuses
        .map((s) => {
          const checked = currentStatus === s.key ? "checked" : "";
          return `
            <td class="center colStatus">

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
  const theme = document.documentElement.dataset.theme || "dark";
  const checkedAttr = theme === "dark" ? "checked" : "";

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

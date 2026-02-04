import { loadState } from "./storage.js";
import { renderApp } from "./ui.js";
import { initEvents } from "./events.js";

// Theme boot
const savedTheme = localStorage.getItem("koren-theme");
document.documentElement.dataset.theme = savedTheme || "dark";

loadState();
renderApp();
initEvents();

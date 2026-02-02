import { loadState } from "./storage.js";
import { renderApp } from "./ui.js";
import { initEvents } from "./events.js";

loadState();
renderApp();
initEvents();

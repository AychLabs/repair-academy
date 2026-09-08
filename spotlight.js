"use strict";

// Local, deterministic curriculum. Spotlight never reads Mac Navigation state.
const spotlightSearchItems = [
  ...["Finder", "Calculator", "Notes", "Safari", "System Settings", "Preview", "TextEdit"].map(name => ({
    id: "app-" + name.toLowerCase().replaceAll(" ", "-"), name, type: "application", category: "APPLICATION",
    keywords: [name, "app", ...(name === "Calculator" ? ["math"] : [])], subtitle: "Applications"
  })),
  ...["Week 3 Notes", "Mac Practice Checklist.pdf", "Computer Parts Review.pdf", "Science Lab Report.docx", "Class Schedule.pdf", "Keyboard Shortcuts Notes.pdf", "School Logo.png"].map((name, index) => ({
    id: "file-" + index, name, type: "document", category: "DOCUMENT",
    keywords: ["file", "document", "documents", name], subtitle: "Documents / Computer Class"
  })),
  ...["Computer Class", "Documents", "Downloads", "Assignments", "Pictures"].map(name => ({
    id: "folder-" + name.toLowerCase().replaceAll(" ", "-"), name, type: "folder", category: "FOLDER",
    keywords: ["folder", name], subtitle: name === "Computer Class" ? "Home / Documents" : "Home"
  }))
];
const spotlightDefinitions = {
  hardware: "The physical parts of a computer that you can see or touch.",
  software: "Programs and instructions that tell a computer what to do.",
  folder: "A container used to organize files and other folders.",
  application: "A program designed to help you perform a task.",
  storage: "The place where a computer keeps files and programs, even when turned off."
};
const spotlightTasks = [
  { instruction: "OPEN CALCULATOR", prompt: "Use Spotlight to find and open Calculator.", target: "app-calculator", hint: "Press Command + Space, then search for the app.", feedback: "Spotlight can launch applications without finding them in the Dock or Applications folder." },
  { instruction: "FIND WEEK 3 NOTES", prompt: "Use Spotlight to find the file named Week 3 Notes.", target: "file-0", hint: "Try searching for part or all of the filename.", feedback: "Spotlight can search for files by name without manually opening folders in Finder." },
  { instruction: "FIND COMPUTER CLASS", prompt: "Use Spotlight to locate the Computer Class folder.", target: "folder-computer-class", hint: "Look for a result labeled Folder.", feedback: "Spotlight can find folders as well as files and applications." },
  { instruction: "USE SPOTLIGHT AS A CALCULATOR", prompt: "Use Spotlight to solve: 48 × 6", target: "calculation", hint: "You can type a math problem directly into Spotlight.", feedback: "Spotlight can perform quick calculations without opening Calculator." },
  { instruction: "LOOK UP A DEFINITION", prompt: "Use Spotlight to find the definition of: hardware", target: "definition-hardware", hint: "Try typing the word hardware.", feedback: "Spotlight can quickly provide definitions for words." },
  { instruction: "FIND A FILE USING ONLY PART OF ITS NAME", prompt: "Find Computer Parts Review.pdf. You do not need to type the entire filename.", target: "file-2", hint: "Searches do not need the complete filename.", feedback: "Spotlight can find items even when you remember only part of the name." },
  { instruction: "CHOOSE THE CORRECT RESULT", prompt: "Find the folder named Documents. Check the name, item type, and path.", target: "folder-documents", hint: "Pay attention to the item type shown with each result.", feedback: "Spotlight may show several types of results. Check the name and type before opening an item." },
  { instruction: "FINAL SEARCH", prompt: "Find and open: System Settings", target: "app-system-settings", hint: "Use the same search method you practiced earlier.", feedback: "You can use Spotlight to quickly locate and launch applications from anywhere on your Mac." }
];
const spotlightApp = document.querySelector("#spotlight-app");
let spotlightState;
function resetSpotlight(view = "training") {
  spotlightState = { view, task: 0, completed: [], incorrect: 0, hints: [], hintVisible: false, query: "", results: [], selected: -1, open: false, opened: null, taughtShortcut: false };
}
resetSpotlight("intro");
function spotlightEscape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
// A bounded two-operand grammar, not JavaScript execution. Supports signed decimals.
function parseSpotlightCalculation(query) {
  if (query.length > 80) return null;
  const normalized = query.replace(/[×x]/gi, "*").replace(/÷/g, "/").trim();
  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*([+*/-])\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (!match) return null;
  const a = Number(match[1]), b = Number(match[3]), operator = match[2];
  if (operator === "/" && b === 0) return null;
  const value = operator === "+" ? a + b : operator === "-" ? a - b : operator === "*" ? a * b : a / b;
  if (!Number.isFinite(value)) return null;
  return { id: "calculation", name: String(Number(value.toPrecision(12))), type: "calculation", category: "CALCULATION", subtitle: query.trim(), value, operands: [a, b], operator };
}
function searchSpotlight(query) {
  const text = query.trim().toLowerCase();
  if (!text) return [];
  const calculation = parseSpotlightCalculation(text);
  if (calculation) return [calculation];
  const word = text.replace(/^define\s+/, "");
  const definitions = Object.entries(spotlightDefinitions).filter(([name]) => name.includes(word)).map(([name, definition]) => ({
    id: "definition-" + name, name: name[0].toUpperCase() + name.slice(1), type: "definition", category: "DEFINITION", subtitle: definition
  }));
  const items = spotlightSearchItems.filter(item => [item.name, ...item.keywords].some(value => value.toLowerCase().includes(text)));
  items.sort((a, b) => Number(b.name.toLowerCase().includes(text)) - Number(a.name.toLowerCase().includes(text)));
  return [...definitions, ...items].slice(0, 6);
}
function spotlightButton(action, label, primary = false) {
  return `<button type="button" class="${primary ? "primary" : "secondary"}-button" data-spotlight-action="${action}">${label}</button>`;
}
function showSpotlightChallenge(updateHistory = true) {
  activeDigitalCourseId = "macos-essentials";
  document.title = "Spotlight Challenge | Repair Academy";
  if (updateHistory) history.pushState({ screen: "spotlight-challenge" }, "", "#spotlight-challenge");
  resetSpotlight("intro");
  spotlightApp.innerHTML = `<section class="mac-intro tech-corners"><div class="training-badge" aria-hidden="true">02</div><p class="section-kicker">SECTION 02</p><h1 id="spotlight-title">SPOTLIGHT CHALLENGE</h1><p class="training-subtitle">Search &amp; Find Training</p><p class="intro-instruction">Use Spotlight to quickly find apps, files, folders, calculations, and information.</p><div class="mac-task-count"><strong>8</strong><span>SEARCH TASKS</span></div><div class="intro-actions">${spotlightButton("begin", "BEGIN CHALLENGE", true)}${spotlightButton("course", "RETURN TO macOS ESSENTIALS")}</div></section>`;
  showScreen("spotlight-challenge");
}
function spotlightIcon(item) {
  if (item.type === "folder" || item.type === "document") return `<span class="spotlight-item-icon mac-file mac-${item.type}" aria-hidden="true"><span></span></span>`;
  return `<span class="spotlight-symbol" aria-hidden="true">${item.type === "calculation" || item.name === "Calculator" ? "＋" : item.type === "definition" ? "Aa" : item.name === "System Settings" ? "⚙" : "▧"}</span>`;
}
function spotlightOpenedMarkup() {
  const item = spotlightState.opened;
  if (!item) return "";
  const calculator = item.id === "app-calculator";
  return `<section class="mac-window is-active ${calculator ? "mac-calculator" : "spotlight-preview"}" aria-label="${spotlightEscape(item.name)} window"><header class="mac-window-title"><span class="mac-window-controls" aria-hidden="true"><i></i><i></i><i></i></span><strong>${spotlightEscape(item.name)}</strong></header>${calculator ? '<div class="mac-calc-display">0</div><div class="mac-calc-keys" aria-hidden="true">' + ["AC","±","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="].map(key => `<span>${key}</span>`).join("") + "</div>" : `<div class="spotlight-preview-body">${spotlightIcon(item)}<h2>${spotlightEscape(item.name)}</h2><p>${item.category} OPENED</p><p>${spotlightEscape(item.subtitle)}</p></div>`}</section>`;
}
function renderSpotlightTraining() {
  const s = spotlightState, task = spotlightTasks[s.task], done = s.completed.includes(s.task);
  spotlightApp.innerHTML = `<section class="mac-training"><div class="mac-task-header"><div><p class="section-kicker">SECTION 02 // GUIDED PRACTICE</p><h1 id="spotlight-title" tabindex="-1">${task.instruction}</h1><p id="spotlight-instruction">${task.prompt}</p></div><div class="mac-progress-copy"><strong>TASK ${s.task + 1} / 8</strong><span id="spotlight-errors">Incorrect Selections: ${s.incorrect}</span></div></div><div class="progress-track mac-progress" role="progressbar" aria-label="Spotlight task progress" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${s.completed.length}"><span style="width:${s.completed.length / 8 * 100}%"></span></div><div class="mac-help-row"><button type="button" class="secondary-button mac-hint-button" data-spotlight-action="hint" aria-expanded="${s.hintVisible}" aria-controls="spotlight-hint">HINT</button><p id="spotlight-hint" class="mac-hint" ${s.hintVisible ? "" : "hidden"}>${task.hint}</p></div><div class="mac-desktop" aria-describedby="spotlight-instruction"><div class="mac-menu-bar"><strong>${spotlightEscape(s.opened?.type === "application" ? s.opened.name : "Finder")}</strong><span class="mac-menu-items" aria-hidden="true">File &nbsp; Edit &nbsp; View &nbsp; Go &nbsp; Window &nbsp; Help</span><span class="mac-status-items" aria-hidden="true">Wi-Fi &nbsp; 10:24</span><button type="button" class="spotlight-menu-search" data-spotlight-action="open" aria-label="Open Spotlight (Command + Space)" aria-keyshortcuts="Meta+Space" title="Open Spotlight (Command + Space)">⌕</button></div><div class="mac-wallpaper">${spotlightOpenedMarkup()}${!done ? '<div class="spotlight-desktop-tip"><strong>OPEN SPOTLIGHT</strong><span>Press Command + Space.</span><small>You can also use the Menu Bar search control.</small></div>' : ""}</div><div class="mac-dock" aria-label="Simulated Dock" aria-hidden="true">${[["finder","☻"],["safari","◈"],["notes","▤"],["calculator","+"],["system-settings","⚙"]].map(([name, glyph]) => `<span class="mac-dock-app mac-icon-${name} spotlight-dock-icon">${glyph}</span>`).join("")}</div><section id="spotlight-panel" class="spotlight-panel" aria-label="Spotlight search" hidden><div class="spotlight-search-row"><span aria-hidden="true">⌕</span><label class="spotlight-sr-only" for="spotlight-input">Search apps, files, folders, calculations, and definitions</label><input id="spotlight-input" type="text" autocomplete="off" spellcheck="false" placeholder="Spotlight Search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="spotlight-results"><button type="button" data-spotlight-action="close" aria-label="Close Spotlight">Esc</button></div><div id="spotlight-results" role="listbox" aria-label="Search results"></div><div class="spotlight-key-help">↑ ↓ Select &nbsp; Enter Open &nbsp; Esc Close</div><p id="spotlight-search-status" class="spotlight-sr-only" role="status"></p></section></div><div id="spotlight-feedback" class="mac-feedback ${done ? "is-complete" : ""}" role="status" aria-live="polite">${done ? `<div><strong>TASK COMPLETE</strong><p>${task.feedback}</p></div>${spotlightButton("next", s.task === 7 ? "FINISH CHALLENGE" : "NEXT TASK", true)}` : "<span>Use Command + Space to search in the practice Mac.</span>"}</div></section>`;
}
function setSpotlightOpen(open) {
  const s = spotlightState;
  if (s.view !== "training" || s.completed.includes(s.task)) return;
  s.open = open;
  spotlightApp.querySelector("#spotlight-panel").hidden = !open;
  const input = spotlightApp.querySelector("#spotlight-input");
  input.setAttribute("aria-expanded", String(open));
  if (open) {
    input.value = s.query;
    renderSpotlightResults();
    input.focus();
    if (!s.taughtShortcut) {
      s.taughtShortcut = true;
      spotlightApp.querySelector("#spotlight-feedback").textContent = "Command + Space quickly opens Spotlight from almost anywhere on your Mac.";
    }
  } else spotlightApp.querySelector('[data-spotlight-action="open"]').focus();
}
function renderSpotlightResults() {
  const s = spotlightState, input = spotlightApp.querySelector("#spotlight-input");
  spotlightApp.querySelector("#spotlight-results").innerHTML = s.results.length ? s.results.map((item, index) => `<div id="spotlight-result-${index}" role="option" aria-selected="${index === s.selected}" data-spotlight-result="${index}" class="spotlight-result ${index === s.selected ? "is-selected" : ""}">${spotlightIcon(item)}<div><strong class="${item.type === "calculation" ? "spotlight-answer" : ""}">${spotlightEscape(item.name)}</strong><small>${item.category}</small><p>${spotlightEscape(item.subtitle)}</p></div><span class="spotlight-selection-mark" aria-hidden="true">${index === s.selected ? "↵" : ""}</span></div>`).join("") : `<p class="spotlight-empty">${s.query.trim() ? "NO RESULTS" : "Type to search your Mac."}</p>`;
  if (s.selected >= 0) input.setAttribute("aria-activedescendant", "spotlight-result-" + s.selected);
  else input.removeAttribute("aria-activedescendant");
  spotlightApp.querySelector("#spotlight-search-status").textContent = s.results.length ? s.results.length + " results available." : s.query.trim() ? "NO RESULTS" : "";
  spotlightApp.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}
function activateSpotlightResult(index) {
  const s = spotlightState, item = s.results[index], task = spotlightTasks[s.task];
  if (!s.open || !item || s.completed.includes(s.task)) return;
  const correct = item.id === task.target && (item.type !== "calculation" || (item.operator === "*" && item.operands[0] === 48 && item.operands[1] === 6));
  if (!correct) {
    s.incorrect++;
    spotlightApp.querySelector("#spotlight-errors").textContent = "Incorrect Selections: " + s.incorrect;
    spotlightApp.querySelector("#spotlight-feedback").textContent = "NOT THE RIGHT RESULT — TRY AGAIN";
    spotlightApp.querySelector("#spotlight-input").focus();
    return;
  }
  s.completed.push(s.task);
  s.opened = item.type === "calculation" || item.type === "definition" ? null : item;
  s.open = false;
  renderSpotlightTraining();
  spotlightApp.querySelector('[data-spotlight-action="next"]').focus();
}
function renderSpotlightComplete() {
  spotlightState.view = "complete";
  spotlightApp.innerHTML = `<section class="mac-complete tech-corners"><div class="completion-mark" aria-hidden="true">✓</div><p class="section-kicker">SECTION COMPLETE</p><h1 id="spotlight-title" tabindex="-1">SPOTLIGHT CHALLENGE</h1><div class="result-score"><strong>8 / 8</strong><span>TASKS COMPLETE</span></div><p>You practiced using Spotlight to open apps, find files and folders, perform calculations, look up definitions, and search using partial names.</p><p class="incorrect-total">Incorrect Selections: ${spotlightState.incorrect}</p><div class="results-actions">${spotlightButton("retry", "RETRY SECTION", true)}${spotlightButton("course", "RETURN TO macOS ESSENTIALS")}${spotlightButton("digital", "DIGITAL SKILLS")}</div></section>`;
  spotlightApp.querySelector("h1").focus();
}
spotlightApp.addEventListener("input", event => {
  if (event.target.id !== "spotlight-input") return;
  spotlightState.query = event.target.value;
  spotlightState.results = searchSpotlight(event.target.value);
  spotlightState.selected = spotlightState.results.length ? 0 : -1;
  renderSpotlightResults();
});
spotlightApp.addEventListener("click", event => {
  const result = event.target.closest("[data-spotlight-result]");
  if (result) { activateSpotlightResult(Number(result.dataset.spotlightResult)); return; }
  const action = event.target.closest("[data-spotlight-action]")?.dataset.spotlightAction;
  if (action === "course") { showDigitalCourse("macos-essentials"); return; }
  if (action === "digital") { showDigitalSkills(); return; }
  if (action === "begin" || action === "retry") { resetSpotlight(); renderSpotlightTraining(); spotlightApp.querySelector('[data-spotlight-action="open"]').focus(); }
  if (action === "open" || action === "close") setSpotlightOpen(action === "open");
  if (action === "hint") {
    const s = spotlightState;
    if (!s.hints.includes(s.task)) s.hints.push(s.task);
    s.hintVisible = !s.hintVisible;
    spotlightApp.querySelector("#spotlight-hint").hidden = !s.hintVisible;
    event.target.closest("button").setAttribute("aria-expanded", String(s.hintVisible));
    if (s.hintVisible && !s.completed.includes(s.task)) spotlightApp.querySelector("#spotlight-feedback").textContent = spotlightTasks[s.task].hint;
  }
  if (action === "next" && spotlightState.completed.includes(spotlightState.task)) {
    if (spotlightState.task === 7) { renderSpotlightComplete(); return; }
    Object.assign(spotlightState, { task: spotlightState.task + 1, query: "", results: [], selected: -1, open: false, opened: null, hintVisible: false });
    renderSpotlightTraining();
    spotlightApp.querySelector("#spotlight-title").focus();
  }
});
document.addEventListener("keydown", event => {
  if (!spotlightApp.closest(".screen").classList.contains("is-active") || spotlightState.view !== "training") return;
  if (event.metaKey && event.code === "Space") { event.preventDefault(); if (!event.repeat) setSpotlightOpen(!spotlightState.open); return; }
  if (!spotlightState.open) return;
  if (event.key === "Escape") { event.preventDefault(); setSpotlightOpen(false); return; }
  if (event.target.id !== "spotlight-input" || event.isComposing) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const count = spotlightState.results.length;
    if (count) spotlightState.selected = (spotlightState.selected + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
    renderSpotlightResults();
  } else if (event.key === "Enter") { event.preventDefault(); activateSpotlightResult(spotlightState.selected); }
});

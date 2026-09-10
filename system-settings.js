'use strict';

const systemSettingsTasks = [
  { id: 'open', title: 'OPEN SYSTEM SETTINGS', prompt: 'Use the Dock to open System Settings.', hint: 'Look for System Settings in the Dock.', successFeedback: "System Settings is where you control many of your Mac's preferences and hardware settings." },
  { id: 'display', title: 'FIND DISPLAY', prompt: 'Use the System Settings sidebar to open Display.', hint: 'Settings categories are listed in the sidebar.', category: 'Display', successFeedback: 'Display settings control how the screen looks and behaves.' },
  { id: 'brightness', title: 'ADJUST BRIGHTNESS', prompt: 'Set the screen brightness to approximately 70%.', hint: 'Look for the Brightness slider.', category: 'Display', control: 'brightness', min: 65, max: 75, successFeedback: "Brightness controls how bright the Mac's display appears." },
  { id: 'sound', title: 'FIND SOUND', prompt: 'Use the sidebar to open Sound.', hint: 'Find Sound in the Settings sidebar.', category: 'Sound', successFeedback: 'Sound settings control audio output, volume, alerts, and related options.' },
  { id: 'volume', title: 'SET THE VOLUME', prompt: 'Set the output volume to approximately 50%.', hint: 'Look for Output Volume.', category: 'Sound', control: 'outputVolume', min: 45, max: 55, successFeedback: 'Output volume controls how loudly sound plays through the selected audio device.' },
  { id: 'trackpad', title: 'FIND TRACKPAD', prompt: 'Use the sidebar to open Trackpad.', hint: 'Find Trackpad in the sidebar.', category: 'Trackpad', successFeedback: 'Trackpad settings control how the pointer responds to movement and gestures.' },
  { id: 'speed', title: 'CHANGE TRACKING SPEED', prompt: 'Increase the tracking speed to a fast setting.', hint: 'Move Tracking Speed toward Fast.', category: 'Trackpad', control: 'trackingSpeed', min: 75, max: 100, successFeedback: 'Tracking speed changes how far the pointer moves when you move your finger on the trackpad.' },
  { id: 'keyboard', title: 'ADJUST KEYBOARD SETTINGS', prompt: 'Open Keyboard settings and set Key Repeat to a fast setting.', hint: 'Open Keyboard, then find Key Repeat.', category: 'Keyboard', control: 'keyRepeat', min: 75, max: 100, successFeedback: 'Key Repeat controls how quickly a key repeats when you hold it down.' }
];
const systemSettingsApp = document.querySelector('#system-settings-app');
let systemSettingsState;
function resetSystemSettings(view = 'training') {
  systemSettingsState = { view, task: 0, completed: [], incorrect: 0, hints: [], hintVisible: false, activeCategory: 'Appearance', open: false, brightness: 40, outputVolume: 25, trackingSpeed: 40, keyRepeat: 40, keyboardVisited: false };
}
resetSystemSettings('intro');
function settingsButton(action, text, primary = false) {
  return `<button type="button" class="${primary ? 'primary' : 'secondary'}-button" data-settings-action="${action}">${text}</button>`;
}
function showSystemSettings(updateHistory = true) {
  activeDigitalCourseId = 'macos-essentials';
  document.title = 'System Settings | Repair Academy';
  if (updateHistory) history.pushState({ screen: 'system-settings' }, '', '#system-settings');
  resetSystemSettings('intro');
  systemSettingsApp.innerHTML = `<section class="mac-intro tech-corners"><div class="training-badge" aria-hidden="true">03</div><p class="section-kicker">SECTION 03</p><h1 id="system-settings-title">SYSTEM SETTINGS</h1><p class="training-subtitle">Mac Configuration Training</p><p class="intro-instruction">Learn where to find and change common settings on your Mac.</p><div class="mac-task-count"><strong>8</strong><span>SETTINGS TASKS</span></div><div class="intro-actions">${settingsButton('begin', 'BEGIN TRAINING', true)}${settingsButton('course', 'RETURN TO macOS ESSENTIALS')}</div></section>`;
  showScreen('system-settings');
}
const settingsCategories = ['Appearance', 'Control Center', 'Display', 'Sound', 'Trackpad', 'Keyboard'];
const settingsControls = {
  Display: ['brightness', 'BRIGHTNESS', 'Dim', 'Bright', 'Adjust the light level of the simulated display.'],
  Sound: ['outputVolume', 'OUTPUT VOLUME', 'Quiet', 'Loud', 'Output device: Mac speakers'],
  Trackpad: ['trackingSpeed', 'TRACKING SPEED', 'Slow', 'Fast', 'Choose how quickly the pointer moves.'],
  Keyboard: ['keyRepeat', 'KEY REPEAT', 'Slow', 'Fast', 'Choose how quickly a held key repeats.']
};
function settingsPanelMarkup() {
  const s = systemSettingsState, control = settingsControls[s.activeCategory];
  if (!control) return `<h2>${s.activeCategory}</h2><div class="settings-group"><strong>${s.activeCategory === 'Appearance' ? 'Appearance: Light' : 'Menu Bar controls'}</strong><p>${s.activeCategory === 'Appearance' ? 'Settings are grouped by category. Choose a category in the sidebar to explore its controls.' : 'Control Center groups frequently used controls in the Menu Bar.'}</p><small>Preview only in this training simulation.</small></div>`;
  const [id, label, low, high, description] = control;
  return `<h2>${s.activeCategory}</h2><div class="settings-group"><p>${description}</p><div class="settings-control-label"><label for="settings-${id}">${label}</label><output for="settings-${id}" id="settings-value-${id}">${s[id]}%</output></div><input id="settings-${id}" data-setting="${id}" type="range" min="0" max="100" step="1" value="${s[id]}" aria-valuetext="${s[id]} percent" aria-describedby="settings-scale"><div id="settings-scale" class="settings-scale"><span>${low}</span><span>${high}</span></div>${id === 'outputVolume' ? `<meter id="settings-volume-meter" aria-label="Simulated speaker volume" min="0" max="100" value="${s.outputVolume}"></meter>` : ''}</div><p class="settings-simulation-note">Practice Mac · Changes apply only to this simulation.</p>`;
}
function renderSettingsWindow() {
  const s = systemSettingsState;
  const host = systemSettingsApp.querySelector('#settings-window-host');
  host.innerHTML = s.open ? `<section class="mac-window is-active settings-window" aria-label="System Settings window"><header class="mac-window-title"><span class="mac-window-controls" aria-hidden="true"><i></i><i></i><i></i></span><strong>System Settings</strong></header><div class="settings-window-body"><nav class="settings-sidebar" aria-label="Settings categories">${settingsCategories.map((name, i) => `<button type="button" data-settings-category="${name}" aria-current="${s.activeCategory === name ? 'page' : 'false'}"><span class="settings-category-icon" aria-hidden="true">${['◐', '▦', '▣', '♪', '▱', '⌨'][i]}</span>${name}</button>`).join('')}</nav><div class="settings-panel">${settingsPanelMarkup()}</div></div></section>` : '<div class="settings-desktop-note"><strong>Your practice Mac</strong><p>Open System Settings from the Dock to get started.</p></div>';
  systemSettingsApp.querySelector('#settings-menu-app').textContent = s.open ? 'System Settings' : 'Finder';
}
function renderSystemSettingsTraining() {
  const s = systemSettingsState, task = systemSettingsTasks[s.task];
  systemSettingsApp.innerHTML = `<section class="mac-training"><div class="mac-task-header"><div><p class="section-kicker">SECTION 03 // GUIDED PRACTICE</p><h1 id="system-settings-title" tabindex="-1">${task.title}</h1><p id="settings-instruction">${task.prompt}</p></div><div class="mac-progress-copy"><strong>TASK ${s.task + 1} / 8</strong><span id="settings-errors">Incorrect Interactions: ${s.incorrect}</span></div></div><div class="progress-track mac-progress" role="progressbar" aria-label="System Settings task progress" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${s.completed.length}"><span style="width:${s.completed.length / 8 * 100}%"></span></div><div class="mac-help-row">${settingsButton('hint', 'HINT')}<p id="settings-hint" class="mac-hint" hidden>${task.hint}</p></div><div class="mac-desktop" aria-describedby="settings-instruction"><div class="mac-menu-bar"><strong id="settings-menu-app">Finder</strong><span class="mac-menu-items" aria-hidden="true">&nbsp; File &nbsp; Edit &nbsp; View &nbsp; Window &nbsp; Help</span><span class="mac-status-items">Practice Mac</span></div><div class="mac-wallpaper"><div class="settings-brightness-wash" aria-hidden="true"></div><div id="settings-window-host"></div></div><nav class="mac-dock" aria-label="Simulated Dock">${[['finder', 'Finder', '☻'], ['safari', 'Safari', '◈'], ['notes', 'Notes', '▤'], ['system-settings', 'System Settings', '⚙']].map(([id, name, glyph]) => `<button type="button" class="mac-dock-app mac-icon-${id}" data-settings-dock="${name}" aria-label="Open ${name}"><span aria-hidden="true">${glyph}</span><small>${name}</small></button>`).join('')}</nav></div><div id="settings-feedback" class="mac-feedback"><div role="status" aria-live="polite" id="settings-status">Complete the task in the practice Mac.</div><div id="settings-next"></div></div></section>`;
  const hint = systemSettingsApp.querySelector('[data-settings-action="hint"]');
  hint.setAttribute('aria-controls', 'settings-hint');
  hint.setAttribute('aria-expanded', 'false');
  renderSettingsWindow();
  updateSettingsBrightness();
}
function updateSettingsBrightness() {
  systemSettingsApp.querySelector('.settings-brightness-wash').style.opacity = String(systemSettingsState.brightness / 500);
}
function checkSettingsTask(eventType, control) {
  const s = systemSettingsState, task = systemSettingsTasks[s.task];
  if (s.completed.includes(s.task)) return;
  const correct = task.id === 'open' ? eventType === 'open' : task.control ? eventType === 'input' && control === task.control && s.activeCategory === task.category && s[control] >= task.min && s[control] <= task.max && (task.id !== 'keyboard' || s.keyboardVisited) : eventType === 'category' && s.activeCategory === task.category;
  if (!correct) return;
  s.completed.push(s.task);
  systemSettingsApp.querySelector('#settings-status').innerHTML = `<strong>TASK COMPLETE</strong><p>${task.successFeedback}</p>`;
  systemSettingsApp.querySelector('#settings-feedback').classList.add('is-complete');
  systemSettingsApp.querySelector('#settings-next').innerHTML = settingsButton('next', s.task === 7 ? 'FINISH TRAINING' : 'NEXT TASK', true);
  const progress = systemSettingsApp.querySelector('[role="progressbar"]');
  progress.setAttribute('aria-valuenow', s.completed.length);
  progress.firstElementChild.style.width = `${s.completed.length / 8 * 100}%`;
  // Keep focus and the native range node intact during mouse drags and arrow-key input.
}
function settingsIncorrect(message) {
  const s = systemSettingsState;
  if (s.completed.includes(s.task)) return;
  s.incorrect++;
  systemSettingsApp.querySelector('#settings-errors').textContent = `Incorrect Interactions: ${s.incorrect}`;
  systemSettingsApp.querySelector('#settings-status').textContent = message;
}
function renderSystemSettingsComplete() {
  systemSettingsState.view = 'complete';
  systemSettingsApp.innerHTML = `<section class="mac-complete tech-corners"><div class="completion-mark" aria-hidden="true">✓</div><p class="section-kicker">SECTION COMPLETE</p><h1 id="system-settings-title" tabindex="-1">SYSTEM SETTINGS</h1><div class="result-score"><strong>8 / 8</strong><span>TASKS COMPLETE</span></div><p>You practiced opening System Settings, navigating categories, and changing Display, Sound, Trackpad, and Keyboard settings.</p><p class="incorrect-total">Incorrect Interactions: ${systemSettingsState.incorrect}</p><div class="results-actions">${settingsButton('retry', 'RETRY SECTION', true)}${settingsButton('course', 'RETURN TO macOS ESSENTIALS')}${settingsButton('digital', 'DIGITAL SKILLS')}</div></section>`;
  systemSettingsApp.querySelector('h1').focus();
}
systemSettingsApp.addEventListener('click', event => {
  const s = systemSettingsState;
  const action = event.target.closest('[data-settings-action]')?.dataset.settingsAction;
  if (action === 'course') { showDigitalCourse('macos-essentials'); return; }
  if (action === 'digital') { showDigitalSkills(); return; }
  if (action === 'begin' || action === 'retry') { resetSystemSettings(); renderSystemSettingsTraining(); systemSettingsApp.querySelector('[data-settings-dock="System Settings"]').focus(); return; }
  if (s.view !== 'training') return;
  if (action === 'hint') {
    s.hintVisible = !s.hintVisible;
    if (!s.hints.includes(s.task)) s.hints.push(s.task);
    systemSettingsApp.querySelector('#settings-hint').hidden = !s.hintVisible;
    event.target.closest('button').setAttribute('aria-expanded', s.hintVisible);
  }
  if (action === 'next' && s.completed.includes(s.task)) {
    if (s.task === 7) { renderSystemSettingsComplete(); return; }
    s.task++; s.hintVisible = false;
    renderSystemSettingsTraining(); systemSettingsApp.querySelector('h1').focus();
  }
  const dock = event.target.closest('[data-settings-dock]')?.dataset.settingsDock;
  if (dock === 'System Settings') { s.open = true; renderSettingsWindow(); checkSettingsTask('open'); }
  else if (dock) settingsIncorrect('KEEP LOOKING — Open System Settings from the Dock.');
  const category = event.target.closest('[data-settings-category]')?.dataset.settingsCategory;
  if (category) {
    s.activeCategory = category;
    if (s.task === 7 && category === 'Keyboard') s.keyboardVisited = true;
    renderSettingsWindow();
    systemSettingsApp.querySelector(`[data-settings-category="${category}"]`).focus();
    if (category !== systemSettingsTasks[s.task].category) settingsIncorrect('KEEP LOOKING — Try another settings category.');
    checkSettingsTask('category');
  }
});
systemSettingsApp.addEventListener('input', event => {
  const control = event.target.dataset.setting;
  if (!control || systemSettingsState.view !== 'training') return;
  systemSettingsState[control] = Number(event.target.value);
  event.target.setAttribute('aria-valuetext', `${event.target.value} percent`);
  systemSettingsApp.querySelector(`#settings-value-${control}`).textContent = `${event.target.value}%`;
  if (control === 'brightness') updateSettingsBrightness();
  if (control === 'outputVolume') systemSettingsApp.querySelector('#settings-volume-meter').value = event.target.value;
  checkSettingsTask('input', control);
});

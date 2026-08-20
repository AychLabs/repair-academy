"use strict";

const academyModules = [
  { id: "identify", level: 1, title: "Identify the Part", description: "Can you recognize the components inside a computer?", skill: "VISUAL RECOGNITION", icon: "01", accent: "#53d5ff", glow: "rgba(83, 213, 255, 0.17)" },
  { id: "function", level: 2, title: "What Does It Do?", description: "Match each computer part with its job.", skill: "COMPONENT FUNCTIONS", icon: "02", accent: "#9dfc79", glow: "rgba(157, 252, 121, 0.14)" },
  { id: "build", level: 3, title: "Build the PC", description: "Install the components in the correct locations.", skill: "SYSTEM ASSEMBLY", icon: "03", accent: "#b9a2ff", glow: "rgba(185, 162, 255, 0.16)" },
  { id: "repair", level: 4, title: "Repair Shop", description: "Diagnose computer problems and choose the right component.", skill: "PROBLEM SOLVING", icon: "04", accent: "#ffb45e", glow: "rgba(255, 180, 94, 0.15)" }
];

const computerPartsResults = {};

function updateBestResult(results, sectionId, earned, possible) {
  const previous = results[sectionId];
  if (!previous || earned / Math.max(1, possible) > previous.earned / Math.max(1, previous.possible)) {
    results[sectionId] = { earned, possible };
  }
}

function courseStatusMarkup(result) {
  return `<small class="course-status-line">${result ? `COMPLETED // BEST SCORE ${result.earned} / ${result.possible}` : "NOT STARTED"}</small>`;
}

/** Shared component curriculum and image source of truth. */
const components = [
  {
    id: "cpu",
    displayName: "CPU",
    description: "The CPU processes instructions and performs calculations for the computer.",
    imagePath: "assets/images/components/component-01.png",
    functionAnswer: "Processes instructions and calculations",
    functionFeedback: "The CPU processes instructions and performs calculations. It is often described as the computer's main processor.",
    placementTarget: "cpu", installationFeedback: "The CPU installs into a socket on the motherboard.", placementScale: "small"
  },
  {
    id: "ram",
    displayName: "RAM",
    description: "RAM temporarily holds information the computer is actively using.",
    imagePath: "assets/images/components/component-02.png",
    functionAnswer: "Temporarily holds actively used data",
    functionFeedback: "RAM temporarily holds information the computer is actively using so the processor can access it quickly.",
    placementTarget: "ram", installationFeedback: "RAM installs into long memory slots located on the motherboard near the CPU.", placementScale: "slim"
  },
  {
    id: "storage",
    displayName: "Storage (HDD/SSD)",
    description: "Storage keeps files, programs, and data even when the computer is turned off.",
    imagePath: "assets/images/components/component-03.png",
    functionAnswer: "Stores files and programs long-term",
    functionFeedback: "Storage keeps files, programs, and data even after the computer is powered off.",
    placementTarget: "storage", installationFeedback: "Storage devices mount in drive bays or dedicated storage locations inside the case.", placementScale: "medium"
  },
  {
    id: "motherboard",
    displayName: "Motherboard",
    description: "The motherboard connects the major components of the computer so they can work together.",
    imagePath: "assets/images/components/component-04.png",
    functionAnswer: "Connects the computer's major components",
    functionFeedback: "The motherboard connects the computer's major components and allows them to communicate with one another.",
    placementTarget: "motherboard", installationFeedback: "The motherboard mounts to the inside of the computer case and connects the computer's major components.", placementScale: "large"
  },
  {
    id: "psu",
    displayName: "Power Supply (PSU)",
    description: "The power supply provides electrical power to the computer's components.",
    imagePath: "assets/images/components/component-05.png",
    functionAnswer: "Supplies electrical power",
    functionFeedback: "The power supply converts and distributes electrical power to the computer's internal components.",
    placementTarget: "psu", installationFeedback: "The power supply mounts in its own bay inside the case and supplies power to the other components.", placementScale: "medium"
  },
  {
    id: "gpu",
    displayName: "GPU",
    description: "The GPU processes graphics, images, video, and 3D visuals.",
    imagePath: "assets/images/components/component-06.png",
    functionAnswer: "Processes graphics and video",
    functionFeedback: "The GPU handles graphics, images, video, and many 3D calculations.",
    placementTarget: "gpu", installationFeedback: "The GPU installs into a PCIe expansion slot on the motherboard and lines up with expansion openings at the rear of the case.", placementScale: "wide"
  },
  {
    id: "ports",
    displayName: "Ports & Connectors",
    description: "Ports and connectors allow computers to connect to monitors, keyboards, networks, USB devices, and other hardware.",
    imagePath: "assets/images/components/component-07.png",
    functionAnswer: "Connects external devices and cables",
    functionFeedback: "Ports and connectors let the computer communicate with monitors, USB devices, networks, audio equipment, and other hardware.",
    placementTarget: "ports", installationFeedback: "The motherboard's rear I/O ports line up with the back of the computer case so external devices can be connected.", placementScale: "small"
  },
  {
    id: "cooling",
    displayName: "Cooling System",
    description: "The cooling system removes heat from computer components to keep them from getting too hot.",
    imagePath: "assets/images/components/component-08.png",
    functionAnswer: "Removes heat from components",
    functionFeedback: "The cooling system moves heat away from components so they stay within safe operating temperatures.",
    placementTarget: "cooling", installationFeedback: "Cooling hardware is positioned to remove heat from the CPU and other components and move warm air out of the case.", placementScale: "medium"
  }
];

/** Level 04 scenarios reference the shared component records above. */
const repairTickets = [
  { id: "calculations", componentId: "cpu", customerReport: "My computer can open programs, but tasks that require lots of calculations take a very long time.", explanation: "The CPU processes instructions and calculations, so calculation-heavy tasks depend heavily on it." },
  { id: "many-programs", componentId: "ram", customerReport: "My computer becomes very slow when I open several programs at the same time.", explanation: "RAM holds information for programs that are currently running. Having many programs open can require more RAM." },
  { id: "save-space", componentId: "storage", customerReport: "My computer says there is almost no space left to save files or install programs.", explanation: "Storage holds saved files and installed programs. If storage is nearly full, there may not be room for more data." },
  { id: "communication", componentId: "motherboard", customerReport: "Several internal components are installed correctly, but they are not communicating or working together properly.", explanation: "The motherboard connects the computer's major components and allows them to communicate." },
  { id: "no-power", componentId: "psu", customerReport: "I press the power button, but the computer does not power on at all.", explanation: "The power supply provides electrical power to the computer's internal components." },
  { id: "poor-graphics", componentId: "gpu", customerReport: "The computer works for normal tasks, but graphics, games, and 3D visuals run very poorly.", explanation: "The GPU handles graphics, video, games, and many 3D visual tasks." },
  { id: "usb-port", componentId: "ports", customerReport: "My USB device is working, but the computer does not detect it when I plug it into one of the computer's ports.", explanation: "Ports and connectors provide physical connections between the computer and external hardware." },
  { id: "too-hot", componentId: "cooling", customerReport: "The computer becomes extremely hot and may slow down after running for a while.", explanation: "The cooling system removes heat. If cooling is not working properly, the computer can become too hot." }
];

const screens = {
  home: document.querySelector('[data-screen="home"]'),
  department: document.querySelector('[data-screen="department"]'),
  parts: document.querySelector('[data-screen="parts"]'),
  "input-output": document.querySelector('[data-screen="input-output"]'),
  "hardware-software": document.querySelector('[data-screen="hardware-software"]'),
  identify: document.querySelector('[data-screen="identify"]'),
  function: document.querySelector('[data-screen="function"]'),
  build: document.querySelector('[data-screen="build"]'),
  repair: document.querySelector('[data-screen="repair"]')
};

const repairElements = {
  views: document.querySelectorAll("[data-repair-view]"), begin: document.querySelector("#open-repair-shop"),
  ticketCounter: document.querySelector("#repair-ticket-counter"), scoreCounter: document.querySelector("#repair-score-counter"), progressTrack: document.querySelector("#repair-progress-track"), progressFill: document.querySelector("#repair-progress-fill"),
  ticketPanel: document.querySelector("#repair-ticket-panel"), ticketNumber: document.querySelector("#repair-ticket-number"), report: document.querySelector("#repair-customer-report"), answerGrid: document.querySelector("#repair-answer-grid"),
  feedback: document.querySelector("#repair-feedback-panel"), feedbackIcon: document.querySelector("#repair-feedback-icon"), feedbackTitle: document.querySelector("#repair-feedback-title"), feedbackText: document.querySelector("#repair-feedback-text"), next: document.querySelector("#repair-next-ticket"),
  finalScore: document.querySelector("#repair-final-score"), finalPercentage: document.querySelector("#repair-final-percentage"), performance: document.querySelector("#repair-performance-message"), incorrect: document.querySelector("#repair-incorrect-total"), retry: document.querySelector("#retry-repair-shop")
};
const repairState = { ticketOrder: [], ticketNumbers: [], choices: [], currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisTicket: 0, answered: false };

const functionElements = {
  views: document.querySelectorAll("[data-function-view]"), begin: document.querySelector("#begin-function-training"),
  questionCounter: document.querySelector("#function-question-counter"), scoreCounter: document.querySelector("#function-score-counter"),
  progressTrack: document.querySelector("#function-progress-track"), progressFill: document.querySelector("#function-progress-fill"),
  componentDisplay: document.querySelector("#function-component-display"), image: document.querySelector("#function-component-image"),
  fallback: document.querySelector("#function-image-fallback"), componentName: document.querySelector("#function-component-name"),
  answerGrid: document.querySelector("#function-answer-grid"), feedbackPanel: document.querySelector("#function-feedback-panel"),
  feedbackIcon: document.querySelector("#function-feedback-icon"), feedbackTitle: document.querySelector("#function-feedback-title"),
  feedbackText: document.querySelector("#function-feedback-text"), next: document.querySelector("#function-next-question"),
  finalScore: document.querySelector("#function-final-score"), finalPercentage: document.querySelector("#function-final-percentage"),
  performance: document.querySelector("#function-performance-message"), incorrect: document.querySelector("#function-incorrect-total"),
  retry: document.querySelector("#retry-function-training")
};

const functionState = { questionOrder: [], currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisQuestion: 0, answered: false };

const buildElements = {
  views: document.querySelectorAll("[data-build-view]"), begin: document.querySelector("#begin-build-training"),
  questionCounter: document.querySelector("#build-question-counter"), scoreCounter: document.querySelector("#build-score-counter"),
  progressTrack: document.querySelector("#build-progress-track"), progressFill: document.querySelector("#build-progress-fill"),
  name: document.querySelector("#build-component-name"), source: document.querySelector("#build-drag-source"),
  image: document.querySelector("#build-component-image"), fallback: document.querySelector("#build-image-fallback"), tower: document.querySelector("#build-tower"),
  targets: document.querySelectorAll("#build-tower [data-target-id]"), installed: document.querySelector("#build-installed-part"), installedImage: document.querySelector("#build-installed-image"),
  feedback: document.querySelector("#build-feedback-panel"), feedbackIcon: document.querySelector("#build-feedback-icon"), feedbackTitle: document.querySelector("#build-feedback-title"), feedbackText: document.querySelector("#build-feedback-text"),
  next: document.querySelector("#build-next-component"), finalScore: document.querySelector("#build-final-score"), finalPercentage: document.querySelector("#build-final-percentage"), performance: document.querySelector("#build-performance-message"), incorrect: document.querySelector("#build-incorrect-total"), retry: document.querySelector("#retry-build-training")
};
const buildState = { questionOrder: [], currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisQuestion: 0, answered: false, selected: false, pointerId: null, dragGhost: null, dragStartX: 0, dragStartY: 0, didDrag: false, suppressClick: false };

const elements = {
  modeGrid: document.querySelector("#mode-grid"),
  identifyViews: document.querySelectorAll("[data-identify-view]"),
  beginTraining: document.querySelector("#begin-training"),
  questionCounter: document.querySelector("#question-counter"),
  scoreCounter: document.querySelector("#score-counter"),
  progressTrack: document.querySelector(".progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  componentDisplay: document.querySelector("#component-display"),
  componentImage: document.querySelector("#component-image"),
  componentImageFallback: document.querySelector("#component-image-fallback"),
  answerGrid: document.querySelector("#answer-grid"),
  feedbackPanel: document.querySelector("#feedback-panel"),
  feedbackIcon: document.querySelector("#feedback-icon"),
  feedbackTitle: document.querySelector("#feedback-title"),
  feedbackText: document.querySelector("#feedback-text"),
  nextQuestion: document.querySelector("#next-question"),
  finalScore: document.querySelector("#final-score"),
  finalPercentage: document.querySelector("#final-percentage"),
  performanceMessage: document.querySelector("#performance-message"),
  incorrectTotal: document.querySelector("#incorrect-total"),
  retryTraining: document.querySelector("#retry-training")
};

const identifyState = {
  questionOrder: [],
  currentIndex: 0,
  firstAttemptCorrect: 0,
  completed: 0,
  incorrectAttempts: 0,
  attemptsThisQuestion: 0,
  answered: false
};

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function renderModuleCards() {
  elements.modeGrid.innerHTML = academyModules.map((module) => `
    <button class="mode-card" type="button" data-module-id="${module.id}"
      style="--card-accent: ${module.accent}; --card-glow: ${module.glow};"
      aria-label="Open Level ${module.level}: ${module.title}">
      <span class="card-content">
        <span class="card-icon" aria-hidden="true">${module.icon}</span>
        <span class="card-copy">
          <span class="card-level">LEVEL ${String(module.level).padStart(2, "0")}</span>
          <h3>${module.title}</h3>
          <p>${module.description}</p>
          ${courseStatusMarkup(computerPartsResults[module.id])}
          <span class="skill-tag">${module.skill}</span>
        </span>
        <span class="card-arrow" aria-hidden="true">&rarr;</span>
      </span>
    </button>
  `).join("");
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => screen.classList.toggle("is-active", name === screenName));
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#main-content").focus({ preventScroll: true });
}

function showIdentifyView(viewName) {
  elements.identifyViews.forEach((view) => {
    const isActive = view.dataset.identifyView === viewName;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });
}

function showFunctionView(viewName) {
  functionElements.views.forEach((view) => {
    const isActive = view.dataset.functionView === viewName;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });
}

function showBuildView(viewName) {
  buildElements.views.forEach((view) => { const active = view.dataset.buildView === viewName; view.hidden = !active; view.classList.toggle("is-active", active); });
}

function showRepairView(viewName) {
  repairElements.views.forEach((view) => { const active = view.dataset.repairView === viewName; view.hidden = !active; view.classList.toggle("is-active", active); });
}

function openModule(moduleId, updateHistory = true) {
  const selectedModule = academyModules.find((module) => module.id === moduleId);
  if (!selectedModule) {
    showHome(updateHistory);
    return;
  }

  if (updateHistory) history.pushState({ moduleId }, "", `#${moduleId}`);
  document.title = `${selectedModule.title} | PC Repair Academy`;

  if (moduleId === "identify") {
    showIdentifyView("intro");
    showScreen("identify");
    return;
  }
  if (moduleId === "function") {
    showFunctionView("intro");
    showScreen("function");
    return;
  }
  if (moduleId === "build") {
    showBuildView("intro");
    showScreen("build");
    return;
  }
  if (moduleId === "repair") {
    showRepairView("intro");
    showScreen("repair");
    return;
  }

  showHome(updateHistory);
}

function showDepartment(updateHistory = true) {
  document.title = "Computer Systems Department | Repair Academy";
  if (updateHistory) history.pushState({ screen: "department" }, "", "#computer-systems");
  showScreen("department");
}

function showComputerParts(updateHistory = true) {
  document.title = "Computer Parts Training | Repair Academy";
  if (updateHistory) history.pushState({ screen: "parts" }, "", "#computer-parts");
  renderModuleCards();
  showScreen("parts");
}

function showInputOutput(updateHistory = true) {
  document.title = "Input & Output Systems | Repair Academy";
  if (updateHistory) history.pushState({ screen: "input-output" }, "", "#input-output");
  resetIOCourse();
  showScreen("input-output");
}

function showHardwareSoftware(updateHistory = true) {
  document.title = "Hardware vs. Software | Repair Academy";
  if (updateHistory) history.pushState({ screen: "hardware-software" }, "", "#hardware-software");
  resetHSCourse();
  showScreen("hardware-software");
}

function showHome(updateHistory = true) {
  document.title = "Repair Academy";
  if (updateHistory) history.pushState({}, "", window.location.pathname + window.location.search);
  showScreen("home");
}

function startTraining() {
  identifyState.questionOrder = shuffle(components);
  identifyState.currentIndex = 0;
  identifyState.firstAttemptCorrect = 0;
  identifyState.completed = 0;
  identifyState.incorrectAttempts = 0;
  identifyState.attemptsThisQuestion = 0;
  identifyState.answered = false;
  showIdentifyView("question");
  renderQuestion();
}

function getAnswerChoices(correctComponent) {
  const distractors = shuffle(components.filter((component) => component.id !== correctComponent.id)).slice(0, 3);
  return shuffle([correctComponent, ...distractors]);
}

function displayComponentArt(component) {
  elements.componentImage.hidden = true;
  elements.componentImageFallback.hidden = true;

  elements.componentImage.onload = () => {
    elements.componentImage.hidden = false;
    elements.componentImageFallback.hidden = true;
  };
  elements.componentImage.onerror = () => {
    elements.componentImage.hidden = true;
    elements.componentImageFallback.hidden = false;
  };
  elements.componentImage.src = component.imagePath;
}

function renderQuestion() {
  const component = identifyState.questionOrder[identifyState.currentIndex];
  const questionNumber = identifyState.currentIndex + 1;
  identifyState.attemptsThisQuestion = 0;
  identifyState.answered = false;

  elements.questionCounter.textContent = `QUESTION ${questionNumber} / ${components.length}`;
  elements.scoreCounter.textContent = `SCORE ${identifyState.firstAttemptCorrect} / ${identifyState.completed}`;
  elements.progressTrack.setAttribute("aria-valuenow", String(questionNumber));
  elements.progressFill.style.width = `${(questionNumber / components.length) * 100}%`;
  elements.componentDisplay.classList.remove("is-correct");
  elements.feedbackPanel.hidden = true;
  elements.feedbackPanel.className = "feedback-panel";
  elements.nextQuestion.hidden = true;
  elements.nextQuestion.textContent = questionNumber === components.length ? "VIEW RESULTS" : "NEXT QUESTION";
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = " →";
  elements.nextQuestion.append(arrow);

  displayComponentArt(component);
  elements.answerGrid.innerHTML = getAnswerChoices(component).map((choice) => `
    <button class="answer-button" type="button" data-answer-id="${choice.id}">${choice.displayName}</button>
  `).join("");
  elements.answerGrid.querySelector("button").focus();
}

function handleAnswer(button) {
  if (identifyState.answered || button.disabled) return;
  const currentComponent = identifyState.questionOrder[identifyState.currentIndex];
  const isCorrect = button.dataset.answerId === currentComponent.id;

  if (!isCorrect) {
    identifyState.attemptsThisQuestion += 1;
    identifyState.incorrectAttempts += 1;
    button.disabled = true;
    button.classList.add("is-wrong");
    elements.feedbackPanel.hidden = false;
    elements.feedbackPanel.className = "feedback-panel is-wrong";
    elements.feedbackIcon.textContent = "!";
    elements.feedbackTitle.textContent = "TRY AGAIN";
    elements.feedbackText.textContent = "That is not the component shown. Choose another answer.";
    const nextActive = elements.answerGrid.querySelector("button:not(:disabled)");
    if (nextActive) nextActive.focus();
    return;
  }

  identifyState.answered = true;
  if (identifyState.attemptsThisQuestion === 0) identifyState.firstAttemptCorrect += 1;
  identifyState.completed += 1;
  elements.scoreCounter.textContent = `SCORE ${identifyState.firstAttemptCorrect} / ${identifyState.completed}`;
  elements.answerGrid.querySelectorAll("button").forEach((answerButton) => { answerButton.disabled = true; });
  button.classList.add("is-correct");
  elements.componentDisplay.classList.add("is-correct");
  elements.feedbackPanel.hidden = false;
  elements.feedbackPanel.className = "feedback-panel is-correct";
  elements.feedbackIcon.textContent = "✓";
  elements.feedbackTitle.textContent = "CORRECT";
  elements.feedbackText.textContent = currentComponent.description;
  elements.nextQuestion.hidden = false;
  elements.nextQuestion.focus();
}

function advanceQuestion() {
  if (!identifyState.answered) return;
  if (identifyState.currentIndex === components.length - 1) {
    showResults();
    return;
  }
  identifyState.currentIndex += 1;
  renderQuestion();
}

function getPerformanceMessage(score) {
  if (score === 8) return "PERFECT DIAGNOSTIC!";
  if (score === 7) return "EXCELLENT WORK!";
  if (score >= 5) return "GOOD WORK!";
  if (score >= 3) return "KEEP TRAINING!";
  return "RUN TRAINING AGAIN";
}

function showResults() {
  const score = identifyState.firstAttemptCorrect;
  updateBestResult(computerPartsResults, "identify", score, components.length);
  const percentage = Math.round((score / components.length) * 100);
  elements.finalScore.textContent = `${score} / ${components.length}`;
  elements.finalPercentage.textContent = `${percentage}%`;
  elements.performanceMessage.textContent = getPerformanceMessage(score);
  elements.incorrectTotal.textContent = String(identifyState.incorrectAttempts);
  showIdentifyView("results");
  elements.retryTraining.focus();
}

function startFunctionTraining() {
  Object.assign(functionState, { questionOrder: shuffle(components), currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisQuestion: 0, answered: false });
  showFunctionView("question");
  renderFunctionQuestion();
}

function getFunctionChoices(correctComponent) {
  return shuffle([correctComponent, ...shuffle(components.filter((item) => item.id !== correctComponent.id)).slice(0, 3)]);
}

function displayFunctionArt(component) {
  functionElements.image.hidden = true;
  functionElements.fallback.hidden = true;
  functionElements.image.alt = `${component.displayName} computer component`;
  functionElements.image.onload = () => { functionElements.image.hidden = false; functionElements.fallback.hidden = true; };
  functionElements.image.onerror = () => { functionElements.image.hidden = true; functionElements.fallback.hidden = false; };
  functionElements.image.src = component.imagePath;
}

function renderFunctionQuestion() {
  const component = functionState.questionOrder[functionState.currentIndex];
  const questionNumber = functionState.currentIndex + 1;
  functionState.attemptsThisQuestion = 0;
  functionState.answered = false;
  functionElements.questionCounter.textContent = `QUESTION ${questionNumber} / ${components.length}`;
  functionElements.scoreCounter.textContent = `SCORE ${functionState.firstAttemptCorrect} / ${functionState.completed}`;
  functionElements.progressTrack.setAttribute("aria-valuenow", String(questionNumber));
  functionElements.progressFill.style.width = `${questionNumber / components.length * 100}%`;
  functionElements.componentDisplay.classList.remove("is-correct");
  functionElements.componentName.textContent = component.displayName;
  functionElements.feedbackPanel.hidden = true;
  functionElements.feedbackPanel.className = "feedback-panel";
  functionElements.next.hidden = true;
  functionElements.next.innerHTML = `${questionNumber === components.length ? "VIEW RESULTS" : "NEXT QUESTION"} <span aria-hidden="true">&rarr;</span>`;
  displayFunctionArt(component);
  functionElements.answerGrid.innerHTML = getFunctionChoices(component).map((choice) => `<button class="answer-button" type="button" data-function-answer-id="${choice.id}">${choice.functionAnswer}</button>`).join("");
  functionElements.answerGrid.querySelector("button").focus();
}

function handleFunctionAnswer(button) {
  if (functionState.answered || button.disabled) return;
  const component = functionState.questionOrder[functionState.currentIndex];
  if (button.dataset.functionAnswerId !== component.id) {
    functionState.attemptsThisQuestion += 1;
    functionState.incorrectAttempts += 1;
    button.disabled = true;
    button.classList.add("is-wrong");
    functionElements.feedbackPanel.hidden = false;
    functionElements.feedbackPanel.className = "feedback-panel is-wrong";
    functionElements.feedbackIcon.textContent = "!";
    functionElements.feedbackTitle.textContent = "TRY AGAIN";
    functionElements.feedbackText.textContent = "That is not this component's job. Choose another answer.";
    functionElements.answerGrid.querySelector("button:not(:disabled)")?.focus();
    return;
  }
  functionState.answered = true;
  if (functionState.attemptsThisQuestion === 0) functionState.firstAttemptCorrect += 1;
  functionState.completed += 1;
  functionElements.scoreCounter.textContent = `SCORE ${functionState.firstAttemptCorrect} / ${functionState.completed}`;
  functionElements.answerGrid.querySelectorAll("button").forEach((choice) => { choice.disabled = true; });
  button.classList.add("is-correct");
  functionElements.componentDisplay.classList.add("is-correct");
  functionElements.feedbackPanel.hidden = false;
  functionElements.feedbackPanel.className = "feedback-panel is-correct";
  functionElements.feedbackIcon.textContent = "✓";
  functionElements.feedbackTitle.textContent = "CORRECT";
  functionElements.feedbackText.textContent = component.functionFeedback;
  functionElements.next.hidden = false;
  functionElements.next.focus();
}

function advanceFunctionQuestion() {
  if (!functionState.answered) return;
  if (functionState.currentIndex === components.length - 1) {
    const score = functionState.firstAttemptCorrect;
    updateBestResult(computerPartsResults, "function", score, components.length);
    functionElements.finalScore.textContent = `${score} / ${components.length}`;
    functionElements.finalPercentage.textContent = `${Math.round(score / components.length * 100)}%`;
    functionElements.performance.textContent = getPerformanceMessage(score);
    functionElements.incorrect.textContent = String(functionState.incorrectAttempts);
    showFunctionView("results");
    functionElements.retry.focus();
    return;
  }
  functionState.currentIndex += 1;
  renderFunctionQuestion();
}

function startBuildTraining() {
  Object.assign(buildState, { questionOrder: shuffle(components), currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisQuestion: 0, answered: false, selected: false, pointerId: null, dragGhost: null });
  showBuildView("question");
  renderBuildChallenge();
}

function setBuildSelection(selected) {
  buildState.selected = selected && !buildState.answered;
  buildElements.source.setAttribute("aria-pressed", String(buildState.selected));
  buildElements.source.classList.toggle("is-selected", buildState.selected);
  buildElements.tower.classList.toggle("is-choosing", buildState.selected);
  buildElements.targets.forEach((target) => { target.tabIndex = buildState.selected ? 0 : -1; });
  if (buildState.selected) {
    buildElements.feedback.hidden = false;
    buildElements.feedback.className = "feedback-panel build-feedback is-selected";
    buildElements.feedbackIcon.textContent = ">";
    buildElements.feedbackTitle.textContent = "COMPONENT SELECTED";
    buildElements.feedbackText.textContent = "CHOOSE INSTALLATION LOCATION";
  } else if (buildState.attemptsThisQuestion === 0 && !buildState.answered) {
    buildElements.feedback.hidden = true;
  }
}

function displayBuildArt(component) {
  buildElements.image.hidden = true;
  buildElements.fallback.hidden = true;
  buildElements.image.alt = `${component.displayName} component ready to install`;
  buildElements.image.onload = () => { buildElements.image.hidden = false; buildElements.fallback.hidden = true; };
  buildElements.image.onerror = () => { buildElements.image.hidden = true; buildElements.fallback.hidden = false; };
  buildElements.image.src = component.imagePath;
}

function renderBuildChallenge() {
  const component = buildState.questionOrder[buildState.currentIndex];
  const number = buildState.currentIndex + 1;
  Object.assign(buildState, { attemptsThisQuestion: 0, answered: false, selected: false, pointerId: null });
  buildElements.questionCounter.textContent = `INSTALLATION ${number} / ${components.length}`;
  buildElements.scoreCounter.textContent = `SCORE ${buildState.firstAttemptCorrect} / ${buildState.completed}`;
  buildElements.progressTrack.setAttribute("aria-valuenow", String(number));
  buildElements.progressFill.style.width = `${number / components.length * 100}%`;
  buildElements.name.textContent = component.displayName;
  buildElements.source.dataset.scale = component.placementScale;
  buildElements.source.disabled = false;
  buildElements.source.setAttribute("aria-pressed", "false");
  buildElements.source.classList.remove("is-selected", "is-installed", "is-returning");
  buildElements.tower.classList.remove("is-choosing");
  buildElements.targets.forEach((target) => { target.tabIndex = -1; target.disabled = false; target.classList.remove("is-wrong", "is-correct", "is-drag-over"); });
  buildElements.installed.hidden = true;
  buildElements.installed.className = "installed-part";
  buildElements.feedback.hidden = true;
  buildElements.feedback.className = "feedback-panel build-feedback";
  buildElements.next.hidden = true;
  buildElements.next.innerHTML = `${number === components.length ? "VIEW RESULTS" : "NEXT COMPONENT"} <span aria-hidden="true">&rarr;</span>`;
  displayBuildArt(component);
  buildElements.source.focus();
}

function attemptBuildPlacement(target) {
  if (buildState.answered) return;
  const component = buildState.questionOrder[buildState.currentIndex];
  buildElements.targets.forEach((zone) => zone.classList.remove("is-drag-over"));
  if (!target || target.dataset.targetId !== component.placementTarget) {
    buildState.attemptsThisQuestion += 1;
    buildState.incorrectAttempts += 1;
    if (target) { target.classList.remove("is-wrong"); void target.offsetWidth; target.classList.add("is-wrong"); }
    buildElements.source.classList.remove("is-returning"); void buildElements.source.offsetWidth; buildElements.source.classList.add("is-returning");
    buildElements.feedback.hidden = false;
    buildElements.feedback.className = "feedback-panel build-feedback is-wrong";
    buildElements.feedbackIcon.textContent = "!";
    buildElements.feedbackTitle.textContent = "INCORRECT LOCATION — TRY AGAIN";
    buildElements.feedbackText.textContent = "Return the component to the tower and choose another location.";
    setBuildSelection(false);
    buildElements.source.focus();
    return;
  }
  buildState.answered = true;
  if (buildState.attemptsThisQuestion === 0) buildState.firstAttemptCorrect += 1;
  buildState.completed += 1;
  buildElements.scoreCounter.textContent = `SCORE ${buildState.firstAttemptCorrect} / ${buildState.completed}`;
  target.classList.add("is-correct");
  buildElements.targets.forEach((zone) => { zone.disabled = true; zone.tabIndex = -1; });
  buildElements.source.disabled = true;
  buildElements.source.classList.add("is-installed");
  setBuildSelection(false);
  buildElements.installed.classList.add(`installed-${component.placementTarget}`);
  buildElements.installedImage.src = component.imagePath;
  buildElements.installedImage.alt = `${component.displayName} installed`;
  buildElements.installed.hidden = false;
  buildElements.feedback.hidden = false;
  buildElements.feedback.className = "feedback-panel build-feedback is-correct";
  buildElements.feedbackIcon.textContent = "✓";
  buildElements.feedbackTitle.textContent = "INSTALLATION SUCCESSFUL";
  buildElements.feedbackText.textContent = component.installationFeedback;
  buildElements.next.hidden = false;
  buildElements.next.focus();
}

function getBuildTargetAtPoint(clientX, clientY) {
  const component = buildState.questionOrder[buildState.currentIndex];
  const intendedTarget = Array.from(buildElements.targets).find((target) => target.dataset.targetId === component?.placementTarget);
  if (intendedTarget) {
    const rect = intendedTarget.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return intendedTarget;
  }
  return document.elementFromPoint(clientX, clientY)?.closest("[data-target-id]") || null;
}

function finishBuildDrag(event) {
  if (buildState.pointerId !== event.pointerId) return;
  const target = buildState.didDrag ? getBuildTargetAtPoint(event.clientX, event.clientY) : null;
  buildElements.source.releasePointerCapture?.(event.pointerId);
  buildState.dragGhost?.remove();
  buildState.dragGhost = null;
  buildState.pointerId = null;
  buildElements.tower.classList.remove("is-dragging");
  if (buildState.didDrag) { buildState.suppressClick = true; attemptBuildPlacement(target); }
}

function advanceBuildChallenge() {
  if (!buildState.answered) return;
  if (buildState.currentIndex === components.length - 1) {
    const score = buildState.firstAttemptCorrect;
    updateBestResult(computerPartsResults, "build", score, components.length);
    buildElements.finalScore.textContent = `${score} / ${components.length}`;
    buildElements.finalPercentage.textContent = `${Math.round(score / components.length * 100)}%`;
    buildElements.performance.textContent = getPerformanceMessage(score);
    buildElements.incorrect.textContent = String(buildState.incorrectAttempts);
    showBuildView("results");
    buildElements.retry.focus();
    return;
  }
  buildState.currentIndex += 1;
  renderBuildChallenge();
}

function makeTicketNumbers(count) {
  const numbers = new Set();
  while (numbers.size < count) numbers.add(Math.floor(1000 + Math.random() * 9000));
  return [...numbers];
}

function getRepairChoices(componentId) {
  const correct = components.find((component) => component.id === componentId);
  const distractors = shuffle(components.filter((component) => component.id !== componentId)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function startRepairShop() {
  Object.assign(repairState, { ticketOrder: shuffle(repairTickets), ticketNumbers: makeTicketNumbers(repairTickets.length), choices: [], currentIndex: 0, firstAttemptCorrect: 0, completed: 0, incorrectAttempts: 0, attemptsThisTicket: 0, answered: false });
  showRepairView("question");
  renderRepairTicket();
}

function renderRepairTicket() {
  const ticket = repairState.ticketOrder[repairState.currentIndex];
  const number = repairState.currentIndex + 1;
  repairState.choices = getRepairChoices(ticket.componentId);
  repairState.attemptsThisTicket = 0;
  repairState.answered = false;
  repairElements.ticketCounter.textContent = `TICKET ${number} / ${repairTickets.length}`;
  repairElements.scoreCounter.textContent = `SCORE ${repairState.firstAttemptCorrect} / ${repairState.completed}`;
  repairElements.progressTrack.setAttribute("aria-valuenow", String(number));
  repairElements.progressFill.style.width = `${number / repairTickets.length * 100}%`;
  repairElements.ticketNumber.textContent = `REPAIR TICKET #${repairState.ticketNumbers[repairState.currentIndex]}`;
  repairElements.report.textContent = `“${ticket.customerReport}”`;
  repairElements.ticketPanel.classList.remove("is-confirmed");
  repairElements.feedback.hidden = true;
  repairElements.feedback.className = "feedback-panel repair-feedback";
  repairElements.next.hidden = true;
  repairElements.next.innerHTML = `${number === repairTickets.length ? "VIEW RESULTS" : "NEXT TICKET"} <span aria-hidden="true">&rarr;</span>`;
  repairElements.answerGrid.innerHTML = repairState.choices.map((component) => `<button class="repair-answer-button" type="button" data-repair-answer-id="${component.id}"><img src="${component.imagePath}" alt="" draggable="false"><span>${component.displayName}</span></button>`).join("");
}

function handleRepairAnswer(button) {
  if (repairState.answered || button.disabled) return;
  const ticket = repairState.ticketOrder[repairState.currentIndex];
  repairState.attemptsThisTicket += 1;
  if (button.dataset.repairAnswerId !== ticket.componentId) {
    repairState.incorrectAttempts += 1;
    button.disabled = true;
    button.classList.add("is-wrong");
    repairElements.feedback.hidden = false;
    repairElements.feedback.className = "feedback-panel repair-feedback is-wrong";
    repairElements.feedbackIcon.textContent = "×";
    repairElements.feedbackTitle.textContent = "DIAGNOSIS NOT CONFIRMED — TRY AGAIN";
    repairElements.feedbackText.textContent = "Review the customer report and check another component.";
    return;
  }
  repairState.answered = true;
  repairState.completed += 1;
  if (repairState.attemptsThisTicket === 1) repairState.firstAttemptCorrect += 1;
  repairElements.scoreCounter.textContent = `SCORE ${repairState.firstAttemptCorrect} / ${repairState.completed}`;
  repairElements.answerGrid.querySelectorAll("button").forEach((choice) => { choice.disabled = true; });
  button.classList.add("is-correct");
  repairElements.ticketPanel.classList.add("is-confirmed");
  repairElements.feedback.hidden = false;
  repairElements.feedback.className = "feedback-panel repair-feedback is-correct";
  repairElements.feedbackIcon.textContent = "✓";
  repairElements.feedbackTitle.textContent = "DIAGNOSIS CONFIRMED";
  repairElements.feedbackText.textContent = ticket.explanation;
  repairElements.next.hidden = false;
  repairElements.next.focus();
}

function advanceRepairTicket() {
  if (!repairState.answered) return;
  if (repairState.currentIndex === repairTickets.length - 1) {
    const score = repairState.firstAttemptCorrect;
    updateBestResult(computerPartsResults, "repair", score, repairTickets.length);
    repairElements.finalScore.textContent = `${score} / ${repairTickets.length}`;
    repairElements.finalPercentage.textContent = `${Math.round(score / repairTickets.length * 100)}%`;
    repairElements.performance.textContent = getPerformanceMessage(score);
    repairElements.incorrect.textContent = String(repairState.incorrectAttempts);
    showRepairView("results");
    repairElements.retry.focus();
    return;
  }
  repairState.currentIndex += 1;
  renderRepairTicket();
}

elements.modeGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-module-id]");
  if (card) openModule(card.dataset.moduleId);
});

elements.answerGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer-id]");
  if (button) handleAnswer(button);
});

elements.beginTraining.addEventListener("click", startTraining);
elements.retryTraining.addEventListener("click", startTraining);
elements.nextQuestion.addEventListener("click", advanceQuestion);
elements.componentImage.addEventListener("contextmenu", (event) => event.preventDefault());
functionElements.answerGrid.addEventListener("click", (event) => { const button = event.target.closest("[data-function-answer-id]"); if (button) handleFunctionAnswer(button); });
/* ---------- Course 02: Input & Output Systems ---------- */
const ioDevices = [
  { id:"keyboard", name:"Keyboard", file:"Keyboard.png", type:"input", explanation:"A keyboard sends key presses INTO the computer, so it is an input device." },
  { id:"mouse", name:"Mouse / Trackpad", file:"Mouse.png", type:"input", explanation:"A mouse or trackpad sends pointer movement and clicks INTO the computer, so it is an input device." },
  { id:"microphone", name:"Microphone", file:"Microphone.png", type:"input", explanation:"A microphone sends sound INTO the computer, so it is an input device." },
  { id:"webcam", name:"Webcam", file:"Webcam.png", type:"input", explanation:"A webcam sends video and images INTO the computer, so it is an input device." },
  { id:"scanner", name:"Scanner", file:"Scanner.png", type:"input", explanation:"A scanner sends scanned documents or images INTO the computer, so it is an input device." },
  { id:"controller", name:"Game Controller", file:"GameController.png", type:"input", explanation:"A game controller sends button presses and movement commands INTO the computer, so it is an input device." },
  { id:"barcode", name:"Barcode Reader", file:"BarcodeReader.png", type:"input", explanation:"A barcode reader sends scanned product information INTO the computer, so it is an input device." },
  { id:"monitor", name:"Monitor", file:"Monitor.png", type:"output", explanation:"A monitor receives visual information FROM the computer, so it is an output device." },
  { id:"speakers", name:"Speakers", file:"Speakers.png", type:"output", explanation:"Speakers play audio sent FROM the computer, so they are output devices." },
  { id:"printer", name:"Printer", file:"Printer.png", type:"output", explanation:"A printer receives information FROM the computer and produces a printed copy, so it is an output device." },
  { id:"headphones", name:"Headphones", file:"Headphones.png", type:"output", explanation:"Headphones play audio sent FROM the computer, so they are an output device." },
  { id:"3dprinter", name:"3D Printer", file:"3DPrinter.png", type:"output", explanation:"A 3D printer receives a digital model FROM the computer and creates a physical object, so it is an output device." },
  { id:"projector", name:"Projector", file:"Projector.png", type:"output", explanation:"A projector displays visual information sent FROM the computer, so it is an output device." },
  { id:"touchscreen", name:"Touchscreen", file:"TouchScreen.png", type:"both", explanation:"A touchscreen displays information and also receives touch commands, so it works as both input and output." },
  { id:"vr", name:"VR Headset", file:"VR Headset.png", type:"both", explanation:"A VR headset displays a virtual world and sends tracking information INTO the computer, so it works as both input and output." }
].map(device => ({...device, imagePath:`assets/images/input-output/${device.file}`}));
const ioById = Object.fromEntries(ioDevices.map(device => [device.id, device]));
const ioScenarios = [
  ["microphone","A student speaks into this device and the computer records the sound.",["headphones","webcam","speakers"]],
  ["webcam","A student joins a video call and this device sends their picture into the computer.",["monitor","scanner","microphone"]],
  ["projector","A teacher wants the computer's screen displayed large enough for the whole classroom to see.",["monitor","webcam","scanner"]],
  ["barcode","A cashier passes a product code in front of this device so the computer can identify the item.",["scanner","webcam","printer"]],
  ["3dprinter","A student finishes a digital 3D model and wants the computer to turn it into a physical object.",["printer","scanner","projector"]],
  ["vr","This device shows a virtual world but also tracks the direction the user moves their head.",["headphones","monitor","controller"]],
  ["touchscreen","The screen displays buttons to the user, and the user taps those same buttons to control the computer.",["monitor","mouse","keyboard"]],
  ["scanner","A student places a paper photograph into this device so the computer can create a digital copy.",["printer","webcam","barcode"]],
  ["controller","A player presses buttons and moves joysticks to tell a computer game what their character should do.",["mouse","keyboard","vr"]],
  ["printer","A student wants a paper copy of a report stored on the computer.",["scanner","3dprinter","projector"]],
  ["speakers","The computer is playing music and this device turns the digital audio into sound the class can hear.",["microphone","headphones","projector"]],
  ["headphones","A student wants to hear audio from the computer without everyone else hearing it.",["speakers","microphone","vr"]],
  ["keyboard","A student types a password and this device sends each key press to the computer.",["mouse","controller","barcode"]],
  ["mouse","A student moves the pointer and clicks an icon using this device.",["keyboard","controller","touchscreen"]],
  ["monitor","The computer sends text, pictures, and video to this device for the user to see.",["projector","webcam","touchscreen"]]
].map(([deviceId,text,distractors]) => ({deviceId,text,distractors}));
const ioSystems = [
  {title:"VIDEO CALL SETUP",prompt:"A student needs to see and talk to another person during a video call. Build the required input and output setup.",available:["webcam","microphone","monitor","speakers","printer","scanner"],input:["webcam","microphone"],output:["monitor","speakers"],flows:["Webcam → Computer → Monitor","Microphone → Computer → Speakers"]},
  {title:"GAMING STATION",prompt:"Build a basic gaming setup that lets the player control the game, see it, and hear it.",available:["controller","monitor","speakers","printer","barcode","scanner"],input:["controller"],output:["monitor","speakers"],flows:["Game Controller → Computer → Monitor","Computer → Speakers"]},
  {title:"CLASSROOM PRESENTATION",prompt:"A teacher wants to control a presentation from the computer, show it to the entire class, and play its sound.",available:["mouse","projector","speakers","webcam","3dprinter","barcode"],input:["mouse"],output:["projector","speakers"],flows:["Mouse → Computer → Projector","Computer → Speakers"]},
  {title:"DIGITAL DESIGN LAB",prompt:"A student wants to turn a paper sketch into a digital file, view the design on screen, and then create a physical 3D model.",available:["scanner","monitor","3dprinter","microphone","speakers","barcode"],input:["scanner"],output:["monitor","3dprinter"],flows:["Scanner → Computer → Monitor","Computer → 3D Printer"]},
  {title:"RETAIL CHECKOUT",prompt:"A store employee needs to scan a product into the computer and see the information on screen.",available:["barcode","monitor","projector","webcam","printer","controller"],input:["barcode"],output:["monitor"],flows:["Barcode Reader → Computer → Monitor"]},
  {title:"COMPUTER WORKSTATION",prompt:"A student wants to type a document, move the pointer, see the work, and listen to audio.",available:["keyboard","mouse","monitor","headphones","scanner","printer"],input:["keyboard","mouse"],output:["monitor","headphones"],flows:["Keyboard + Mouse → Computer → Monitor","Computer → Headphones"]}
];
const ioApp = document.querySelector("#io-course-app");
const ioState = {view:"menu",section:0,index:0,order:[],completed:0,sectionEarned:0,sectionPossible:0,attempts:0,step:"device",selected:null,placed:{input:[],output:[]},eligible:{},results:{}};
const ioTypeLabel = {input:"INPUT",output:"OUTPUT",both:"BOTH"};
const ioDirection = {input:"DEVICE → COMPUTER",output:"COMPUTER → DEVICE",both:"BOTH DIRECTIONS"};

function ioImage(device, compact=false) { return `<span class="io-device-art ${compact?'is-compact':''}"><img data-io-image data-src="${device.imagePath}" alt="${device.name}" draggable="false" hidden><span class="io-image-fallback">${device.name.toUpperCase()}</span></span>`; }
function hydrateIOImages() { ioApp.querySelectorAll("[data-io-image]").forEach(img => { const fallback=img.nextElementSibling; img.onload=()=>{img.hidden=false;fallback.hidden=true;}; img.onerror=()=>{img.hidden=true;fallback.hidden=false;}; img.src=img.dataset.src; }); }
function ioProgress() { const total=ioState.order.length||1; return `<div class="io-course-progress"><span>SECTION ${ioState.section} OF 4</span><div class="progress-track" role="progressbar" aria-label="Section progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${ioState.index}"><i style="width:${ioState.index/total*100}%"></i></div><span>SCORE ${ioState.sectionEarned} / ${ioState.sectionPossible}</span></div>`; }
function setIO(html) { ioApp.innerHTML=html; hydrateIOImages(); window.scrollTo({top:0,behavior:"smooth"}); }
function resetIOCourse() { Object.assign(ioState,{view:"menu",section:0,index:0,order:[],completed:0,sectionEarned:0,sectionPossible:0,attempts:0,step:"device",selected:null,placed:{input:[],output:[]},eligible:{}}); renderIOMenu(); }
function renderIOMenu() { const sections=[["01","Device Classification","Identify devices as Input, Output, or Both."],["02","Follow the Signal","Determine which direction information travels."],["03","Technician Challenge","Identify devices from real-world situations."],["04","Build the System","Assemble the correct input/output setup for a real-world task."]]; setIO(`<section class="io-intro tech-corners"><p class="section-kicker">COURSE 02 // SIGNAL TRAINING</p><h1 id="input-output-title">INPUT &amp; OUTPUT SYSTEMS</h1><p class="io-lead"><strong>Choose a training section. Practice any skill in any order.</strong></p><div class="io-reminder" aria-label="Information direction reminder"><span><b>INPUT</b>Device → Computer</span><span><b>OUTPUT</b>Computer → Device</span><span><b>BOTH</b>Device ↔ Computer</span></div><div class="io-stage-grid io-menu-grid">${sections.map((s,index)=>{const result=ioState.results[index+1];return `<article><b>${s[0]}</b><div><h2>${s[1]}</h2><p>${s[2]}</p>${courseStatusMarkup(result)}<button class="primary-button" type="button" data-io-section="${index+1}">START TRAINING</button></div></article>`;}).join("")}</div><div class="intro-actions"><button class="secondary-button" type="button" data-department-button>← BACK TO COMPUTER SYSTEMS</button></div></section>`); bindDynamicDepartmentButtons(); }
function startIOSection(number) { ioState.section=number; ioState.index=0; ioState.completed=0; ioState.sectionEarned=0; ioState.sectionPossible=0; ioState.attempts=0; ioState.step="device"; ioState.selected=null; ioState.placed={input:[],output:[]}; ioState.eligible={}; if(number===1) ioState.order=shuffle(ioDevices).slice(0,10); if(number===2) ioState.order=shuffle(ioDevices).slice(0,8); if(number===3) ioState.order=shuffle(ioScenarios).slice(0,8); if(number===4) ioState.order=shuffle(ioSystems).slice(0,4); renderIOQuestion(); }
function ioQuestionHeader(title,total,label="QUESTION") { return `${ioProgress()}<header class="io-question-header"><div><p class="section-kicker">SECTION ${String(ioState.section).padStart(2,"0")}</p><h1>${title}</h1></div><span>${label} ${ioState.index+1} / ${total}</span></header>`; }
function renderIOQuestion() { if(ioState.section===1) renderIOClassification(); else if(ioState.section===2) renderIOSignal(); else if(ioState.section===3) renderIOTechnician(); else renderIOSystem(); }
function renderIOClassification() { const d=ioState.order[ioState.index]; ioState.attempts=0; setIO(`${ioQuestionHeader("DEVICE CLASSIFICATION",10)}<div class="io-training-card"><div class="io-focus-device">${ioImage(d)}<h2>${d.name}</h2></div><div class="io-answer-panel"><p class="answer-prompt">HOW DOES INFORMATION MOVE?</p><div class="io-three-choices">${["input","output","both"].map(t=>`<button type="button" data-io-class="${t}">${ioTypeLabel[t]}<small>${t==='input'?'Device → Computer':t==='output'?'Computer → Device':'Device ↔ Computer'}</small></button>`).join("")}</div><div class="feedback-panel io-feedback" aria-live="assertive" hidden></div><button class="primary-button io-next" type="button" data-io-action="next" hidden>NEXT DEVICE →</button></div></div>`); }
function renderIOSignal() { const d=ioState.order[ioState.index]; ioState.attempts=0; setIO(`${ioQuestionHeader("FOLLOW THE SIGNAL",8)}<div class="io-signal-card"><div class="io-signal-stage"><div>${ioImage(d,true)}<b>${d.name}</b></div><div class="io-signal-line" aria-hidden="true"><i></i><span>?</span></div><div class="io-computer"><span aria-hidden="true">▣</span><b>COMPUTER</b></div></div><p class="answer-prompt">WHICH DIRECTION DOES THE INFORMATION TRAVEL?</p><div class="io-three-choices">${["input","output","both"].map(t=>`<button type="button" data-io-signal="${t}">${ioDirection[t]}</button>`).join("")}</div><div class="feedback-panel io-feedback" aria-live="assertive" hidden></div><button class="primary-button io-next" type="button" data-io-action="next" hidden>NEXT SIGNAL →</button></div>`); }
function renderIOTechnician() { const q=ioState.order[ioState.index], correct=ioById[q.deviceId]; ioState.attempts=0; ioState.step="device"; const choices=shuffle([q.deviceId,...q.distractors]); setIO(`${ioQuestionHeader("TECHNICIAN CHALLENGE",8)}<div class="io-tech-card"><p class="io-scenario">${q.text}</p><p class="answer-prompt">STEP A // CHOOSE THE DEVICE</p><div class="io-device-choices">${choices.map(id=>`<button type="button" data-io-device-choice="${id}">${ioImage(ioById[id],true)}<b>${ioById[id].name}</b></button>`).join("")}</div><div class="io-classify-step" hidden><p class="answer-prompt">STEP B // CLASSIFY <strong>${correct.name.toUpperCase()}</strong></p><div class="io-three-choices">${["input","output","both"].map(t=>`<button type="button" data-io-tech-class="${t}">${ioTypeLabel[t]}</button>`).join("")}</div></div><div class="feedback-panel io-feedback" aria-live="assertive" hidden></div><button class="primary-button io-next" type="button" data-io-action="next" hidden>NEXT CHALLENGE →</button></div>`); }
function renderIOSystem() { const s=ioState.order[ioState.index]; ioState.selected=null; ioState.placed={input:[],output:[]}; ioState.eligible=Object.fromEntries([...s.input,...s.output].map(id=>[id,true])); setIO(`${ioQuestionHeader("BUILD THE SYSTEM",4,"SYSTEM")}<div class="io-system-card"><header><h2>${s.title}</h2><p>${s.prompt}</p></header><p class="io-build-hint">Drag a card to a matching area, or select it and then choose an area.</p><div class="io-device-tray" aria-label="Available devices">${shuffle(s.available).map(id=>`<button type="button" draggable="true" data-io-build-device="${id}" aria-pressed="false">${ioImage(ioById[id],true)}<b>${ioById[id].name}</b></button>`).join("")}</div><div class="io-drop-grid"><button type="button" class="io-drop-zone" data-io-zone="input"><b>INPUT DEVICES</b><span>Device → Computer</span><div data-io-placed="input"></div></button><button type="button" class="io-drop-zone" data-io-zone="output"><b>OUTPUT DEVICES</b><span>Computer → Device</span><div data-io-placed="output"></div></button></div><div class="feedback-panel io-feedback" aria-live="assertive" hidden></div><div class="io-system-online" hidden></div><button class="primary-button io-next" type="button" data-io-action="next" hidden>NEXT SYSTEM →</button></div>`); }
function showIOFeedback(correct,title,text) { const el=ioApp.querySelector(".io-feedback"); el.hidden=false; el.className=`feedback-panel io-feedback ${correct?'is-correct':'is-wrong'}`; el.innerHTML=`<span class="feedback-icon" aria-hidden="true">${correct?'✓':'!'}</span><div><strong>${title}</strong><p>${text}</p></div>`; }
function awardIOPoint(firstTry) { ioState.sectionPossible++; if(firstTry)ioState.sectionEarned++; }
function finishIOSingle() { ioState.completed++; ioApp.querySelector(".io-next").hidden=false; ioApp.querySelectorAll(".io-three-choices button").forEach(b=>b.disabled=true); }
function handleIOClass(type) { const d=ioState.order[ioState.index]; ioState.attempts++; if(type!==d.type){showIOFeedback(false,"Not quite.","Think about the direction the information travels. Does this device send information to the computer, receive information from it, or do both?");return;} awardIOPoint(ioState.attempts===1); finishIOSingle(); showIOFeedback(true,"Correct!",d.explanation); }
function handleIOSignal(type) { const d=ioState.order[ioState.index]; ioState.attempts++; if(type!==d.type){showIOFeedback(false,"Not quite.","Trace the signal: does it travel toward the computer, away from it, or both ways?");return;} awardIOPoint(ioState.attempts===1); finishIOSingle(); const line=ioApp.querySelector(".io-signal-line"); line.classList.add(`is-${d.type}`); line.querySelector("span").textContent=d.type==='input'?'→→→':d.type==='output'?'←←←':'↔'; showIOFeedback(true,"Signal confirmed!",d.explanation.replace(/, so.+$/,".")); }
function handleIODeviceChoice(id,button) { if(ioState.step!=="device")return; const q=ioState.order[ioState.index]; ioState.attempts++; if(id!==q.deviceId){button.classList.add("is-wrong");showIOFeedback(false,"Device mismatch.","Read the situation again and focus on what information must move.");return;} awardIOPoint(ioState.attempts===1); ioState.step="class"; ioState.attempts=0; ioApp.querySelectorAll("[data-io-device-choice]").forEach(b=>b.disabled=true); button.classList.add("is-correct"); ioApp.querySelector(".io-classify-step").hidden=false; showIOFeedback(true,"Device identified.",`Now classify the ${ioById[id].name}.`); }
function handleIOTechClass(type) { if(ioState.step!=="class")return; const d=ioById[ioState.order[ioState.index].deviceId]; ioState.attempts++; if(type!==d.type){showIOFeedback(false,"Not quite.","Use the arrows: does information enter the computer, leave it, or travel both ways?");return;} awardIOPoint(ioState.attempts===1); ioState.step="done"; ioState.completed++; ioApp.querySelectorAll("[data-io-tech-class]").forEach(b=>b.disabled=true); ioApp.querySelector(".io-next").hidden=false; showIOFeedback(true,"Challenge complete!",d.explanation); }
function attemptIOPlacement(id,zone) { const s=ioState.order[ioState.index]; if(!id||ioState.placed.input.includes(id)||ioState.placed.output.includes(id))return; const expected=s.input.includes(id)?"input":s.output.includes(id)?"output":null; if(expected!==zone){if(ioState.eligible[id]!==undefined)ioState.eligible[id]=false;showIOFeedback(false,"Connection rejected.",expected?`${ioById[id].name} belongs in ${ioTypeLabel[expected]} DEVICES.`:`${ioById[id].name} is not needed for this system.`);return;} ioState.placed[zone].push(id); awardIOPoint(ioState.eligible[id]); const card=ioApp.querySelector(`[data-io-build-device="${id}"]`); card.disabled=true; card.classList.add("is-placed"); const holder=ioApp.querySelector(`[data-io-placed="${zone}"]`); holder.insertAdjacentHTML("beforeend",`<span>${ioById[id].name} ✓</span>`); ioState.selected=null; ioApp.querySelectorAll("[data-io-build-device]").forEach(b=>b.setAttribute("aria-pressed","false")); showIOFeedback(true,"Device connected.",`${ioById[id].name} is correctly placed as ${ioTypeLabel[zone]}.`); if(ioState.placed.input.length===s.input.length&&ioState.placed.output.length===s.output.length){ioState.completed++; const online=ioApp.querySelector(".io-system-online");online.hidden=false;online.innerHTML=`<strong>SYSTEM ONLINE</strong>${s.flows.map(f=>`<span>${f}</span>`).join("")}`;ioApp.querySelector(".io-next").hidden=false;} }
function advanceIO() { ioState.index++; if(ioState.index>=ioState.order.length){renderIOSectionComplete();return;} renderIOQuestion(); }
function renderIOSectionComplete() { const names=["","Device Classification","Follow the Signal","Technician Challenge","Build the System"]; updateBestResult(ioState.results,ioState.section,ioState.sectionEarned,ioState.sectionPossible); setIO(`<section class="io-complete tech-corners"><div class="completion-mark" aria-hidden="true">✓</div><p class="section-kicker">SECTION COMPLETE</p><h1>${names[ioState.section]}</h1><p>First-Attempt Accuracy</p><div class="result-score"><strong>${ioState.sectionEarned} / ${ioState.sectionPossible}</strong><span>${Math.round(ioState.sectionEarned/ioState.sectionPossible*100)}%</span></div><p class="series-complete">SECTION ${ioState.section} OF 4 COMPLETE</p><div class="results-actions"><button class="primary-button" type="button" data-io-action="retry-section">RETRY SECTION ↻</button><button class="secondary-button" type="button" data-io-action="menu">RETURN TO INPUT &amp; OUTPUT MENU</button><button class="secondary-button" type="button" data-department-button>RETURN TO COMPUTER SYSTEMS</button></div></section>`); bindDynamicDepartmentButtons(); }
function bindDynamicDepartmentButtons(){ioApp.querySelectorAll("[data-department-button]").forEach(b=>b.addEventListener("click",()=>showDepartment()));}
ioApp.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;const action=button.dataset.ioAction;if(button.dataset.ioSection)startIOSection(Number(button.dataset.ioSection));else if(action==="next")advanceIO();else if(action==="retry-section")startIOSection(ioState.section);else if(action==="menu")renderIOMenu();else if(button.dataset.ioClass)handleIOClass(button.dataset.ioClass);else if(button.dataset.ioSignal)handleIOSignal(button.dataset.ioSignal);else if(button.dataset.ioDeviceChoice)handleIODeviceChoice(button.dataset.ioDeviceChoice,button);else if(button.dataset.ioTechClass)handleIOTechClass(button.dataset.ioTechClass);else if(button.dataset.ioBuildDevice){ioState.selected=button.dataset.ioBuildDevice;ioApp.querySelectorAll("[data-io-build-device]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));}else if(button.dataset.ioZone)attemptIOPlacement(ioState.selected,button.dataset.ioZone);});
ioApp.addEventListener("dragstart",event=>{const card=event.target.closest("[data-io-build-device]");if(card&&!card.disabled){ioState.selected=card.dataset.ioBuildDevice;event.dataTransfer.setData("text/plain",ioState.selected);}});
ioApp.addEventListener("dragover",event=>{if(event.target.closest("[data-io-zone]"))event.preventDefault();});
ioApp.addEventListener("drop",event=>{const zone=event.target.closest("[data-io-zone]");if(zone){event.preventDefault();attemptIOPlacement(event.dataTransfer.getData("text/plain")||ioState.selected,zone.dataset.ioZone);}});

/* ---------- Course 03: Hardware vs. Software ---------- */
const hsSections = [
  ["01","Hardware or Software?","Classify common computer items as hardware or software."],
  ["02","Troubleshooting Detective","Decide whether a computer problem is most likely hardware or software."],
  ["03","Software Specialist","Identify applications, drivers, firmware, and cloud-based software."],
  ["04","Repair Ticket Challenge","Analyze technician tickets and determine what kind of problem or software is involved."]
];
const hsClassifications = [
  ["Keyboard","Hardware","A keyboard is a physical input device, so it is hardware.","assets/images/input-output/Keyboard.png"],
  ["Monitor","Hardware","A monitor is a physical output device, so it is hardware.","assets/images/input-output/Monitor.png"],
  ["RAM","Hardware","RAM is a physical component inside the computer, so it is hardware.","assets/images/components/component-02.png"],
  ["Hard Drive","Hardware","A hard drive is a physical storage component, so it is hardware.","assets/images/components/component-03.png"],
  ["Mouse","Hardware","A mouse is a physical input device, so it is hardware.","assets/images/input-output/Mouse.png"],
  ["CPU","Hardware","The CPU is a physical processor inside the computer, so it is hardware.","assets/images/components/component-01.png"],
  ["Trackpad","Hardware","A trackpad is a physical input surface, so it is hardware.","assets/images/hardware-software/trackpad.png"],
  ["Webcam","Hardware","A webcam is a physical camera device, so it is hardware.","assets/images/input-output/Webcam.png"],
  ["Motherboard","Hardware","A motherboard is a physical circuit board that connects computer components.","assets/images/components/component-04.png"],
  ["GPU","Hardware","A GPU is a physical component that processes graphics.","assets/images/components/component-06.png"],
  ["Power Supply","Hardware","A power supply is a physical component that provides electrical power.","assets/images/components/component-05.png"],
  ["Cooling System","Hardware","Fans and cooling parts are physical components, so they are hardware.","assets/images/components/component-08.png"],
  ["SSD","Hardware","An SSD is a physical storage device, so it is hardware.","assets/images/components/component-03.png"],
  ["Google Docs","Software","Google Docs is a program used to create and edit documents.","assets/images/hardware-software/google-docs.png"], ["Google Chrome","Software","Google Chrome is a web browser program.","assets/images/hardware-software/google-chrome.png"],
  ["macOS","Software","macOS is an operating system made of programs and instructions.","assets/images/hardware-software/macos.png"], ["Video Game","Software","A video game is a program that runs on hardware.","assets/images/hardware-software/video-game.png"],
  ["Photos App","Software","The Photos app is a program used to view and organize pictures.","assets/images/hardware-software/photos-app.png"], ["Spotify","Software","Spotify is a program used to play and organize audio.","assets/images/hardware-software/spotify.png"],
  ["Scratch","Software","Scratch is software used to create programs.","assets/images/hardware-software/scratch.png"], ["Calculator App","Software","A calculator app is a program that performs calculations.","assets/images/hardware-software/calculator-app.png"],
  ["Microsoft Word","Software","Microsoft Word is an application used to create documents.","assets/images/hardware-software/microsoft-word.png"], ["PowerPoint","Software","PowerPoint is an application used to make presentations.","assets/images/hardware-software/powerpoint.png"],
  ["Safari","Software","Safari is a web browser program.","assets/images/hardware-software/safari.png"], ["Operating System","Software","An operating system is software that manages the computer.","assets/images/hardware-software/operating-system.png"], ["Music App","Software","A music app is a program used to play and organize music.","assets/images/hardware-software/music-app.png"],
  ["Software Application","Software","An application is a program designed to help a user perform a specific task, so it is software.","assets/images/hardware-software/software-application.png","Is this a physical computer part you can touch, or a program/instruction that runs on hardware?"],
  ["Cloud-Based Software","Software","Cloud-based software is accessed through the internet and runs as software rather than being a physical computer component.","assets/images/hardware-software/cloud-software.png","Think about whether this is a physical device or software accessed and used through a computer."]
].map(([name,answer,explanation,imagePath=null,hint])=>({name,answer,explanation,imagePath,hint}));
const hsConceptAssets = {
  application: "assets/images/hardware-software/software-application.png",
  cloudSoftware: "assets/images/hardware-software/cloud-software.png"
};
const hsTroubleshooting = [
  ["Laptop Will Not Power On","The laptop will not turn on at all, even when it is plugged in.","Hardware","The problem is most likely related to a physical component such as the battery, charging port, power system, or power button."],
  ["App Keeps Crashing","One app keeps crashing, but everything else on the computer works normally.","Software","Because the problem is limited to one program, the most likely cause is software."],
  ["Cracked Screen","The laptop screen is cracked.","Hardware","The screen is a physical component, so physical damage to it is a hardware problem."],
  ["App Needs Update","A message says an app must be updated before it can open.","Software","Updating an app changes its software, not the physical computer."],
  ["Sticking Keyboard Keys","Several keyboard keys stick and do not respond correctly.","Hardware","The physical keyboard is malfunctioning, so this is most likely a hardware problem."],
  ["Browser Freezing","The web browser is running very slowly and keeps freezing, while the rest of the computer works normally.","Software","A browser that freezes while the rest of the system works normally is usually a software problem."],
  ["Battery Will Not Hold Charge","The laptop battery no longer holds a charge.","Hardware","The battery is a physical component, so this is a hardware problem."],
  ["Operating System Corruption","The operating system must be reinstalled because important system files became corrupted.","Software","The operating system and its files are software."],
  ["Broken USB Port","A USB port is bent and no longer holds a connector securely.","Hardware","The bent port is a damaged physical component, so this is a hardware problem."],
  ["Program Will Not Install","A program displays an installation error even though the computer is working normally.","Software","The error is limited to installing a program, so software is the most likely cause."],
  ["Fan Grinding Noise","The computer's cooling fan makes a grinding noise whenever it spins.","Hardware","A grinding fan indicates a problem with a moving physical component."],
  ["Settings Reset","An app keeps returning to the wrong settings every time it opens.","Software","Settings are controlled by the app, so this is most likely a software problem."],
  ["Loose Charger Connector","The laptop only charges when the cable is held at a certain angle.","Hardware","The physical charging cable or port is most likely damaged or loose."],
  ["Missing Desktop Icons","After an operating system update, several desktop icons and settings are missing, but the computer powers on normally.","Software","The issue began with system files and settings after an update, so software is the most likely cause."],
  ["Damaged Mouse Cable","The mouse cable is cut and the mouse no longer responds.","Hardware","The cut cable is physical damage to the mouse hardware."]
].map(([name,prompt,answer,explanation])=>({name,prompt,answer,explanation}));
const hsSoftware = [
  ["Software built directly into a hardware device that controls its most basic functions.","Firmware"],
  ["Software that allows the operating system to communicate with a specific piece of hardware.","Driver"],
  ["Software designed to help a user perform a specific task.","Application"],
  ["Software accessed through the internet instead of being installed and used only from the local computer.","Cloud-based software"],
  ["A new printer needs a small piece of software before the operating system can communicate with it.","Driver"],
  ["A webcam is connected, but the operating system needs special software to recognize and use it correctly.","Driver"],
  ["A device uses built-in instructions immediately when it powers on, before the main operating system has fully loaded.","Firmware"],
  ["A student opens Google Docs in a browser and works online without installing Google Docs as a traditional desktop program.","Cloud-based software"],
  ["A student uses Gmail through a web browser.","Cloud-based software"],
  ["A student opens Scratch to create a program. Scratch is software designed for a specific user task.","Application"],
  ["A calculator program is designed to help the user perform calculations.","Application"],
  ["A web browser helps users visit websites and use web-based tools.","Application"],
  ["A graphics card receives a built-in update that changes how the card starts and controls its basic operations.","Firmware"],
  ["The operating system installs special software so it can send sound to a newly connected audio device.","Driver"],
  ["A student signs into an online presentation tool from a school computer and later continues from home in a browser.","Cloud-based software"]
].map(([prompt,answer])=>({prompt,answer,explanation:{Firmware:"Firmware provides low-level built-in instructions that help hardware perform its basic functions.",Driver:"A driver acts as a translator between the operating system and a specific hardware device.",Application:"An application helps a user perform a specific task.","Cloud-based software":"Cloud-based software is accessed through the internet and can be used from different connected devices."}[answer]}));
const hsTickets = [
  ["The printer powers on normally, but the computer does not recognize it after it is connected.","What software may need to be installed or updated?","Driver",["Firmware","Application","Cloud-based software"],"The printer powers on, but the operating system cannot communicate with it. Checking the printer driver is the best first step."],
  ["The computer still turns on, but the display panel is physically cracked.","What type of problem is this?","Hardware",["Software","Driver","Cloud-based software"],"The cracked display is physical damage, so this is a hardware problem."],
  ["The computer starts, but important operating system files are corrupted and the OS needs to be reinstalled.","What type of problem is this?","Software",["Hardware","Firmware","Driver"],"The operating system and its corrupted files are software."],
  ["The student needs to write a document on several different computers and wants to access the same program and files through a browser.","Which type of software best fits this situation?","Cloud-based software",["Firmware","Driver","Hardware"],"A browser-based tool such as Google Docs is cloud-based software and can be accessed from different connected computers."],
  ["The user wants a program designed specifically to perform calculations.","Which software category best fits?","Application",["Driver","Firmware","Hardware"],"A calculator is an application because it helps the user perform a specific task."],
  ["A device needs built-in low-level instructions to perform basic functions immediately when it powers on.","Which software category is involved?","Firmware",["Application","Cloud-based software","Driver"],"Firmware supplies built-in instructions for a device's most basic functions."],
  ["The laptop battery drains extremely quickly and will no longer hold a normal charge.","What type of problem is this?","Hardware",["Application","Cloud-based software","Driver"],"The battery is a physical component, so its failure is a hardware problem."],
  ["One program repeatedly crashes, but the rest of the computer works normally.","What type of problem is most likely?","Software",["Hardware","Firmware","Driver"],"Because only one program crashes, software is the most likely cause."],
  ["A webcam is physically connected and powers on, but the operating system cannot use it correctly.","Which software should the technician check first?","Driver",["Application","Cloud-based software","Firmware"],"The driver lets the operating system communicate with the webcam."],
  ["The user accesses email through a browser from different computers without installing a dedicated desktop email program.","Which software category best fits?","Cloud-based software",["Driver","Firmware","Hardware"],"Browser-based email is cloud-based software accessed through the internet."],
  ["The charging connector is loose and only works when held in a certain physical position.","What type of problem is this?","Hardware",["Software","Application","Firmware"],"The loose charging port or connector is a physical hardware problem."],
  ["The user opens a program specifically to listen to and organize music.","Which software category best fits?","Application",["Driver","Firmware","Hardware"],"A music program is an application designed for a specific user task."]
].map(([report,question,answer,distractors,explanation])=>({report,question,answer,distractors,explanation}));
const hsChoices=["Hardware","Software","Firmware","Driver","Application","Cloud-based software"];
const hsApp=document.querySelector("#hardware-software-app");
const hsState={section:0,index:0,order:[],earned:0,possible:0,attempts:0,answered:false,results:{}};
function setHS(html){hsApp.innerHTML=html;hydrateHSImages();window.scrollTo({top:0,behavior:"smooth"});}
function hydrateHSImages(){hsApp.querySelectorAll("[data-hs-image]").forEach(img=>{const fallback=img.parentElement.querySelector(".hs-art-fallback");img.onload=()=>{img.hidden=false;fallback.hidden=true;};img.onerror=()=>{img.hidden=true;fallback.hidden=false;};img.src=img.dataset.src;});}
function hsArt(item){return `<div class="hs-art"><div class="hs-art-viewport">${item.imagePath?`<img data-hs-image data-src="${item.imagePath}" alt="" draggable="false" hidden>`:""}<span class="hs-art-fallback">${item.name.toUpperCase()}</span></div><div class="hs-art-label">${item.name}</div></div>`;}
function resetHSCourse(){Object.assign(hsState,{section:0,index:0,order:[],earned:0,possible:0,attempts:0,answered:false});renderHSMenu();}
function renderHSMenu(){setHS(`<section class="hs-intro tech-corners"><p class="section-kicker">COURSE 03 // DIAGNOSTIC TRAINING</p><h1 id="hardware-software-course-title">HARDWARE VS. <span>SOFTWARE</span></h1><p class="hs-lead">Learn to identify hardware and software, diagnose computer problems, and understand the different types of software that keep computer systems working.</p><div class="hs-reminder"><span><b>HARDWARE</b>Physical parts of a computer you can touch.</span><span><b>SOFTWARE</b>Programs and instructions that run on hardware.</span></div><div class="hs-menu-grid">${hsSections.map((s,i)=>`<article><b>${s[0]}</b><div><h2>${s[1]}</h2><p>${s[2]}</p>${courseStatusMarkup(hsState.results[i+1])}<button class="primary-button" type="button" data-hs-section="${i+1}">START TRAINING</button></div></article>`).join("")}</div><div class="intro-actions"><button class="secondary-button" type="button" data-hs-action="department">← BACK TO COMPUTER SYSTEMS</button></div></section>`);}
function startHSSection(section){hsState.section=section;hsState.index=0;hsState.earned=0;hsState.possible=0;hsState.attempts=0;hsState.answered=false;const pools=[null,hsClassifications,hsTroubleshooting,hsSoftware,hsTickets],counts=[0,12,8,10,8];hsState.order=shuffle(pools[section]).slice(0,counts[section]);renderHSQuestion();}
function hsHeader(){const total=hsState.order.length;return `<div class="hs-progress"><span>SECTION ${hsState.section} OF 4</span><div class="progress-track" role="progressbar" aria-label="Section progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hsState.index}"><i style="width:${hsState.index/total*100}%"></i></div><span>SCORE ${hsState.earned} / ${hsState.possible}</span></div>`;}
function renderHSQuestion(){hsState.attempts=0;hsState.answered=false;const q=hsState.order[hsState.index],ticket=hsState.section===4;let title,prompt,choices,content;if(hsState.section===1){title="HARDWARE OR SOFTWARE?";prompt="IS THIS HARDWARE OR SOFTWARE?";choices=["Hardware","Software"];content=hsArt(q);}else if(hsState.section===2){title="TROUBLESHOOTING DETECTIVE";prompt="WHAT TYPE OF PROBLEM IS MOST LIKELY?";choices=["Hardware","Software"];content=`<div class="hs-scenario"><small>DIAGNOSTIC CASE</small><h2>${q.name}</h2><p>${q.prompt}</p></div>`;}else if(hsState.section===3){title="SOFTWARE SPECIALIST";prompt="WHICH TYPE OF SOFTWARE IS DESCRIBED?";choices=hsChoices.slice(2);content=`<div class="hs-scenario"><small>SOFTWARE PROFILE</small><p>${q.prompt}</p></div>`;}else{title="REPAIR TICKET CHALLENGE";prompt=q.question;choices=shuffle([q.answer,...q.distractors]);const number=1042+hsState.index*7;content=`<article class="hs-ticket"><header><small>INCOMING SERVICE REQUEST</small><b>STATUS: OPEN</b></header><h2>REPAIR TICKET #${number}</h2><p><strong>CUSTOMER REPORT:</strong><br>“${q.report}”</p></article>`;}setHS(`${hsHeader()}<header class="hs-question-header"><div><p class="section-kicker">SECTION ${String(hsState.section).padStart(2,"0")}</p><h1>${title}</h1></div><span>${ticket?"TICKET":"QUESTION"} ${hsState.index+1} / ${hsState.order.length}</span></header><div class="hs-training-card">${content}<section class="hs-answer-panel"><p class="answer-prompt">${prompt}</p><div class="hs-answer-grid">${choices.map(c=>`<button type="button" data-hs-answer="${c}">${c.toUpperCase()}</button>`).join("")}</div><div class="feedback-panel hs-feedback" aria-live="assertive" hidden></div><button class="primary-button hs-next" type="button" data-hs-action="next" hidden>${hsState.index===hsState.order.length-1?"VIEW RESULTS":"NEXT"} →</button></section></div>`);}
function handleHSAnswer(button){if(hsState.answered)return;const q=hsState.order[hsState.index],answer=q.answer;hsState.attempts++;const feedback=hsApp.querySelector(".hs-feedback");feedback.hidden=false;if(button.dataset.hsAnswer!==answer){button.classList.add("is-wrong");feedback.className="feedback-panel hs-feedback is-wrong";feedback.innerHTML=`<strong>NOT QUITE — TRY AGAIN</strong><p>${hsState.section===1?(q.hint||"Ask yourself: Is this a physical object you can touch, or a program or instruction that runs on a computer?"):hsState.section===4?"Review what is working, then identify the physical part or software role involved.":"Use the details in the scenario to identify the most likely category."}</p>`;return;}hsState.answered=true;hsState.possible++;if(hsState.attempts===1)hsState.earned++;button.classList.add("is-correct");hsApp.querySelectorAll("[data-hs-answer]").forEach(b=>b.disabled=true);feedback.className="feedback-panel hs-feedback is-correct";feedback.innerHTML=`<strong>${hsState.section===4?"TICKET RESOLVED.":"CORRECT!"}</strong><p>${q.explanation}</p>`;const next=hsApp.querySelector(".hs-next");next.hidden=false;next.focus();}
function advanceHS(){hsState.index++;if(hsState.index>=hsState.order.length)renderHSResults();else renderHSQuestion();}
function renderHSResults(){updateBestResult(hsState.results,hsState.section,hsState.earned,hsState.possible);const percent=Math.round(hsState.earned/hsState.possible*100);const performance=percent>=90?["Diagnostic Expert","Excellent work. You can clearly distinguish hardware, software, and the software tools technicians use."]:percent>=75?["Systems Technician","Strong work. Review the categories that gave you trouble and try the section again."]:["Technician in Training","Keep practicing. Focus on whether the problem involves a physical component, a program, or software that helps hardware communicate."];setHS(`<section class="hs-complete tech-corners"><div class="completion-mark" aria-hidden="true">✓</div><p class="section-kicker">SECTION COMPLETE</p><h1>${hsSections[hsState.section-1][1]}</h1><p class="result-label">First-Attempt Score</p><div class="result-score"><strong>${hsState.earned} / ${hsState.possible}</strong><span>${percent}%</span></div><h2>${performance[0]}</h2><p class="performance-message">${performance[1]}</p><div class="results-actions"><button class="primary-button" type="button" data-hs-action="retry">RETRY SECTION ↻</button><button class="secondary-button" type="button" data-hs-action="menu">RETURN TO HARDWARE &amp; SOFTWARE MENU</button><button class="secondary-button" type="button" data-hs-action="department">RETURN TO COMPUTER SYSTEMS</button></div></section>`);}
hsApp.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;if(button.dataset.hsSection)startHSSection(Number(button.dataset.hsSection));else if(button.dataset.hsAnswer)handleHSAnswer(button);else if(button.dataset.hsAction==="next")advanceHS();else if(button.dataset.hsAction==="retry")startHSSection(hsState.section);else if(button.dataset.hsAction==="menu")renderHSMenu();else if(button.dataset.hsAction==="department")showDepartment();});

functionElements.begin.addEventListener("click", startFunctionTraining);
functionElements.retry.addEventListener("click", startFunctionTraining);
functionElements.next.addEventListener("click", advanceFunctionQuestion);
functionElements.image.addEventListener("contextmenu", (event) => event.preventDefault());
buildElements.begin.addEventListener("click", startBuildTraining);
buildElements.retry.addEventListener("click", startBuildTraining);
buildElements.next.addEventListener("click", advanceBuildChallenge);
repairElements.begin.addEventListener("click", startRepairShop);
repairElements.retry.addEventListener("click", startRepairShop);
repairElements.next.addEventListener("click", advanceRepairTicket);
repairElements.answerGrid.addEventListener("click", (event) => { const button = event.target.closest("[data-repair-answer-id]"); if (button) handleRepairAnswer(button); });
repairElements.answerGrid.addEventListener("contextmenu", (event) => { if (event.target.closest("img")) event.preventDefault(); });
buildElements.source.addEventListener("click", () => {
  if (buildState.suppressClick) { buildState.suppressClick = false; return; }
  if (buildState.pointerId === null) setBuildSelection(!buildState.selected);
});
buildElements.source.addEventListener("contextmenu", (event) => event.preventDefault());
buildElements.source.addEventListener("pointerdown", (event) => {
  if (buildState.answered || event.button !== 0) return;
  event.preventDefault();
  buildState.pointerId = event.pointerId;
  buildState.dragStartX = event.clientX; buildState.dragStartY = event.clientY; buildState.didDrag = false;
  buildElements.source.setPointerCapture(event.pointerId);
});
buildElements.source.addEventListener("pointermove", (event) => {
  if (buildState.pointerId !== event.pointerId) return;
  if (!buildState.didDrag && Math.hypot(event.clientX - buildState.dragStartX, event.clientY - buildState.dragStartY) > 6) {
    buildState.didDrag = true;
    const ghost = buildElements.image.cloneNode();
    ghost.hidden = false; ghost.removeAttribute("id"); ghost.className = "build-drag-ghost";
    document.body.append(ghost); buildState.dragGhost = ghost; buildElements.tower.classList.add("is-dragging");
  }
  if (!buildState.dragGhost) return;
  buildState.dragGhost.style.left = `${event.clientX}px`; buildState.dragGhost.style.top = `${event.clientY}px`;
  const hoveredTarget = getBuildTargetAtPoint(event.clientX, event.clientY);
  buildElements.targets.forEach((target) => target.classList.toggle("is-drag-over", target === hoveredTarget));
});
buildElements.source.addEventListener("pointerup", finishBuildDrag);
buildElements.source.addEventListener("pointercancel", finishBuildDrag);
buildElements.tower.addEventListener("click", (event) => { const target = getBuildTargetAtPoint(event.clientX, event.clientY); if (target && buildState.selected) attemptBuildPlacement(target); });
document.querySelectorAll("[data-home-button]").forEach((button) => button.addEventListener("click", () => {
  const inComputerParts = button.closest('[data-screen="parts"], [data-screen="identify"], [data-screen="function"], [data-screen="build"], [data-screen="repair"]');
  if (inComputerParts) showDepartment();
  else showHome();
}));
document.querySelectorAll("[data-department-button]").forEach((button) => button.addEventListener("click", () => showDepartment()));
document.querySelectorAll("[data-parts-button]").forEach((button) => button.addEventListener("click", () => showComputerParts()));
document.querySelectorAll("[data-input-output-button]").forEach((button) => button.addEventListener("click", () => showInputOutput()));
document.querySelectorAll("[data-hardware-software-button]").forEach((button) => button.addEventListener("click", () => showHardwareSoftware()));

window.addEventListener("popstate", () => {
  const route = window.location.hash.slice(1);
  if (route === "computer-systems") { showDepartment(false); return; }
  if (route === "computer-parts") { showComputerParts(false); return; }
  if (route === "input-output") { showInputOutput(false); return; }
  if (route === "hardware-software") { showHardwareSoftware(false); return; }
  const moduleId = route;
  if (academyModules.some((module) => module.id === moduleId)) openModule(moduleId, false);
  else showHome(false);
});

renderModuleCards();
const initialModuleId = window.location.hash.slice(1);
if (initialModuleId === "computer-systems") showDepartment(false);
else if (initialModuleId === "computer-parts") showComputerParts(false);
else if (initialModuleId === "input-output") showInputOutput(false);
else if (initialModuleId === "hardware-software") showHardwareSoftware(false);
else if (academyModules.some((module) => module.id === initialModuleId)) openModule(initialModuleId, false);

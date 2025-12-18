/* ===================== CONFIG ===================== */
const STORAGE_KEY = "error_app_full_pro_v1";

/* ===================== STATE ===================== */
let state = {
  lang: "es",
  codes: {},
  inventory: []
};

/* ===================== MACHINES ===================== */
const MACHINES = [
  { id: "mega", name: "Mega Slicer" },
  { id: "repak", name: "Repak" },
  { id: "cashin", name: "Cashin" },
  { id: "supervac", name: "Super Vac" },
  { id: "alkar", name: "Alkar" },
  { id: "mixer5000", name: "Mixer 5000" },
  { id: "mixer2500", name: "Mixer 2500" }
];

/* ===================== HELPERS ===================== */
function machineName(id) {
  const m = MACHINES.find(m => m.id === id);
  return m ? m.name : id;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") state = parsed;
  } catch (e) {}
}

/* ===================== INIT ===================== */
function init() {
  load();
  renderHeader();
  renderLayout();
  renderHome();
  console.log("FULL PRO APP READY", state);
}
init();

/* ===================== HEADER ===================== */
function renderHeader() {
  const header = document.getElementById("appHeader");
  if (!header) return;

  header.innerHTML = `
    <div class="headerLeft">
      <a href="#" onclick="goHome(); return false;" class="logoLink">
        <img src="logo.png" class="logo" alt="Logo">
      </a>
      <span class="title">${state.lang === "es" ? "Aplicación de Errores" : "Error Application"}</span>
    </div>

    <div class="headerRight">
      <button class="langBtn" onclick="setLang('es')">ES</button>
      <button class="langBtn" onclick="setLang('en')">EN</button>
    </div>
  `;
}

function goHome() {
  renderLayout();
  renderHome();
}

/* ===================== LAYOUT (NAV + VIEW) ===================== */
function renderLayout() {
  const root = document.getElementById("appRoot");
  if (!root) return;

  root.innerHTML = `
    <nav class="nav">
      <button class="navBtn" onclick="go('codes')">${state.lang === "es" ? "Códigos" : "Codes"}</button>
      <button class="navBtn" onclick="go('inventory')">${state.lang === "es" ? "Inventario" : "Inventory"}</button>
      <button class="navBtn" onclick="go('admin')">Admin</button>
    </nav>

    <section id="view"></section>
  `;
}

/* ===================== ROUTER ===================== */
function go(view) {
  if (view === "codes") renderCodesHome();
  if (view === "inventory") renderInventoryHome();
  if (view === "admin") renderAdminHome();
}

/* ===================== HOME ===================== */
function renderHome() {
  const view = document.getElementById("view");
  if (!view) return;

  view.innerHTML = `
    <div class="welcome">
      <h1>${state.lang === "es" ? "Sistema de mantenimiento" : "Maintenance system"}</h1>
      <p>${state.lang === "es" ? "Selecciona una opción del menú" : "Select an option from the menu"}</p>
    </div>
  `;
}

/* ===================== CODES VIEW ===================== */
function renderCodesHome() {
  const view = document.getElementById("view");
  if (!view) return;

  view.innerHTML = `
    <div class="card">
      <h2>🔍 ${state.lang === "es" ? "Buscar código de error" : "Search error code"}</h2>

      <label>${state.lang === "es" ? "Máquina" : "Machine"}</label>
      <select id="codeMachine">
        ${MACHINES.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
      </select>

      <label>${state.lang === "es" ? "Código" : "Code"}</label>
      <input id="codeInput" placeholder="Ej: E101">

      <button class="primaryBtn" onclick="searchCode()">
        ${state.lang === "es" ? "Buscar" : "Search"}
      </button>
    </div>

    <div id="codeResult"></div>
  `;
}

function searchCode() {
  const machine = document.getElementById("codeMachine")?.value;
  const code = document.getElementById("codeInput")?.value?.toUpperCase();
  const result = document.getElementById("codeResult");
  if (!result || !machine || !code) return;

  if (!state.codes[machine] || !state.codes[machine][code]) {
    result.innerHTML = `<div class="card error">❌ ${state.lang === "es" ? "Código no encontrado" : "Code not found"}</div>`;
    return;
  }

  const data = state.codes[machine][code];
  result.innerHTML = `
    <div class="card success">
      <h3>${machineName(machine)} – ${code}</h3>

      <p><strong>${state.lang === "es" ? "Solución" : "Solution"}:</strong></p>
      <p>${data.solution?.[state.lang] ?? "-"}</p>

      <p><strong>${state.lang === "es" ? "Piezas típicas" : "Typical parts"}:</strong></p>
      <p>${(data.defaultParts && data.defaultParts.length) ? data.defaultParts.join(", ") : "-"}</p>

      <p class="muted">
        ${(data.comments?.length ?? 0)} ${state.lang === "es" ? "comentarios registrados" : "comments logged"}
      </p>
    </div>
  `;
}

/* ===================== DATA API ===================== */
function saveCode(machine, code, es, en, parts = []) {
  if (!state.codes[machine]) state.codes[machine] = {};
  state.codes[machine][code] = {
    solution: { es, en },
    defaultParts: parts,
    comments: []
  };
  save();
}

/* ===================== OTHER VIEWS ===================== */
function renderInventoryHome() {
  const view = document.getElementById("view");
  if (!view) return;
  view.innerHTML = `<h2>📦 ${state.lang === "es" ? "Inventario" : "Inventory"}</h2><p>${state.lang === "es" ? "Próximamente" : "Coming soon"}</p>`;
}

function renderAdminHome() {
  const view = document.getElementById("view");
  if (!view) return;
  view.innerHTML = `<h2>🛠️ Admin</h2><p>${state.lang === "es" ? "Próximamente" : "Coming soon"}</p>`;
}

/* ===================== LANG ===================== */
function setLang(lang) {
  state.lang = lang;
  save();
  renderHeader();
  renderLayout();
  renderHome();
}


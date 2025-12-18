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
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) state = JSON.parse(data);
}

/* ===================== INIT ===================== */

function init() {
  load();
  renderHome();
  console.log("FULL PRO APP READY", state);
}

init();

/* ===================== NAV ===================== */

function go(view) {
  if (view === "codes") renderCodesHome();
  if (view === "inventory") renderInventory();
  if (view === "admin") renderAdmin();
}

/* ===================== HOME ===================== */

function renderHome() {
  document.getElementById("view").innerHTML = `
    <h1>Sistema de mantenimiento</h1>
    <p>Selecciona una opción del menú</p>
  `;
}

/* ===================== CODES ===================== */

function renderCodesHome() {
  const view = document.getElementById("view");

  view.innerHTML = `
    <div class="card">
      <h2>🔍 ${state.lang === "es" ? "Buscar código de error" : "Search error code"}</h2>

      <label>${state.lang === "es" ? "Máquina" : "Machine"}</label>
      <select id="codeMachine">
        ${MACHINES.map(m =>
          `<option value="${m.id}">${m.name}</option>`
        ).join("")}
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
  const machine = document.getElementById("codeMachine").value;
  const code = document.getElementById("codeInput").value.toUpperCase();
  const result = document.getElementById("codeResult");

  if (!state.codes[machine] || !state.codes[machine][code]) {
    result.innerHTML = `
      <div class="card error">
        ❌ ${state.lang === "es" ? "Código no encontrado" : "Code not found"}
      </div>
    `;
    return;
  }

  const data = state.codes[machine][code];

  result.innerHTML = `
    <div class="card success">
      <h3>${machineName(machine)} – ${code}</h3>

      <p><strong>${state.lang === "es" ? "Solución" : "Solution"}:</strong></p>
      <p>${data.solution[state.lang]}</p>

      <p><strong>${state.lang === "es" ? "Piezas típicas" : "Typical parts"}:</strong></p>
      <p>${data.defaultParts?.join(", ") || "-"}</p>

      <p class="muted">
        ${data.comments.length}
        ${state.lang === "es" ? "comentarios registrados" : "comments logged"}
      </p>
    </div>
  `;
}

/* ===================== SAVE CODE ===================== */

function saveCode(machine, code, es, en, parts = []) {
  if (!state.codes[machine]) state.codes[machine] = {};

  state.codes[machine][code] = {
    solution: { es, en },
    defaultParts: parts,
    comments: []
  };

  save();
}

/* ===================== INVENTORY ===================== */

function renderInventory() {
  document.getElementById("view").innerHTML = `
    <h2>Inventario</h2>
    <p>Próximamente</p>
  `;
}

/* ===================== ADMIN ===================== */

function renderAdmin() {
  document.getElementById("view").innerHTML = `
    <h2>Admin</h2>
    <p>Próximamente</p>
  `;
}

/* ===================== LANGUAGE ===================== */

function setLang(lang) {
  state.lang = lang;
  save();
  renderHome();
}




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
  { id: "metaldetector", name: "Metal Detector" },
  { id: "alkar", name: "Alkar" },
  { id: "mixer5000", name: "Mixer 5000" },
  { id: "mixer2500", name: "Mixer 2500" }
];

/* ===================== HELPERS ===================== */
function machineName(id) {
  const m = MACHINES.find(x => x.id === id);
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
  } catch {}
}

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ===================== DATA API ===================== */
function saveCode(machine, code, es, en, parts = []) {
  if (!state.codes[machine]) state.codes[machine] = {};

  state.codes[machine][code] = {
    solution: { es, en },
    defaultParts: parts,
    comments: state.codes[machine][code]?.comments || []
  };

  save();
}

function addComment(machine, code, who, textES, textEN, photoDataUrl, partsUsedStr) {
  if (!state.codes[machine] || !state.codes[machine][code]) return;

  const entry = state.codes[machine][code];
  entry.comments = entry.comments || [];

  entry.comments.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    who: (who || "").trim(),
    text: { es: textES || "", en: textEN || "" },
    photo: photoDataUrl || "",
    partsUsed: partsUsedStr || ""
  });

  save();
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
      <a href="#" onclick="goHome();return false;">
        <img src="logo.png" class="logo">
      </a>
      <span class="title">${state.lang === "es" ? "Aplicación de Errores" : "Error Application"}</span>
    </div>
    <div class="headerRight">
      <button onclick="setLang('es')">ES</button>
      <button onclick="setLang('en')">EN</button>
    </div>
  `;
}

function goHome() {
  renderLayout();
  renderHome();
}

/* ===================== LAYOUT ===================== */
function renderLayout() {
  const root = document.getElementById("appRoot");
  if (!root) return;

  root.innerHTML = `
    <nav>
      <button onclick="go('codes')">Códigos</button>
      <button onclick="go('inventory')">Inventario</button>
      <button onclick="go('admin')">Admin</button>
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
  document.getElementById("view").innerHTML = `
    <h1>${state.lang === "es" ? "Sistema de mantenimiento" : "Maintenance system"}</h1>
    <p>${state.lang === "es" ? "Selecciona una opción del menú" : "Select an option"}</p>
  `;
}

/* ===================== CODES ===================== */
function renderCodesHome() {
  document.getElementById("view").innerHTML = `
    <div class="card">
      <h2>Buscar código</h2>
      <select id="codeMachine">
        ${MACHINES.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
      </select>
      <input id="codeInput" placeholder="E101">
      <button onclick="searchCode()">Buscar</button>
    </div>
    <div id="codeResult"></div>
  `;
}

async function searchCode() {
  const machine = document.getElementById("codeMachine").value;
  const code = document.getElementById("codeInput").value.toUpperCase();
  const result = document.getElementById("codeResult");

  if (!state.codes[machine] || !state.codes[machine][code]) {
    result.innerHTML = "Código no encontrado";
    return;
  }

  const data = state.codes[machine][code];

  result.innerHTML = `
    <div class="card">
      <h3>${machineName(machine)} - ${code}</h3>
      <p>${data.solution[state.lang]}</p>
    </div>
  `;
}

/* ===================== OTHER ===================== */
function renderInventoryHome() {
  document.getElementById("view").innerHTML = "<h2>Inventario (próximamente)</h2>";
}

function renderAdminHome() {
  document.getElementById("view").innerHTML = "<h2>Admin (próximamente)</h2>";
}

function setLang(lang) {
  state.lang = lang;
  save();
  renderHeader();
  renderLayout();
  renderHome();
}

/* ===================== CONFIG ===================== */
const STORAGE_KEY = "error_app_full_pro_v1";

/* ===================== MÁQUINAS ===================== */
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

/* ===================== I18N ===================== */
const I18N = {
  es:{ app_title:"Aplicación de Errores", save:"Guardar", delete:"Borrar", edit:"Editar" },
  en:{ app_title:"Error Application", save:"Save", delete:"Delete", edit:"Edit" }
};

/* ===================== ESTADO ===================== */
let state = {
  lang:"es",
  codes:{},
  inventory:[]
};

/* ===================== UTIL ===================== */
function uuid(){ return crypto.randomUUID(); }
function now(){ return new Date().toISOString().slice(0,16).replace("T"," "); }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){ try{ state = JSON.parse(raw); }catch(e){} }
}

/* ===================== CÓDIGOS ===================== */
function saveCode(machine, code, solutionES, solutionEN, parts=[]){
  if(!state.codes[machine]) state.codes[machine]={};
  if(!state.codes[machine][code]){
    state.codes[machine][code]={ comments:[] };
  }
  state.codes[machine][code].solution={ es:solutionES, en:solutionEN };
  state.codes[machine][code].defaultParts=parts;
  save();
}

function addComment(machine, code, who, textES, textEN, photo, partsUsed){
  if(!state.codes[machine] || !state.codes[machine][code]) return;
  state.codes[machine][code].comments.push({
    who,
    date:now(),
    text:{ es:textES, en:textEN },
    photo,
    partsUsed
  });
  save();
}

/* ===================== INVENTARIO ===================== */
function addInventory(item){
  item.id = uuid();
  state.inventory.push(item);
  save();
}

function updateInventory(id, data){
  const it = state.inventory.find(x=>x.id===id);
  if(it){ Object.assign(it, data); save(); }
}

function deleteInventory(id){
  state.inventory = state.inventory.filter(x=>x.id!==id);
  save();
}

/* ===================== INIT ===================== */
function init(){
  load();
  console.log("FULL PRO APP READY", state);
}

init();

/* ======================================================
FIN APP.JS FULL PRO
====================================================== */

/* ===================== UI: HEADER + NAV ===================== */

function renderHeader() {
  const header = document.getElementById("appHeader");

  header.innerHTML = `
    <div class="headerLeft">
      <img src="logo.png" class="logo" alt="Logo">
      <span class="title">${state.lang === "es" ? "Aplicación de Errores" : "Error Application"}</span>
    </div>

    <div class="headerRight">
      <button class="langBtn" onclick="setLang('es')">ES</button>
      <button class="langBtn" onclick="setLang('en')">EN</button>
    </div>
  `;
}

function renderNav() {
  const root = document.getElementById("appRoot");

  root.innerHTML = `
    <nav class="nav">
      <button onclick="go('codes')" class="navBtn">Códigos</button>
      <button onclick="go('inventory')" class="navBtn">Inventario</button>
      <button onclick="go('admin')" class="navBtn">Admin</button>
    </nav>

    <section id="view"></section>
  `;
}

function setLang(lang) {
  state.lang = lang;
  save();
  renderHeader();
  renderNav();
  renderHome();
}

function go(view) {
  if (view === "codes") renderCodesHome();
  if (view === "inventory") renderInventoryHome();
  if (view === "admin") renderAdminHome();
}

function renderHome() {
  document.getElementById("view").innerHTML = `
    <div class="welcome">
      <h2>${state.lang === "es" ? "Sistema de mantenimiento" : "Maintenance system"}</h2>
      <p>${state.lang === "es"
        ? "Selecciona una opción del menú"
        : "Select an option from the menu"}
      </p>
    </div>
  `;
}

/* ====== VISTAS TEMPORALES (placeholder) ====== */

function renderCodesHome() {
  document.getElementById("view").innerHTML = `<h2>📟 Códigos de error</h2>`;
}

function renderInventoryHome() {
  document.getElementById("view").innerHTML = `<h2>📦 Inventario</h2>`;
}

function renderAdminHome() {
  document.getElementById("view").innerHTML = `<h2>🛠️ Administración</h2>`;
}

/* ===================== RE-INIT ===================== */
renderHeader();
renderNav();
renderHome();

/* ===================== VISTA: BUSCAR CÓDIGO ===================== */

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

  if (
    !state.codes[machine] ||
    !state.codes[machine][code]
  ) {
    result.innerHTML = `
      <div class="card error">
        ❌ ${state.lang === "es"
          ? "Código no encontrado"
          : "Code not found"}
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

      <p><strong>${state.lang === "es"
        ? "Piezas típicas"
        : "Typical parts"}:</strong></p>
      <p>${data.defaultParts?.join(", ") || "-"}</p>

      <p class="muted">
        ${data.comments.length}
        ${state.lang === "es"
          ? "comentarios registrados"
          : "comments logged"}
      </p>
    </div>
  `;
}

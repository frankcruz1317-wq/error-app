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

async function searchCode() {
  const machine = document.getElementById("codeMachine")?.value;
  const code = document.getElementById("codeInput")?.value?.toUpperCase();
  const result = document.getElementById("codeResult");
  if (!result || !machine || !code) return;

  if (!state.codes[machine] || !state.codes[machine][code]) {
    result.innerHTML = `<div class="card error">❌ ${state.lang === "es" ? "Código no encontrado" : "Code not found"}</div>`;
    return;
  }

  const data = state.codes[machine][code];
  const comments = data.comments || [];

  result.innerHTML = `
    <div class="card success">
      <h3>${machineName(machine)} – ${code}</h3>

      <p><strong>${state.lang === "es" ? "Solución" : "Solution"}:</strong></p>
      <p>${escapeHtml(data.solution?.[state.lang] ?? "-")}</p>

      <p><strong>${state.lang === "es" ? "Piezas típicas" : "Typical parts"}:</strong></p>
      <p>${(data.defaultParts && data.defaultParts.length) ? escapeHtml(data.defaultParts.join(", ")) : "-"}</p>

      <p class="muted">
        ${comments.length} ${state.lang === "es" ? "comentarios registrados" : "comments logged"}
      </p>
    </div>

    <div class="card">
      <h3>💬 ${state.lang === "es" ? "Agregar comentario" : "Add comment"}</h3>

      <label>${state.lang === "es" ? "Tu nombre" : "Your name"}</label>
      <input id="cWho" placeholder="${state.lang === "es" ? "Ej: Cruz" : "Ex: Cruz"}">

      <div class="grid2">
        <div>
          <label>${state.lang === "es" ? "Comentario (ES)" : "Comment (ES)"}</label>
          <textarea id="cTextES" rows="3" placeholder="${state.lang === "es" ? "Qué pasó y qué hicieron..." : "What happened and what you did..."}"></textarea>
        </div>
        <div>
          <label>${state.lang === "es" ? "Comentario (EN)" : "Comment (EN)"}</label>
          <textarea id="cTextEN" rows="3" placeholder="${state.lang === "es" ? "English version..." : "Versión en inglés..."}"></textarea>
        </div>
      </div>

      <div class="row">
        <button class="secondaryBtn" onclick="copyES2EN()">
          ${state.lang === "es" ? "Copiar ES → EN" : "Copy ES → EN"}
        </button>
        <button class="secondaryBtn" onclick="copyEN2ES()">
          ${state.lang === "es" ? "Copiar EN → ES" : "Copy EN → ES"}
        </button>
      </div>

      <label>${state.lang === "es" ? "Piezas usadas (en este caso)" : "Parts used (in this case)"}</label>
      <input id="cParts" placeholder="${state.lang === "es" ? "Ej: SEN-23, CAB-11" : "Ex: SEN-23, CAB-11"}">

      <label>${state.lang === "es" ? "Foto (opcional)" : "Photo (optional)"}</label>
      <input id="cPhoto" type="file" accept="image/*">

      <button class="primaryBtn" onclick="submitComment('${machine}', '${code}')">
        ${state.lang === "es" ? "Guardar comentario" : "Save comment"}
      </button>
    </div>

    <div class="card">
      <h3>📜 ${state.lang === "es" ? "Historial" : "History"}</h3>
      <div id="commentsList">
        ${renderCommentsList(comments)}
      </div>
    </div>
  `;
}

function renderCommentsList(comments) {
  if (!comments || comments.length === 0) {
    return `<p class="muted">(${state.lang === "es" ? "Sin comentarios aún" : "No comments yet"})</p>`;
  }

  return comments.map(c => {
    const txt = escapeHtml(c.text?.[state.lang] || (state.lang === "es" ? c.text?.en : c.text?.es) || "");
    const who = escapeHtml(c.who || (state.lang === "es" ? "Sin nombre" : "No name"));
    const parts = escapeHtml(c.partsUsed || "-");
    const photo = c.photo ? `<img class="commentImg" src="${c.photo}" alt="photo">` : "";

    return `
      <div class="commentItem">
        <div class="commentMeta">
          <strong>${who}</strong>
          <span class="muted">${escapeHtml(formatDate(c.date))}</span>
        </div>
        <div class="commentText">${txt || `<span class="muted">(sin texto)</span>`}</div>
        <div class="commentParts"><strong>${state.lang === "es" ? "Piezas:" : "Parts:"}</strong> ${parts}</div>
        ${photo}
      </div>
    `;
  }).join("");
}

function copyES2EN() {
  const es = document.getElementById("cTextES");
  const en = document.getElementById("cTextEN");
  if (es && en) en.value = es.value;
}

function copyEN2ES() {
  const es = document.getElementById("cTextES");
  const en = document.getElementById("cTextEN");
  if (es && en) es.value = en.value;
}

async function submitComment(machine, code) {
  const who = document.getElementById("cWho")?.value || "";
  const textES = document.getElementById("cTextES")?.value || "";
  const textEN = document.getElementById("cTextEN")?.value || "";
  const partsUsed = document.getElementById("cParts")?.value || "";
  const photoInput = document.getElementById("cPhoto");
  let photoDataUrl = "";

  // Validación mínima
  if (!textES.trim() && !textEN.trim()) {
    alert(state.lang === "es" ? "Escribe un comentario (ES o EN)." : "Write a comment (ES or EN).");
    return;
  }

  // Foto opcional
  const file = photoInput?.files?.[0];
  if (file) {
    // Ojo: si la foto es muy grande, localStorage se llena.
    // Recomendación: fotos pequeñas.
    photoDataUrl = await readFileAsDataURL(file);
  }

  addComment(machine, code, who, textES, textEN, photoDataUrl, partsUsed);

  // Limpia campos
  if (document.getElementById("cTextES")) document.getElementById("cTextES").value = "";
  if (document.getElementById("cTextEN")) document.getElementById("cTextEN").value = "";
  if (document.getElementById("cParts")) document.getElementById("cParts").value = "";
  if (document.getElementById("cPhoto")) document.getElementById("cPhoto").value = "";

  // Re-render rápido: vuelve a buscar el mismo code para refrescar la lista
  searchCode();
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

function addComment(machine, code, who, textES, textEN, photoDataUrl, partsUsedStr) {
  if (!state.codes[machine] || !state.codes[machine][code]) return;

  const entry = state.codes[machine][code];

  entry.comments = entry.comments || [];
  entry.comments.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    who: (who || "").trim(),
    text: {
      es: (textES || "").trim(),
      en: (textEN || "").trim()
    },
    photo: photoDataUrl || "",
    partsUsed: (partsUsedStr || "").trim()
  });

  save();
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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


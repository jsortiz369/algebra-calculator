/* ============================================================
   Calculadora de Ãlgebra Lineal
   - Sistemas de ecuaciones lineales nÃ—n (Gauss-Jordan, fracciones exactas)
   - Operaciones con matrices m x n
   ============================================================ */

/* ---------- Utilidades ---------- */
const $ = (id) => document.getElementById(id);
const num = (id) => parseFloat($(id).value) || 0;

// Redondea evitando "-0" y decimales muy largos
function fmt(n) {
  const r = Math.round(n * 1e6) / 1e6;
  return Object.is(r, -0) ? 0 : r;
}

// MÃ¡ximo comÃºn divisor
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/* ---------- NavegaciÃ³n por pestaÃ±as ---------- */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

// Clases Tailwind para el estado activo / inactivo de una pestaÃ±a
const TAB_ACTIVE = ["bg-white", "text-indigo-600", "shadow-sm"];
const TAB_INACTIVE = ["text-slate-500", "hover:bg-slate-200/70", "hover:text-slate-900"];

function setTabState(tab, active) {
  tab.setAttribute("aria-selected", active ? "true" : "false");
  if (active) {
    tab.classList.add(...TAB_ACTIVE);
    tab.classList.remove(...TAB_INACTIVE);
  } else {
    tab.classList.remove(...TAB_ACTIVE);
    tab.classList.add(...TAB_INACTIVE);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => setTabState(t, t === tab));

    const target = tab.dataset.tab;
    panels.forEach((p) => {
      const active = p.id === target;
      p.classList.toggle("hidden", !active);
      p.hidden = !active;
    });
  });
});

/* ============================================================
   ARITMÃ‰TICA DE FRACCIONES EXACTAS
   Cada fracciÃ³n se representa como { n: numerador, d: denominador }
   con d > 0 y forma irreducible.
   ============================================================ */
function makeFrac(n, d = 1) {
  if (d === 0) throw new Error("DivisiÃ³n por cero");

  // Escala a enteros si vienen decimales
  const decimals = (x) => {
    const s = String(x);
    const i = s.indexOf(".");
    return i === -1 ? 0 : s.length - i - 1;
  };
  const scale = Math.pow(10, Math.max(decimals(n), decimals(d)));
  n = Math.round(n * scale);
  d = Math.round(d * scale);

  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

const fAdd = (a, b) => makeFrac(a.n * b.d + b.n * a.d, a.d * b.d);
const fSub = (a, b) => makeFrac(a.n * b.d - b.n * a.d, a.d * b.d);
const fMul = (a, b) => makeFrac(a.n * b.n, a.d * b.d);
const fDiv = (a, b) => makeFrac(a.n * b.d, a.d * b.n);
const fIsZero = (a) => a.n === 0;
const fToStr = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/* ============================================================
   SISTEMA DE ECUACIONES LINEALES n x n
   MÃ©todo de eliminaciÃ³n gaussiana (triangular + sustituciÃ³n
   hacia atrÃ¡s) con fracciones exactas.
   ============================================================ */
let linearSize = 3;

// Nombres de variables usados en toda la secciÃ³n
const VAR_NAMES = ["x", "y", "z", "w", "v", "u", "t", "s"];
const varName = (i) => VAR_NAMES[i] || `x${i + 1}`;

// Genera la cuadrÃ­cula de coeficientes: n ecuaciones, cada una con
// n coeficientes + tÃ©rmino independiente.
function buildLinearGrid(n, fillExample = true) {
  linearSize = n;
  const grid = $("linearGrid");
  grid.innerHTML = "";

  const defaultExample = [
    [2, 3, 4, 20],
    [3, -5, -1, -10],
    [-1, 2, -3, -6],
  ];

  for (let r = 0; r < n; r++) {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 flex-nowrap py-1 group";

    // Indicador de fila (E1, E2...)
    const rowTag = document.createElement("span");
    rowTag.className = "text-xs font-bold font-mono text-slate-400 group-hover:text-indigo-600 transition-colors w-8 shrink-0 text-right pr-1 select-none";
    rowTag.textContent = `E${r + 1}:`;
    row.appendChild(rowTag);

    for (let c = 0; c < n; c++) {
      const input = document.createElement("input");
      if (fillExample && defaultExample[r] && defaultExample[r][c] !== undefined && n === 3) {
        input.value = defaultExample[r][c];
      }
      input.type = "number";
      input.id = `L_${r}_${c}`;
      input.placeholder = "0";
      input.className = "cell";
      input.setAttribute("aria-label", `EcuaciÃ³n ${r + 1}, coeficiente de ${varName(c)}`);
      row.appendChild(input);

      const label = document.createElement("span");
      label.className = "text-sm font-semibold text-slate-600 shrink-0 select-none flex items-center";
      if (c === n - 1) {
        label.innerHTML = `<span class="text-indigo-600 font-mono font-bold">${varName(c)}</span><span class="mx-2 text-slate-400 font-bold">=</span>`;
      } else {
        label.innerHTML = `<span class="text-indigo-600 font-mono font-bold">${varName(c)}</span><span class="mx-1.5 text-slate-400 font-bold">+</span>`;
      }
      row.appendChild(label);
    }

    const rhs = document.createElement("input");
    if (fillExample && defaultExample[r] && defaultExample[r][n] !== undefined && n === 3) {
      rhs.value = defaultExample[r][n];
    }
    rhs.type = "number";
    rhs.id = `L_${r}_b`;
    rhs.placeholder = "0";
    rhs.className = "cell cell--rhs";
    rhs.setAttribute("aria-label", `EcuaciÃ³n ${r + 1}, tÃ©rmino independiente`);
    row.appendChild(rhs);

    grid.appendChild(row);
  }
}

// Copia profunda de la matriz de fracciones (para guardar snapshots de pasos)
function cloneMatrix(M) {
  return M.map((row) => row.map((f) => ({ n: f.n, d: f.d })));
}

// Convierte una fila de coeficientes en el texto de una ecuaciÃ³n:
//   2x + 3y âˆ’ z = 5
function rowToEquation(row, n) {
  let terms = "";
  for (let c = 0; c < n; c++) {
    const f = row[c];
    if (fIsZero(f)) continue;
    const val = fToStr(f);
    const isNeg = f.n < 0;
    const abs = fToStr({ n: Math.abs(f.n), d: f.d });
    const coef = abs === "1" ? "" : abs; // omite el 1

    if (terms === "") {
      terms += `${isNeg ? "âˆ’" : ""}${coef}${varName(c)}`;
    } else {
      terms += ` ${isNeg ? "âˆ’" : "+"} ${coef}${varName(c)}`;
    }
  }
  if (terms === "") terms = "0";
  return `${terms} = ${fToStr(row[n])}`;
}

// Multiplica una fila (ecuaciÃ³n) de fracciones por un escalar-fracciÃ³n
function scaleRow(row, k) {
  return row.map((f) => fMul(f, k));
}

// Suma dos filas de fracciones tÃ©rmino a tÃ©rmino
function addRows(r1, r2) {
  return r1.map((f, i) => fAdd(f, r2[i]));
}

// Resuelve el sistema por el MÃ‰TODO DE ELIMINACIÃ“N (estilo escolar):
function solveLinearSystem(n) {
  // Matriz aumentada de fracciones [n x (n+1)]
  const M = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(makeFrac(num(`L_${r}_${c}`)));
    row.push(makeFrac(num(`L_${r}_b`)));
    M.push([...row]);
  }
  
  const steps = [];
  const recSystem = (phase, desc) => steps.push({ kind: "system", phase, desc, system: cloneMatrix(M) });
  recSystem("Sistema inicial", "Planteamos el sistema de ecuaciones a resolver.");

  /* ---------- 1) ELIMINACIÃ“N POR SUMA DE ECUACIONES ---------- */
  let pivotRow = 0;
  for (let col = 0; col < n && pivotRow < n; col++) {
    let sel = -1;
    for (let r = pivotRow; r < n; r++) {
      if (!fIsZero(M[r][col])) { sel = r; break; }
    }
    if (sel === -1) continue;

    if (sel !== pivotRow) {
      [M[pivotRow], M[sel]] = [M[sel], M[pivotRow]];
      recSystem(
        "EliminaciÃ³n",
        `Intercambiamos la ecuaciÃ³n ${pivotRow + 1} con la ${sel + 1} para tener un coeficiente de ${varName(col)} distinto de cero.`
      );
    }

    for (let r = pivotRow + 1; r < n; r++) {
      if (fIsZero(M[r][col])) continue;

      const a = M[pivotRow][col];
      const b = M[r][col];

      const kPivot = b;
      const kTarget = makeFrac(-a.n, a.d);

      const topRow = scaleRow(M[pivotRow], kPivot);
      const botRow = scaleRow(M[r], kTarget);
      const sumRow = addRows(topRow, botRow);

      steps.push({
        kind: "sum",
        phase: "EliminaciÃ³n",
        desc: `Eliminamos ${varName(col)} entre la ecuaciÃ³n ${pivotRow + 1} y la ${r + 1}: multiplicamos E${pivotRow + 1} por (${fToStr(kPivot)}) y E${r + 1} por (${fToStr(kTarget)}), y las sumamos.`,
        top: topRow,
        bottom: botRow,
        result: sumRow,
      });

      M[r] = sumRow;
    }
    pivotRow++;
  }

  // Detecta inconsistencia: fila [0 ... 0 | k] con k != 0
  for (let r = 0; r < n; r++) {
    const allZero = M[r].slice(0, n).every(fIsZero);
    if (allZero && !fIsZero(M[r][n])) return { type: "none", steps };
  }
  if (pivotRow < n) return { type: "infinite", steps };

  /* ---------- 2) SUSTITUCIÃ“N HACIA ATRÃS ---------- */
  const solution = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const eqs = [];
    eqs.push(`De la ecuaciÃ³n ${i + 1}:  ${rowToEquation(M[i], n)}`);

    let acc = makeFrac(0);
    let sustTxt = `${fToStr(M[i][i]) === "1" ? "" : "(" + fToStr(M[i][i]) + ")Â·"}${varName(i)} = ${fToStr(M[i][n])}`;
    for (let c = i + 1; c < n; c++) {
      if (fIsZero(M[i][c])) continue;
      acc = fAdd(acc, fMul(M[i][c], solution[c]));
      sustTxt += ` âˆ’ (${fToStr(M[i][c])})Â·(${fToStr(solution[c])})`;
    }

    const rhs = fSub(M[i][n], acc);
    solution[i] = fDiv(rhs, M[i][i]);

    if (i < n - 1) eqs.push(sustTxt);
    eqs.push(`${varName(i)} = ${fToStr(solution[i])}`);

    steps.push({
      kind: "text",
      phase: "SustituciÃ³n",
      desc: i === n - 1
        ? `De la Ãºltima ecuaciÃ³n despejamos ${varName(i)}.`
        : `Sustituimos los valores ya hallados y despejamos ${varName(i)}.`,
      eqs,
    });
  }

  // Paso final con la soluciÃ³n completa
  steps.push({
    kind: "text",
    phase: "SoluciÃ³n",
    desc: "SoluciÃ³n del sistema:",
    eqs: solution.map((f, i) => `${varName(i)} = ${fToStr(f)}`),
  });

  return { type: "unique", solution, steps };
}

// Renderiza el sistema de ecuaciones con llave a la izquierda
function renderSystem(M) {
  const n = M[0].length - 1;
  const eqs = M.map((row) => `<div class="py-0.5">${rowToEquation(row, n)}</div>`).join("");
  return `
    <div class="flex items-stretch gap-2.5 mt-2.5 w-max max-w-full">
      <div class="w-2.5 border-l-[3px] border-t-[3px] border-b-[3px] border-indigo-400 rounded-l-md my-0.5"></div>
      <div class="font-mono text-sm leading-relaxed tabular-nums py-1 text-slate-800">${eqs}</div>
    </div>`;
}

// Renderiza una suma vertical de dos ecuaciones con lÃ­nea divisoria
function renderSum(top, bottom, result, n) {
  const line = (row, prefix) =>
    `<div class="grid grid-cols-[1.5rem_1fr] items-center py-0.5">
       <span class="text-indigo-600 font-bold text-center">${prefix}</span>
       <span class="text-slate-800">${rowToEquation(row, n)}</span>
     </div>`;
  return `
    <div class="font-mono text-sm leading-relaxed tabular-nums bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 mt-2.5 w-max max-w-full overflow-x-auto shadow-sm">
      ${line(top, "")}
      ${line(bottom, "+")}
      <div class="grid grid-cols-[1.5rem_1fr]"><span class="text-transparent">.</span><hr class="border-t-2 border-slate-300 my-1" /></div>
      ${line(result, "")}
    </div>`;
}

// Renderiza un bloque de lÃ­neas de ecuaciÃ³n
function renderTextEqs(eqs) {
  const lines = eqs.map((e) => `<div class="py-0.5">${e}</div>`).join("");
  return `<div class="font-mono text-sm leading-relaxed tabular-nums bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 mt-2.5 w-max max-w-full overflow-x-auto text-slate-800 shadow-sm">${lines}</div>`;
}

// Muestra u oculta los pasos segÃºn el checkbox
function renderSteps(steps) {
  const box = $("stepsLinear");
  if (!$("showSteps").checked || !steps || steps.length === 0) {
    box.innerHTML = "";
    return;
  }

  const phaseBadge = {
    "Sistema inicial": "bg-slate-100 text-slate-700 border-slate-200",
    "EliminaciÃ³n": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "SustituciÃ³n": "bg-teal-50 text-teal-700 border-teal-200",
    "SoluciÃ³n": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const n = linearSize;

  const items = steps
    .map((s, i) => {
      const badgeClass = phaseBadge[s.phase] || "bg-slate-100 text-slate-700 border-slate-200";
      let body = "";
      if (s.kind === "system") body = renderSystem(s.system);
      else if (s.kind === "sum") body = renderSum(s.top, s.bottom, s.result, n);
      else if (s.kind === "text") body = renderTextEqs(s.eqs);

      return `
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-x-auto transition-all hover:border-slate-300">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${badgeClass}">${s.phase}</span>
          <span class="text-xs font-semibold text-slate-400">Paso ${i + 1} de ${steps.length}</span>
        </div>
        <p class="text-sm font-medium text-slate-800">${s.desc}</p>
        ${body}
      </div>`;
    })
    .join("");

  box.innerHTML = `
    <div class="flex items-center justify-between mb-3.5">
      <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
        <svg width="20" height="20" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Procedimiento Paso a Paso (MÃ©todo de EliminaciÃ³n)
      </h4>
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">${steps.length} pasos</span>
    </div>
    <div class="flex flex-col gap-3.5">${items}</div>`;
}

const MAX_LINEAR = 15;

$("buildLinear").addEventListener("click", () => {
  let n = parseInt($("linearSize").value, 10);

  if (isNaN(n) || n < 2) {
    n = 2;
  } else if (n > MAX_LINEAR) {
    alert(`El nÃºmero mÃ¡ximo de ecuaciones es ${MAX_LINEAR}. Se ajustarÃ¡ a ${MAX_LINEAR}.`);
    n = MAX_LINEAR;
  }

  $("linearSize").value = n;
  buildLinearGrid(n, false);
  $("resultLinear").innerHTML = "";
  $("stepsLinear").innerHTML = "";
  lastLinearResult = null;
});

// Cargar ejemplo para ecuaciones lineales
const exampleLinearBtn = $("exampleLinear");
if (exampleLinearBtn) {
  exampleLinearBtn.addEventListener("click", () => {
    $("linearSize").value = 3;
    buildLinearGrid(3, true);
    $("resultLinear").innerHTML = "";
    $("stepsLinear").innerHTML = "";
    lastLinearResult = null;
  });
}

// Guarda el Ãºltimo resultado para poder mostrar/ocultar los pasos con el checkbox
let lastLinearResult = null;

$("solveLinear").addEventListener("click", () => {
  const box = $("resultLinear");
  box.classList.remove("result--error");

  const res = solveLinearSystem(linearSize);
  lastLinearResult = res;

  if (res.type === "none") {
    box.classList.add("result--error");
    box.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
          <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-base text-rose-700 m-0">Sistema Incompatible</h4>
          <p class="text-sm text-rose-600/90 mt-1">No existe soluciÃ³n: las ecuaciones son contradictorias (lÃ­neas o planos paralelos que no se intersectan).</p>
        </div>
      </div>`;
    renderSteps(res.steps);
    return;
  }
  if (res.type === "infinite") {
    box.classList.add("result--error");
    box.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
          <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-base text-amber-800 m-0">Infinitas Soluciones</h4>
          <p class="text-sm text-amber-700/90 mt-1">El sistema tiene variables libres: existen infinitas soluciones posibles que satisfacen las ecuaciones.</p>
        </div>
      </div>`;
    renderSteps(res.steps);
    return;
  }

  const solutionCards = res.solution
    .map((frac, i) => {
      const fracStr = fToStr(frac);
      const isFraction = frac.d !== 1;
      const decStr = isFraction ? (frac.n / frac.d).toFixed(4) : null;
      return `
        <div class="bg-white border border-indigo-100 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 min-w-[130px] flex-1">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold flex items-center justify-center text-sm shadow-sm">${varName(i)}</span>
            <span class="text-slate-400 font-bold text-sm">=</span>
          </div>
          <div class="text-right">
            <span class="font-mono text-lg font-bold text-slate-800">${fracStr}</span>
            ${decStr ? `<div class="text-[11px] text-slate-400 font-mono font-medium">â‰ˆ ${decStr}</div>` : ""}
          </div>
        </div>`;
    })
    .join("");

  box.innerHTML = `
    <div class="flex items-center justify-between mb-3.5">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded-lg bg-emerald-100 text-emerald-600">
          <svg width="16" height="16" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h4 class="font-bold text-base text-slate-900 m-0">SoluciÃ³n Ãšnica del Sistema</h4>
      </div>
      <span class="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">Exacta</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">${solutionCards}</div>`;
  renderSteps(res.steps);
});

// Mostrar/ocultar el paso a paso sin recalcular
$("showSteps").addEventListener("change", () => {
  if (lastLinearResult) renderSteps(lastLinearResult.steps);
});

$("clearLinear").addEventListener("click", () => {
  document.querySelectorAll("#linearGrid input").forEach((i) => (i.value = ""));
  $("resultLinear").innerHTML = "";
  $("stepsLinear").innerHTML = "";
  lastLinearResult = null;
});

/* ============================================================
   MATRICES
   Tres modos: resolver sistema (AÂ·X=B), suma (A+B), multiplicaciÃ³n (AÃ—B).
   Toda la aritmÃ©tica usa fracciones exactas.
   ============================================================ */

/* ---------- Utilidades comunes de matrices ---------- */
// Renderiza una matriz de fracciones con soporte grÃ¡fico de corchetes
function renderMatrixFrac(m) {
  const rows = m.length;
  const cols = m[0].length;
  let html = `
    <div class="inline-flex items-center gap-2 my-2 select-none">
      <!-- Corchete izquierdo -->
      <div class="w-2.5 self-stretch border-l-2 border-t-2 border-b-2 border-indigo-500 rounded-l"></div>
      
      <div class="grid gap-1.5 py-1 px-1" style="grid-template-columns:repeat(${cols},minmax(46px,auto))">`;
  m.forEach((row) => {
    row.forEach((v) => {
      html += `<span class="py-1.5 px-2.5 text-center bg-slate-50 border border-slate-200/80 rounded-lg text-sm font-mono tabular-nums text-slate-800 font-medium select-text">${fToStr(v)}</span>`;
    });
  });
  html += `
      </div>
      
      <!-- Corchete derecho -->
      <div class="w-2.5 self-stretch border-r-2 border-t-2 border-b-2 border-indigo-500 rounded-r"></div>
      
      <span class="text-[10px] font-mono font-bold text-slate-400 self-end mb-1 ml-0.5">${rows}Ã—${cols}</span>
    </div>`;
  return html;
}

function showMatrixResult(title, content, isError = false) {
  const box = $("resultMatrix");
  box.classList.toggle("result--error", isError);
  box.innerHTML = `<h4>${title}</h4>${content}`;
}

/* ---------- Operaciones con fracciones ---------- */
function matAddFrac(A, B) {
  return A.map((row, r) => row.map((v, c) => fAdd(v, B[r][c])));
}

function matMulFrac(A, B) {
  const result = [];
  for (let i = 0; i < A.length; i++) {
    const row = [];
    for (let j = 0; j < B[0].length; j++) {
      let sum = makeFrac(0);
      for (let k = 0; k < B.length; k++) sum = fAdd(sum, fMul(A[i][k], B[k][j]));
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/* ============================================================
   MODO 1: RESOLVER SISTEMA POR MATRICES  (AÂ·X = B)
   Se resuelve por eliminaciÃ³n con fracciones exactas.
   ============================================================ */
let solveSize = 3;

function buildSolveGrid(n) {
  solveSize = n;
  const grid = $("solveGrid");
  grid.innerHTML = "";

  for (let r = 0; r < n; r++) {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 flex-nowrap py-1 group";

    const tag = document.createElement("span");
    tag.className = "text-xs font-bold font-mono text-slate-400 group-hover:text-indigo-600 transition-colors w-8 shrink-0 text-right pr-1 select-none";
    tag.textContent = `F${r + 1}:`;
    row.appendChild(tag);

    for (let c = 0; c < n; c++) {
      const input = document.createElement("input");
      input.type = "number";
      input.id = `S_${r}_${c}`;
      input.placeholder = "0";
      input.className = "cell";
      input.setAttribute("aria-label", `EcuaciÃ³n ${r + 1}, coeficiente de x${c + 1}`);
      row.appendChild(input);

      const label = document.createElement("span");
      label.className = "text-sm font-semibold text-slate-600 shrink-0 select-none flex items-center";
      if (c === n - 1) {
        label.innerHTML = `<span class="text-indigo-600 font-mono font-bold">x<sub>${c + 1}</sub></span><span class="mx-2 text-slate-400 font-bold">=</span>`;
      } else {
        label.innerHTML = `<span class="text-indigo-600 font-mono font-bold">x<sub>${c + 1}</sub></span><span class="mx-1.5 text-slate-400 font-bold">+</span>`;
      }
      row.appendChild(label);
    }

    const rhs = document.createElement("input");
    rhs.type = "number";
    rhs.id = `S_${r}_b`;
    rhs.placeholder = "0";
    rhs.className = "cell cell--rhs";
    rhs.setAttribute("aria-label", `EcuaciÃ³n ${r + 1}, tÃ©rmino independiente`);
    row.appendChild(rhs);

    grid.appendChild(row);
  }
}

// Resuelve AÂ·X = B por Gauss-Jordan con fracciones, registrando los pasos.
function solveByMatrix(n) {
  const M = []; // matriz aumentada de fracciones [A | B]
  for (let r = 0; r < n; r++) {
    const rowM = [];
    for (let c = 0; c < n; c++) rowM.push(makeFrac(parseFloat($(`S_${r}_${c}`).value) || 0));
    rowM.push(makeFrac(parseFloat($(`S_${r}_b`).value) || 0));
    M.push(rowM);
  }

  const steps = [];
  const record = (desc) => steps.push({ desc, matrix: cloneMatrix(M) });

  record("Escribimos la matriz aumentada [A | B].");

  // EliminaciÃ³n de Gauss-Jordan con fracciones
  let pivotRow = 0;
  for (let col = 0; col < n && pivotRow < n; col++) {
    let sel = -1;
    for (let r = pivotRow; r < n; r++) if (!fIsZero(M[r][col])) { sel = r; break; }
    if (sel === -1) continue;

    if (sel !== pivotRow) {
      [M[pivotRow], M[sel]] = [M[sel], M[pivotRow]];
      record(`Intercambiamos F${pivotRow + 1} â†” F${sel + 1} para tener un pivote no nulo en la columna ${col + 1}.`);
    }

    const piv = M[pivotRow][col];
    if (!(piv.n === piv.d)) { // si no es ya 1
      for (let c = 0; c <= n; c++) M[pivotRow][c] = fDiv(M[pivotRow][c], piv);
      record(`F${pivotRow + 1} â†’ F${pivotRow + 1} Ã· (${fToStr(piv)}) para hacer 1 el pivote.`);
    }

    for (let r = 0; r < n; r++) {
      if (r === pivotRow || fIsZero(M[r][col])) continue;
      const factor = M[r][col];
      for (let c = 0; c <= n; c++) M[r][c] = fSub(M[r][c], fMul(factor, M[pivotRow][c]));
      record(`F${r + 1} â†’ F${r + 1} âˆ’ (${fToStr(factor)})Â·F${pivotRow + 1} para anular la columna ${col + 1}.`);
    }
    pivotRow++;
  }

  for (let r = 0; r < n; r++) {
    const allZero = M[r].slice(0, n).every(fIsZero);
    if (allZero && !fIsZero(M[r][n])) return { type: "none", steps };
  }
  if (pivotRow < n) return { type: "infinite", steps };

  const solution = M.map((row) => row[n]);
  return { type: "unique", solution, steps };
}

// Renderiza una matriz aumentada de fracciones [A | B] con la lÃ­nea separadora
function renderAugmentedFrac(M) {
  const n = M[0].length - 1;
  let html = `
    <div class="relative inline-block mt-3 px-3 py-2.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-sm">
      <div class="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 mb-1.5 px-3">
        <span>Matriz [A]</span>
        <span>Vector [B]</span>
      </div>
      <table class="border-collapse mx-auto">
        <tbody>`;
  M.forEach((row) => {
    html += "<tr>";
    row.forEach((f, c) => {
      const isAugmented = c === n;
      const sep = isAugmented
        ? "border-l-2 border-indigo-400/80 bg-indigo-50/50 font-bold text-indigo-900"
        : "text-slate-800 font-medium";
      html += `<td class="px-3 py-1.5 text-center tabular-nums text-sm font-mono ${sep}">${fToStr(f)}</td>`;
    });
    html += "</tr>";
  });
  html += `
        </tbody>
      </table>
    </div>`;
  return html;
}

// Muestra u oculta los pasos del mÃ©todo matricial segÃºn el checkbox
function renderMatrixSteps(steps) {
  const box = $("stepsMatrix");
  if (!$("showStepsMatrix").checked || !steps || steps.length === 0) {
    box.innerHTML = "";
    return;
  }

  const items = steps
    .map(
      (s, i) => `
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-x-auto transition-all hover:border-slate-300">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">Gauss-Jordan</span>
          <span class="text-xs font-semibold text-slate-400">Paso ${i + 1} de ${steps.length}</span>
        </div>
        <p class="text-sm font-medium text-slate-800">${s.desc}</p>
        ${renderAugmentedFrac(s.matrix)}
      </div>`
    )
    .join("");

  box.innerHTML = `
    <div class="flex items-center justify-between mb-3.5">
      <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
        <svg width="20" height="20" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Procedimiento (Gauss-Jordan sobre [A | B])
      </h4>
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">${steps.length} operaciones</span>
    </div>
    <div class="flex flex-col gap-3.5">${items}</div>`;
}

$("buildSolve").addEventListener("click", () => {
  let n = parseInt($("solveSize").value, 10);
  if (isNaN(n) || n < 2) n = 2;
  if (n > 8) { alert("El tamaÃ±o mÃ¡ximo para resolver por matrices es 8."); n = 8; }
  $("solveSize").value = n;
  buildSolveGrid(n);
  $("resultMatrix").innerHTML = "";
  $("stepsMatrix").innerHTML = "";
  lastMatrixSolve = null;
});

$("exampleSolve").addEventListener("click", () => {
  buildSolveGrid(3);
  $("solveSize").value = 3;
  const ex = [
    [1, 1, 1, 40],
    [2, 1, 1, 45],
    [1, 2, 1, 55],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) $(`S_${r}_${c}`).value = ex[r][c];
    $(`S_${r}_b`).value = ex[r][3];
  }
  $("resultMatrix").innerHTML = "";
  $("stepsMatrix").innerHTML = "";
  lastMatrixSolve = null;
});

// Guarda el Ãºltimo resultado para mostrar/ocultar pasos con el checkbox
let lastMatrixSolve = null;

$("solveMatrixBtn").addEventListener("click", () => {
  const res = solveByMatrix(solveSize);
  lastMatrixSolve = res;

  if (res.type === "none") {
    showMatrixResult(
      "Sistema Incompatible",
      `<div class="flex items-start gap-3">
        <div class="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
          <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p class="text-sm text-rose-700 font-medium">La matriz A no es invertible (determinante = 0) y el sistema no tiene soluciÃ³n.</p>
        </div>
      </div>`,
      true
    );
    renderMatrixSteps(res.steps);
    return;
  }
  if (res.type === "infinite") {
    showMatrixResult(
      "Infinitas Soluciones",
      `<div class="flex items-start gap-3">
        <div class="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
          <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-sm text-amber-800 font-medium">La matriz A no es invertible; el sistema tiene infinitas soluciones dependientes de variables libres.</p>
        </div>
      </div>`,
      true
    );
    renderMatrixSteps(res.steps);
    return;
  }

  const solCards = res.solution
    .map((f, i) => {
      const fracStr = fToStr(f);
      const isFraction = f.d !== 1;
      const decStr = isFraction ? (f.n / f.d).toFixed(4) : null;
      return `
        <div class="bg-white border border-indigo-100 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 min-w-[130px] flex-1">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold flex items-center justify-center text-sm shadow-sm">x<sub>${i + 1}</sub></span>
            <span class="text-slate-400 font-bold text-sm">=</span>
          </div>
          <div class="text-right">
            <span class="font-mono text-lg font-bold text-slate-800">${fracStr}</span>
            ${decStr ? `<div class="text-[11px] text-slate-400 font-mono font-medium">â‰ˆ ${decStr}</div>` : ""}
          </div>
        </div>`;
    })
    .join("");

  showMatrixResult(
    "SoluciÃ³n Matricial (X = Aâ»Â¹Â·B)",
    `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">${solCards}</div>`
  );
  renderMatrixSteps(res.steps);
});

// Mostrar/ocultar el paso a paso del mÃ©todo matricial sin recalcular
$("showStepsMatrix").addEventListener("change", () => {
  if (lastMatrixSolve) renderMatrixSteps(lastMatrixSolve.steps);
});

$("clearSolve").addEventListener("click", () => {
  document.querySelectorAll("#solveGrid input").forEach((i) => (i.value = ""));
  $("resultMatrix").innerHTML = "";
  $("stepsMatrix").innerHTML = "";
  lastMatrixSolve = null;
});

/* ============================================================
   MODO: MULTIPLICACIÃ“N EN CADENA  (n matrices, A Ã— B Ã— Câ€¦)
   ============================================================ */
let mulCount = 2;
let mulSizes = []; // [{ rows, cols }] por matriz

// Genera los controles de dimensiones (filas Ã— columnas) por matriz
function buildMulDims(count) {
  mulCount = count;
  const wrap = $("mulDims");
  wrap.innerHTML = "";

  for (let m = 0; m < count; m++) {
    const letter = COMB_LETTERS[m];
    const prev = mulSizes[m] || { rows: 2, cols: 2 };
    const box = document.createElement("div");
    box.className = "flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 shadow-sm";
    box.innerHTML = `
      <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">${letter}</span>
      <div class="flex items-center gap-1.5">
        <label class="text-xs font-semibold text-slate-500" for="mrows_${letter}">Filas:</label>
        <input type="number" id="mrows_${letter}" min="1" max="8" value="${prev.rows}"
          class="w-12 py-1 px-1.5 border border-slate-200 rounded-lg text-center text-sm font-mono font-bold text-slate-800 bg-slate-50
                 focus:outline-none focus:border-indigo-500 focus:bg-white" />
      </div>
      <span class="text-slate-300 font-bold">Ã—</span>
      <div class="flex items-center gap-1.5">
        <label class="text-xs font-semibold text-slate-500" for="mcols_${letter}">Cols:</label>
        <input type="number" id="mcols_${letter}" min="1" max="8" value="${prev.cols}"
          class="w-12 py-1 px-1.5 border border-slate-200 rounded-lg text-center text-sm font-mono font-bold text-slate-800 bg-slate-50
                 focus:outline-none focus:border-indigo-500 focus:bg-white" />
      </div>`;
    wrap.appendChild(box);
  }
}

// Genera las cuadrÃ­culas de las n matrices segÃºn sus dimensiones
function buildMulGrids(count) {
  const wrap = $("mulGrids");
  wrap.innerHTML = "";
  mulSizes = [];

  for (let m = 0; m < count; m++) {
    const letter = COMB_LETTERS[m];
    let rows = parseInt($(`mrows_${letter}`).value, 10);
    let cols = parseInt($(`mcols_${letter}`).value, 10);
    if (isNaN(rows) || rows < 1) rows = 1; if (rows > 8) rows = 8;
    if (isNaN(cols) || cols < 1) cols = 1; if (cols > 8) cols = 8;
    $(`mrows_${letter}`).value = rows;
    $(`mcols_${letter}`).value = cols;
    mulSizes.push({ rows, cols });

    const card = document.createElement("div");
    card.className = "bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow";

    // Encabezado: escalar Â· Matriz X (rowsÃ—cols)
    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-4 pb-3 border-b border-slate-100";
    header.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">${letter}</span>
        <div>
          <h3 class="text-base font-bold text-slate-800">Matriz ${letter}</h3>
          <span class="text-[11px] font-mono text-slate-400 font-semibold">${rows} Ã— ${cols}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
        <label for="mulScal_${letter}" class="text-xs font-semibold text-slate-500">Escalar:</label>
        <input type="number" id="mulScal_${letter}" value="1" step="any"
          class="w-14 py-1 px-1.5 border border-slate-200 rounded-lg text-center text-sm font-mono font-bold bg-white
                 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          aria-label="Escalar de la matriz ${letter}" />
      </div>`;
    card.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid gap-2";
    grid.id = `gridMul${letter}`;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const input = document.createElement("input");
        input.type = "number";
        input.id = `MUL${letter}_${r}_${c}`;
        input.placeholder = "0";
        input.className =
          "w-full min-w-[44px] py-2 px-1 border-[1.5px] border-slate-200 rounded-xl text-center font-mono text-sm bg-white tabular-nums transition-all " +
          "hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";
        input.setAttribute("aria-label", `Matriz ${letter}, fila ${r + 1}, columna ${c + 1}`);
        grid.appendChild(input);
      }
    }
    card.appendChild(grid);
    wrap.appendChild(card);
  }

  // Conecta los escalares a la vista previa
  wrap.querySelectorAll('input[id^="mulScal_"]').forEach((el) => {
    el.addEventListener("input", updateMulPreview);
  });

  updateMulPreview();
}

// Lee la matriz de multiplicaciÃ³n por letra
function readMulMatrix(letter, rows, cols) {
  const m = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(makeFrac(parseFloat($(`MUL${letter}_${r}_${c}`).value) || 0));
    }
    m.push(row);
  }
  return m;
}

// Lee el escalar de una matriz de multiplicaciÃ³n (por defecto 1)
function mulScalar(letter) {
  const el = $(`mulScal_${letter}`);
  if (!el) return 1;
  const v = parseFloat(el.value);
  return isNaN(v) ? 1 : v;
}

// Texto del producto con escalares, ej. "4A Ã— 2B Ã— C"
function mulPreviewText() {
  return COMB_LETTERS.slice(0, mulCount)
    .map((letter) => {
      const s = mulScalar(letter);
      const coef = s === 1 ? "" : s === -1 ? "âˆ’" : `${s}`;
      return `${coef}${letter}`;
    })
    .join(" Ã— ");
}

function updateMulPreview() {
  const el = $("mulPreview");
  if (el) el.textContent = mulPreviewText();
}

let lastMulResult = null;

$("buildMul").addEventListener("click", () => {
  let count = parseInt($("numMulMatrices").value, 10);
  if (isNaN(count) || count < 2) count = 2;
  if (count > 6) { alert("El mÃ¡ximo es 6 matrices (Aâ€“F)."); count = 6; }
  $("numMulMatrices").value = count;

  buildMulDims(count);
  buildMulGrids(count);
  $("resultMatrix").innerHTML = "";
  $("stepsMul").innerHTML = "";
  lastMulResult = null;
});

$("mulDims").addEventListener("change", () => {
  buildMulGrids(mulCount);
});

$("mulRun").addEventListener("click", () => {
  if (!$("MULA_0_0")) {
    showMatrixResult("AtenciÃ³n", "<p class='text-sm text-slate-600'>Primero genera las matrices con el botÃ³n <em>Generar</em>.</p>", true);
    return;
  }

  const mats = [];
  for (let m = 0; m < mulCount; m++) {
    const letter = COMB_LETTERS[m];
    const { rows, cols } = mulSizes[m];
    const scalar = mulScalar(letter);
    mats.push({ letter, rows, cols, scalar, M: readMulMatrix(letter, rows, cols) });
  }

  // Valida compatibilidad en cadena: cols[i] === rows[i+1]
  for (let i = 0; i < mats.length - 1; i++) {
    if (mats[i].cols !== mats[i + 1].rows) {
      showMatrixResult("Dimensiones Incompatibles",
        `<p class="text-sm text-rose-600 font-medium">No se puede multiplicar <strong>${mats[i].letter} Ã— ${mats[i + 1].letter}</strong>: las columnas de ${mats[i].letter} (${mats[i].cols}) deben igualar las filas de ${mats[i + 1].letter} (${mats[i + 1].rows}).</p>`,
        true);
      return;
    }
  }

  const steps = [];

  // 1) Aplica el escalar a cada matriz que lo tenga (â‰  1)
  mats.forEach((mat) => {
    if (mat.scalar !== 1) {
      const k = makeFrac(mat.scalar);
      mat.M = matScaleFrac(mat.M, k);
      steps.push({
        desc: `${fToStr(k)}Â·${mat.letter} (multiplicamos toda la matriz ${mat.letter} por ${fToStr(k)})`,
        matrix: mat.M,
      });
    }
  });

  // 2) Multiplica de izquierda a derecha
  let acc = mats[0].M;
  let accLabel = mats[0].scalar === 1 ? mats[0].letter : `(${fToStr(makeFrac(mats[0].scalar))}${mats[0].letter})`;

  for (let i = 1; i < mats.length; i++) {
    const next = mats[i];
    acc = matMulFrac(acc, next.M);
    const nextLabel = next.scalar === 1 ? next.letter : `(${fToStr(makeFrac(next.scalar))}${next.letter})`;
    accLabel = `${accLabel} Ã— ${nextLabel}`;
    steps.push({ desc: `${accLabel}`, matrix: acc });
  }

  lastMulResult = { result: acc, steps, expr: mulPreviewText() };

  showMatrixResult(`Resultado de ${mulPreviewText()}`, renderMatrixFrac(acc));
  renderMulSteps(lastMulResult);
});

// Paso a paso de multiplicaciÃ³n
function renderMulSteps(data) {
  const box = $("stepsMul");
  if (!$("showStepsMul").checked || !data) {
    box.innerHTML = "";
    return;
  }

  const items = data.steps
    .map(
      (s, i) => `
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-x-auto transition-all hover:border-slate-300">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">Producto</span>
          <span class="text-xs font-semibold text-slate-400">Paso ${i + 1} de ${data.steps.length}</span>
        </div>
        <p class="text-sm font-medium text-slate-800">OperaciÃ³n parcial: <span class="font-mono font-bold text-indigo-600">${s.desc}</span></p>
        ${renderMatrixFrac(s.matrix)}
      </div>`
    )
    .join("");

  box.innerHTML = `
    <div class="flex items-center justify-between mb-3.5">
      <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
        <svg width="20" height="20" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Procedimiento de la MultiplicaciÃ³n en Cadena
      </h4>
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">${data.steps.length} pasos</span>
    </div>
    <div class="flex flex-col gap-3.5">${items}</div>`;
}

$("showStepsMul").addEventListener("change", () => {
  if (lastMulResult) renderMulSteps(lastMulResult);
});

$("clearMul").addEventListener("click", () => {
  document.querySelectorAll("#mulGrids input").forEach((i) => (i.value = ""));
  $("resultMatrix").innerHTML = "";
  $("stepsMul").innerHTML = "";
  lastMulResult = null;
});

/* ============================================================
   MODO: COMBINACIÃ“N LINEAL  (n matrices, ej. 4A âˆ’ 5B + C)
   ============================================================ */
let combCount = 2;
let combRows = 2;
let combCols = 2;
const COMB_LETTERS = ["A", "B", "C", "D", "E", "F"];

// Genera las cuadrÃ­culas de las n matrices con dimensiones comunes
function buildCombineGrids(count, rows, cols) {
  combCount = count;
  combRows = rows;
  combCols = cols;

  const wrap = $("combineGrids");
  wrap.innerHTML = "";

  for (let m = 0; m < count; m++) {
    const letter = COMB_LETTERS[m];
    const card = document.createElement("div");
    card.className = "bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow";

    // Encabezado: escalar Â· Matriz X
    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-4 pb-3 border-b border-slate-100";
    header.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">${letter}</span>
        <div>
          <h3 class="text-base font-bold text-slate-800">Matriz ${letter}</h3>
          <span class="text-[11px] font-mono text-slate-400 font-semibold">${rows} Ã— ${cols}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
        <label for="scal_${letter}" class="text-xs font-semibold text-slate-500">Escalar:</label>
        <input type="number" id="scal_${letter}" value="1" step="any"
          class="w-14 py-1 px-1.5 border border-slate-200 rounded-lg text-center text-sm font-mono font-bold bg-white
                 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          aria-label="Escalar de la matriz ${letter}" />
      </div>`;
    card.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid gap-2";
    grid.id = `gridM${letter}`;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const input = document.createElement("input");
        input.type = "number";
        input.id = `M${letter}_${r}_${c}`;
        input.placeholder = "0";
        input.className =
          "w-full min-w-[44px] py-2 px-1 border-[1.5px] border-slate-200 rounded-xl text-center font-mono text-sm bg-white tabular-nums transition-all " +
          "hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";
        input.setAttribute("aria-label", `Matriz ${letter}, fila ${r + 1}, columna ${c + 1}`);
        grid.appendChild(input);
      }
    }
    card.appendChild(grid);

    // Selector de operador entre esta matriz y la siguiente (no en la Ãºltima)
    if (m < count - 1) {
      const opWrap = document.createElement("div");
      opWrap.className = "flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 mt-4";
      opWrap.innerHTML = `
        <label for="op_${m}" class="text-xs font-semibold text-slate-600">Operador siguiente:</label>
        <select id="op_${m}"
          class="py-1 px-3 border border-slate-200 rounded-lg text-sm font-bold bg-white text-indigo-600
                 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm">
          <option value="+">+ (Suma)</option>
          <option value="-">âˆ’ (Resta)</option>
        </select>`;
      card.appendChild(opWrap);
    }

    wrap.appendChild(card);
  }

  wrap.querySelectorAll('input[id^="scal_"], select[id^="op_"]').forEach((el) => {
    el.addEventListener("input", updateCombPreview);
    el.addEventListener("change", updateCombPreview);
  });
  updateCombPreview();
}

function readCombExpr() {
  const terms = [];
  for (let m = 0; m < combCount; m++) {
    const letter = COMB_LETTERS[m];
    const scalar = parseFloat($(`scal_${letter}`).value);
    const opBefore = m === 0 ? "+" : $(`op_${m - 1}`).value;
    terms.push({ scalar: isNaN(scalar) ? 0 : scalar, letter, opBefore });
  }
  return terms;
}

function combExprText() {
  const terms = readCombExpr();
  return terms
    .map((t, i) => {
      const coef = t.scalar === 1 ? "" : t.scalar === -1 ? "âˆ’" : `${t.scalar}`;
      const term = `${coef}${t.letter}`;
      if (i === 0) return term;
      return `${t.opBefore === "-" ? "âˆ’" : "+"} ${term}`;
    })
    .join(" ");
}

function updateCombPreview() {
  const el = $("combPreview");
  if (el) el.textContent = combExprText();
}

function readCombMatrix(letter) {
  const m = [];
  for (let r = 0; r < combRows; r++) {
    const row = [];
    for (let c = 0; c < combCols; c++) {
      row.push(makeFrac(parseFloat($(`M${letter}_${r}_${c}`).value) || 0));
    }
    m.push(row);
  }
  return m;
}

function matScaleFrac(M, k) {
  return M.map((row) => row.map((f) => fMul(f, k)));
}

let lastCombResult = null;

$("buildCombine").addEventListener("click", () => {
  let count = parseInt($("numMatrices").value, 10);
  let rows = parseInt($("combRows").value, 10);
  let cols = parseInt($("combCols").value, 10);

  if (isNaN(count) || count < 2) count = 2;
  if (count > 6) { alert("El mÃ¡ximo es 6 matrices (Aâ€“F)."); count = 6; }
  if (isNaN(rows) || rows < 1) rows = 1;
  if (rows > 8) rows = 8;
  if (isNaN(cols) || cols < 1) cols = 1;
  if (cols > 8) cols = 8;

  $("numMatrices").value = count;
  $("combRows").value = rows;
  $("combCols").value = cols;

  buildCombineGrids(count, rows, cols);
  $("resultMatrix").innerHTML = "";
  $("stepsCombine").innerHTML = "";
  lastCombResult = null;
});

$("combineRun").addEventListener("click", () => {
  if (!$("MA_0_0")) {
    showMatrixResult("AtenciÃ³n", "<p class='text-sm text-slate-600'>Primero genera las matrices con el botÃ³n <em>Generar</em>.</p>", true);
    return;
  }

  const terms = readCombExpr();
  const exprText = combExprText();

  const steps = [];
  let acc = null;

  for (const t of terms) {
    const M = readCombMatrix(t.letter);
    const sign = t.opBefore === "-" ? -1 : 1;
    const k = makeFrac(sign * t.scalar);
    const scaled = matScaleFrac(M, k);

    steps.push({ desc: `${fToStr(k)}Â·${t.letter}`, matrix: scaled });

    acc = acc === null ? scaled : matAddFrac(acc, scaled);
  }

  lastCombResult = { result: acc, steps, expr: exprText };

  showMatrixResult(`Resultado de ${exprText}`, renderMatrixFrac(acc));
  renderCombineSteps(lastCombResult);
});

function renderCombineSteps(data) {
  const box = $("stepsCombine");
  if (!$("showStepsCombine").checked || !data) {
    box.innerHTML = "";
    return;
  }

  const termItems = data.steps
    .map(
      (s, i) => `
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-x-auto transition-all hover:border-slate-300">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">Escalamiento</span>
          <span class="text-xs font-semibold text-slate-400">Paso ${i + 1}</span>
        </div>
        <p class="text-sm font-medium text-slate-800">Calculamos el tÃ©rmino <span class="font-mono font-bold text-indigo-600">${s.desc}</span> (multiplicamos cada elemento por su escalar).</p>
        ${renderMatrixFrac(s.matrix)}
      </div>`
    )
    .join("");

  const finalItem = `
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-x-auto transition-all hover:border-slate-300">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border bg-teal-50 text-teal-700 border-teal-200">Suma Total</span>
        <span class="text-xs font-semibold text-slate-400">Paso ${data.steps.length + 1}</span>
      </div>
      <p class="text-sm font-medium text-slate-800">Sumamos y restamos todos los tÃ©rminos elemento a elemento.</p>
      ${renderMatrixFrac(data.result)}
    </div>`;

  box.innerHTML = `
    <div class="flex items-center justify-between mb-3.5">
      <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
        <svg width="20" height="20" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Procedimiento de la CombinaciÃ³n Lineal
      </h4>
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">${data.steps.length + 1} pasos</span>
    </div>
    <div class="flex flex-col gap-3.5">${termItems}${finalItem}</div>`;
}

$("showStepsCombine").addEventListener("change", () => {
  if (lastCombResult) renderCombineSteps(lastCombResult);
});

$("clearCombine").addEventListener("click", () => {
  document.querySelectorAll("#combineGrids input").forEach((i) => (i.value = ""));
  $("resultMatrix").innerHTML = "";
  $("stepsCombine").innerHTML = "";
  lastCombResult = null;
});

/* ============================================================
   SELECTOR DE MODO DE MATRICES
   ============================================================ */
const modeBtns = document.querySelectorAll(".mode-btn");
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("mode-btn--active"));
    btn.classList.add("mode-btn--active");

    const mode = btn.dataset.mode;
    $("mode-solve").classList.toggle("hidden", mode !== "solve");
    $("mode-combine").classList.toggle("hidden", mode !== "combine");
    $("mode-mul").classList.toggle("hidden", mode !== "mul");

    // Limpia resultados al cambiar de modo
    $("resultMatrix").innerHTML = "";
    if (mode !== "solve") $("stepsMatrix").innerHTML = "";
    if (mode !== "combine") $("stepsCombine").innerHTML = "";
  });
});

/* ---------- InicializaciÃ³n ---------- */
window.addEventListener("DOMContentLoaded", () => {
  buildLinearGrid(3);
  buildSolveGrid(3);
  buildCombineGrids(2, 2, 2);
  buildMulDims(2);
  buildMulGrids(2);
});



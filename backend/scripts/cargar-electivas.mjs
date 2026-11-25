// Carga las electivas de una regional (archivo JSON) en Supabase.
// Uso, desde la carpeta backend: npm run cargar-electivas -- planes/utn-isi-2023-frc-electivas.json
// Antes tiene que estar cargado el plan base (npm run cargar-plan).
// Se puede correr las veces que haga falta: actualiza lo que ya existe.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Falta el archivo. Ejemplo: npm run cargar-electivas -- planes/utn-isi-2023-frc-electivas.json");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const clave = process.env.SUPABASE_SECRET_KEY;
if (!url || !clave) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en backend/.env");
  process.exit(1);
}

const db = createClient(url, clave, { auth: { persistSession: false } });
const {
  plan_id: planId,
  regional_id: regionalId,
  creditos_requeridos: creditosRequeridos,
  unidad = "creditos",
  electivas,
} = JSON.parse(await readFile(archivo, "utf8"));
const idDe = (numero) => `${planId}-${String(numero).padStart(2, "0")}`;

// ---------- Revisión del archivo antes de cargar ----------
const { data: base, error: errorBase } = await db
  .from("materias")
  .select("numero")
  .eq("plan_id", planId)
  .eq("tipo", "obligatoria");
if (errorBase) {
  console.error(`No pudimos leer el plan ${planId}: ${errorBase.message}`);
  process.exit(1);
}
if (!base.length) {
  console.error(`El plan ${planId} no está cargado. Corré primero: npm run cargar-plan`);
  process.exit(1);
}

const numerosBase = new Set(base.map((m) => m.numero));
const numerosElectivas = new Set();
const errores = [];

// Créditos u horas; con medios como mucho (1,5 sí, 1,3 no).
if (!["creditos", "horas"].includes(unidad)) errores.push(`La unidad "${unidad}" no existe (creditos u horas)`);
const valeCantidad = (n) => typeof n === "number" && n >= 0.5 && n <= 99 && Number.isInteger(n * 2);
if (creditosRequeridos != null && !valeCantidad(creditosRequeridos)) {
  errores.push(`creditos_requeridos (${creditosRequeridos}) tiene que ir de medio en medio`);
}

for (const e of electivas) {
  if (numerosElectivas.has(e.numero)) errores.push(`La electiva ${e.numero} está repetida`);
  numerosElectivas.add(e.numero);
}
for (const e of electivas) {
  if (numerosBase.has(e.numero)) {
    errores.push(`${e.nombre} usa el número ${e.numero}, que ya es una materia del plan`);
  }
  for (const n of [...e.regulares, ...e.aprobadas]) {
    if (!numerosBase.has(n) && !numerosElectivas.has(n)) errores.push(`${e.nombre} pide la materia ${n}, que no existe`);
  }
  if (e.creditos != null && !valeCantidad(e.creditos)) {
    errores.push(`${e.nombre} tiene ${e.creditos} créditos: tiene que ir de medio en medio`);
  }
  const ambas = e.regulares.filter((n) => e.aprobadas.includes(n));
  if (ambas.length) errores.push(`${e.nombre} pide ${ambas.join(", ")} como regular y como aprobada`);
}
if (errores.length) {
  console.error("El archivo tiene errores, no se cargó nada:\n- " + errores.join("\n- "));
  process.exit(1);
}

// ---------- Carga ----------
const { error: errorMaterias } = await db.from("materias").upsert(
  electivas.map((e) => ({
    id: idDe(e.numero),
    plan_id: planId,
    numero: e.numero,
    nombre: e.nombre,
    nivel: e.nivel,
    tipo: "electiva",
    integradora: false,
    regional_id: regionalId,
    creditos: e.creditos ?? null,
    se_dicta: e.se_dicta ?? true,
  }))
);
if (errorMaterias) {
  console.error(`Error al guardar las electivas: ${errorMaterias.message}`);
  process.exit(1);
}
console.log(`✓ electivas: ${electivas.length}`);

const ids = electivas.map((e) => idDe(e.numero));
const { error: errorBorrado } = await db.from("correlativas").delete().in("materia_id", ids);
if (errorBorrado) {
  console.error(`Error al limpiar correlativas: ${errorBorrado.message}`);
  process.exit(1);
}

const correlativas = electivas.flatMap((e) => [
  ...e.regulares.map((n) => ({ materia_id: idDe(e.numero), requiere_id: idDe(n), condicion: "regular" })),
  ...e.aprobadas.map((n) => ({ materia_id: idDe(e.numero), requiere_id: idDe(n), condicion: "aprobada" })),
]);
if (correlativas.length) {
  const { error: errorCorrelativas } = await db.from("correlativas").insert(correlativas);
  if (errorCorrelativas) {
    console.error(`Error al guardar correlativas: ${errorCorrelativas.message}`);
    process.exit(1);
  }
}
console.log(`✓ correlativas de electivas: ${correlativas.length}`);

// En qué unidad cuenta el plan sus electivas y cuántas pide para recibirse (si ya lo sabemos).
const cambiosPlan = { unidad_electivas: unidad };
if (creditosRequeridos) cambiosPlan.creditos_electivas = creditosRequeridos;
const { error: errorPlan } = await db.from("planes").update(cambiosPlan).eq("id", planId);
if (errorPlan) {
  console.error(`Error al guardar los datos del plan: ${errorPlan.message}`);
  process.exit(1);
}
const palabra = unidad === "horas" ? "horas" : "créditos";
console.log(`✓ electivas en ${palabra}${creditosRequeridos ? `: se piden ${creditosRequeridos}` : ""}`);

const aVerificar = electivas.filter((e) => e.verificar);
if (aVerificar.length) {
  console.log("\nPara revisar en la etapa de verificación:");
  for (const e of aVerificar) console.log(`- ${e.nombre}: ${e.verificar}`);
}

console.log(`\nListo: electivas de ${regionalId} cargadas.`);
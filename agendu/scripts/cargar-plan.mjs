// Carga un plan de estudios (archivo JSON) en Supabase.
// Uso: node --env-file=.env.local scripts/cargar-plan.mjs data/planes/utn-isi-2023.json
// Necesita en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.
// Se puede correr las veces que haga falta: actualiza lo que ya existe.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Falta el archivo. Ejemplo: node --env-file=.env.local scripts/cargar-plan.mjs data/planes/utn-isi-2023.json");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clave = process.env.SUPABASE_SECRET_KEY;
if (!url || !clave) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}

const db = createClient(url, clave, { auth: { persistSession: false } });
const datos = JSON.parse(await readFile(archivo, "utf8"));
const { universidad, carrera, plan, regionales, materias } = datos;

// ---------- Revisión del archivo antes de cargar ----------
const errores = [];
const idDe = new Map();
for (const m of materias) {
  if (idDe.has(m.numero)) errores.push(`La materia ${m.numero} está repetida`);
  idDe.set(m.numero, `${plan.id}-${String(m.numero).padStart(2, "0")}`);
}
for (const m of materias) {
  for (const n of [...m.regulares, ...m.aprobadas]) {
    if (!idDe.has(n)) errores.push(`${m.nombre} pide la materia ${n}, que no existe en el plan`);
    if (n === m.numero) errores.push(`${m.nombre} se pide a sí misma como correlativa`);
  }
  const ambas = m.regulares.filter((n) => m.aprobadas.includes(n));
  if (ambas.length) errores.push(`${m.nombre} pide ${ambas.join(", ")} como regular y como aprobada`);
}
if (errores.length) {
  console.error("El archivo tiene errores, no se cargó nada:\n- " + errores.join("\n- "));
  process.exit(1);
}

// ---------- Carga ----------
async function guardar(tabla, filas) {
  if (!filas.length) return;
  const { error } = await db.from(tabla).upsert(filas);
  if (error) {
    console.error(`Error al guardar en ${tabla}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ ${tabla}: ${filas.length}`);
}

await guardar("universidades", [universidad]);
await guardar("regionales", regionales.map((r) => ({ ...r, universidad_id: universidad.id })));
await guardar("carreras", [{ ...carrera, universidad_id: universidad.id }]);
await guardar("planes", [{
  id: plan.id,
  carrera_id: carrera.id,
  nombre: plan.nombre,
  anio: plan.anio,
  ordenanzas: plan.ordenanzas,
  horas_electivas: plan.horas_electivas,
}]);
await guardar("planes_regionales", regionales.map((r) => ({ plan_id: plan.id, regional_id: r.id })));
await guardar("materias", materias.map((m) => ({
  id: idDe.get(m.numero),
  plan_id: plan.id,
  numero: m.numero,
  nombre: m.nombre,
  nivel: m.nivel,
  integradora: Boolean(m.integradora),
})));

// Las correlativas se reemplazan enteras, así una corrección en el archivo borra lo viejo.
const ids = [...idDe.values()];
const { error: errorBorrado } = await db.from("correlativas").delete().in("materia_id", ids);
if (errorBorrado) {
  console.error(`Error al limpiar correlativas: ${errorBorrado.message}`);
  process.exit(1);
}
const correlativas = materias.flatMap((m) => [
  ...m.regulares.map((n) => ({ materia_id: idDe.get(m.numero), requiere_id: idDe.get(n), condicion: "regular" })),
  ...m.aprobadas.map((n) => ({ materia_id: idDe.get(m.numero), requiere_id: idDe.get(n), condicion: "aprobada" })),
]);
await guardar("correlativas", correlativas);

console.log(`\nListo: ${plan.nombre} de ${carrera.nombre} cargado.`);

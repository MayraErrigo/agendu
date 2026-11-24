// Carga el año y el cuatrimestre en que una regional dicta cada materia de un plan (archivo JSON).
// La ordenanza fija las materias y las correlativas; cada regional puede cambiar el año y si es anual o cuatrimestral.
// Uso, desde la carpeta backend: node --env-file=.env scripts/cargar-dictado.mjs planes/utn-iq-2023-frc-dictado.json
// Antes tienen que estar cargados el plan y las electivas de esa regional.
// Se puede correr las veces que haga falta: actualiza lo que ya existe.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Falta el archivo. Ejemplo: node --env-file=.env scripts/cargar-dictado.mjs planes/utn-iq-2023-frc-dictado.json");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const clave = process.env.SUPABASE_SECRET_KEY;
if (!url || !clave) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en backend/.env");
  process.exit(1);
}

const db = createClient(url, clave, { auth: { persistSession: false } });
const { plan_id: planId, regional_id: regionalId, materias } = JSON.parse(await readFile(archivo, "utf8"));
const idDe = (numero) => `${planId}-${String(numero).padStart(2, "0")}`;
// anual · 1c · 2c · 1c-2c / 2c-1c (se puede cursar en cualquiera de los dos; el primero es el principal)
const DICTADOS = ["anual", "1c", "2c", "1c-2c", "2c-1c"];

// ---------- Revisión del archivo antes de cargar ----------
const { data: existentes, error: errorLectura } = await db.from("materias").select("id").eq("plan_id", planId);
if (errorLectura) {
  console.error(`No pudimos leer el plan ${planId}: ${errorLectura.message}`);
  process.exit(1);
}
const ids = new Set(existentes.map((m) => m.id));
const errores = [];
const vistos = new Set();
// Cada materia se indica por su número en el plan o, si no sigue ese formato (como el Seminario), por su id.
const idDeFila = (m) => m.id ?? idDe(m.numero);
for (const m of materias) {
  const id = idDeFila(m);
  if (vistos.has(id)) errores.push(`La materia ${id} está repetida`);
  vistos.add(id);
  if (!ids.has(id)) errores.push(`La materia ${id} no está cargada en ${planId}`);
  if (!Number.isInteger(m.nivel) || m.nivel < 1 || m.nivel > 6) errores.push(`La materia ${id} tiene un año inválido`);
  if (!DICTADOS.includes(m.dictado)) errores.push(`La materia ${id} tiene un dictado inválido (${DICTADOS.join(", ")})`);
}
if (errores.length) {
  console.error("El archivo tiene errores, no se cargó nada:\n- " + errores.join("\n- "));
  process.exit(1);
}

// ---------- Carga ----------
const { error } = await db.from("materias_regionales").upsert(
  materias.map((m) => ({ materia_id: idDeFila(m), regional_id: regionalId, nivel: m.nivel, dictado: m.dictado }))
);
if (error) {
  console.error(`Error al guardar: ${error.message}`);
  process.exit(1);
}
console.log(`✓ año y cuatrimestre en ${regionalId}: ${materias.length} materias`);
console.log(`\nListo: dictado de ${planId} en ${regionalId} cargado.`);
// Pruebas de la lógica de correlativas con el plan real de Sistemas 2023.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  faltantesParaCursar,
  faltantesParaRendir,
  habilita,
  indexarCorrelativas,
  puedeRendir,
  requisitos,
  resumen,
  situacion,
} from "../src/lib/logica/correlativas.ts";

// Armamos las correlativas tal como quedan en la base, a partir del archivo del plan.
const plan = JSON.parse(
  await readFile(new URL("../../backend/planes/utn-isi-2023.json", import.meta.url), "utf8")
);
const id = (n) => `utn-isi-2023-${String(n).padStart(2, "0")}`;
const correlativas = plan.materias.flatMap((m) => [
  ...m.regulares.map((n) => ({ materia_id: id(m.numero), requiere_id: id(n), condicion: "regular" })),
  ...m.aprobadas.map((n) => ({ materia_id: id(m.numero), requiere_id: id(n), condicion: "aprobada" })),
]);
const todas = plan.materias.map((m) => id(m.numero));
const indice = indexarCorrelativas(correlativas);

// Atajo para armar el avance: { 1: "aprobada", 9: "regular" }
const avance = (porNumero) =>
  Object.fromEntries(Object.entries(porNumero).map(([n, estado]) => [id(Number(n)), estado]));

test("un alumno que recién empieza puede cursar todo 1er año e Ingeniería y Sociedad", () => {
  const { podesCursar } = resumen(todas, correlativas, {});
  assert.deepEqual(podesCursar.sort(), [1, 2, 3, 4, 5, 6, 7, 8, 11].map(id).sort());
});

test("Análisis Matemático II pide AM I y Álgebra regulares para cursar", () => {
  assert.equal(situacion(id(9), indice, avance({ 1: "regular" })), "bloqueada");
  assert.deepEqual(faltantesParaCursar(id(9), indice, avance({ 1: "regular" })), [
    { materiaId: id(2), necesita: "regular" },
  ]);
  assert.equal(situacion(id(9), indice, avance({ 1: "regular", 2: "aprobada" })), "disponible");
});

test("Economía pide AM I y Álgebra aprobadas: con regulares no alcanza", () => {
  assert.equal(situacion(id(18), indice, avance({ 1: "regular", 2: "regular" })), "bloqueada");
  assert.equal(situacion(id(18), indice, avance({ 1: "aprobada", 2: "aprobada" })), "disponible");
});

test("para rendir un final hay que tener la materia regular y todas las correlativas aprobadas", () => {
  const conCorrelativasRegulares = avance({ 1: "regular", 2: "aprobada", 9: "regular" });
  assert.equal(puedeRendir(id(9), indice, conCorrelativasRegulares), false);
  assert.deepEqual(faltantesParaRendir(id(9), indice, conCorrelativasRegulares), [
    { materiaId: id(1), necesita: "aprobada" },
  ]);
  assert.equal(puedeRendir(id(9), indice, avance({ 1: "aprobada", 2: "aprobada", 9: "regular" })), true);
});

test("una materia que se está cursando no se puede rendir todavía", () => {
  assert.equal(puedeRendir(id(9), indice, avance({ 1: "aprobada", 2: "aprobada", 9: "cursando" })), false);
});

test("las materias ya hechas muestran su estado, no 'disponible'", () => {
  assert.equal(situacion(id(1), indice, avance({ 1: "aprobada" })), "aprobada");
  assert.equal(situacion(id(14), indice, avance({ 14: "regular" })), "regular");
  assert.equal(situacion(id(15), indice, avance({ 15: "cursando" })), "cursando");
});

test("Análisis Matemático II habilita Análisis Numérico, Simulación y Tecnologías para la Automatización", () => {
  assert.deepEqual(habilita(id(9), correlativas).sort(), [id(22), id(28), id(29)].sort());
});

test("Proyecto Final queda bloqueado hasta cumplir todas sus correlativas", () => {
  assert.equal(situacion(id(36), indice, {}), "bloqueada");
  const listo = avance({ 25: "regular", 26: "regular", 30: "regular", 12: "aprobada", 20: "aprobada", 23: "aprobada" });
  assert.equal(situacion(id(36), indice, listo), "disponible");
});

test("la ficha muestra cada correlativa con lo que pide y si se cumple", () => {
  const lista = requisitos(id(9), indice, avance({ 1: "aprobada", 2: "regular" }));
  assert.deepEqual(lista, [
    { materiaId: id(1), condicion: "regular", cumpleParaCursar: true, aprobada: true },
    { materiaId: id(2), condicion: "regular", cumpleParaCursar: true, aprobada: false },
  ]);
});
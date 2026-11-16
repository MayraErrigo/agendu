// Pruebas del cálculo de avance (porcentaje, créditos y promedio).
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularAvance } from "../src/lib/logica/avance.ts";

const materias = [
  { id: "a", tipo: "obligatoria", creditos: null },
  { id: "b", tipo: "obligatoria", creditos: null },
  { id: "c", tipo: "obligatoria", creditos: null },
  { id: "d", tipo: "obligatoria", creditos: null },
  { id: "e1", tipo: "electiva", creditos: 4 },
  { id: "e2", tipo: "electiva", creditos: 3 },
  { id: "e3", tipo: "electiva", creditos: 3 },
];

test("sin avance: 0% y todas las obligatorias por hacer", () => {
  const a = calcularAvance(materias, {}, {}, 20);
  assert.equal(a.porcentaje, 0);
  assert.equal(a.faltan, 4);
  assert.equal(a.creditosAprobados, 0);
  assert.equal(a.promedio, null);
});

test("el porcentaje cuenta solo obligatorias aprobadas", () => {
  const a = calcularAvance(materias, { a: "aprobada", b: "regular", e1: "aprobada" }, {}, 20);
  assert.equal(a.obligatoriasAprobadas, 1);
  assert.equal(a.porcentaje, 25);
  assert.equal(a.regulares, 1);
  assert.equal(a.faltan, 3);
});

test("los créditos suman solo electivas aprobadas", () => {
  const a = calcularAvance(materias, { e1: "aprobada", e2: "regular", e3: "aprobada" }, {}, 20);
  assert.equal(a.electivasAprobadas, 2);
  assert.equal(a.creditosAprobados, 7);
  assert.equal(a.creditosRequeridos, 20);
});

test("el promedio usa las notas de las materias aprobadas", () => {
  const a = calcularAvance(
    materias,
    { a: "aprobada", b: "aprobada", c: "regular" },
    { a: 8, b: 7, c: 4 },
    20
  );
  assert.equal(a.promedio, 7.5);
});
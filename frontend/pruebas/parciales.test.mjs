// Pruebas del resumen de parciales (regularidad, promoción práctica, aprobación directa y recuperatorios).
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { resumirParciales } from "../src/lib/logica/parciales.ts";

const ev = (nota, recuperatorio = null) => ({ fecha: null, nota, recuperatorio });
// Mínimo 6 en cada parcial, promoción práctica con promedio 7, aprobación directa con promedio 8.
const base = { cantidad: 2, tieneTp: false, minimo: 6, practica: 7, directa: 8, tp: ev(null) };

test("sin notas cargadas", () => {
  const r = resumirParciales({ ...base, parciales: [ev(null), ev(null)] });
  assert.equal(r.situacion, "sin_notas");
  assert.equal(r.total, 2);
});

test("con un 9 y un parcial por rendir, va con aprobación directa", () => {
  const r = resumirParciales({ ...base, parciales: [ev(9), ev(null)] });
  assert.equal(r.situacion, "directa_en_curso");
  assert.equal(r.cargadas, 1);
});

test("promedio igual a la nota de aprobación directa: aprueba (igual o mayor)", () => {
  const r = resumirParciales({ ...base, parciales: [ev(7), ev(9)] });
  assert.equal(r.promedio, 8);
  assert.equal(r.situacion, "aprobacion_directa");
});

test("promedio 7: promoción práctica", () => {
  const r = resumirParciales({ ...base, parciales: [ev(6), ev(8)] });
  assert.equal(r.situacion, "promocion_practica");
});

test("promedio 6,5: regular", () => {
  const r = resumirParciales({ ...base, parciales: [ev(6), ev(7)] });
  assert.equal(r.situacion, "regularizo");
});

test("un parcial por debajo del mínimo hay que recuperarlo, aunque el promedio sea alto", () => {
  const r = resumirParciales({ ...base, parciales: [ev(10), ev(5)] });
  assert.equal(r.situacion, "a_recuperar");
  assert.deepEqual(r.aRecuperar, ["2do parcial"]);
});

test("el recuperatorio reemplaza la nota y permite promocionar", () => {
  const r = resumirParciales({ ...base, parciales: [ev(9), ev(4, 8)] });
  assert.equal(r.promedio, 8.5);
  assert.equal(r.situacion, "aprobacion_directa");
});

test("recuperó y no llegó al mínimo: libre", () => {
  const r = resumirParciales({ ...base, parciales: [ev(9), ev(4, 5)] });
  assert.equal(r.situacion, "libre");
});

test("materia sin promoción: solo regulariza", () => {
  const r = resumirParciales({ ...base, practica: null, directa: null, parciales: [ev(10), ev(10)] });
  assert.equal(r.situacion, "regularizo");
});

test("el TP integrador también cuenta", () => {
  const r = resumirParciales({ ...base, tieneTp: true, tp: ev(null), parciales: [ev(9), ev(8)] });
  assert.equal(r.situacion, "directa_en_curso");
  assert.equal(r.total, 3);
});

test("sin condiciones cargadas solo da el promedio", () => {
  const r = resumirParciales({ ...base, minimo: null, practica: null, directa: null, parciales: [ev(5), ev(7)] });
  assert.equal(r.situacion, "completo");
  assert.equal(r.promedio, 6);
});
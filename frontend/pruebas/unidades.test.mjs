// Pruebas de cómo se muestran los créditos y las horas de las electivas.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { cantidad, leerCantidad, nombreUnidad, numero, unidadDe } from "../src/lib/logica/unidades.ts";

test("si la base no dice horas, son créditos", () => {
  assert.equal(unidadDe("horas"), "horas");
  assert.equal(unidadDe("creditos"), "creditos");
  assert.equal(unidadDe(undefined), "creditos");
  assert.equal(unidadDe(null), "creditos");
});

test("los medios se muestran con coma", () => {
  assert.equal(numero(1.5), "1,5");
  assert.equal(numero(2), "2");
  assert.equal(numero(22), "22");
});

test("singular y plural en cada unidad", () => {
  assert.equal(cantidad(1, "creditos"), "1 crédito");
  assert.equal(cantidad(4, "creditos"), "4 créditos");
  assert.equal(cantidad(1, "horas"), "1 hora");
  assert.equal(cantidad(1.5, "horas"), "1,5 horas");
  assert.equal(nombreUnidad("horas"), "Horas");
  assert.equal(nombreUnidad("creditos"), "Créditos");
});

test("lee lo que escribe el alumno", () => {
  assert.equal(leerCantidad("2"), 2);
  assert.equal(leerCantidad("1,5"), 1.5);
  assert.equal(leerCantidad("1.5"), 1.5);
  assert.equal(leerCantidad(" 20 "), 20);
  assert.equal(leerCantidad("0,5"), 0.5);
});

test("rechaza cantidades raras", () => {
  assert.equal(leerCantidad(""), null);
  assert.equal(leerCantidad("0"), null);
  assert.equal(leerCantidad("1,3"), null);
  assert.equal(leerCantidad("21"), null);
  assert.equal(leerCantidad("-2"), null);
  assert.equal(leerCantidad("dos"), null);
  assert.equal(leerCantidad("1,55"), null);
});
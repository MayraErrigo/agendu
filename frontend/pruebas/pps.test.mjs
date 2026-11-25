// Pruebas de la Práctica Profesional Supervisada como requisito.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { buscarProyectoFinal, estadoPpsDe, situacionPps } from "../src/lib/logica/pps.ts";

test("si la base trae algo raro, la PPS está pendiente", () => {
  assert.equal(estadoPpsDe("haciendo"), "haciendo");
  assert.equal(estadoPpsDe("aprobada"), "aprobada");
  assert.equal(estadoPpsDe(undefined), "pendiente");
  assert.equal(estadoPpsDe("cualquiera"), "pendiente");
});

test("encuentra Proyecto Final entre las obligatorias", () => {
  const materias = [
    { id: "a", nombre: "Análisis Matemático I", tipo: "obligatoria" },
    { id: "b", nombre: "Proyecto Final", tipo: "obligatoria" },
  ];
  assert.equal(buscarProyectoFinal(materias)?.id, "b");
});

test("no confunde una electiva con Proyecto Final", () => {
  const materias = [{ id: "e", nombre: "Proyecto Final de algo", tipo: "electiva" }];
  assert.equal(buscarProyectoFinal(materias), null);
});

test("lo que marcó el alumno manda sobre los requisitos", () => {
  assert.equal(situacionPps("aprobada", 5), "aprobada");
  assert.equal(situacionPps("haciendo", 3), "haciendo");
});

test("pendiente: bloqueada si faltan requisitos, disponible si no", () => {
  assert.equal(situacionPps("pendiente", 2), "bloqueada");
  assert.equal(situacionPps("pendiente", 0), "disponible");
});
test("si no sabemos los requisitos, no dice que puede o no puede empezarla", () => {
  assert.equal(situacionPps("pendiente", null), "sin_datos");
  assert.equal(situacionPps("haciendo", null), "haciendo");
});
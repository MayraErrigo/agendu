// Pruebas del estado del calendario conectado: hace cuánto se buscó y cuándo avisar.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { diasDesde, estadoConexion, haceCuanto } from "../src/lib/logica/conexion.ts";

test("cuenta los días en hora de Argentina", () => {
  // 01:00 UTC del 22 = 22:00 del 21 en Argentina: fue ayer
  assert.equal(diasDesde("2026-11-22T01:00:00Z", "2026-11-22"), 1);
  assert.equal(diasDesde("2026-11-22T15:00:00+00:00", "2026-11-22"), 0);
  assert.equal(diasDesde("2026-11-01T15:00:00Z", "2026-11-22"), 21);
});

test("dice hace cuánto con palabras", () => {
  assert.equal(haceCuanto(0), "hoy");
  assert.equal(haceCuanto(1), "ayer");
  assert.equal(haceCuanto(5), "hace 5 días");
});

test("avisa a los 14 días y no antes", () => {
  const base = { origen: "uv", conError: false };
  assert.equal(estadoConexion({ ...base, ultimaBusqueda: "2026-11-09T15:00:00Z" }, "2026-11-22").nivel, "ok");
  assert.equal(estadoConexion({ ...base, ultimaBusqueda: "2026-11-08T15:00:00Z" }, "2026-11-22").nivel, "aviso");
});

test("si el link falla, eso va primero", () => {
  const estado = estadoConexion({ origen: "google", ultimaBusqueda: "2026-11-22T15:00:00Z", conError: true }, "2026-11-22");
  assert.equal(estado.nivel, "error");
  assert.equal(estado.nombre, "Google Calendar");
});
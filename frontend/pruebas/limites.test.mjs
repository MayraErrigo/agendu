// Pruebas de los mensajes de límites de uso.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { mensajeDeLimite } from "../src/lib/logica/limites.ts";

test("traduce cada límite de la base a un mensaje claro", () => {
  assert.match(mensajeDeLimite("limite_tareas"), /1000 tareas/);
  assert.match(mensajeDeLimite("P0001: limite_fechas"), /1500 fechas/);
  assert.match(mensajeDeLimite("limite_materias_propias"), /10 materias agregadas/);
  assert.match(mensajeDeLimite("limite_reportes"), /mañana/);
});

test("los demás errores no son de límites", () => {
  assert.equal(mensajeDeLimite("duplicate key value"), null);
  assert.equal(mensajeDeLimite(null), null);
});
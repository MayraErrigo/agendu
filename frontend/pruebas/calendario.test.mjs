// Pruebas de las cuentas del calendario (semanas, meses y cambios de mes).
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { diasDeSemana, grillaDelMes, moverMes, nombreDelDia, sumarDias } from "../src/lib/logica/calendario.ts";

test("la semana va de lunes a domingo", () => {
  // El jueves 26/11/2026 está en la semana del lunes 23 al domingo 29
  const semana = diasDeSemana("2026-11-26");
  assert.equal(semana[0], "2026-11-23");
  assert.equal(semana[6], "2026-11-29");
});

test("un domingo pertenece a la semana que empezó el lunes anterior", () => {
  assert.equal(diasDeSemana("2026-11-29")[0], "2026-11-23");
});

test("sumar días cruza de mes y de año", () => {
  assert.equal(sumarDias("2026-11-30", 1), "2026-12-01");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
  assert.equal(sumarDias("2026-03-01", -1), "2026-02-28");
});

test("noviembre de 2026 empieza en domingo: 6 huecos antes del 1", () => {
  const grilla = grillaDelMes(2026, 11);
  assert.equal(grilla.slice(0, 6).every((d) => d === null), true);
  assert.equal(grilla[6], "2026-11-01");
  assert.equal(grilla.length, 6 + 30);
});

test("pasar de diciembre a enero cambia de año", () => {
  assert.deepEqual(moverMes(2026, 12, 1), { anio: 2027, mes: 1 });
  assert.deepEqual(moverMes(2026, 1, -1), { anio: 2025, mes: 12 });
});

test("el nombre del día", () => {
  assert.equal(nombreDelDia("2026-11-26"), "Jueves 26");
});
// Pruebas de las fechas importantes (orden, pasadas y cómo se muestran).
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { hoyEnArgentina, partesDeFecha, separarPorFecha } from "../src/lib/logica/fechas.ts";

const item = (id, fecha, hora = null) => ({ id, tipo: "entrega", titulo: id, fecha, hora, origen: "manual" });

test("separa las próximas (hoy incluido) de las que ya pasaron", () => {
  const { proximas, pasadas } = separarPorFecha(
    [item("a", "2026-11-30"), item("b", "2026-11-18"), item("c", "2026-11-23")],
    "2026-11-23"
  );
  assert.deepEqual(proximas.map((i) => i.id), ["c", "a"]);
  assert.deepEqual(pasadas.map((i) => i.id), ["b"]);
});

test("el mismo día, primero las que tienen hora más temprana y al final las sin hora", () => {
  const { proximas } = separarPorFecha(
    [item("sin", "2026-11-26"), item("tarde", "2026-11-26", "18:00"), item("temprano", "2026-11-26", "08:00")],
    "2026-11-01"
  );
  assert.deepEqual(proximas.map((i) => i.id), ["temprano", "tarde", "sin"]);
});

test("las que ya pasaron van de la más reciente a la más vieja", () => {
  const { pasadas } = separarPorFecha([item("vieja", "2026-10-01"), item("reciente", "2026-11-20")], "2026-11-23");
  assert.deepEqual(pasadas.map((i) => i.id), ["reciente", "vieja"]);
});

test("muestra el día de la semana y el número", () => {
  assert.deepEqual(partesDeFecha("2026-11-24"), { dia: "MAR", numero: 24, mes: "nov" });
});

test("hoy se calcula con la hora de Argentina", () => {
  // 1:00 del 24/11 en Londres (UTC) todavía es 23/11 en Argentina
  assert.equal(hoyEnArgentina(new Date("2026-11-24T01:00:00Z")), "2026-11-23");
});
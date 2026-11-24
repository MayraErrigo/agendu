// Pruebas de archivos repetidos en una carpeta.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { buscarRepetido, nombreLibre } from "../src/lib/logica/repetidos.ts";

const carpeta = [
  { id: "a", nombre: "Apunte TP2", extension: "pdf", tamano: 2000 },
  { id: "b", nombre: "Apunte TP2 (2)", extension: "pdf", tamano: 3000 },
  { id: "c", nombre: "Resumen", extension: "docx", tamano: 500 },
];

test("mismo nombre y tamaño: es el mismo archivo, sin importar mayúsculas", () => {
  const r = buscarRepetido("apunte tp2", "PDF", 2000, carpeta);
  assert.equal(r.tipo, "igual");
  assert.equal(r.id, "a");
});

test("mismo nombre y otro tamaño: versión nueva", () => {
  assert.equal(buscarRepetido("Apunte TP2", "pdf", 9999, carpeta).tipo, "nombre");
});

test("otro nombre u otra extensión: no se repite", () => {
  assert.equal(buscarRepetido("Apunte TP3", "pdf", 2000, carpeta), null);
  assert.equal(buscarRepetido("Resumen", "pdf", 500, carpeta), null);
});

test("el nombre libre salta los que ya están usados", () => {
  assert.equal(nombreLibre("Apunte TP2", "pdf", carpeta), "Apunte TP2 (3).pdf");
  assert.equal(nombreLibre("Resumen", "docx", carpeta), "Resumen (2).docx");
});
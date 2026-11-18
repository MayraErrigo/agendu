// Pruebas de las reglas de archivos (tipos permitidos, huellas y tamaños).
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { coincideFirma, extensionDe, formatearTamano, nombreSinExtension } from "../src/lib/logica/archivos.ts";

test("acepta PDF, fotos y Office moderno, sin importar mayúsculas", () => {
  assert.deepEqual(extensionDe("Resumen.PDF"), { extension: "pdf" });
  assert.deepEqual(extensionDe("pizarron.jpeg"), { extension: "jpg" });
  assert.deepEqual(extensionDe("tp.docx"), { extension: "docx" });
});

test("rechaza Office viejo y con macros, con un mensaje que explica qué hacer", () => {
  assert.match(extensionDe("tp.doc").error, /\.docx/);
  assert.match(extensionDe("planilla.xlsm").error, /macros/);
});

test("rechaza programas y archivos sin extensión", () => {
  assert.ok("error" in extensionDe("juego.exe"));
  assert.ok("error" in extensionDe("archivo"));
  assert.ok("error" in extensionDe("dibujo.svg"));
});

test("reconoce un PDF real por su huella", () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
  assert.equal(coincideFirma("pdf", pdf), true);
});

test("detecta un programa renombrado a .pdf", () => {
  const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // así empiezan los .exe
  assert.equal(coincideFirma("pdf", exe), false);
});

test("los Word modernos son zip por dentro", () => {
  const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  assert.equal(coincideFirma("docx", zip), true);
  assert.equal(coincideFirma("pdf", zip), false);
});

test("muestra los tamaños en KB y MB", () => {
  assert.equal(formatearTamano(1536), "2 KB");
  assert.equal(formatearTamano(1.5 * 1024 * 1024), "1,5 MB");
  assert.equal(formatearTamano(50 * 1024 * 1024), "50 MB");
});

test("el nombre se muestra sin la extensión", () => {
  assert.equal(nombreSinExtension("Resumen Unidad 2.pdf"), "Resumen Unidad 2");
  assert.equal(nombreSinExtension(".pdf"), ".pdf");
});
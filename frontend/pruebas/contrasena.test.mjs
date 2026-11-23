// Pruebas de las reglas de contraseñas y de la lectura de la lista de filtradas.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { apareceEnLista, problemaDeContrasena } from "../src/lib/logica/contrasena.ts";

test("pide 8 caracteres, letras y números", () => {
  assert.match(problemaDeContrasena("abc12"), /al menos 8/);
  assert.match(problemaDeContrasena("12345678"), /letras y números/);
  assert.match(problemaDeContrasena("abcdefgh"), /letras y números/);
  assert.equal(problemaDeContrasena("cuaderno2026"), null);
  assert.equal(problemaDeContrasena("Ñandú2026"), null);
});

test("encuentra la contraseña en la lista, ignorando el relleno", () => {
  // "password" tiene huella 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
  const huella = createHash("sha1").update("password").digest("hex").toUpperCase();
  const sufijo = huella.slice(5);
  assert.equal(apareceEnLista(sufijo, `0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n${sufijo}:9545824\r\n`), true);
  assert.equal(apareceEnLista(sufijo, `${sufijo}:0\r\n`), false); // relleno
  assert.equal(apareceEnLista(sufijo, "0018A45C4D1DEF81644B54AB7F969B88D65:3"), false);
});
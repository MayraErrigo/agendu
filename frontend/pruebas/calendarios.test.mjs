// Pruebas de la importación de calendarios: lectura del .ics, sugerencias y seguridad de los links.
// Se corren con: npm test (desde la carpeta frontend)

import { test } from "node:test";
import assert from "node:assert/strict";
import { esApertura, leerIcs, sugerirMateria, sugerirTipo } from "../src/lib/logica/ics.ts";
import { esIpPrivada, revisarLink } from "../src/lib/logica/links.ts";

const ICS = [
  "BEGIN:VCALENDAR",
  "BEGIN:VEVENT",
  "UID:1@uv.frc.utn.edu.ar",
  "SUMMARY:TP 3: planificación de procesos vence",
  "CATEGORIES:Sistemas Operativos - 3K2 - 2026",
  "DTSTART:20261125T025900Z",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:2@uv",
  "SUMMARY:Cumple de Juli",
  "DTSTART;VALUE=DATE:20261128",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:3@uv",
  "SUMMARY:Cuestionario unidad 4 ",
  " cierra",
  "DTSTART;TZID=America/Argentina/Buenos_Aires:20261126T180000",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

test("lee los eventos y pasa la hora UTC a la de Argentina", () => {
  const eventos = leerIcs(ICS);
  assert.equal(eventos.length, 3);
  // 02:59 UTC del 25 = 23:59 del 24 en Argentina
  assert.equal(eventos[0].fecha, "2026-11-24");
  assert.equal(eventos[0].hora, "23:59");
  assert.equal(eventos[0].categoria, "Sistemas Operativos - 3K2 - 2026");
});

test("los eventos de día completo no tienen hora, y las líneas partidas se unen", () => {
  const eventos = leerIcs(ICS);
  assert.equal(eventos[1].hora, null);
  assert.equal(eventos[2].titulo, "Cuestionario unidad 4 cierra");
  assert.equal(eventos[2].hora, "18:00");
});

test("sugiere la materia por el curso, prefiriendo el nombre más largo", () => {
  const materias = [
    { id: "am1", nombre: "Análisis Matemático I" },
    { id: "am2", nombre: "Análisis Matemático II" },
    { id: "so", nombre: "Sistemas Operativos" },
  ];
  assert.equal(sugerirMateria("Sistemas Operativos - 3K2 - 2026", materias), "so");
  assert.equal(sugerirMateria("ANALISIS MATEMATICO II - 2K1", materias), "am2");
  assert.equal(sugerirMateria("Cumple de Juli", materias), null);
});

test("sugiere el tipo por las palabras del título", () => {
  assert.equal(sugerirTipo("TP 3 vence"), "entrega");
  assert.equal(sugerirTipo("Cuestionario unidad 4 cierra"), "evaluacion");
  assert.equal(sugerirTipo("Lección oral"), "leccion");
  assert.equal(sugerirTipo("Clase de consulta"), "otro");
});

test("reconoce la apertura de un cuestionario de Moodle", () => {
  assert.equal(esApertura("Cuestionario unidad 4 abre"), true);
  assert.equal(esApertura("Cuestionario unidad 4 cierra"), false);
});

test("acepta links https y webcal públicos", () => {
  assert.ok("url" in revisarLink("https://uv.frc.utn.edu.ar/calendar/export_execute.php?x=1"));
  const webcal = revisarLink("webcal://p01-caldav.icloud.com/published/2/abc");
  assert.equal(webcal.url.protocol, "https:");
});

test("rechaza links sin cifrar, internos o con IP", () => {
  assert.ok("error" in revisarLink("http://uv.frc.utn.edu.ar/cal.ics"));
  assert.ok("error" in revisarLink("https://localhost/cal.ics"));
  assert.ok("error" in revisarLink("https://192.168.0.10/cal.ics"));
  assert.ok("error" in revisarLink("https://[::1]/cal.ics"));
  assert.ok("error" in revisarLink("https://intranet/cal.ics"));
  assert.ok("error" in revisarLink("https://usuario:clave@ejemplo.com/cal.ics"));
  assert.ok("error" in revisarLink("file:///etc/passwd"));
});

test("detecta direcciones IP privadas", () => {
  assert.equal(esIpPrivada("10.1.2.3"), true);
  assert.equal(esIpPrivada("172.20.0.1"), true);
  assert.equal(esIpPrivada("169.254.169.254"), true);
  assert.equal(esIpPrivada("::1"), true);
  assert.equal(esIpPrivada("::ffff:127.0.0.1"), true);
  assert.equal(esIpPrivada("8.8.8.8"), false);
});
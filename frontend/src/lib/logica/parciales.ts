// Cálculo de cómo va el alumno en los parciales de una materia.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.
//
// Reglas (UTN):
// 1. Cada parcial (o su recuperatorio) tiene que llegar a la nota mínima. Si no, hay que recuperarlo.
// 2. Si todos llegan, el promedio decide: aprobación directa, promoción práctica o regular.
// 3. Siempre "igual o mayor": con un 8 y aprobación directa en 8, aprueba.
// 4. El recuperatorio reemplaza la nota del parcial y cuenta como cualquier otro.

export type Evaluacion = {
  fecha: string | null; // AAAA-MM-DD
  nota: number | null; // 1 a 10
  recuperatorio: number | null; // nota del recuperatorio, si lo rindió
  fechaRecuperatorio?: string | null; // AAAA-MM-DD
};

export type ConfigParciales = {
  cantidad: number; // cantidad de parciales (1 a 6)
  tieneTp: boolean; // si hay TP integrador
  minimo: number | null; // nota mínima en cada parcial para regularizar
  practica: number | null; // promedio para la promoción práctica
  directa: number | null; // promedio para la aprobación directa
  parciales: Evaluacion[];
  tp: Evaluacion;
};

export type Situacion =
  | "sin_notas" // todavía no cargó ninguna nota
  | "en_curso" // sin condiciones cargadas: solo sabemos el promedio
  | "completo"
  | "a_recuperar" // algún parcial por debajo del mínimo, sin recuperar
  | "libre" // recuperó y aun así no llegó
  | "regularizando" // faltan notas
  | "regularizo" // ya tiene todas las notas
  | "practica_en_curso"
  | "promocion_practica"
  | "directa_en_curso"
  | "aprobacion_directa";

export type Resumen = {
  situacion: Situacion;
  promedio: number | null;
  cargadas: number; // evaluaciones con nota
  total: number; // evaluaciones que tiene la materia
  aRecuperar: string[]; // nombres de las que tiene que recuperar
};

// "1er parcial", "2do parcial"…
export function nombreParcial(indice: number): string {
  const ordinales = ["1er", "2do", "3er", "4to", "5to", "6to"];
  return `${ordinales[indice] ?? `${indice + 1}º`} parcial`;
}

// La nota que cuenta: la del recuperatorio si lo rindió, si no la original.
export function notaQueCuenta(e: Evaluacion): number | null {
  return e.recuperatorio ?? e.nota;
}

export function resumirParciales(config: ConfigParciales): Resumen {
  const evaluaciones = config.parciales.slice(0, config.cantidad).map((e, i) => ({ nombre: nombreParcial(i), e }));
  if (config.tieneTp) evaluaciones.push({ nombre: "TP integrador", e: config.tp });

  const total = evaluaciones.length;
  const conNota = evaluaciones.filter(({ e }) => notaQueCuenta(e) !== null);
  const notas = conNota.map(({ e }) => notaQueCuenta(e) as number);
  const promedio = notas.length
    ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100
    : null;

  if (promedio === null) {
    return { situacion: "sin_notas", promedio, cargadas: 0, total, aRecuperar: [] };
  }

  const completo = conNota.length === total;
  const { minimo, practica, directa } = config;
  const base = { promedio, cargadas: conNota.length, total };

  // Sin condiciones: solo el promedio.
  if (minimo === null && practica === null && directa === null) {
    return { ...base, situacion: completo ? "completo" : "en_curso", aRecuperar: [] };
  }

  // 1. La nota mínima en cada parcial.
  const bajas = minimo === null ? [] : conNota.filter(({ e }) => (notaQueCuenta(e) as number) < minimo);
  const aRecuperar = bajas.filter(({ e }) => e.recuperatorio === null).map(({ nombre }) => nombre);
  if (bajas.length) {
    return { ...base, situacion: aRecuperar.length ? "a_recuperar" : "libre", aRecuperar };
  }

  // 2. El promedio decide.
  let situacion: Situacion;
  if (directa !== null && promedio >= directa) {
    situacion = completo ? "aprobacion_directa" : "directa_en_curso";
  } else if (practica !== null && promedio >= practica) {
    situacion = completo ? "promocion_practica" : "practica_en_curso";
  } else {
    situacion = completo ? "regularizo" : "regularizando";
  }
  return { ...base, situacion, aRecuperar: [] };
}
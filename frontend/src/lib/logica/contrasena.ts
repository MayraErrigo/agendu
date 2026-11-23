// Reglas para las contraseñas nuevas (al registrarse, cambiarla o recuperarla).
// Funciones puras: se pueden probar solas.

export const LARGO_MINIMO = 8;
export const AYUDA_CONTRASENA = "Mínimo 8 caracteres, con letras y números.";

// Devuelve el motivo si la contraseña no sirve, o null si está bien.
export function problemaDeContrasena(contrasena: string): string | null {
  if (contrasena.length < LARGO_MINIMO) return `La contraseña tiene que tener al menos ${LARGO_MINIMO} caracteres.`;
  if (contrasena.length > 72) return "La contraseña puede tener hasta 72 caracteres.";
  if (!/\p{L}/u.test(contrasena) || !/\d/.test(contrasena)) return "La contraseña tiene que tener letras y números.";
  return null;
}

// La respuesta del servicio de contraseñas filtradas es una lista de "SUFIJO:CANTIDAD".
// ¿Está nuestro sufijo, con al menos una aparición? (las de cantidad 0 son relleno para más privacidad)
export function apareceEnLista(sufijo: string, respuesta: string): boolean {
  const buscado = sufijo.toUpperCase();
  for (const linea of respuesta.split("\n")) {
    const [s, cantidad] = linea.trim().split(":");
    if (s?.toUpperCase() === buscado && Number(cantidad) > 0) return true;
  }
  return false;
}
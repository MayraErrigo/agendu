# Agendu · Plan de trabajo por etapas

## Cómo trabajamos

1. **Objetivo:** qué vamos a lograr en la etapa.
2. **Archivos:** uno por uno, con su ruta exacta y el código completo, aclarando si es nuevo o si reemplaza uno que ya existe. Sin archivos zip.
3. **Prueba:** qué probar y qué tendría que verse.
4. **Commit:** se guarda en GitHub con el mensaje indicado.
5. **Siguiente:** recién ahí se pasa a la próxima etapa.

**Regla:** si algo falla, no seguimos. Se copia el error y se resuelve antes de avanzar.

**Seguridad:** la clave secreta de Supabase solo va en `backend/.env`. Antes de cada commit, `git status`: si aparece `.env` o `.env.local`, se frena.

## Versión 1 · La app para mí y mis amigos (sin cobros)

| Etapa | Nombre | Qué hacemos | Está lista cuando… | Estado |
|---|---|---|---|---|
| 0 | Preparación | Programas, proyecto, GitHub y Supabase | La app corre en la compu | Hecha |
| 1 | Base de datos | Tablas y plan de Sistemas 2023 (36 materias y correlativas) | Las materias están en Supabase | Hecha |
| 1b | Orden del proyecto | Carpetas `frontend`, `backend` y `docs`; claves separadas | Todo corre desde su carpeta | Hecha |
| 2 | Login | Entrar con mail (con nombre) y con Google | Entro, cierro sesión y vuelvo a entrar | Hecha |
| 3 | Elegí tu carrera | Universidad, regional, carrera y plan | La elección queda guardada en el perfil | Hecha |
| 4 | Cargá tu avance | Marcar lo aprobado, año por año | Las materias quedan guardadas | Hecha |
| 5 | Correlativas | La lógica de qué puedo cursar y rendir, con pruebas | `npm test` da todo bien | Hecha |
| 6 | Pantalla Plan | Materias por año, con colores por estado | Veo la carrera y cambio estados | Hecha |
| 7 | Pantalla Inicio | Avance, promedio, créditos, qué cursar y rendir | Los números coinciden con autogestión | Hecha |
| 8 | Ficha de materia | Estado, nota, fechas y correlativas | Abro cualquier materia y veo todo | Hecha |
| 8b | Materia con pestañas | Resumen, Importante, Tareas, Parciales y Archivos | Me muevo entre pestañas y Resumen e Importante guardan | Hecha |
| 9a | Navegación | Barra de abajo, pantallas Cursando y Perfil | Me muevo por toda la app y cambio mi nombre | Hecha |
| 9b | Reportes | Agregar una materia que no figura y reportar errores | La materia aparece en mi plan y el reporte llega a Supabase | Sigue ahora |
| 10 | Electivas FRC | Las electivas con créditos y correlativas | Aparecen en el plan y suman créditos | Hecha |
| 11 | Publicar | Hacerla instalable (PWA) y subirla a Vercel | Mis amigos la usan desde el celular | Pendiente |
| 12 | Verificación | La lista de datos a revisar, con mis amigos | Nadie encuentra errores en el plan | Pendiente |

### Para revisar en la etapa 12

- Confirmar que el plan 2023 pide **20 créditos** de electivas (el 2008 pedía 22).
- Correlativas de las electivas 120, 121 y 122 (Experiencia e Interfaces de Usuario, Habilidades Blandas, Creatividad y Desarrollo de Entornos Virtuales).
- Créditos de las electivas 108, 110 y 111 (hoy figuran como "no se dicta").
- Qué electivas ofrece la FRC en 2026.
- Cronograma de la transición del plan 2008 al 2023 en la FRC.
- Qué materias son anuales y cuáles cuatrimestrales.

## Versión 2 · Lanzamiento con cobros

- Mercado Pago: mensual (USD 6), cuatrimestral (USD 20) y anual (USD 50), cobrados en pesos.
- Prueba gratis de 7 días sin tarjeta, con recordatorios desde el día 5. Después sigue el plan gratis.
- Precio fundador para los primeros usuarios.
- Pestañas de cada materia: Tareas, Parciales y Archivos (los apuntes de clase se suben como archivo).
- La página de presentación en el dominio propio.
- Mails propios en lugar de los de Supabase.
- Monotributo y planes pagos de Vercel y Supabase.

## Versión 3 · Organización del día a día

- Planificador de finales, tareas del día y alertas (por ejemplo, vencimiento de regularidades).
- Títulos intermedios.
- Más carreras de la UTN y otras universidades.
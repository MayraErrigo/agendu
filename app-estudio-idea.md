# SaaS para estudiantes universitarios — Documento de producto

Nov 10, 2026 · @Mayra

## Resumen

Una app web donde el estudiante universitario argentino elige su universidad y su carrera, y recibe su plan de estudios listo para marcar su avance. Desde ahí organiza todo: materias, fechas, notas, finales y tareas.

- **Problema:** no hay una app que junte en un solo lugar el avance de la carrera y la organización del día a día de cada materia. Hoy se resuelve con planillas, Notion, el sistema de la facultad y el grupo de WhatsApp.
- **Para quién:** estudiantes de universidades argentinas. Arranque: la UTN, donde estudiás, con 3 a 5 carreras.
- **Diferencial:** el plan de estudios ya viene cargado, con correlatividades. El alumno no arma nada desde cero.
- **Señal de mercado (caza del 10/11/2026):** en Brasil, una página que vende plantillas de Notion por carrera sostiene 214 anuncios activos. En español no apareció ningún competidor con este ángulo.

## Funcionalidades

La V1 resuelve el avance de la carrera; la V2 suma la organización diaria. Lo que no esté en V1 no se programa hasta validar.

**Sin IA para el alumno (decisión del 10/11):** la mayoría ya paga un plan de IA y Gemini es gratis un año para estudiantes, así que no se compite ahí. La IA queda solo como herramienta interna para cargar los planes de estudio.

### V1 — MVP (avance de carrera)

1. **Onboarding:** registro → universidad → carrera → plan cargado automáticamente.
2. **Estado de cada materia:** aprobada (con nota y fecha), regular (con fecha de regularidad), cursando o por cursar.
3. **Correlatividades:** qué materias podés cursar y cuáles podés rendir hoy; qué te falta para desbloquear cada una.
4. **Dashboard de carrera:** % de materias aprobadas, promedio (con y sin aplazos), materias restantes por año.
5. **Ficha de materia en curso:** condiciones (con cuánto se regulariza, se promociona, se aprueba), fechas importantes, notas de parciales y anotaciones libres.
6. **Agregar una materia que no figura:** el alumno la suma a su plan en el momento (nombre, año, cuatrimestre y correlativas si las sabe) y se genera un reporte automático. Después se revisa y se corrige el plan oficial.

### V2 — Organización del estudio

1. **Planificador de finales:** elegir una materia regular y una fecha de mesa; la app reparte los temas hasta ese día.
2. **Tareas por materia:** lista con fecha (“martes: estudiar tema 1 y 2”) y vista de “hoy” con todas las materias.
3. **Alertas:** parciales, mesas de examen y vencimiento de regularidades.
4. **Proyección de egreso:** a tu ritmo actual, en qué año te recibís.
5. **Calendario de mesas** por facultad.

### Versiones futuras

1. **Títulos intermedios:** cargar el título intermedio de cada ingeniería según la regional y la carrera, con las materias que exige, y mostrarle al alumno cuánto le falta para obtenerlo. Ejemplo: en Sistemas, Analista Desarrollador/a Universitario/a de Sistemas de Información (Ord. 1910 y 1911), que pide 24 materias de los primeros tres niveles más el Seminario Integrador.

El modelo de datos de la V1 deja lugar para esto: un título intermedio es un subconjunto de materias del plan, más alguna materia propia como el Seminario.

## Modelo de datos

El plan de estudios se carga una sola vez y lo comparten todos los alumnos de esa carrera. Cada alumno guarda solo su estado por materia y sus fichas de cursada.

&#91;embedded content: modelo de datos · 9 entidades\]

Cada flecha es una relación de uno a muchos. El dashboard, el porcentaje de avance y las materias habilitadas se calculan cruzando el estado de cada materia con sus correlativas.

Además, cada alumno puede tener materias propias (las que agregó porque no figuraban), con un vínculo opcional a la materia oficial una vez que se incorpora. Cada agregado o reporte queda en una tabla de reportes con su estado: pendiente, incorporado o descartado.

## Estrategia de datos

El trabajo pesado no es el código: es tener cada plan de estudios bien cargado, con sus correlativas. Se resuelve por etapas.

Ingenierías de la UTN por regional (por ahora, solo ingenierías): Carreras UTN

1. **Carga manual propia:** la UTN y 3 a 5 carreras, desde los planes publicados por la universidad. Cada plan con su año de vigencia.
2. **Carga asistida con IA:** pasarle el PDF del plan a la IA para que devuelva materias, año, cuatrimestre y correlativas en JSON; vos lo revisás antes de publicarlo.
3. **Carga por la comunidad:** si tu carrera no está, la cargás vos. Queda “en revisión” hasta que la aprobás o la validan otros alumnos de la misma carrera.
4. **Correcciones de usuarios:** botón “reportar error en el plan” en cada materia, y opción de agregar una materia que no figura. La materia agregada queda en el plan del alumno al instante y genera un reporte; cuando se incorpora al plan oficial, la del alumno se vincula a la oficial sin perder su estado ni sus notas.

**Reglas que el modelo tiene que soportar desde el día uno:**

- Varios planes por carrera (plan viejo y plan nuevo) y equivalencias entre ellos.
- Correlativas de dos tipos: para cursar (regular o aprobada) y para rendir (aprobada).
- Electivas y optativas: un “cupo” de horas o créditos, no una materia fija.
- Vencimiento de regularidad, que varía por universidad.
- UTN: cada plan lo aprueba el Consejo Superior por ordenanza y es común a todas las facultades regionales (la misma ordenanza aparece publicada en varias). Lo que puede cambiar por regional son las electivas. Confirmado para Ingeniería en Sistemas (ver la comparación de abajo).

**Fuera de alcance:** integración con SIU Guaraní. No tiene una API pública para terceros; el alumno marca su avance a mano.

### Comparación UTN: Ingeniería en Sistemas, Plan 2023

El plan es uno solo para toda la UTN: la Ord. 1877 fija las 36 materias obligatorias y las 480 horas de electivas, y la Ord. 1878 fija las correlatividades. Cada regional puede cambiar en qué nivel va una materia, si es anual o cuatrimestral, y define sus propias electivas, siempre respetando las correlativas.

| Regional | Correlativas obligatorias | Qué cambia |
| --- | --- | --- |
| Santa Fe (FRSF) | Iguales a la Ord. 1878 | Publica la ordenanza tal cual |
| La Plata (FRLP) | Iguales | No publica lista de electivas |
| San Nicolás (FRSN) | Iguales | Suma Inglés III, IV y V como optativas |
| San Francisco | Iguales | Inglés II pasa a 3er nivel; define anual o cuatrimestral por materia; 8 electivas propias |
| Concepción del Uruguay (FRCU) | Iguales, con otra numeración | Ingeniería y Sociedad pasa a 1er nivel; electivas propias |
| Delta (FRD) | Iguales salvo Seguridad, que figura con Diseño en vez de Adm. de SI | Probable error del PDF, a verificar; electivas propias |
| Córdoba (FRC) | Sin tabla propia encontrada; rige la Ord. 1878 | 19 electivas propias con sus correlativas; falta confirmar qué materias son anuales o cuatrimestrales |
| Tucumán (FRT) | Solo publica el Plan 2008 | Sin datos del Plan 2023 |

No todas las regionales que dictan la carrera publican su plan en la web; las de la tabla son las que lo tienen disponible.

**Qué implica para el modelo de datos:**

- Un plan base compartido (materias obligatorias y correlativas) que se carga una sola vez para todas las regionales.
- Una capa por regional: nivel de cada materia, anual o cuatrimestral, electivas con sus correlativas y optativas extra.
- El Plan 2008 (Ord. 1150) convive hasta fines de 2027, cuando sus alumnos pasan al Plan 2023. La V1 carga el Plan 2023 y la tabla de equivalencias, para pasar automáticamente a quien viene del Plan 2008.

### Pase del Plan 2008 al Plan 2023

La Ord. 1878 (Anexo II) fija las equivalencias para toda la UTN: cada materia aprobada del Plan 2008 se reconoce por su par del Plan 2023. 19 materias se mantienen con el mismo nombre, más Proyecto Final y la Práctica Supervisada; estas cambian:

| Plan 2008 | Plan 2023 |
| --- | --- |
| Matemática Discreta | Lógica y Estructuras Discretas |
| Sistemas y Organizaciones | Sistemas y Procesos de Negocio |
| Análisis de Sistemas | Análisis de Sistemas de Información |
| Probabilidades y Estadísticas | Probabilidad y Estadística |
| Diseño de Sistemas | Diseño de Sistemas de Información |
| Comunicaciones | Comunicación de Datos |
| Matemática Superior | Análisis Numérico |
| Gestión de Datos | Bases de Datos |
| Redes de Información | Redes de Datos |
| Administración de Recursos | Administración de Sistemas de Información |
| Ingeniería de Software | Ingeniería y Calidad de Software |
| Teoría de Control | Tecnologías para la automatización |
| Administración Gerencial | Gestión Gerencial |
| Química | Sin equivalencia (puede contar como horas de electiva) |
| Sistemas de Representación | Sin equivalencia (puede contar como horas de electiva) |
| — | Desarrollo de Software, Ciencia de Datos y Seguridad en los SI: nuevas; cada regional puede darlas por equivalencia con electivas aprobadas |

**En la FRC:** el Consejo Departamental (acta del 16/03/2023) aprobó homologaciones propias de electivas del Plan 2008, por ejemplo ADA y Big Data por Ciencia de Datos, Aplicaciones Visuales I o TSB por Desarrollo de Software, y Consultoría en Seguridad o Seguridad en el Desarrollo de Software por Seguridad en los SI.

**Cronograma:** cada regional fija el suyo. En FRBA el Plan 2008 cierra materias año por año entre 2023 y 2027 y se puede rendir hasta 2028; en San Francisco quedan todos asimilados al Plan 2023 al terminar 2027.

**Función posible:** el alumno del Plan 2008 marca lo que aprobó y la app le muestra cómo queda en el Plan 2023 y qué le falta. Es una duda frecuente y ningún sistema oficial la muestra de forma simple.

### Etapa de verificación

Antes de abrir la app a otros alumnos, cada plan se verifica contra la fuente oficial. Para Ingeniería en Sistemas en la FRC:

- [ ] Materias obligatorias y correlativas contra las Ord. 1877 y 1878.
- [ ] Electivas de la FRC y sus correlativas contra la resolución publicada por el departamento.
- [ ] Qué materias son anuales y cuáles cuatrimestrales, y en qué cuatrimestre (autogestión o alumnos de cada año).
- [ ] Tabla de equivalencias 2008 → 2023 y homologaciones propias de la FRC.
- [ ] Cronograma de transición de la FRC: consultar en el departamento de Sistemas o con alumnos que vienen del Plan 2008. No bloquea la V1, que arranca con alumnos del Plan 2023.
- [ ] Prueba con 2 o 3 alumnos por año: cargan su avance real y se compara con lo que muestra su autogestión.

Cada nueva regional o carrera pasa por la misma etapa antes de publicarse.

## Plan de validación

La app se construye ya: la usás vos y tus amigos desde el día uno, y ellos son los primeros testers. La landing, la preventa y el test en Meta corren en paralelo, no como requisito para programar.

1. **Prototipo navegable:** capturas o un video corto del dashboard y del marcado de materias con tu propia carrera.
2. **Landing:** promesa (“tu carrera entera, organizada en un solo lugar”), las 3 funciones clave, precio de lanzamiento y dos botones: lista de espera gratis y preventa con descuento.
3. **Orgánico primero (costo cero):** grupos de WhatsApp y centros de estudiantes de tu facultad, y perfiles de Instagram o TikTok de la carrera.
4. **Test chico en Meta:** público universitario de tu ciudad, 3 a 5 creativos con ángulos distintos (“¿cuánto te falta para recibirte?”, “qué materias podés cursar”, “no pierdas una regularidad”). Seguir la estructura de testeo de tu wiki (testeo-abo).
5. **Entrevistas:** 10 charlas cortas con quienes se anoten: qué usan hoy, qué les falta, cuánto pagarían.

**Criterios para seguir (propuesta, a ajustar):**

- [ ] 100+ registros en la lista de espera
- [ ] 10+ preventas pagas
- [ ] Costo por registro que puedas sostener con el precio elegido

Si no se cumplen, se cambia el ángulo o la oferta antes de invertir en pauta.

## Modelo de precios

Freemium: el avance de carrera es gratis para crecer por boca a boca; la organización diaria es paga. Los montos son hipótesis a confirmar en la preventa.

| Función | Gratis | Pago |
| --- | --- | --- |
| Plan de estudios cargado y marcado de materias | Sí | Sí |
| Dashboard básico (% y promedio) | Sí | Sí |
| Correlatividades (qué podés cursar y rendir) | Sí | Sí |
| Ficha completa de materias en curso | 2 materias | Ilimitadas |
| Planificador de finales y tareas por día | No | Sí |
| Alertas de vencimiento y mesas | No | Sí |
| Estadísticas avanzadas y proyección de egreso | No | Sí |

**Hipótesis de precio:** USD 6 por mes, cobrado en pesos, como precio de lanzamiento. Los primeros usuarios lo conservan como precio fundador; después sube (meta: USD 10) solo para los nuevos. Tres planes, con 7 días gratis del plan pago para todos los que se registran al lanzar:

| Plan | Precio (lanzamiento) | Equivale por mes | Ahorro |
| --- | --- | --- | --- |
| Mensual | USD 6 | USD 6 | — |
| Cuatrimestral (4 meses) | USD 20 | USD 5 | 17% |
| Anual | USD 50 | USD 4,2 | 30% |

Montos confirmados para el lanzamiento; se pueden ajustar más adelante. Se cobra en pesos por Mercado Pago, que no permite suscripciones en dólares; la página muestra el precio en pesos, redondeado. El dólar es solo la referencia interna: la app lo revisa una vez por mes y actualiza el monto por API solo si se movió más de un 5%, avisando al usuario con unos días de anticipación. El cuatrimestral y el anual quedan fijos en pesos desde el día que se pagan. Cobrar en USD con una plataforma del exterior le sumaría al alumno la percepción del 30% y dejaría afuera a quien paga con débito.

**Prueba gratis:** 7 días con todo desbloqueado, sin pedir tarjeta. Desde el día 5 la app le recuerda que la prueba termina (días 5, 6 y 7). Al terminar, para seguir usando las funciones pagas tiene que elegir un plan; si no paga, se bloquean esas funciones y sigue con el plan gratis, sin perder nada de lo que cargó.

**Alternativa a testear en paralelo:** pago único por carrera (“acceso de por vida”), más cerca del modelo low-ticket de la wiki (`WIKI/creacion-de-productos-digitales.md`).

## Stack técnico y hoja de ruta

Proyecto nuevo, desde cero: no se reutiliza el código de tu app personal. Web responsive pensada primero para el celular; después se adapta a tablet y compu. Todo en planes gratuitos para arrancar.

| Capa | Herramienta | Por qué |
| --- | --- | --- |
| App web | Next.js + TypeScript + Tailwind | Estándar para web responsive; proyecto nuevo desde cero |
| Base de datos y login | Supabase (Postgres + Auth) | Multiusuario; plan gratuito; lo nombra tu wiki |
| Hosting | Vercel | Plan gratuito, deploy desde Git |
| Pagos | Suscripciones de Mercado Pago | Lo que usa el estudiante argentino |

&#91;embedded content: hoja de ruta · 4 fases, 3 compuertas\]

Cada fase arranca solo si la anterior pasó su compuerta; los umbrales son una propuesta a ajustar. Antes de abrir a otros alumnos hay una etapa de verificación de datos (ver Estrategia de datos).

## Riesgos y preguntas abiertas

El mayor riesgo es que el estudiante use la parte gratis y nunca pague; el segundo, el costo de mantener los planes actualizados.

| Riesgo | Qué lo mitiga |
| --- | --- |
| Baja disposición a pagar del estudiante argentino | Preventa antes de construir; probar también el pago único por carrera |
| Planes de estudio mal cargados o desactualizados | Carga asistida con IA + revisión; reportes de error de los usuarios |
| Uso estacional (picos en mesas de examen, caída en vacaciones) | Plan anual o cuatrimestral; alertas que traen al usuario de vuelta |
| Copia por un competidor o por la propia universidad | Velocidad, comunidad por carrera y planes ya cargados |
| Datos personales de menores o de estudiantes | Política de privacidad y cumplimiento de la Ley 25.326 de protección de datos |

**Preguntas abiertas:**

- [ ] UTN decidida. ¿Qué 3 a 5 carreras cargo primero? ¿Cambian las electivas entre regionales?
- [x] ¿Suscripción mensual, cuatrimestral o pago único? (lo decide la preventa)
- [x] Web responsive, pensada primero para el celular (decidido).
- [x] No se reutiliza código de `Desktop\APP`: se empieza de cero (decidido).

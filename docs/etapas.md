# Agendu · Plan de trabajo por etapas

## Cómo trabajamos

1. **Debatir primero:** cuando hay que decidir algo, lo charlamos antes del código. El código se pide cuando está decidido.
2. **Archivos:** uno por uno, con su ruta exacta y el código completo (archivos enteros cuando el cambio no es de una o dos líneas), aclarando si es nuevo o si reemplaza uno que ya existe. Sin archivos zip.
3. **Prueba:** qué probar y qué tendría que verse.
4. **Commit:** se guarda en GitHub con el mensaje indicado.
5. **Siguiente:** recién ahí se pasa a la próxima etapa.

**Regla:** si algo falla, no seguimos. Se copia el error y se resuelve antes de avanzar.

**Seguridad:** la clave secreta de Supabase solo va en `backend/.env`. Antes de cada commit, `git status`: si aparece `.env` o `.env.local`, se frena. Nunca se pegan claves ni el link de la UV en el chat.

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
| 8b | Materia con pestañas | Resumen, Importante, Tareas, Parciales, Fechas y Archivos | Me muevo entre pestañas y todo guarda | Hecha |
| 8c | Tareas | Tareas por materia con fecha, hechas y pendientes | Agrego, marco y borro tareas | Hecha |
| 8d | Parciales | Notas, recuperatorios, promoción práctica y aprobación directa | El resumen dice cómo voy | Hecha |
| 8e | Archivos | Carpetas fijas y propias; subir, abrir, mover y borrar, con límite de espacio | Subo un PDF y lo abro desde el celular | Hecha |
| 8f | Archivos repetidos | Aviso al subir un archivo que ya está en la carpeta: No subir, Reemplazar o Subir igual | Subo el mismo PDF dos veces y me pregunta | Hecha |
| 9a | Navegación | Barra de abajo, pantallas Cursando y Perfil | Me muevo por toda la app y cambio mi nombre | Hecha |
| 9b | Reportes y opiniones | Agregar una materia que no figura, reportar errores y mandar opiniones | El reporte llega a Supabase | Hecha |
| 10 | Electivas FRC | Las electivas con créditos y correlativas | Aparecen en el plan y suman créditos | Hecha |
| 10b | Título intermedio | Seminario Integrador (Sistemas): se ve en su año, no suma al avance | Aparece en 3er año con su etiqueta | Hecha |
| 11 | Publicar | Subirla a Vercel (agendu.vercel.app) para que mis amigos la usen | La abren desde el celular e inician sesión | Hecha |
| 11b | Instalable (PWA) | Ícono en la pantalla de inicio, se abre como app | Se instala en Android y iPhone | Después de validar |
| 11c | Contraseña | Olvidé mi contraseña y cambiarla desde Perfil | Recupero la cuenta con el link del mail | Hecha |
| 12 | Verificación | Revisar los datos de cada plan con estudiantes de cada carrera | Nadie encuentra errores en el plan | En curso |
| 13a | Fechas | Pestaña Fechas en cada materia (entrega, lección, evaluación, presentación, otro), hora opcional y fecha del recuperatorio | Cargo una fecha y la veo en la materia | Hecha |
| 13b | Calendario | Calendario en Inicio con fechas y parciales de todas las materias (semana que se despliega a mes) | Toco un día y veo qué tengo | Hecha |
| 13c-1 | Conectar y traer | Pegar el link de la UV, Google, Apple u Outlook; leerlo con seguridad; sugerir materia y tipo (materias por año en el desplegable); revisar y traer; recordar lo descartado | Conecto la UV y traigo mis entregas | Hecha |
| 13c-2 | Mantenerlo al día | Buscar fechas nuevas; aviso a los 14 días sin buscar y si el link falla; desconectar; acceso desde Perfil; política de privacidad actualizada | Busco fechas nuevas y solo aparece lo que no vi | Hecha |
| 14a | Seguridad · Revisar | RLS en las 20 tablas, Security Advisor, funciones cerradas, catálogo con sesión, contraseñas (8 caracteres, letras y números, control de filtradas), npm audit, claves | No queda ningún aviso sin explicar | Hecha |
| 14b | Seguridad · Reforzar | Encabezados de seguridad y límites de uso en la base (tareas, fechas, materias agregadas, reportes y búsquedas) | La consola no muestra bloqueos y los límites avisan | Hecha |
| 15 | Otras carreras de la FRC | Cada carrera desde la ordenanza + el cuadro del CET (año y cuatrimestre de la FRC) | La carrera aparece para elegir y se ve como se cursa | En curso |
| 15a | Año y cuatrimestre FRC | Mostrar el año y el cuatrimestre de la regional encima de la ordenanza (anual, 1er, 2do, o cualquiera de los dos) | Sistemas muestra Probabilidad en 2do año | Hecha |
| 15b | Ingeniería Química | Plan 2023 (Ord. 1875 y 2138), 9 electivas FRC, dictado del CET | Aparece para elegir | Hecha |
| 15c | Ingeniería Industrial | Plan 2023 (Ord. 1908 y 1909), 12 electivas FRC, Gestión Industrial (título intermedio) | Aparece para elegir | Sigue ahora |
Ingeniería Civil: Hecha 
| 15e | Próximas carreras |  Eléctrica, Electrónica, Mecánica, Metalúrgica; licenciaturas en Inteligencia Artificial y Seguridad Informática (2026) y Ciencia de Datos (2027) | Una por vez, con su cuadro del CET | Pendiente |
15i · Práctica Profesional Supervisada: Hecha (materia en Eléctrica, Civil y Electrónica; requisito en Química, Sistemas, Mecánica e Industrial. A verificar: requisitos de la PPS de Electrónica).
### Para revisar en la etapa 12

**Sistemas**
- Confirmar con los consejeros si **Green Software** va en 4to o en 5to (el cuadro la pone en 4to, pero pide Administración de Sistemas de Información, anual de 4to).
- Cronograma de la transición del plan 2008 al 2023 en la FRC. ¿Hace falta cargar el plan 2008?

**Química**
- Correlativas de **Calidad y Control Estadístico de Procesos** y **Organización Industrial**: el cuadro del CET difiere de la Ord. 2138 (se cargó la ordenanza).
- Correlativas de las 3 electivas nuevas: Energías Renovables, Hidrógeno y Power-to-X renovable, y Psicoingeniería.
- Licenciatura embebida en Gestión de Procesos Químicos (4 años): ver qué pide.
- Conseguir un estudiante de Química que revise la carrera.

**Industrial**
- Nombre completo de la electiva **"CNH Cátedra In Stu"**.
- En qué cuatrimestre se dicta **Gestión Industrial**.
- Conseguir un estudiante de Industrial que revise la carrera.

### Pendientes chicos

- Activar 2FA en Google, GitHub y Supabase (Vercel ya está).
- Probar `https://agendu.vercel.app` en securityheaders.com.
- Borrar `C:\Users\merri\_resto_npm` si nada de la facu se rompió.
- Actualizar el brief de marketing cuando se anuncien Química e Industrial.

## Después de validar

- App instalable (PWA): etapa 11b.
- Anunciar las carreras nuevas, con un revisor de cada una.

## Versión 2 · Lanzamiento con cobros

- Mercado Pago: mensual (USD 6), cuatrimestral (USD 20) y anual (USD 50), cobrados en pesos.
- Prueba gratis de 7 días sin tarjeta, con recordatorios desde el día 5. Después sigue el plan gratis.
- Precio fundador para los primeros usuarios.
- Más espacio para archivos en los planes pagos.
- Dominio propio: `agendu.com.ar` por NIC Argentina (con clave fiscal nivel 3) o un `.com`.
- Mails propios de Agendu, en castellano y con su diseño (Resend), en lugar de los de Supabase.
- Verificar la marca en Google con el dominio propio.
- La página de presentación en el dominio propio.
- Monotributo y planes pagos de Vercel y Supabase.

## Versión 3 · Organización del día a día

- Planificador de finales, tareas del día y alertas (por ejemplo, vencimiento de regularidades).
- Buscar fechas nuevas de la UV automáticamente (una vez por día) y avisar con notificación.
- Foro por materia.
- Otras universidades.
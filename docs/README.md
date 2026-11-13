# Agendu

Tu carrera entera, organizada en un solo lugar.

## Estructura

- `frontend/` — la app que ve el alumno (Next.js, TypeScript, Tailwind).
- `backend/` — todo lo de Supabase: esquema de la base, planes de estudio y scripts.
- `docs/` — documentación del proyecto.

## Cómo prender la app

```
cd frontend
npm install
npm run dev
```

Se abre en http://localhost:3000

## Cómo cargar o actualizar un plan de estudios

```
cd backend
npm install
npm run cargar-plan -- planes/utn-isi-2023.json
```

## Claves (nunca se suben a GitHub)

- `frontend/.env.local`: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `backend/.env`: `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (secreta: solo vive acá).

## Documentos

- [etapas.md](etapas.md) — plan de trabajo y estado de cada etapa.
- [decisiones.md](decisiones.md) — qué decidimos y por qué.
- [app-estudio-idea.md](app-estudio-idea.md) — la idea original.
- [Carreras UTN.md](Carreras%20UTN.md) — carreras de la UTN por regional.
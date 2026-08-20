# MealPlanner

[![CI](https://github.com/PauMGDev/MealPlanner/actions/workflows/ci.yml/badge.svg)](https://github.com/PauMGDev/MealPlanner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](./LICENSE)

**[Ver la aplicación en producción](https://meal-planner-azure-ten.vercel.app)**

Aplicación web de planificación semanal de comidas. Creas recetas con sus ingredientes, mantienes el inventario de tu despensa y montas el menú de la semana en un calendario. Cada receta se marca según lo que tengas en casa, para saber en todo momento qué puedes cocinar hoy.

## Características

### Recetas
- CRUD completo de recetas: nombre, descripción, imagen, tiempo de preparación, raciones, pasos e ingredientes con cantidad.
- Indicador de disponibilidad: cada ingrediente de la receta se cruza con la despensa y sale como disponible, agotado (lo tienes a 0) o ausente (no lo tienes). La receta hereda el peor de sus ingredientes.
- Modal de detalle a pantalla completa con imagen, ingredientes (dot de color por disponibilidad) y pasos numerados.
- Edición de recetas con diff automático de ingredientes (añade, actualiza y elimina solo lo que ha cambiado).
- Búsqueda por nombre y filtro "Listo para cocinar" con contador de resultados y estados vacíos descriptivos.

### Despensa
- Inventario personal por usuario, agrupado por categoría de ingrediente (lácteos, carnes, verduras...).
- Estimación automática de la fecha de caducidad según la categoría, o introducción manual.
- Avisos de "caduca pronto" y "caducado" en la fila y en el badge del artículo.
- Búsqueda, filtros (caducidad, categoría) y ordenación (nombre, caducidad, cantidad).
- Sección de "agotados", edición inline de cantidad y detección de duplicados al añadir (merge automático).
- Categorías plegables, animadas con `grid-template-rows` de 1fr a 0fr para que la transición funcione sin altura fija.

### Planificador semanal
- Matriz semanal con los tipos de comida que actives: desayuno, almuerzo, comida, merienda y cena. Por defecto tres (desayuno, comida y cena); se cambian desde los ajustes, entre tres y cinco.
- Asignar, reemplazar o quitar una receta de cualquier slot del plan.
- Un usuario solo puede tener una comida por tipo y día (constraint a nivel de base de datos).

### Catálogo de ingredientes
- Catálogo global de ingredientes (nombre, unidad, calorías/100g) compartido entre recetas y despensa.
- Autocompletado con búsqueda difusa (extensión `pg_trgm` de PostgreSQL) para evitar duplicados y unificar nomenclatura.

### Lista de la compra
- Lista de la compra por usuario, con marcado de artículos comprados y borrado de los ya marcados.
- Sugerencias a partir de la despensa: los ingredientes agotados o próximos a caducar se proponen para añadir.
- Añadir un artículo suelto o enlazarlo al catálogo de ingredientes.

### Autenticación
- Registro y login con email + contraseña (bcrypt + JWT).
- Login con Google OAuth 2.0.
- Rutas protegidas con guards en el frontend (Angular) y en el backend (NestJS). Cada método de servicio recibe el `userId` del token y comprueba la propiedad: pedir un recurso de otro usuario devuelve 403.

### Interfaz
- Landing pública: hero, características, cómo funciona, muestra de la despensa, preguntas frecuentes y CTA.
- Sistema de diseño propio (tokens `lp-*`) sobre Tailwind CSS 4, en modo claro.
- Componentes standalone con Angular Signals y `OnPush` change detection.
- Animaciones de scroll-reveal, modales con transición de entrada y skeletons de carga.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (standalone components, signals) + Tailwind CSS 4 |
| Backend | NestJS 11 + Passport (JWT y Google OAuth2) |
| ORM | Prisma 7 (`prisma-client` con `@prisma/adapter-pg`) |
| Base de datos | PostgreSQL (con extensión `pg_trgm`) |
| Documentación API | Swagger en `/api/docs` |
| Tests | Vitest (frontend), Jest unitarios y end to end (backend) |
| Despliegue | Vercel (frontend) y Railway (backend + PostgreSQL) |
| Entorno local | Docker Compose |
| CI | GitHub Actions en cada pull request: build, lint y tests de las dos apps, con un service container de PostgreSQL para los end to end |

## Estructura del monorepo

```
MealPlanner/
├── apps/
│   ├── backend/            → API REST NestJS (puerto 3000)
│   │   ├── src/
│   │   │   ├── auth/        → Registro, login, Google OAuth, JWT
│   │   │   ├── recipes/     → CRUD de recetas e ingredientes de receta
│   │   │   ├── pantry/      → Despensa personal del usuario
│   │   │   ├── ingredients/ → Catálogo global de ingredientes
│   │   │   ├── meal-plans/  → Planificación semanal
│   │   │   ├── shopping-list/ → Lista de la compra y sugerencias
│   │   │   └── users/       → Gestión de usuarios
│   │   └── prisma/          → Schema, migraciones y seed
│   └── frontend/           → SPA Angular (puerto 4200)
│       └── src/app/
│           ├── landing/     → Página pública
│           ├── auth/        → Login, registro, callback OAuth
│           └── shell/       → Área autenticada (plan, recetas, despensa, lista)
├── .github/workflows/      → CI
└── docker-compose.yml
```

## Puesta en marcha

### Con Docker (recomendado)

```bash
docker compose up -d
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| Documentación Swagger | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |

### Desarrollo local

**Backend** (`apps/backend/`) — copia antes `.env.example` a `.env` (ver más abajo)
```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev      # http://localhost:3000
```

**Frontend** (`apps/frontend/`)
```bash
npm install
npm start               # http://localhost:4200
```

## Variables de entorno

Copia `apps/backend/.env.example` a `.env` y ajusta los valores:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Configuración del token JWT |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Credenciales OAuth de Google |
| `FRONTEND_URL` | URL del frontend (usada en redirecciones OAuth) |

## Tests

```bash
# Backend
cd apps/backend
npm run test       # unitarios
npm run test:e2e   # end to end, necesita PostgreSQL en marcha
npm run test:cov   # cobertura
npm run lint       # ESLint (también en CI)

# Frontend
cd apps/frontend
npm test
npm run lint       # ESLint + reglas de accesibilidad de plantillas
```

Todo esto corre en CI en cada pull request. Los end to end van contra un PostgreSQL
real: en local el de `docker compose`, en CI un service container. Registran un
usuario desechable y lo borran al terminar, así que se pueden repetir sobre la misma
base de datos.

## Decisiones técnicas

- La disponibilidad la calcula `computeAvailability()`, una función pura que recibe la
  receta y un mapa de la despensa, así que se prueba sin montar componentes ni base de
  datos. El backend repite el cruce al servir una receta suelta.
- El enum de comidas tiene cinco valores y separa "almuerzo" (media mañana) de "comida",
  porque la app está pensada para horarios españoles. Los que cada usuario activa deciden
  las filas de la matriz semanal.
- La unicidad de (usuario, día, tipo de comida) es una constraint de PostgreSQL, así que
  dos peticiones simultáneas no pueden duplicar una comida. Asignar un plato a un hueco
  es un upsert.
- El autocompletado de ingredientes usa `pg_trgm` en vez de una librería de fuzzy matching
  en JavaScript: el catálogo entero vive en la base de datos y la comparación se hace ahí.
- Las mutaciones del plan escriben de forma optimista y, si el servidor las rechaza,
  recargan la semana afectada en vez de restaurar una copia previa. Esa copia puede
  contener el resultado sin confirmar de otra mutación en vuelo.

## Roadmap

- [x] Lista de la compra con sugerencias a partir de la despensa
- [ ] Generar la lista de la compra directamente desde el plan semanal
- [ ] Control de macros nutricionales

## Historial de cambios

Cada versión está publicada en [Releases](https://github.com/PauMGDev/MealPlanner/releases).

## Licencia

[MIT](./LICENSE)

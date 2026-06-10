# MealPlanner

Aplicación web de planificación semanal de comidas. Permite crear recetas con sus ingredientes, llevar un control de la despensa personal y organizar el menú de la semana en un calendario, comprobando en todo momento qué recetas se pueden cocinar con lo que ya tienes en casa.

## Características

### 🍳 Recetas
- CRUD completo de recetas: nombre, descripción, imagen, tiempo de preparación, raciones, pasos e ingredientes con cantidad.
- **Indicador de disponibilidad**: cada receta se compara contra la despensa del usuario y se marca como lista para cocinar, con ingredientes parciales o sin stock, con un código de color.
- Modal de detalle a pantalla completa con imagen, ingredientes (dot de color por disponibilidad) y pasos numerados.
- Edición de recetas con diff automático de ingredientes (añade, actualiza y elimina solo lo que ha cambiado).
- Búsqueda por nombre y filtro "Listo para cocinar" con contador de resultados y estados vacíos descriptivos.

### 🥫 Despensa (Pantry)
- Inventario personal por usuario, agrupado por categoría de ingrediente (lácteos, carnes, verduras...).
- Estimación automática de la fecha de caducidad según la categoría, o introducción manual.
- Indicadores visuales de urgencia de caducidad (caduca pronto / caducado) en tarjetas y badges.
- Búsqueda, filtros (caducidad, categoría) y ordenación (nombre, caducidad, cantidad).
- Sección de "agotados", edición inline de cantidad y detección de duplicados al añadir (merge automático).
- Categorías colapsables con animación fluida basada en CSS Grid.

### 📅 Planificador semanal
- Calendario semanal con 5 tipos de comida por día: desayuno, almuerzo, comida, merienda y cena.
- Asignar, reemplazar o quitar una receta de cualquier slot del plan.
- Un usuario solo puede tener una comida por tipo y día (constraint a nivel de base de datos).

### 🥕 Catálogo de ingredientes
- Catálogo global de ingredientes (nombre, unidad, calorías/100g) compartido entre recetas y despensa.
- Autocompletado con búsqueda difusa (extensión `pg_trgm` de PostgreSQL) para evitar duplicados y unificar nomenclatura.

### 🔐 Autenticación
- Registro y login con email + contraseña (bcrypt + JWT).
- Login con Google OAuth 2.0.
- Rutas protegidas mediante guards tanto en el frontend (Angular) como en el backend (NestJS).

### 🎨 Interfaz
- Landing page pública con hero, secciones de características, roadmap "en desarrollo" y CTA.
- Sistema de diseño oscuro propio sobre Tailwind CSS 4.
- Componentes standalone con Angular Signals y `OnPush` change detection.
- Animaciones de scroll-reveal, modales con transición de entrada y skeletons de carga.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (standalone components, signals) + Tailwind CSS 4 |
| Backend | NestJS 11 + Passport (JWT y Google OAuth2) |
| ORM | Prisma 7 (`prisma-client` con `@prisma/adapter-pg`) |
| Base de datos | PostgreSQL (con extensión `pg_trgm`) |
| Documentación API | Swagger en `/api/docs` |
| Tests | Vitest (frontend) y Jest (backend) |
| Infraestructura | Docker Compose + nginx |

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
│   │   │   └── users/       → Gestión de usuarios
│   │   └── prisma/          → Schema, migraciones y seed
│   └── frontend/           → SPA Angular (puerto 4200)
│       └── src/app/
│           ├── landing/     → Página pública
│           ├── auth/        → Login, registro, callback OAuth
│           └── shell/       → Área autenticada (dashboard, recetas, despensa)
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
| Prisma Studio | http://localhost:5555 |
| PostgreSQL | localhost:5432 |

### Desarrollo local

**Backend** (`apps/backend/`)
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
npm run test:e2e   # end-to-end
npm run test:cov   # cobertura

# Frontend
cd apps/frontend
npm test
```

## Roadmap

- [ ] Lista de la compra automática a partir del plan semanal y la despensa
- [ ] Control de macros nutricionales

## Historial de cambios

Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle de cada feature implementada.

# Historial de cambios — MealPlanner

---

## `c0f310f` — feat: add search and availability filter to recipes
**Fecha:** 5 jun 2026

**Tecnología:** Angular 21 · Tailwind CSS · Angular Signals

**Qué se cambió y por qué:**

- **Búsqueda por nombre** — Campo de texto con icono de lupa y botón de limpiar, idéntico en estética al buscador de la despensa. Filtra en tiempo real sobre la lista de recetas.
- **Filtro "Listo para cocinar"** — Pill toggle que, cuando está activo, muestra únicamente las recetas cuyo `overallStatus` es `available` (todos los ingredientes en despensa con cantidad > 0). El pill cambia a verde al activarse para reforzar el estado.
- **Barra sticky con backdrop blur** — La barra de búsqueda y filtros queda fija en la parte superior al hacer scroll, con `bg-mm-base/90 backdrop-blur-md`, coherente con la barra de la despensa.
- **Contador contextual** — El subtítulo del header pasa de "N recetas" a "X de Y" cuando hay algún filtro activo, dando feedback inmediato de cuántos resultados quedan.
- **Estado vacío descriptivo** — Si los filtros no devuelven resultados, el mensaje explica exactamente la causa: sin coincidencias por texto, sin ingredientes completos, o la combinación de ambos.
- **Botón "Limpiar"** — Aparece solo cuando hay algún filtro activo y resetea búsqueda y toggle de disponibilidad de una vez.

---

## `2a737e5` — feat: recipe images, detail modal, edit flow and UI improvements
**Fecha:** 5 jun 2026

**Tecnología:** NestJS · Prisma 7 · Angular 21 · Tailwind CSS · Unsplash CDN

**Qué se cambió y por qué:**

- **Campo `imageUrl` en recetas** — Se añadió el campo opcional `image_url` al modelo `Recipe` en Prisma con su migración correspondiente. El DTO del backend acepta el campo; el frontend actualiza la interfaz `Recipe` y `CreateRecipeDto`.
- **Imagen en las tarjetas** — Cada tarjeta muestra un área de imagen de altura fija (`h-36`) en la parte superior. Si la receta tiene `imageUrl`, se muestra con `object-cover`; si no, aparece un gradiente oscuro con un icono de libro cuyo color varía según la disponibilidad de ingredientes (verde / amarillo / rojo / neutro).
- **Modal de detalle de receta** — Click en la imagen, nombre, descripción o pills de la tarjeta abre un modal de solo lectura con layout de dos columnas: contenido a la izquierda (nombre, estado, pills de metadatos, ingredientes con dots de color, pasos numerados) e imagen a la derecha. En móvil, la imagen se apila encima del contenido. La línea de acento de color en la parte superior refleja el estado de disponibilidad.
- **Separación de interacciones en la tarjeta** — La franja inferior (dots de disponibilidad + chevron) mantiene el toggle expand/collapse mediante `stopPropagation`, mientras que el resto de la card abre el modal de detalle.
- **Flujo de edición desde el detalle** — El modal de detalle incluye un botón de lápiz que cierra el detalle y abre el formulario de edición pre-relleno con todos los datos de la receta, incluyendo ingredientes actuales.
- **Simplificación de la lista de ingredientes** — Tanto en el desplegable de la tarjeta como en el modal de detalle, se eliminó la columna de estado de despensa (texto "En stock", "Agotado"…). Solo se muestra el dot de color, el nombre y la cantidad necesaria para la receta.
- **Flechas personalizadas en selects del pantry** — Los selects de filtros y del modal de despensa usan `appearance-none` con un SVG chevron posicionado a distancia controlada del borde, eliminando la flecha nativa pegada al margen.
- **Altura uniforme en las tarjetas de receta** — `line-clamp-2` en el nombre con `min-h-[2.75rem]` y slot de descripción siempre renderizado con `line-clamp-1` y `min-h-[1rem]` aseguran que todas las tarjetas colapsadas tengan la misma altura.
- **Edición de recetas** — Se añadió el método `update()` al `RecipesService` del frontend (`PATCH /recipes/:id`). El modal de edición pre-rellena nombre, descripción, tiempo, raciones, pasos e ingredientes. El guardado calcula el diff de ingredientes: elimina los modificados o borrados y re-añade los nuevos con la cantidad correcta.

---

## `c6f81e3` — feat: pantry UX polish and app-wide design improvements
**Fecha:** 4 jun 2026

**Tecnología:** Angular 21 · Tailwind CSS · CSS Grid animations

**Qué se cambió y por qué:**

- **Búsqueda y filtros en la despensa** — Se añadió un campo de búsqueda por nombre, filtros de caducidad ("Caduca pronto", "Caducados") y un selector de categoría para localizar ingredientes rápidamente cuando la despensa tiene mucho contenido. Los filtros se muestran como pills redondeados para distinguirlos visualmente de los botones de acción.
- **Ordenación de ingredientes** — Nuevo selector de orden en la barra de filtros: Nombre A→Z, Caducidad próxima primero, o Cantidad (mayor → menor). El orden se aplica dentro de cada categoría.
- **Categorías colapsables con animación suave** — Cada grupo de categoría se puede colapsar/expandir haciendo click en su cabecera. La transición usa la técnica CSS `grid-template-rows: 0fr → 1fr` para una animación fluida sin depender de Angular Animations. Al colapsar, el header muestra un preview con los primeros tres nombres de ingredientes del grupo.
- **Barra de búsqueda sticky** — La sección de búsqueda y filtros queda fija en la parte superior al hacer scroll, con `backdrop-blur-md` para mantener legibilidad sobre el contenido de abajo.
- **Badges de caducidad en móvil** — Antes los badges de caducidad estaban ocultos en pantallas pequeñas (`hidden lg:flex`). Ahora se muestra un dot de color (naranja, amarillo o rojo) en todas las pantallas, y el badge completo con fecha aparece en `lg+`.
- **Mensaje "sin resultados" contextual** — Cuando los filtros no devuelven nada, el mensaje describe exactamente qué filtro está activo ("No se encontró 'tomate'", "No hay ingredientes caducados en stock", etc.).
- **Indicador de ruta activa en el sidebar** — Se añadió una barra vertical de 2px a la izquierda del item de navegación activo, que aparece con transición suave. Complementa el fondo azul tenue que ya existía.
- **Animación de entrada en modales** — Los modales ahora aparecen con un slide-up + fade de 220ms en lugar de mostrarse instantáneamente. El backdrop también tiene su propio fade-in.
- **Focus-visible para navegación por teclado** — Se añadió un anillo de foco azul global (`:focus-visible`) que antes no estaba definido, mejorando la accesibilidad con teclado.
- **Hover más visible en filas** — El color de hover en las filas de ingredientes pasó de `white/[0.03]` a `white/[0.05]`, haciéndolo claramente perceptible sin romper la estética oscura.

---

## `aa95224` — Quick fix to chip size
**Fecha:** 4 jun 2026

**Tecnología:** Angular 21 · Tailwind CSS

**Qué se cambió:**  
Los chips de caducidad y de cantidad en las filas del pantry tenían un tamaño variable según su contenido, lo que hacía que las columnas se desalinearan visualmente entre filas. Se envolvió cada chip en un contenedor `<div>` de ancho fijo (`w-28` para caducidad, `w-24` para cantidad) con `justify-end`, de forma que el chip se ancla a la derecha dentro de su celda y la alineación vertical es consistente independientemente del texto.

---

## `73d4fe9` — feat: ingredients catalog, recipes page and pantry redesign
**Fecha:** 4 jun 2026

**Tecnología:** NestJS · Prisma 7 · PostgreSQL (`pg_trgm`) · Angular 21 · Tailwind CSS · Docker Compose

**Qué se cambió y por qué:**

- **Catálogo global de ingredientes** — Se añadió un módulo `ingredients` en el backend con endpoints CRUD y búsqueda difusa mediante la extensión `pg_trgm` de PostgreSQL. Esto permite autocompletar ingredientes en recetas y en la despensa sin duplicados, y centraliza el vocabulario de ingredientes de la app.
- **Página de recetas** — Se construyó la interfaz frontend de recetas con autocompletado de ingredientes (consumiendo el catálogo), indicadores visuales de disponibilidad en despensa (si el ingrediente está en pantry o no), y tarjetas de estadísticas en el dashboard.
- **Rediseño del pantry** — Se reorganizó la despensa en una cuadrícula multi-columna agrupada por categoría, se añadió una sección "agotados" mostrada como chips compactos, edición inline de cantidad, detección de duplicados al añadir (merge automático), e integración con el catálogo de ingredientes para unificar nomenclatura.
- **Prisma Studio en Docker** — Se configuró el arranque automático de Prisma Studio en el puerto 5555 al levantar el stack de desarrollo, facilitando la inspección de datos sin herramientas externas.

---

## `13c290c` — fix: run prisma migrations automatically on container startup
**Fecha:** 4 jun 2026

**Tecnología:** Docker · Prisma 7 · Shell scripting

**Qué se cambió y por qué:**  
Al arrancar el contenedor del backend, la base de datos podía estar vacía o desactualizada si se clonaba el repositorio en un entorno nuevo. Se añadió la ejecución automática de `prisma migrate deploy` como parte del entrypoint del contenedor, garantizando que el esquema de la base de datos esté siempre al día antes de que el servidor acepte peticiones. Evita el paso manual de migraciones al desplegar o al incorporar a un nuevo desarrollador.

---

## `e52fa9d` — feat: pantry page with category-based expiry and UI polish
**Fecha:** 3 jun 2026

**Tecnología:** NestJS · Prisma 7 · PostgreSQL · Angular 21 · Tailwind CSS · nginx

**Qué se cambió y por qué:**

- **Modelo `IngredientCategory`** — Se añadió una tabla de categorías de ingredientes (13 categorías sembradas con vida útil por defecto: lácteos, carnes, verduras, etc.). Esto permite estimar automáticamente la fecha de caducidad al añadir un producto a la despensa, sin que el usuario tenga que introducirla manualmente.
- **Endpoint `/api/pantry/categories`** — Nueva ruta GET que devuelve todas las categorías disponibles para poblar el selector del modal de añadir.
- **Interfaz del pantry** — Se implementó la página completa de despensa: cuadrícula de tarjetas, modal de añadir con soporte de categoría (caducidad estimada) o fecha manual, y botón de borrado. El color del borde de cada tarjeta refleja la urgencia de caducidad (rojo / amarillo / neutro), y el texto de caducidad está siempre al fondo de la tarjeta mediante `mt-auto`.
- **nginx charset utf-8** — Se corrigió la codificación del servidor nginx para que los caracteres acentuados (ó, é, ñ…) se mostraran correctamente en la UI.

---

## `ad3e5a9` — feat: add frontend auth layer with login, register and app shell
**Fecha:** 3 jun 2026

**Tecnología:** Angular 21 · Angular Signals · HTTP Interceptors · Angular Router · JWT · nginx

**Qué se cambió y por qué:**

- **`AuthService` con señales** — Se implementó el servicio de autenticación usando Angular Signals para que el estado del usuario (logueado / no logueado) sea reactivo en toda la app, sin necesidad de Subject/Observable adicionales.
- **HTTP Interceptor** — Un interceptor adjunta automáticamente el header `Authorization: Bearer <token>` a todas las peticiones salientes, evitando repetir la lógica en cada servicio.
- **Auth Guard** — Protege todas las rutas bajo `/app/**`; redirige al login si no hay sesión activa.
- **Páginas de login y registro** — Diseñadas siguiendo el sistema de diseño oscuro `mm` del proyecto.
- **Callback de Google OAuth** — Manejador de la ruta `/auth/callback?token=` para completar el flujo OAuth y almacenar el token recibido.
- **App shell con sidebar** — Layout principal con navegación lateral (Dashboard, Recetas, Despensa) y botón de cierre de sesión.
- **Configuración SPA en nginx** — Se añadió la regla `try_files` para que las recargas directas de rutas Angular no devuelvan 404.

---

## `14fef39` — feat: add auth, recipes, pantry modules and initial DB migration
**Fecha:** 3 jun 2026

**Tecnología:** NestJS · Prisma 7 · PostgreSQL · JWT · Passport · Google OAuth 2.0 · Docker Compose

**Qué se cambió y por qué:**

- **Autenticación dual** — Se implementó tanto autenticación por email/contraseña (JWT) como Google OAuth 2.0, dando flexibilidad de acceso a los usuarios.
- **Módulos `recipes` y `pantry`** — CRUD completo para recetas e ítems de despensa, ambos aislados por usuario (cada usuario solo ve sus propios datos).
- **Schema Prisma 7 con ESM y `@prisma/adapter-pg`** — Se definió el modelo de datos completo: `User`, `Recipe`, `Ingredient`, `Meal`, `WeeklyPlan`, `PantryItem`. Se configuró Prisma con el adaptador nativo de PostgreSQL para compatibilidad con ESM (módulos ES en Node.js).
- **Migración inicial** — Primera migración que crea todas las tablas en la base de datos.
- **Seed idempotente** — Script de seed que crea un usuario demo y una receta de ejemplo solo si no existen, seguro de ejecutar varias veces.
- **Variables de entorno en Docker Compose** — Todos los secretos necesarios (JWT secret, credenciales OAuth, cadena de conexión DB) se inyectan como variables de entorno al contenedor.

---

## `9fc97ff` — feat: initial version of MealPlanner monorepo
**Fecha:** 2 jun 2026

**Tecnología:** NestJS · Angular 21 · Prisma 7 · PostgreSQL · Tailwind CSS · nginx · Docker Compose · Swagger

**Qué se cambió y por qué:**  
Commit fundacional del proyecto. Se estableció la estructura del monorepo con dos aplicaciones bajo `apps/`:

- **`backend`** — API REST con NestJS, integración con Prisma como ORM, JWT para autenticación y Swagger para documentación automática de endpoints.
- **`frontend`** — SPA con Angular 21 y Tailwind CSS para el sistema de estilos utilitario.
- **Infraestructura** — PostgreSQL como base de datos, servida vía Docker Compose para desarrollo local. nginx actúa como servidor estático del frontend en producción, haciendo proxy de las llamadas `/api` al backend.

Esta base define la arquitectura full-stack que escalan todos los commits posteriores.

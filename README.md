# Backend UCN Inclui2

API REST construida con **NestJS** para gestionar estudiantes y sus ajustes razonables dentro del programa **Incluye UCN-DGE**.

## Objetivo del proyecto

Este backend centraliza la información de:
- Estudiantes
- Ajustes razonables académicos asociados a cada estudiante

La API usa MongoDB, validación con DTOs y documentación Swagger.

## Stack tecnológico

- Node.js + TypeScript
- NestJS
- MongoDB + Mongoose
- class-validator / class-transformer
- Swagger (OpenAPI)
- Jest (tests)
- ESLint + Prettier

## Módulos implementados

- `students`: CRUD de estudiantes
- `adjustments`: CRUD de ajustes razonables

## Estructura principal

```text
src/
  adjustments/
    dto/
    schemas/
    adjustments.controller.ts
    adjustments.service.ts
    adjustments.module.ts
  students/
    dto/
    schemas/
    students.controller.ts
    students.service.ts
    students.module.ts
  app.module.ts
  main.ts
```

## Requisitos previos

- Node.js 20+ (recomendado)
- npm
- MongoDB (local o Atlas)

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto con al menos:

```env
MONGODB_URI=mongodb://localhost:27017/ucn-dge
PORT=3000
```

> También puedes usar MongoDB Atlas cambiando `MONGODB_URI`.

## Levantar MongoDB con Docker (opcional)

El repositorio incluye `docker-compose.yml` para levantar MongoDB:

```bash
docker compose up -d
```

## Ejecutar el proyecto

```bash
# desarrollo
npm run start:dev

# producción (requiere build previo)
npm run build
npm run start:prod
```

## Documentación de la API

Con la aplicación en ejecución:

- Swagger UI: `http://localhost:3000/api`
- Endpoint base: `http://localhost:3000`

## Endpoints principales

### Students

- `POST /students` Crear estudiante
- `GET /students` Listar estudiantes
- `GET /students/:id` Obtener estudiante por id
- `PATCH /students/:id` Actualizar estudiante
- `DELETE /students/:id` Eliminar estudiante

Campos principales de estudiante:
- `rut` (único)
- `name`
- `lastName`
- `email` (único)

### Adjustments

- `POST /adjustments` Crear ajuste
- `GET /adjustments` Listar ajustes
- `GET /adjustments/:id` Obtener ajuste por id
- `PATCH /adjustments/:id` Actualizar ajuste
- `DELETE /adjustments/:id` Eliminar ajuste

Campos principales de ajuste:
- `studentRut`
- `currentAdjustments[]` (tipo, NRC de curso, aprobación y expiración)
- `history[]` (historial de cambios)

## Scripts disponibles

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## Estado actual y próximos pasos

El backend actualmente cubre el CRUD base para estudiantes y ajustes razonables.
Como evolución natural del proyecto, se pueden integrar autenticación JWT/OAuth, control de roles y procesos de notificación.

## Licencia

Proyecto de uso académico.

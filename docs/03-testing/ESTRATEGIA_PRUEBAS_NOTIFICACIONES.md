# 📑 Estrategia de Pruebas – Notificaciones y Scheduler

### Fecha: 06-07-2025

## 1. Objetivos

1. Validar la lógica de negocio del _NotificationsService_:
   - Paginación `findAll(page, limit)`.
   - Operaciones de marcado (`markAsRead`, `markAllAsRead`).
   - Métrica `getUnreadCount`.
   - Limpieza de registros antiguos (`cleanupOldNotifications`).
2. Garantizar que _SemesterSchedulerService_ invoque tareas programadas correctamente:
   - Cron `notificationsCleanup` llame a `cleanupOldNotifications(90)`.
   - `executeFullSemesterSync` retorne un objeto `SyncResult` coherente.

## 2. Alcance

| Tipo de prueba | Cobertura |
|----------------|-----------|
| **Unitarias**  | Lógica pura de servicios y mapeo a repositorios (100 %). |
| **E2E**        | Endpoint `/notifications` y cron jobs (ya cubierto en `test/app.e2e-spec.ts`). |

## 3. Herramientas

- **Jest** con `ts-jest` para unit testing.
- **Supertest** para E2E.
- **mongodb-memory-server** se evaluará a futuro para pruebas con base de datos en memoria.

## 4. Guía de implementación

1. Crear mocks de _NotificationRepository_ y _ConfigService_ para aislar dependencias.
2. Utilizar `jest.spyOn` para verificar llamadas y argumentos.
3. Mantener nomenclatura `*.spec.ts` dentro de `test/unit/**`.
4. Ejecución en CI:
   ```bash
   npm run test      # Unit
   npm run test:e2e  # End-to-end
   ```

## 5. Resultados esperados

- Cobertura mínima **80 %** para los métodos del servicio de notificaciones.
- Cron de limpieza verificado con un mock —sin necesidad de esperar tiempo real.

---
_Este documento se actualiza automáticamente al agregar pruebas nuevas que afecten cobertura o alcance._ 
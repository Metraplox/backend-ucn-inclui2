# SEEDING GUIDE – UCN INCLUI2

> Última actualización: 01-07-2025

Esta guía explica cómo reinicializar la base de datos con datos de prueba coherentes que cubren todos los casos de uso core.

## Objetivos
1. Disponer de datos realistas para validación manual y pruebas automatizadas.
2. Contar con un *dataset* que incluya los 7 roles del sistema, estados variados y relaciones consistentes.
3. Permitir la ejecución del seed en local, CI/CD y entornos de demo con un solo comando.

## Contenido de los seeds
| Colección | Registros | Notas |
|-----------|-----------|-------|
| `departments` | 3 | Informática, Matemáticas, Civil |
| `careers` | 3 | ICI, ICIN, IC |
| `users` | 7 | Uno por rol (coordinador, educadora_social, diddec_staff, jefe_departamento, jefe_carrera, docente, estudiante) |
| `students` | 2 | Con y sin NEE |
| `courses` | 4 | Dos por semestre |
| `adjustments` | 3 | Pendiente, aprobado, rechazado |
| `documents`, `consents`, `notifications`, `resources`, `enrollments` | Datos mínimos funcionando |

Scripts:
- `mongodb-init/01-init-database.js` – Índices y configuración inicial.
- `mongodb-init/02-sample-data.js` – Datos básicos.
- `mongodb-init/03-complete-test-data.js` – Dataset completo (usa **bypass** de validaciones).

> 🛈  Los scripts se ejecutan automáticamente cuando el contenedor `mongodb_prod` se crea **por primera vez**.

## Ejecución paso a paso
```bash
# 1. Parar y eliminar contenedores + volumen
 docker compose -f back/backend-ucn-inclui2/docker-compose.yml down -v

# 2. Levantar stack (Mongo + API)
 docker compose -f back/backend-ucn-inclui2/docker-compose.yml up -d

# 3. Verificar healthcheck
 curl http://localhost:3000/health  # => {"status":"ok"}
```

El volumen `mongo_data` se recrea limpio y los scripts del directorio `mongodb-init` se montan en `/docker-entrypoint-initdb.d`, ejecutándose en orden ascendente.

## Usuarios de prueba
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Coordinador | coordinadora@ucn.cl | (OAuth) |
| Educadora Social | educadora@ucn.cl | (OAuth) |
| DIDDEC Staff | diddec@ucn.cl | (OAuth) |
| Jefe Departamento | jefe.informatica@ucn.cl | (OAuth) |
| Jefe Carrera | jefe.carrera.ici@ucn.cl | (OAuth) |
| Docente | docente1@ucn.cl | (OAuth) |
| Estudiante | estudiante1@alumnos.ucn.cl | (OAuth) |

> Login usa Google OAuth; el backend permite cualquier usuario cuyo correo coincida con la colección `users` en modo desarrollo.

## Integración en CI/CD
- El *compose* monta `mongodb-init`, por lo que los seeds corren también en entornos de CI.
- Próximo paso: agregar `npm run test:e2e` al workflow de GitHub Actions.

---
© 2025 – Equipo Inclui2 
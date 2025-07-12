Última actualización: 11/07/2025

# 🎯 ESTADO ACTUAL DEL SISTEMA UCN INCLUI2

## ✅ Backend y Base de Datos
- **Backend**: Funcionando en http://localhost:3001
- **MongoDB**: Contenedor activo con restart policy
- **Conexión**: Backend conectado exitosamente a la BD
- **Salud**: Endpoint `/health` respondiendo correctamente

## 👥 Usuarios para Login
Los siguientes usuarios están cargados en la base de datos:

| Email | Rol | Contraseña |
|-------|-----|------------|
| coordinadora@ucn.cl | COORDINADORA | inclui2025 |
| educadora@ucn.cl | EDUCADORA_SOCIAL | inclui2025 |
| jefe.carrera@ucn.cl | JEFE_CARRERA | inclui2025 |
| jefe.departamento@ucn.cl | JEFE_DEPARTAMENTO | inclui2025 |
| docente@ucn.cl | DOCENTE | inclui2025 |
| diddec@ucn.cl | DIDDEC_STAFF | inclui2025 |
| estudiante@alumnos.ucn.cl | ESTUDIANTE | inclui2025 |

## 🚀 Frontend Flutter
Para iniciar el frontend:
```bash
cd "c:\Users\fabi_\Desktop\U\Proyecto Plataformas V2\V1\frontend-unified\backend-ucn-inclui2\incluye_app"
flutter run -d web-server --web-port 8080
```

## 📝 Próximos pasos
1. Iniciar frontend Flutter
2. Probar login con los usuarios cargados
3. Verificar que todas las funcionalidades estén operativas

## 🔧 Scripts útiles
- `load-initial-data.bat`: Cargar datos iniciales completos
- `docker-compose up -d`: Iniciar backend y BD
- `docker-compose down -v`: Detener y limpiar volúmenes

---

# Guía de despliegue y robustez de backend

## Problema frecuente: Error de conexión inicial a MongoDB

En algunos entornos Docker, el backend puede intentar conectarse a la base de datos antes de que el contenedor de MongoDB esté completamente listo, generando errores como:

```
MongooseServerSelectionError: getaddrinfo ENOTFOUND mongodb_prod
```

## Solución recomendada

- Se ha configurado `restart: always` en ambos servicios (`app` y `mongodb_prod`) en `docker-compose.yml`.
- Si el backend falla al iniciar por conexión, Docker lo reiniciará automáticamente hasta que la base de datos esté disponible.
- No es necesario intervención manual: el sistema se recupera solo tras unos segundos.

## Buenas prácticas adicionales

- Si el error persiste más de 2 minutos, revisar logs de MongoDB y backend.
- Asegúrate de no tener puertos 27017 ocupados por otra instancia local de MongoDB.
- Para desarrollo, puedes usar `command: npm run start:dev` en el servicio `app` para hot-reload.

---

Consulta siempre este archivo y `requisitos.txt` ante cualquier duda de despliegue o robustez.

# Guía de Pruebas - Funcionalidad DIDDEC

## ✅ Estado Actual de la Implementación

### Componentes Frontend
- ✅ `DiddecDashboardScreen` - Dashboard completo con estadísticas, gráficos y reportes
- ✅ `DiddecService` - Servicio con todos los endpoints correctos
- ✅ `DiddecTestScreen` - Pantalla de pruebas de conectividad
- ❌ `SimpleDiddecScreen` - **ELIMINADO** (solo se usa la versión completa)

### Endpoints Backend Verificados
- ✅ `GET /diddec/statistics?semester=2025-1` - Estadísticas generales
- ✅ `GET /diddec/reports/semester/:semester` - Reporte de semestre
- ✅ `GET /diddec/students/all?semester=2025-1` - Estudiantes con NEE
- ✅ `GET /diddec/adjustments/compliance?semester=2025-1` - Cumplimiento por departamento
- ✅ `GET /diddec/adjustments/trends?years=3` - Tendencias de ajustes
- ✅ `POST /diddec/reports/export` - Exportar reportes
- ✅ `GET /diddec/reports/download/:filename` - Descargar reportes
- ✅ `GET /diddec/resources` - Recursos disponibles
- ✅ `POST /diddec/resources` - Subir recursos (**CORREGIDO**: no usa `/upload`)
- ✅ `GET /diddec/resources/:id/download` - Descargar recursos

### Configuración de Red
- ✅ Frontend configurado para `http://localhost:3002`
- ✅ Backend configurado para puerto `3002`

## 🧪 Cómo Probar la Funcionalidad

### 1. Iniciar el Backend
```bash
cd "c:\Users\fabi_\Desktop\U\proyecto Plataformas V3\Back\backend-ucn-inclui2"
npm run start:dev
```

Esperar a ver el mensaje:
```
Servidor iniciado en: http://localhost:3002
Swagger disponible en: http://localhost:3002/api
```

### 2. Verificar que el Backend Responde
```bash
# Usando curl (si está disponible)
curl http://localhost:3002/health

# Usando PowerShell
Invoke-WebRequest -Uri 'http://localhost:3002/health' -Method Get
```

### 3. Iniciar el Frontend
```bash
cd "c:\Users\fabi_\Desktop\U\proyecto Plataformas V3\Front\backend-ucn-inclui2\incluye_app"
flutter run
```

### 4. Probar la Funcionalidad DIDDEC

#### Opción A: Usar la Pantalla de Pruebas
1. Ir al Dashboard de Administrador
2. Buscar el botón **"TEST DIDDEC"** (color naranja)
3. Presionar y ejecutar todas las pruebas
4. Verificar que los endpoints respondan correctamente

#### Opción B: Usar el Dashboard Normal
1. **Como Administrador:**
   - Ir al Dashboard → "Dashboard DIDDEC" (botón verde-azulado)
   
2. **Como Usuario DIDDEC:**
   - Automáticamente se muestra el dashboard al iniciar sesión

### 5. Verificar Funcionalidades Específicas

#### Dashboard Principal
- ✅ Selector de semestre funciona
- ✅ Estadísticas generales se cargan
- ✅ Gráfico de cumplimiento por departamento
- ✅ Acciones rápidas (generar reporte, ver estudiantes, etc.)

#### Generación de Reportes
- ✅ Diferentes tipos de reporte
- ✅ Múltiples formatos (Excel, PDF, CSV)
- ✅ Descarga de archivos generados

#### Gestión de Recursos
- ✅ Listar recursos disponibles
- ✅ Subir nuevos recursos
- ✅ Búsqueda de recursos

## 🔧 Debugging y Logs

### Frontend (Flutter)
Los logs aparecerán en la consola de Flutter con prefijos:
```
flutter: Haciendo petición a: http://localhost:3002/diddec/statistics?semester=2025-1
flutter: Con token: eyJhbGciOiJIUzI1NiIs...
flutter: Respuesta del servidor: 200
flutter: Cuerpo de la respuesta: {"success":true,"data":...}
```

### Backend (NestJS)
Los logs aparecerán en la consola del backend:
```
[Nest] 12345  - LOG [DiddecService] Obteniendo estadísticas para semestre: 2025-1
[Nest] 12345  - LOG [DiddecController] Estadísticas solicitadas correctamente
```

## ⚠️ Posibles Problemas y Soluciones

### Error de Conectividad
**Síntoma:** `Error al obtener estadísticas: Exception: Token no disponible`
**Solución:** 
1. Verificar que el usuario esté logueado
2. Verificar que el token JWT sea válido
3. Verificar que el usuario tenga rol DIDDEC_STAFF o COORDINADOR

### Error 404 en Endpoints
**Síntoma:** `Error al obtener estadísticas: 404`
**Solución:**
1. Verificar que el backend esté corriendo en puerto 3002
2. Verificar que el módulo DiddecModule esté registrado en app.module.ts
3. Verificar las rutas en el controlador

### Error de CORS
**Síntoma:** `CORS policy error`
**Solución:**
1. Verificar configuración de CORS en main.ts del backend
2. El backend debe permitir `origin: "*"` en desarrollo

### Datos Vacíos
**Síntoma:** Estadísticas muestran 0 estudiantes, 0 ajustes
**Solución:**
1. Verificar que hay datos de prueba en la base de datos
2. Ejecutar los scripts de población de datos
3. Verificar que el semestre usado existe en los datos

## 🎯 Checklist de Funcionalidad Completa

- [ ] Backend inicia correctamente en puerto 3002
- [ ] Frontend se conecta al backend sin errores CORS
- [ ] Usuario puede loguearse con rol DIDDEC_STAFF
- [ ] Dashboard de DIDDEC se carga sin errores
- [ ] Estadísticas muestran datos (no todos en 0)
- [ ] Selector de semestre funciona
- [ ] Gráfico de cumplimiento se renderiza
- [ ] Se pueden generar reportes
- [ ] Se pueden listar recursos
- [ ] Pantalla de pruebas muestra todos los tests en verde (✅)

## 📱 Navegación en la App

### Para Administradores (COORDINADOR)
1. Login → Dashboard Principal
2. Buscar sección "Panel DIDDEC"
3. Presionar "Dashboard DIDDEC" → Acceso al dashboard completo

### Para Staff DIDDEC (DIDDEC_STAFF)
1. Login → Dashboard de DIDDEC (se muestra automáticamente)

### Usuarios Sin Permisos
- No verán opciones relacionadas con DIDDEC
- Si intentan acceder directamente, recibirán error 403

---

**Fecha de última actualización:** 7 de julio de 2025  
**Estado:** Funcionalidad completa implementada y lista para pruebas

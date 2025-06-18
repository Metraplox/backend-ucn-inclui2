# REPORTE DE TESTING EXHAUSTIVO - UCN INCLUI2

**Fecha:** 2025-06-18T23:25:34.830Z  
**Duración:** 0.0 minutos  
**Estado General:** **CRÍTICO**  
**Tasa de Éxito:** **35.9%**

## 📊 RESUMEN EJECUTIVO

- **✅ Tests Exitosos:** 14/39
- **❌ Tests Fallidos:** 25
- **⚠️ Advertencias:** 0
- **🎯 Tasa de Éxito:** 35.9%

## 📋 RESULTADOS POR SUITE

### Autenticación y Autorización
- **Exitosos:** 7/13 (53.8%)
- **Fallidos:** 6
- **Advertencias:** 0

### Funcionalidad de Endpoints
- **Exitosos:** 3/10 (30.0%)
- **Fallidos:** 7
- **Advertencias:** 0

### Control de Roles y Permisos
- **Exitosos:** 1/3 (33.3%)
- **Fallidos:** 2
- **Advertencias:** 0

### Funcionalidades NEE
- **Exitosos:** 0/4 (0.0%)
- **Fallidos:** 4
- **Advertencias:** 0

### Integridad de Datos
- **Exitosos:** 0/2 (0.0%)
- **Fallidos:** 2
- **Advertencias:** 0

### Performance y Carga
- **Exitosos:** 1/4 (25.0%)
- **Fallidos:** 3
- **Advertencias:** 0

### Seguridad del Sistema
- **Exitosos:** 2/3 (66.7%)
- **Fallidos:** 1
- **Advertencias:** 0

## 📝 RESULTADOS DETALLADOS

1. **Health Check** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Sistema operativo
   - Timestamp: 2025-06-18T23:25:33.908Z

2. **Login coordinador** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para coordinadora.inclusion@ucn.cl
   - Timestamp: 2025-06-18T23:25:34.000Z

3. **Login educadora** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para educadora.social@ucn.cl
   - Timestamp: 2025-06-18T23:25:34.121Z

4. **Login diddec** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para director.diddec@ucn.cl
   - Timestamp: 2025-06-18T23:25:34.249Z

5. **Login estudiante_nee** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para estudiante.nee@alumnos.ucn.cl
   - Timestamp: 2025-06-18T23:25:34.399Z

6. **Login estudiante_regular** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para estudiante.regular@alumnos.ucn.cl
   - Timestamp: 2025-06-18T23:25:34.483Z

7. **Login profesor** (AUTHENTICATION)
   - Estado: PASSED
   - Mensaje: Login exitoso para profesor.mat101@ucn.cl
   - Timestamp: 2025-06-18T23:25:34.567Z

8. **Validación JWT coordinador** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.576Z

9. **Validación JWT educadora** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.587Z

10. **Validación JWT diddec** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.601Z

11. **Validación JWT estudiante_nee** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.610Z

12. **Validación JWT estudiante_regular** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.616Z

13. **Validación JWT profesor** (AUTHENTICATION)
   - Estado: FAILED
   - Mensaje: JWT inválido
   - Timestamp: 2025-06-18T23:25:34.623Z

14. **GET /students** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.635Z

15. **GET /adjustments** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.642Z

16. **GET /courses** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.649Z

17. **GET /users** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.655Z

18. **GET /notifications** (ENDPOINTS)
   - Estado: PASSED
   - Mensaje: Status: 200, Data count: N/A
   - Timestamp: 2025-06-18T23:25:34.667Z

19. **GET /consents/all** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Cannot GET /consents/all
   - Timestamp: 2025-06-18T23:25:34.670Z

20. **GET /careers** (ENDPOINTS)
   - Estado: PASSED
   - Mensaje: Status: 200, Data count: N/A
   - Timestamp: 2025-06-18T23:25:34.682Z

21. **GET /departments** (ENDPOINTS)
   - Estado: PASSED
   - Mensaje: Status: 200, Data count: N/A
   - Timestamp: 2025-06-18T23:25:34.691Z

22. **GET /nee-categories** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Cannot GET /nee-categories
   - Timestamp: 2025-06-18T23:25:34.696Z

23. **GET /educational-resources** (ENDPOINTS)
   - Estado: FAILED
   - Mensaje: Cannot GET /educational-resources
   - Timestamp: 2025-06-18T23:25:34.699Z

24. **Coordinador - Acceso completo a estudiantes** (ROLES)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.706Z

25. **Estudiante - Acceso limitado** (ROLES)
   - Estado: PASSED
   - Mensaje: Acceso correctamente denegado
   - Timestamp: 2025-06-18T23:25:34.716Z

26. **Educadora - Acceso a funcionalidades NEE** (ROLES)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.722Z

27. **Consulta estudiantes NEE** (NEE_FUNCTIONALITY)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.731Z

28. **Gestión ajustes académicos** (NEE_FUNCTIONALITY)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.737Z

29. **Sistema de consentimientos** (NEE_FUNCTIONALITY)
   - Estado: FAILED
   - Mensaje: Cannot GET /consents/all
   - Timestamp: 2025-06-18T23:25:34.741Z

30. **Gestión documentos NEE** (NEE_FUNCTIONALITY)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.751Z

31. **Consistencia datos estudiantes** (DATA_INTEGRITY)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.762Z

32. **Relaciones entidades** (DATA_INTEGRITY)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.771Z

33. **Performance /students** (PERFORMANCE)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.783Z

34. **Performance /adjustments** (PERFORMANCE)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.790Z

35. **Performance /courses** (PERFORMANCE)
   - Estado: FAILED
   - Mensaje: Forbidden resource
   - Timestamp: 2025-06-18T23:25:34.798Z

36. **Carga concurrente** (PERFORMANCE)
   - Estado: PASSED
   - Mensaje: 5 requests concurrentes exitosas en 14ms
   - Timestamp: 2025-06-18T23:25:34.814Z

37. **Protección sin autenticación** (SECURITY)
   - Estado: PASSED
   - Mensaje: Endpoint correctamente protegido
   - Timestamp: 2025-06-18T23:25:34.818Z

38. **Protección token inválido** (SECURITY)
   - Estado: PASSED
   - Mensaje: Tokens inválidos correctamente rechazados
   - Timestamp: 2025-06-18T23:25:34.821Z

39. **Headers de seguridad** (SECURITY)
   - Estado: FAILED
   - Mensaje: Headers expuestos: x-powered-by
   - Timestamp: 2025-06-18T23:25:34.825Z

## 🎯 RECOMENDACIONES

❌ **ACCIÓN REQUERIDA** - Resolver problemas críticos antes de producción.

## 🔧 CONFIGURACIÓN DE TESTING

- **Base URL:** http://localhost:3000
- **Timeout:** 15000ms
- **Roles Testeados:** 6
- **Suites Ejecutadas:** 7

---
*Reporte generado automáticamente por el Sistema de Testing UCN INCLUI2*

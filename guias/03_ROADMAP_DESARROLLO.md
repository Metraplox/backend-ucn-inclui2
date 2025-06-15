# 🗺️ ROADMAP DE DESARROLLO - Plan Priorizado
## Proyecto: Plataforma Inclusiva UCN

### 📅 **Última Actualización**: 17 Diciembre 2025
### 🎯 **Objetivo**: Plan estructurado para resolver problemas y continuar desarrollo

---

## 🚨 **EMERGENCIAS - RESOLVER HOY**

### **🔴 Día 1 - Problemas Críticos Inmediatos**
```bash
# ⏱️ Tiempo estimado: 3-4 horas

# 1. ELIMINAR ARCHIVO DUPLICADO (5 min)
rm "src/auth/decorators/user.decorator 2.ts"

# 2. IMPLEMENTAR findByDepartment() (2 horas)
# Ubicación: src/adjustments/adjustments.service.ts líneas 25-31
# Estado actual: return [] (placeholder vacío)
# Impacto: Estadísticas departamentales rotas

# 3. VERIFICAR ESTADÍSTICAS DEPARTAMENTALES (1 hora)
# Endpoint: GET /departments/:id/stats

# 4. TESTING BÁSICO (30 min)
# Verificar que dashboard DIDDEC funciona
```

### **Estado Esperado Fin Día 1**
- ✅ Sin archivos duplicados
- ✅ Estadísticas departamentales funcionando
- ✅ Dashboard DIDDEC con datos reales

---

## ⚡ **ALTA PRIORIDAD - ESTA SEMANA**

### **🔴 Día 2-3 - Sistema de Roles**
```typescript
// ⏱️ Tiempo estimado: 2-3 días

// DÍA 2: DEFINICIÓN Y PREPARACIÓN
// 1. Reunión con stakeholders (2 horas)
//    - Definir roles organizacionales reales
//    - Clarificar Educadora Social vs Coordinadora
//    - Mapear permisos por funcionalidad

// DÍA 3: IMPLEMENTACIÓN
// 1. Actualizar UserRole enum (1 hora)
// 2. Migración de base de datos (2 horas)  
// 3. Actualizar @Roles() decorators (3 horas)
// 4. Testing de permisos (2 horas)
```

### **🔴 Día 4-5 - Refactoring AdjustmentsService**
```typescript
// ⏱️ Tiempo estimado: 2 días
// PROBLEMA: 709 líneas, 6+ responsabilidades
// OBJETIVO: Dividir en servicios especializados

// Crear servicios:
// - adjustments-search.service.ts
// - adjustments-status.service.ts  
// - adjustments-stats.service.ts
// - adjustments-docs.service.ts
// - adjustments-help.service.ts
```

### **Estado Esperado Fin Semana 1**
- ✅ Sistema de roles unificado y seguro
- ✅ AdjustmentsService refactorizado (< 200 líneas)
- ✅ Permisos granulares funcionando

---

## 📋 **PRIORIDAD MEDIA - SEMANAS 2-3**

### **🔧 Semana 2 - Calidad de Código**
- **Lunes**: Exception Handling Consistente
- **Martes**: Eliminación de Duplicaciones  
- **Miércoles**: Enum duplicado staff-adjustments
- **Jueves**: Documentación API faltante
- **Viernes**: Code review setup

### **🔧 Semana 3 - Optimización**
- **Lunes-Martes**: Optimización MongoDB queries
- **Miércoles-Jueves**: Interfaces específicas vs 'any'
- **Viernes**: Testing coverage y estándares

---

## 📊 **CRONOGRAMA VISUAL**

### **Diciembre 2025**
```
Sem 51 (16-22 Dic) | 🚨 CRÍTICO
├── Lun 16: Problemas inmediatos
├── Mar 17: Sistema roles - definición
├── Mié 18: Sistema roles - implementación  
├── Jue 19: Refactoring AdjustmentsService
└── Vie 20: Testing y validación

Sem 52 (23-29 Dic) | ⚠️ ALTA PRIORIDAD
├── Lun 23: Exception handling
├── Mar 24: Eliminación duplicaciones
├── Mié 25: 🎄 NAVIDAD
├── Jue 26: Documentación
└── Vie 27: Code review setup
```

---

## 🎯 **OBJETIVOS POR MILESTONE**

### **🏁 Milestone 1 - Estabilidad (22 Dic)**
- ✅ **Sin problemas críticos** conocidos
- ✅ **Sistema de roles** seguro y funcional
- ✅ **Código mantenible** (servicios < 300 líneas)
- ✅ **Estadísticas** funcionando correctamente

### **🏁 Milestone 2 - Calidad (5 Ene)**
- ✅ **Exception handling** consistente
- ✅ **Documentación** completa y actualizada
- ✅ **Code review** process establecido
- ✅ **Testing coverage** > 80%

---

## 📈 **MÉTRICAS DE ÉXITO**

### **Técnicas**
- **Lines of Code por Servicio**: < 300 líneas
- **Test Coverage**: > 80%
- **Response Time APIs**: < 200ms

### **Funcionales**
- **Dashboard DIDDEC**: Datos reales y actualizados
- **Sistema de Roles**: Permisos granulares funcionando
- **Estadísticas**: Sin datos ficticios o vacíos

---

## 🚧 **RIESGOS Y MITIGACIONES**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración roles falla | Media | Alto | Rollback script + testing exhaustivo |
| Refactoring rompe funcionalidad | Baja | Alto | Testing incremental |
| Stakeholders no disponibles | Alta | Alto | Documentar asunciones |

---

## 📝 **CHECKLIST DE SEGUIMIENTO**

### **Diario**
- [ ] Actualizar estado en `02_PROBLEMAS_IDENTIFICADOS.md`
- [ ] Commit con mensaje descriptivo
- [ ] Testing básico de cambios

### **Semanal**
- [ ] Actualizar roadmap con progreso real
- [ ] Review de métricas técnicas
- [ ] Planning de próxima semana

---

## 🔄 **PROCESO DE SEGUIMIENTO**

### **Daily Checks (5 min)**
- Review problemas críticos pendientes
- Actualizar estado en guías
- Identificar bloqueadores

### **Weekly Reviews (30 min)**
- Review objetivos cumplidos vs planificados
- Ajuste de roadmap si necesario
- Planning próxima semana

---

> **🎯 Nota**: Este roadmap debe actualizarse semanalmente. Los plazos son estimaciones y pueden ajustarse según necesidades del equipo. 
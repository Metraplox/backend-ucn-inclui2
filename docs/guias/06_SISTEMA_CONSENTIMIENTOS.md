# 📋 SISTEMA DE CONSENTIMIENTOS UCN INCLUI2

## 🎯 **OBJETIVO**

Sistema de consentimientos que permite a estudiantes con NEE autorizar o denegar el compartir su información de diagnóstico con docentes y otras áreas académicas, respetando su privacidad y cumpliendo con las regulaciones de protección de datos.

## 📑 **FUNDAMENTO LEGAL**

Basado en el **Formato de Consentimiento UCN 2025** oficial, que establece:
- **Participación opcional** en compartir diagnóstico
- **Control granular** de acceso a información sensible
- **Trazabilidad completa** de decisiones del estudiante

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Esquema de Datos**
```typescript
Consent {
  studentId: ObjectId,          // Estudiante propietario
  allowsDataSharing: boolean,   // Autoriza compartir diagnóstico
  consentDate: Date,           // Fecha de la decisión
  studentRut: string,          // RUT para auditoría
  studentName: string,         // Nombre completo
  studentCareer: string,       // Carrera académica
  comments?: string,           // Comentarios del estudiante
  registeredBy: ObjectId,      // Usuario que registró
  ipAddress?: string,          // IP de auditoría
  userAgent?: string,          // Navegador de auditoría
  isActive: boolean,           // Estado activo
  revokedAt?: Date,           // Fecha de revocación
  revocationReason?: string,  // Motivo de revocación
}
```

### **Control de Acceso Granular**

#### **🔍 INFORMACIÓN DE DIAGNÓSTICO/NEE:**
- **Coordinadora + Educadora Social**: SIEMPRE acceso completo
- **Docentes + Otras áreas**: SOLO con consentimiento autorizado
- **Propio estudiante**: SIEMPRE acceso completo

#### **📄 DOCUMENTOS SENSIBLES:**
- **Coordinadora + Educadora Social**: SOLO con consentimiento autorizado
- **Otros roles**: NUNCA acceso
- **Propio estudiante**: SIEMPRE acceso completo

#### **🔧 AJUSTES ACADÉMICOS:**
- **Coordinadora + Educadora Social**: SIEMPRE acceso completo
- **Docentes**: SIEMPRE (sin necesidad de consentimiento para aplicar ajustes)
- **Propio estudiante**: SIEMPRE acceso completo

## 🛠️ **API ENDPOINTS**

### **Endpoints para Estudiantes**
```
POST   /consents                    # Crear/actualizar consentimiento
GET    /consents/my-consent         # Ver consentimiento actual
PATCH  /consents/revoke             # Revocar consentimiento
```

### **Endpoints Administrativos**
```
GET    /consents/all               # Listar todos (Coordinador/Educadora)
GET    /consents/stats             # Estadísticas (Admin)
```

## 🔒 **MÉTODOS DE AUTORIZACIÓN**

### **ConsentService.canViewSensitiveInfo()**
```typescript
// Controla acceso a diagnósticos, información NEE
canViewSensitiveInfo(studentId, userRole, requestingUserId): boolean
```

### **ConsentService.canViewDocuments()**
```typescript
// Controla acceso a documentos sensibles
canViewDocuments(studentId, userRole, requestingUserId): boolean
```

### **ConsentService.canViewAdjustments()**
```typescript
// Controla acceso a ajustes académicos (siempre permitido a docentes)
canViewAdjustments(studentId, userRole, requestingUserId): boolean
```

## 📱 **INTEGRACIÓN FRONTEND**

### **ConsentService (Dart)**
```dart
// Autorizar/actualizar consentimiento
ConsentService.createOrUpdateConsent(allowsDataSharing: true)

// Revocar consentimiento
ConsentService.revokeConsent(reason: "Motivo")

// Obtener estado actual
ConsentService.getMyConsent()
```

## 🗄️ **MIGRACIÓN DE DATOS**

### **Script de Migración**
```bash
node scripts/migrate-consents.js
```

Convierte consentimientos antiguos (`documentId` + `isConsentGiven`) al nuevo esquema (`studentId` + `allowsDataSharing`).

## 🧪 **TESTING**

### **Script de Verificación**
```powershell
.\scripts\test-consent-system.ps1 -Verbose
```

**Tests incluidos:**
- ✅ Autenticación de usuarios
- ✅ CRUD de consentimientos
- ✅ Control de acceso a documentos
- ✅ Endpoints administrativos
- ✅ Seguridad y autorización

## 📊 **CASOS DE USO**

### **Escenario 1: Estudiante Autoriza Compartir**
```
🟢 CON CONSENTIMIENTO:
├── Coordinadora/Educadora: Ve TODO (diagnóstico + documentos + ajustes)
├── Docentes: Ve diagnóstico + ajustes (NO documentos)
├── Otras áreas: Ve diagnóstico según configuración
└── Estudiante: Ve TODO siempre
```

### **Escenario 2: Estudiante NO Autoriza**
```
🔴 SIN CONSENTIMIENTO:
├── Coordinadora/Educadora: Ve ajustes únicamente (NO diagnóstico/documentos)
├── Docentes: Ve ajustes únicamente (NO diagnóstico)
├── Otras áreas: NO acceso
└── Estudiante: Ve TODO siempre
```

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **Seguridad**
- Todos los endpoints protegidos con JWT
- Validación de roles en cada operación
- Trazabilidad completa (IP, UserAgent, timestamps)

### **Privacidad**
- Principio de menor privilegio
- Control granular por tipo de información
- Respeto a decisiones del estudiante

### **Auditoría**
- Registro completo de cambios
- Motivos de revocación
- Historial immutable

## 🔄 **FLUJO DE TRABAJO**

1. **Estudiante ingresa al sistema**
2. **Decide sobre consentimiento** (opcional)
3. **Sistema aplica controles** según decisión
4. **Staff accede según permisos** configurados
5. **Estudiante puede revocar** en cualquier momento
6. **Auditoría registra** todas las acciones

## 🎯 **BENEFICIOS**

- ✅ **Cumplimiento legal** con regulaciones UCN
- ✅ **Privacidad garantizada** del estudiante
- ✅ **Flexibilidad total** en decisiones
- ✅ **Trazabilidad completa** para auditorías
- ✅ **Integración perfecta** con sistemas existentes

---

> **💡 TIP:** El sistema está diseñado para ser **flexible y respetuoso** con las decisiones de privacidad del estudiante, garantizando que siempre tengan control total sobre su información sensible. 
# 🏗️ SISTEMA DE DATOS REALES Y ACTUALIZACIÓN SEMESTRAL
## Proyecto: Plataforma Inclusiva UCN - Gestión Automática de Datos

### 📅 **Última Actualización**: Enero 2025
### 🎯 **Objetivo**: Sistema completo para poblar BD con datos reales y automatizar actualizaciones semestrales

---

## 🔍 **ANÁLISIS DEL SISTEMA ACTUAL**

### **✅ INFRAESTRUCTURA EXISTENTE**

#### **1. Sistema Hawaii UCN (API Externa)**
```typescript
// Servicios ya implementados:
- HawaiiService: Conexión API institucional UCN
- Hawaii Sync Service: Sincronización datos NEE
- Sync Service: Gestión completa de sincronización
- Sync Controller: Endpoints de sincronización manual
```

#### **2. Fuentes de Datos Reales**
```
📡 API Hawaii UCN:
   • /estudiantes - Todos los estudiantes UCN
   • /oferta?semestre=YYYY-P - Cursos por semestre
   • /inscripcion?semestre=YYYY-P - Matrículas por semestre

📁 Archivos Institucionales:
   • ESTUDIANTES_NEE_CSV.txt - Lista oficial estudiantes NEE
   • ESTUDIANTES_NEE_TEST.txt - Datos de prueba
   • JSON imports - Datos masivos estructurados
```

#### **3. Módulos de Sincronización**
```
🔄 SyncService (Principal):
   • syncNeeStudents() - Estudiantes NEE
   • syncAndPersistNeeStudents() - Persistencia estudiantes
   • syncAndPersistCourses() - Persistencia cursos
   • syncInscriptions() - Matrículas por semestre

📊 Logging y Monitoreo:
   • SyncLog schema - Registro completo de sincronizaciones
   • Estados: SUCCESS, PARTIAL, ERROR, WARNING
   • Métricas: total intentos, exitosos, fallos
```

---

## 🎯 **ESTRATEGIA DE IMPLEMENTACIÓN**

### **FASE 1: CONFIGURACIÓN INICIAL DE DATOS REALES**

#### **Paso 1.1: Configurar Credenciales Hawaii UCN**
```bash
# .env.production
HAWAII_API_KEY=your_hawaii_api_key
HAWAII_API_TOKEN=your_hawaii_token
HAWAII_BASE_URL=https://api.hawaii.ucn.cl

# Para desarrollo/testing
HAWAII_SYNC_ENABLED=true
NEE_STUDENTS_FILE=ESTUDIANTES_NEE_CSV.txt
```

#### **Paso 1.2: Preparar Archivos de Datos NEE**
```bash
# Estructura requerida en backend-ucn-inclui2/
GUIA-PROYECTO/
├── ESTUDIANTES_NEE_CSV.txt      # Lista oficial UCN
├── json_estudiantes-hawaii.txt   # Datos masivos estudiantes
├── json_cursos-hawaii.txt        # Datos masivos cursos
└── json_inscripciones-hawaii.txt # Datos masivos inscripciones
```

#### **Paso 1.3: Script de Carga Inicial**
```typescript
// scripts/initial-data-load.ts
export class InitialDataLoader {
  async loadRealData(semester: string) {
    console.log(`🚀 Iniciando carga de datos reales para semestre ${semester}`);
    
    // 1. Limpiar datos de prueba
    await this.cleanTestData();
    
    // 2. Cargar estudiantes NEE reales
    const students = await this.syncService.syncAndPersistNeeStudents(semester);
    console.log(`✅ ${students.count} estudiantes NEE cargados`);
    
    // 3. Cargar cursos del semestre
    const courses = await this.syncService.syncAndPersistCourses(semester);
    console.log(`✅ ${courses.count} cursos cargados`);
    
    // 4. Cargar inscripciones
    const enrollments = await this.syncEnrollments(semester);
    console.log(`✅ ${enrollments.length} inscripciones cargadas`);
    
    // 5. Validar integridad
    await this.validateDataIntegrity(semester);
    
    console.log(`🎉 Carga inicial completada para semestre ${semester}`);
  }
}
```

### **FASE 2: SISTEMA DE ACTUALIZACIÓN SEMESTRAL**

#### **Paso 2.1: Scheduler Automático**
```typescript
// src/scheduler/semester-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class SemesterSchedulerService {
  constructor(private readonly syncService: SyncService) {}
  
  // Ejecutar el 1 de marzo y 1 de agosto (inicio semestres UCN)
  @Cron('0 6 1 3,8 *') // 06:00 AM el día 1 de marzo y agosto
  async autoSyncNewSemester() {
    const currentSemester = this.getCurrentSemester();
    
    console.log(`🔄 Iniciando sincronización automática semestre ${currentSemester}`);
    
    try {
      // 1. Sync estudiantes NEE
      await this.syncService.syncAndPersistNeeStudents(currentSemester);
      
      // 2. Sync cursos nuevos
      await this.syncService.syncAndPersistCourses(currentSemester);
      
      // 3. Notification coordinadores
      await this.notifyCoordinators(currentSemester);
      
      console.log(`✅ Sincronización automática completada: ${currentSemester}`);
    } catch (error) {
      console.error(`❌ Error en sincronización automática:`, error);
      await this.notifyAdministrators(error, currentSemester);
    }
  }
  
  private getCurrentSemester(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Semestre 1: Marzo-Julio, Semestre 2: Agosto-Diciembre
    return month >= 3 && month <= 7 ? `${year}-1` : `${year}-2`;
  }
}
```

#### **Paso 2.2: Endpoints de Sincronización Manual**
```typescript
// src/sync/semester-sync.controller.ts
@Controller('semester-sync')
@UseGuards(JwtAuthGuard, RoleGuard(['DIDDEC', 'COORDINADOR']))
export class SemesterSyncController {
  
  @Post('full-sync/:semester')
  @ApiOperation({ summary: 'Sincronización completa de un semestre' })
  async fullSemesterSync(@Param('semester') semester: string) {
    const startTime = Date.now();
    
    try {
      // 1. Validar formato semestre
      if (!semester.match(/^\d{4}-[1-2]$/)) {
        throw new BadRequestException('Formato de semestre inválido (debe ser YYYY-P)');
      }
      
      // 2. Sincronización completa
      const results = await this.semesterSyncService.performFullSync(semester);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        semester,
        duration: `${duration}ms`,
        results: {
          students: results.students,
          courses: results.courses,
          enrollments: results.enrollments
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new InternalServerErrorException(`Error en sincronización: ${error.message}`);
    }
  }
  
  @Get('sync-status/:semester')
  @ApiOperation({ summary: 'Estado de sincronización de un semestre' })
  async getSyncStatus(@Param('semester') semester: string) {
    return await this.semesterSyncService.getSyncStatus(semester);
  }
}
```

### **FASE 3: VALIDACIÓN Y MONITOREO**

#### **Paso 3.1: Dashboard de Monitoreo**
```typescript
// src/admin/sync-monitoring.service.ts
@Injectable()
export class SyncMonitoringService {
  
  async getSemesterSyncDashboard(semester: string) {
    const [students, courses, enrollments, logs] = await Promise.all([
      this.getStudentsSyncStatus(semester),
      this.getCoursesSyncStatus(semester),
      this.getEnrollmentsSyncStatus(semester),
      this.getSyncLogs(semester)
    ]);
    
    return {
      semester,
      overview: {
        totalStudentsNEE: students.total,
        totalCourses: courses.total,
        totalEnrollments: enrollments.total,
        lastSyncDate: logs[0]?.createdAt,
        syncHealth: this.calculateSyncHealth(logs)
      },
      details: { students, courses, enrollments },
      recentLogs: logs.slice(0, 10)
    };
  }
  
  private calculateSyncHealth(logs: SyncLog[]): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' {
    const recentLogs = logs.slice(0, 5);
    const successRate = recentLogs.filter(log => log.status === SyncStatus.SUCCESS).length / recentLogs.length;
    
    if (successRate >= 0.9) return 'EXCELLENT';
    if (successRate >= 0.7) return 'GOOD';
    if (successRate >= 0.5) return 'WARNING';
    return 'CRITICAL';
  }
}
```

---

## 🛠️ **SCRIPTS DE IMPLEMENTACIÓN**

### **Script 1: Carga Inicial de Datos Reales**
```bash
# scripts/load-real-data.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$Semester,
    
    [switch]$ForceClean
)

Write-Host "🏗️ CARGA DE DATOS REALES - SEMESTRE $Semester" -ForegroundColor Cyan

# 1. Validar archivos requeridos
$requiredFiles = @(
    "GUIA-PROYECTO/ESTUDIANTES_NEE_CSV.txt",
    "GUIA-PROYECTO/json_estudiantes-hawaii.txt",
    "GUIA-PROYECTO/json_cursos-hawaii.txt"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "❌ Archivo requerido no encontrado: $file"
        exit 1
    }
}

# 2. Limpieza opcional de datos de prueba
if ($ForceClean) {
    Write-Host "🧹 Limpiando datos de prueba..." -ForegroundColor Yellow
    npm run clean-test-data
}

# 3. Carga de estudiantes NEE
Write-Host "👥 Cargando estudiantes NEE..." -ForegroundColor Green
$response = Invoke-RestMethod -Uri "http://localhost:3000/sync/students/nee/persist" -Method POST -Headers @{
    "Content-Type" = "application/json"
} -Body (@{ semester = $Semester } | ConvertTo-Json)

Write-Host "✅ Estudiantes NEE: $($response.count) cargados"

# 4. Carga de cursos
Write-Host "📚 Cargando cursos del semestre..." -ForegroundColor Green
$response = Invoke-RestMethod -Uri "http://localhost:3000/sync/courses/persist" -Method POST -Headers @{
    "Content-Type" = "application/json"
} -Body (@{ semester = $Semester } | ConvertTo-Json)

Write-Host "✅ Cursos: $($response.count) cargados"

# 5. Validación final
Write-Host "🔍 Validando integridad de datos..." -ForegroundColor Blue
$validation = Invoke-RestMethod -Uri "http://localhost:3000/semester-sync/sync-status/$Semester" -Method GET

if ($validation.health -eq "EXCELLENT" -or $validation.health -eq "GOOD") {
    Write-Host "🎉 Carga de datos reales completada exitosamente!" -ForegroundColor Green
    Write-Host "📊 Resumen:"
    Write-Host "   • Estudiantes NEE: $($validation.overview.totalStudentsNEE)"
    Write-Host "   • Cursos: $($validation.overview.totalCourses)"
    Write-Host "   • Estado: $($validation.health)"
} else {
    Write-Warning "⚠️ Carga completada con advertencias. Estado: $($validation.health)"
}
```

### **Script 2: Actualización Semestral Automática**
```bash
# scripts/semester-auto-update.ps1
param(
    [string]$TargetSemester = ""
)

if (-not $TargetSemester) {
    # Calcular semestre actual automáticamente
    $currentDate = Get-Date
    $year = $currentDate.Year
    $month = $currentDate.Month
    
    $TargetSemester = if ($month -ge 3 -and $month -le 7) { "$year-1" } else { "$year-2" }
}

Write-Host "🔄 ACTUALIZACIÓN SEMESTRAL AUTOMÁTICA - $TargetSemester" -ForegroundColor Cyan

try {
    # 1. Pre-validación
    Write-Host "🔍 Validando prerequisitos..." -ForegroundColor Blue
    $preCheck = Invoke-RestMethod -Uri "http://localhost:3000/semester-sync/pre-check/$TargetSemester" -Method GET
    
    if (-not $preCheck.canProceed) {
        Write-Error "❌ Pre-validación falló: $($preCheck.reason)"
        exit 1
    }
    
    # 2. Sincronización completa
    Write-Host "🚀 Iniciando sincronización completa..." -ForegroundColor Green
    $syncResult = Invoke-RestMethod -Uri "http://localhost:3000/semester-sync/full-sync/$TargetSemester" -Method POST
    
    # 3. Reporte de resultados
    Write-Host "📊 RESULTADOS DE SINCRONIZACIÓN:" -ForegroundColor Green
    Write-Host "   • Estudiantes NEE: $($syncResult.results.students.count)"
    Write-Host "   • Cursos: $($syncResult.results.courses.count)"
    Write-Host "   • Inscripciones: $($syncResult.results.enrollments.count)"
    Write-Host "   • Duración: $($syncResult.duration)"
    Write-Host "   • Estado: EXITOSO ✅"
    
    # 4. Notificación a coordinadores
    Write-Host "📧 Enviando notificaciones..." -ForegroundColor Blue
    Invoke-RestMethod -Uri "http://localhost:3000/notifications/semester-sync-complete" -Method POST -Headers @{
        "Content-Type" = "application/json"
    } -Body (@{ 
        semester = $TargetSemester
        results = $syncResult.results 
    } | ConvertTo-Json)
    
    Write-Host "🎉 ¡Actualización semestral completada exitosamente!" -ForegroundColor Green
    
} catch {
    Write-Error "❌ Error en actualización semestral: $($_.Exception.Message)"
    
    # Notificar administradores sobre el error
    try {
        Invoke-RestMethod -Uri "http://localhost:3000/notifications/semester-sync-error" -Method POST -Headers @{
            "Content-Type" = "application/json"
        } -Body (@{ 
            semester = $TargetSemester
            error = $_.Exception.Message
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        } | ConvertTo-Json)
    } catch {
        Write-Warning "⚠️ No se pudo enviar notificación de error"
    }
    
    exit 1
}
```

---

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Semana 1: Preparación y Configuración**
- [ ] **Día 1-2**: Configurar credenciales Hawaii UCN
- [ ] **Día 3-4**: Preparar archivos de datos reales NEE
- [ ] **Día 5**: Testing de conexión Hawaii API

### **Semana 2: Desarrollo de Servicios**
- [ ] **Día 1-2**: Implementar SemesterSchedulerService
- [ ] **Día 3-4**: Crear SemesterSyncController
- [ ] **Día 5**: Desarrollar SyncMonitoringService

### **Semana 3: Scripts y Automatización**
- [ ] **Día 1-2**: Crear scripts PowerShell de carga inicial
- [ ] **Día 3-4**: Desarrollar scripts de actualización automática
- [ ] **Día 5**: Testing completo de scripts

### **Semana 4: Testing y Validación**
- [ ] **Día 1-2**: Testing de carga inicial con datos reales
- [ ] **Día 3-4**: Simulación de actualización semestral
- [ ] **Día 5**: Validación de integridad y rendimiento

---

## 🎯 **MEJORES PRÁCTICAS IMPLEMENTADAS**

### **🔒 Seguridad y Privacidad**
```typescript
// Filtrado automático solo estudiantes NEE
const neeRuts = await readNeeList(); // Lista oficial UCN
const filteredStudents = allStudents.filter(s => neeRuts.includes(s.rut));

// Encriptación campos sensibles
const encryptedData = await this.encryptService.encryptSensitiveFields(studentData);
```

### **📊 Logging y Auditoria**
```typescript
// Registro completo de sincronizaciones
await this.createSyncLog(
  SyncType.ESTUDIANTES_NEE,
  semester,
  SyncStatus.SUCCESS,
  totalAttempted,
  totalSuccessful,
  detailedMessage
);
```

### **🔄 Recuperación de Errores**
```typescript
// Reintentos automáticos con backoff exponencial
for (let retry = 0; retry < maxRetries; retry++) {
  try {
    await this.syncOperation();
    break;
  } catch (error) {
    if (retry === maxRetries - 1) throw error;
    await this.sleep(Math.pow(2, retry) * 1000);
  }
}
```

### **⚡ Optimización de Rendimiento**
```typescript
// Procesamiento en lotes para grandes volúmenes
const batches = this.createBatches(students, 50);
for (const batch of batches) {
  await Promise.all(batch.map(student => this.processStudent(student)));
}
```

---

## 🚀 **PRÓXIMOS PASOS INMEDIATOS**

### **Para Implementación Inmediata**
1. **Obtener credenciales Hawaii UCN** desde administración UCN
2. **Configurar archivos CSV** con lista oficial estudiantes NEE
3. **Ejecutar script de carga inicial** con datos del semestre actual
4. **Configurar scheduler** para próximo semestre

### **Para Monitoreo Continuo**
1. **Dashboard de administración** con métricas en tiempo real
2. **Alertas automáticas** por fallos de sincronización
3. **Reportes semanales** de estado del sistema
4. **Backup automático** antes de cada sincronización

---

## 📈 **MÉTRICAS DE ÉXITO**

### **KPIs Técnicos**
- ✅ **Tasa de sincronización exitosa**: >95%
- ✅ **Tiempo de sincronización completa**: <30 minutos
- ✅ **Integridad de datos**: 100%
- ✅ **Disponibilidad del sistema**: >99.5%

### **KPIs Funcionales**
- ✅ **Estudiantes NEE sincronizados**: 100% de lista oficial
- ✅ **Cursos actualizados**: 100% oferta semestral
- ✅ **Inscripciones precisas**: Concordancia con SIGA UCN
- ✅ **Notificaciones automáticas**: Coordinadores informados

---

> **💡 NOTA CRÍTICA**: Este sistema convierte la plataforma en una **solución completamente autónoma** que se mantiene actualizada automáticamente cada semestre, reduciendo la carga administrativa y garantizando datos siempre precisos y actualizados.

---

**📄 Documento técnico especializado** | **📅 Versión**: 1.0 | **🎯 Estado**: LISTO PARA IMPLEMENTACIÓN 
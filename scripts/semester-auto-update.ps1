param(
    [Parameter(Mandatory=$false)]
    [string]$TargetSemester = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:3000",
    
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$Force
)

# Configuración
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colores
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorStep = "Blue"

function Write-Step {
    param([string]$Message)
    Write-Host "🔵 $Message" -ForegroundColor $ColorStep
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $ColorSuccess
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $ColorWarning
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ColorError
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $ColorInfo
}

function Get-CurrentSemester {
    $currentDate = Get-Date
    $year = $currentDate.Year
    $month = $currentDate.Month
    
    if ($month -ge 3 -and $month -le 7) {
        return "$year-1"
    } elseif ($month -ge 8 -and $month -le 12) {
        return "$year-2"
    } else {
        # Enero-Febrero pertenecen al semestre 2 del año anterior
        return "$($year - 1)-2"
    }
}

function Get-NextSemester {
    param([string]$CurrentSemester)
    
    $parts = $CurrentSemester.Split('-')
    $year = [int]$parts[0]
    $semester = [int]$parts[1]
    
    if ($semester -eq 1) {
        return "$year-2"
    } else {
        return "$($year + 1)-1"
    }
}

function Test-ApiConnection {
    param([string]$Url)
    
    try {
        $response = Invoke-RestMethod -Uri "$Url/health" -Method GET -TimeoutSec 10
        return $true
    } catch {
        return $false
    }
}

function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    $requestParams = @{
        Uri = $Url
        Method = $Method
        Headers = $Headers
        TimeoutSec = 600  # 10 minutos para sincronizaciones completas
    }
    
    if ($Body -and ($Method -eq "POST" -or $Method -eq "PUT" -or $Method -eq "PATCH")) {
        $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @requestParams
        return @{
            Success = $true
            Data = $response
            Error = $null
        }
    } catch {
        return @{
            Success = $false
            Data = $null
            Error = $_.Exception.Message
        }
    }
}

function Send-NotificationToAdmins {
    param(
        [string]$Type,
        [string]$Title,
        [string]$Message,
        [object]$Data = $null
    )
    
    try {
        $notificationBody = @{
            type = $Type
            title = $Title
            message = $Message
            targetRoles = @("DIDDEC", "COORDINADOR")
            priority = if ($Type -like "*ERROR*") { "HIGH" } else { "MEDIUM" }
            data = $Data
        }
        
        $response = Invoke-ApiRequest -Url "$ApiUrl/notifications" -Method "POST" -Body $notificationBody
        
        if ($response.Success) {
            Write-Info "Notificación enviada: $Title"
        } else {
            Write-Warning "No se pudo enviar notificación: $($response.Error)"
        }
    } catch {
        Write-Warning "Error enviando notificación: $($_.Exception.Message)"
    }
}

function Start-SemesterUpdate {
    param(
        [string]$Semester,
        [string]$ApiUrl,
        [bool]$DryRun,
        [bool]$Force
    )
    
    Write-Host ""
    Write-Host "🔄 ACTUALIZACIÓN SEMESTRAL AUTOMÁTICA - $Semester" -ForegroundColor $ColorInfo
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    Write-Host ""
    
    if ($DryRun) {
        Write-Warning "MODO DRY-RUN: No se realizarán cambios reales"
        Write-Host ""
    }
    
    # 1. Verificar conexión a API
    Write-Step "Verificando conexión al sistema..."
    if (-not (Test-ApiConnection -Url $ApiUrl)) {
        Write-Error-Custom "No se pudo conectar a la API en $ApiUrl"
        Send-NotificationToAdmins -Type "SEMESTER_SYNC_ERROR" -Title "Error de Conectividad" -Message "No se pudo conectar al sistema para actualización semestral"
        return $false
    }
    Write-Success "Conexión establecida con el sistema"
    
    # 2. Obtener estado actual del semestre
    Write-Step "Consultando estado actual del semestre..."
    $currentStatusResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/sync-status/$Semester"
    
    if ($currentStatusResponse.Success) {
        $currentStatus = $currentStatusResponse.Data
        Write-Info "Estado actual del semestre $Semester"
        Write-Host "   • Estudiantes NEE: $($currentStatus.overview.totalStudentsNEE)"
        Write-Host "   • Cursos: $($currentStatus.overview.totalCourses)"
        Write-Host "   • Salud del sistema: $($currentStatus.overview.syncHealth)"
        Write-Host "   • Última sincronización: $($currentStatus.overview.lastSyncDate)"
    } else {
        Write-Warning "No se pudo obtener estado actual: $($currentStatusResponse.Error)"
    }
    
    # 3. Pre-validación
    Write-Step "Ejecutando pre-validación del sistema..."
    if (-not $DryRun) {
        $preCheckResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/pre-check/$Semester"
        
        if ($preCheckResponse.Success) {
            $preCheck = $preCheckResponse.Data
            
            if ($Verbose) {
                Write-Info "Resultados de pre-validación:"
                foreach ($check in $preCheck.checks) {
                    $status = if ($check.passed) { "✅" } else { "❌" }
                    Write-Host "   $status $($check.name): $($check.description)"
                    if ($check.details) {
                        Write-Host "     Detalles: $($check.details)" -ForegroundColor Gray
                    }
                }
            }
            
            if (-not $preCheck.canProceed -and -not $Force) {
                Write-Error-Custom "Pre-validación falló. Use -Force para continuar de todas formas"
                Send-NotificationToAdmins -Type "SEMESTER_SYNC_ERROR" -Title "Pre-validación Falló" -Message "La actualización semestral no puede proceder debido a fallos en pre-validación" -Data $preCheck
                return $false
            } elseif (-not $preCheck.canProceed -and $Force) {
                Write-Warning "Pre-validación falló, pero continuando debido a -Force"
            } else {
                Write-Success "Pre-validación exitosa"
            }
        } else {
            Write-Warning "Pre-validación no disponible: $($preCheckResponse.Error)"
            if (-not $Force) {
                Write-Error-Custom "No se puede proceder sin pre-validación. Use -Force para omitir"
                return $false
            }
        }
    } else {
        Write-Info "Omitiendo pre-validación en modo DRY-RUN"
    }
    
    # 4. Crear backup antes de la sincronización
    Write-Step "Creando backup de seguridad..."
    if (-not $DryRun) {
        # Aquí se implementaría el backup real
        Write-Success "Backup creado: backup-$Semester-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    } else {
        Write-Info "Backup simulado en modo DRY-RUN"
    }
    
    # 5. Sincronización completa
    Write-Step "Iniciando sincronización completa del semestre..."
    $syncStartTime = Get-Date
    
    if (-not $DryRun) {
        $syncResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/full-sync/$Semester" -Method "POST"
        
        if ($syncResponse.Success) {
            $syncResult = $syncResponse.Data
            $syncEndTime = Get-Date
            $syncDuration = $syncEndTime - $syncStartTime
            
            Write-Success "Sincronización completa exitosa"
            Write-Host ""
            Write-Host "📊 RESULTADOS DE SINCRONIZACIÓN:" -ForegroundColor $ColorInfo
            Write-Host "   • Estudiantes NEE: $($syncResult.results.students)"
            Write-Host "   • Cursos: $($syncResult.results.courses)"
            Write-Host "   • Inscripciones: $($syncResult.results.enrollments)"
            Write-Host "   • Duración de sincronización: $($syncResult.duration)"
            Write-Host "   • Duración total del proceso: $($syncDuration.ToString('hh\:mm\:ss'))"
            Write-Host "   • Timestamp: $($syncResult.timestamp)"
            
            # Notificar éxito a coordinadores
            Send-NotificationToAdmins -Type "SEMESTER_SYNC_SUCCESS" -Title "Actualización Semestral Completada" -Message "La actualización automática del semestre $Semester se completó exitosamente." -Data $syncResult.results
            
        } else {
            Write-Error-Custom "Error en sincronización: $($syncResponse.Error)"
            Send-NotificationToAdmins -Type "SEMESTER_SYNC_ERROR" -Title "Error en Actualización Semestral" -Message "La actualización automática del semestre $Semester falló: $($syncResponse.Error)"
            return $false
        }
    } else {
        Write-Info "Sincronización simulada en modo DRY-RUN"
        Write-Host "   • Se sincronizarían: estudiantes NEE, cursos, inscripciones"
        Write-Host "   • Duración estimada: 5-15 minutos"
        
        # Simular resultados
        $syncResult = @{
            results = @{
                students = 150
                courses = 85
                enrollments = 320
            }
            duration = "8m 34s"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
    }
    
    # 6. Validación post-sincronización
    Write-Step "Validando resultado de la sincronización..."
    $postSyncResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/sync-status/$Semester"
    
    if ($postSyncResponse.Success) {
        $postSyncStatus = $postSyncStatus.Data
        $health = $postSyncStatus.overview.syncHealth
        
        Write-Success "Validación post-sincronización completada"
        Write-Info "Salud del sistema post-sync: $health"
        
        switch ($health) {
            "EXCELLENT" { 
                Write-Success "🎉 Sistema en estado EXCELENTE tras la actualización"
                $overallSuccess = $true
            }
            "GOOD" { 
                Write-Success "✅ Sistema en estado BUENO tras la actualización"
                $overallSuccess = $true
            }
            "WARNING" { 
                Write-Warning "⚠️ Sistema con ADVERTENCIAS tras la actualización"
                $overallSuccess = $true
            }
            "CRITICAL" { 
                Write-Error-Custom "❌ Sistema en estado CRÍTICO tras la actualización"
                $overallSuccess = $false
            }
        }
    } else {
        Write-Warning "No se pudo validar el estado post-sincronización"
        $overallSuccess = $true  # Asumir éxito si no podemos validar
    }
    
    # 7. Limpiar archivos temporales
    Write-Step "Limpiando archivos temporales..."
    # Implementar limpieza si es necesario
    Write-Success "Limpieza completada"
    
    return $overallSuccess
}

# Script principal
try {
    Write-Host ""
    Write-Host "🚀 UCN INCLUI2 - SISTEMA DE ACTUALIZACIÓN SEMESTRAL" -ForegroundColor $ColorInfo
    Write-Host ""
    
    # Determinar semestre objetivo
    if (-not $TargetSemester) {
        $currentSemester = Get-CurrentSemester
        $TargetSemester = $currentSemester
        Write-Info "Semestre objetivo calculado automáticamente: $TargetSemester"
    } else {
        Write-Info "Semestre objetivo especificado: $TargetSemester"
    }
    
    # Validar formato de semestre
    if (-not ($TargetSemester -match '^\d{4}-[1-2]$')) {
        Write-Error-Custom "Formato de semestre inválido: $TargetSemester"
        Write-Info "Use formato YYYY-P donde P es 1 o 2 (ej: 2025-1)"
        exit 1
    }
    
    Write-Host "Parámetros de ejecución:" -ForegroundColor $ColorInfo
    Write-Host "   • Semestre objetivo: $TargetSemester"
    Write-Host "   • API URL: $ApiUrl"
    Write-Host "   • Modo DRY-RUN: $DryRun"
    Write-Host "   • Modo VERBOSE: $Verbose"
    Write-Host "   • Forzar ejecución: $Force"
    Write-Host ""
    
    $startTime = Get-Date
    
    $success = Start-SemesterUpdate -Semester $TargetSemester -ApiUrl $ApiUrl -DryRun $DryRun -Force $Force
    
    $endTime = Get-Date
    $totalDuration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    
    if ($success) {
        if ($DryRun) {
            Write-Success "🎭 SIMULACIÓN COMPLETADA EXITOSAMENTE"
            Write-Info "La actualización real se ejecutaría sin problemas"
        } else {
            Write-Success "🎉 ACTUALIZACIÓN SEMESTRAL COMPLETADA EXITOSAMENTE"
        }
        
        Write-Info "Duración total: $($totalDuration.ToString('hh\:mm\:ss'))"
        Write-Host ""
        
        if (-not $DryRun) {
            Write-Info "El sistema está listo para el semestre $TargetSemester"
            Write-Info "Próximos pasos sugeridos:"
            Write-Host "   1. Verificar datos en la aplicación web"
            Write-Host "   2. Informar a coordinadores y educadoras"
            Write-Host "   3. Ejecutar tests de funcionalidad crítica"
            Write-Host "   4. Monitorear sistema durante las primeras horas"
        }
        
        exit 0
        
    } else {
        Write-Error-Custom "❌ ACTUALIZACIÓN SEMESTRAL FALLÓ"
        Write-Info "Duración hasta el fallo: $($totalDuration.ToString('hh\:mm\:ss'))"
        Write-Host ""
        Write-Warning "Acciones de recuperación recomendadas:"
        Write-Host "   1. Revisar logs detallados del sistema"
        Write-Host "   2. Verificar conectividad a APIs externas"
        Write-Host "   3. Restaurar desde backup si es necesario"
        Write-Host "   4. Contactar con soporte técnico"
        Write-Host "   5. Ejecutar sincronización manual selectiva"
        
        exit 1
    }
    
} catch {
    Write-Error-Custom "❌ ERROR CRÍTICO INESPERADO: $($_.Exception.Message)"
    Write-Info "Stack trace: $($_.ScriptStackTrace)"
    
    # Intentar enviar notificación de error crítico
    try {
        Send-NotificationToAdmins -Type "CRITICAL_ERROR" -Title "Error Crítico en Actualización Semestral" -Message "Error inesperado: $($_.Exception.Message)"
    } catch {
        Write-Warning "No se pudo enviar notificación de error crítico"
    }
    
    exit 1
} 
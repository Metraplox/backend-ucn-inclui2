param(
    [Parameter(Mandatory=$true)]
    [string]$Semester,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:3000",
    
    [switch]$ForceClean,
    [switch]$SkipValidation,
    [switch]$Verbose
)

# Configuración
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colores para output
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorStep = "Blue"

# Headers para requests
$Headers = @{
    "Content-Type" = "application/json"
}

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

function Test-ApiConnection {
    param([string]$Url)
    
    try {
        $response = Invoke-RestMethod -Uri "$Url/health" -Method GET -TimeoutSec 10
        return $true
    } catch {
        return $false
    }
}

function Test-RequiredFiles {
    $requiredFiles = @(
        "GUIA-PROYECTO/ESTUDIANTES_NEE_CSV.txt",
        "src/sync/utils/read-nee-list.ts"
    )
    
    $missingFiles = @()
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    return $missingFiles
}

function Get-AuthToken {
    param([string]$ApiUrl)
    
    # Para datos reales, se necesitaría autenticación real
    # Por ahora retornamos null para endpoints públicos
    return $null
}

function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"},
        [string]$Token = $null
    )
    
    if ($Token) {
        $Headers["Authorization"] = "Bearer $Token"
    }
    
    $requestParams = @{
        Uri = $Url
        Method = $Method
        Headers = $Headers
        TimeoutSec = 300
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

function Start-DataLoad {
    param(
        [string]$Semester,
        [string]$ApiUrl,
        [bool]$ForceClean,
        [bool]$SkipValidation
    )
    
    Write-Host ""
    Write-Host "🏗️ CARGA DE DATOS REALES - SEMESTRE $Semester" -ForegroundColor $ColorInfo
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    Write-Host ""
    
    # 1. Validaciones iniciales
    Write-Step "Ejecutando validaciones iniciales..."
    
    # Validar formato de semestre
    if (-not ($Semester -match '^\d{4}-[1-2]$')) {
        Write-Error-Custom "Formato de semestre inválido. Use formato YYYY-P (ej: 2025-1)"
        exit 1
    }
    Write-Success "Formato de semestre válido: $Semester"
    
    # Verificar conexión a API
    Write-Info "Verificando conexión a API en $ApiUrl..."
    if (-not (Test-ApiConnection -Url $ApiUrl)) {
        Write-Error-Custom "No se pudo conectar a la API en $ApiUrl"
        Write-Warning "Asegúrese de que el backend esté ejecutándose"
        exit 1
    }
    Write-Success "Conexión a API establecida"
    
    # Verificar archivos requeridos
    if (-not $SkipValidation) {
        Write-Info "Verificando archivos requeridos..."
        $missingFiles = Test-RequiredFiles
        if ($missingFiles.Count -gt 0) {
            Write-Error-Custom "Archivos requeridos no encontrados:"
            foreach ($file in $missingFiles) {
                Write-Host "   • $file" -ForegroundColor $ColorError
            }
            Write-Warning "Use -SkipValidation para omitir esta verificación"
            exit 1
        }
        Write-Success "Todos los archivos requeridos están presentes"
    }
    
    # 2. Limpieza opcional de datos de prueba
    if ($ForceClean) {
        Write-Step "Limpiando datos de prueba existentes..."
        # Aquí se implementaría la limpieza de datos de prueba
        Write-Warning "Limpieza de datos no implementada en esta versión"
    }
    
    # 3. Obtener token de autenticación
    Write-Step "Configurando autenticación..."
    $authToken = Get-AuthToken -ApiUrl $ApiUrl
    if ($authToken) {
        $Headers["Authorization"] = "Bearer $authToken"
        Write-Success "Token de autenticación obtenido"
    } else {
        Write-Info "Usando endpoints públicos (sin autenticación)"
    }
    
    # 4. Pre-validación del sistema
    Write-Step "Ejecutando pre-validación del sistema..."
    $preCheckResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/pre-check/$Semester" -Headers $Headers
    
    if ($preCheckResponse.Success) {
        $preCheck = $preCheckResponse.Data
        Write-Success "Pre-validación completada"
        
        if ($Verbose) {
            Write-Info "Resultados de pre-validación:"
            foreach ($check in $preCheck.checks) {
                $status = if ($check.passed) { "✅" } else { "❌" }
                Write-Host "   $status $($check.name): $($check.description)" -ForegroundColor $(if ($check.passed) { $ColorSuccess } else { $ColorError })
            }
        }
        
        if (-not $preCheck.canProceed) {
            Write-Error-Custom "Pre-validación falló. No se puede proceder con la sincronización"
            exit 1
        }
    } else {
        Write-Warning "Pre-validación no disponible: $($preCheckResponse.Error)"
    }
    
    # 5. Carga de estudiantes NEE
    Write-Step "Cargando estudiantes NEE..."
    $studentsBody = @{ semester = $Semester }
    $studentsResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/sync-students/$Semester" -Method "POST" -Body $studentsBody -Headers $Headers
    
    if ($studentsResponse.Success) {
        $studentsData = $studentsResponse.Data
        Write-Success "Estudiantes NEE cargados: $($studentsData.studentsCount)"
        if ($Verbose) {
            Write-Info "Duración: $($studentsData.duration)"
        }
    } else {
        Write-Error-Custom "Error cargando estudiantes NEE: $($studentsResponse.Error)"
        return $false
    }
    
    # 6. Carga de cursos
    Write-Step "Cargando cursos del semestre..."
    $coursesBody = @{ semester = $Semester }
    $coursesResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/sync-courses/$Semester" -Method "POST" -Body $coursesBody -Headers $Headers
    
    if ($coursesResponse.Success) {
        $coursesData = $coursesResponse.Data
        Write-Success "Cursos cargados: $($coursesData.coursesCount)"
        if ($Verbose) {
            Write-Info "Duración: $($coursesData.duration)"
        }
    } else {
        Write-Error-Custom "Error cargando cursos: $($coursesResponse.Error)"
        return $false
    }
    
    # 7. Validación final de integridad
    Write-Step "Validando integridad de datos cargados..."
    $statusResponse = Invoke-ApiRequest -Url "$ApiUrl/semester-sync/sync-status/$Semester" -Headers $Headers
    
    if ($statusResponse.Success) {
        $status = $statusResponse.Data
        $health = $status.overview.syncHealth
        
        Write-Success "Validación de integridad completada"
        Write-Host ""
        Write-Host "📊 RESUMEN DE CARGA:" -ForegroundColor $ColorInfo
        Write-Host "   • Semestre: $($status.semester)"
        Write-Host "   • Estudiantes NEE: $($status.overview.totalStudentsNEE)"
        Write-Host "   • Cursos: $($status.overview.totalCourses)"
        Write-Host "   • Estado del sistema: $health"
        Write-Host "   • Última sincronización: $($status.overview.lastSyncDate)"
        
        switch ($health) {
            "EXCELLENT" { 
                Write-Success "🎉 Carga de datos reales completada EXITOSAMENTE!"
                return $true
            }
            "GOOD" { 
                Write-Success "✅ Carga de datos reales completada con calidad BUENA"
                return $true
            }
            "WARNING" { 
                Write-Warning "⚠️ Carga completada con ADVERTENCIAS. Revisar logs del sistema"
                return $true
            }
            "CRITICAL" { 
                Write-Error-Custom "❌ Carga completada pero con problemas CRÍTICOS"
                return $false
            }
        }
    } else {
        Write-Warning "No se pudo validar la integridad: $($statusResponse.Error)"
        Write-Success "Carga aparentemente exitosa, pero sin validación final"
        return $true
    }
    
    return $true
}

# Script principal
try {
    Write-Host ""
    Write-Host "🚀 INICIANDO CARGA DE DATOS REALES UCN INCLUI2" -ForegroundColor $ColorInfo
    Write-Host "Parámetros:" -ForegroundColor $ColorInfo
    Write-Host "   • Semestre: $Semester"
    Write-Host "   • API URL: $ApiUrl"
    Write-Host "   • Forzar limpieza: $ForceClean"
    Write-Host "   • Omitir validación: $SkipValidation"
    Write-Host "   • Modo verbose: $Verbose"
    Write-Host ""
    
    $startTime = Get-Date
    
    $success = Start-DataLoad -Semester $Semester -ApiUrl $ApiUrl -ForceClean $ForceClean -SkipValidation $SkipValidation
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    
    if ($success) {
        Write-Success "🎉 PROCESO COMPLETADO EXITOSAMENTE"
        Write-Info "Duración total: $($duration.ToString('hh\:mm\:ss'))"
        Write-Host ""
        Write-Info "Próximos pasos recomendados:"
        Write-Host "   1. Verificar datos en la aplicación web"
        Write-Host "   2. Ejecutar tests de funcionalidad"
        Write-Host "   3. Configurar sincronización automática"
        exit 0
    } else {
        Write-Error-Custom "❌ PROCESO FALLÓ"
        Write-Info "Duración: $($duration.ToString('hh\:mm\:ss'))"
        Write-Host ""
        Write-Warning "Acciones recomendadas:"
        Write-Host "   1. Revisar logs del backend"
        Write-Host "   2. Verificar conectividad a APIs externas"
        Write-Host "   3. Validar archivos de datos"
        exit 1
    }
    
} catch {
    Write-Error-Custom "❌ ERROR INESPERADO: $($_.Exception.Message)"
    Write-Info "Stack trace: $($_.ScriptStackTrace)"
    exit 1
} 
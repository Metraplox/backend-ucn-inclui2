# Script de testing para el nuevo sistema de consentimientos UCN Inclui2
# Ejecutar: powershell -ExecutionPolicy Bypass .\scripts\test-consent-system.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose = $false
)

Write-Host "🧪 TESTING SISTEMA DE CONSENTIMIENTOS UCN INCLUI2" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Variables globales
$Global:StudentToken = $null
$Global:CoordinadorToken = $null
$Global:TestResults = @()

function Write-TestResult {
    param($TestName, $Success, $Details = "")
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Success) { "Green" } else { "Red" }
    
    Write-Host "$status - $TestName" -ForegroundColor $color
    if ($Verbose -and $Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
    
    $Global:TestResults += @{
        Test = $TestName
        Success = $Success
        Details = $Details
    }
}

function Invoke-ApiCall {
    param($Endpoint, $Method = "GET", $Token = $null, $Body = $null)
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

# 1. HEALTH CHECK
Write-Host "🔍 1. VERIFICANDO CONECTIVIDAD" -ForegroundColor Yellow
$health = Invoke-ApiCall -Endpoint "/health"
Write-TestResult "Health Check" $health.Success $health.Error

if (-not $health.Success) {
    Write-Host "❌ No se puede conectar al servidor. Verifique que esté ejecutándose." -ForegroundColor Red
    exit 1
}

# 2. AUTENTICACIÓN
Write-Host "`n🔐 2. AUTENTICACIÓN DE USUARIOS" -ForegroundColor Yellow

# Login estudiante
$studentLogin = Invoke-ApiCall -Endpoint "/auth/login" -Method "POST" -Body @{
    email = "juan.perez@alumnos.ucn.cl"
    password = "123456"
}

if ($studentLogin.Success) {
    $Global:StudentToken = $studentLogin.Data.access_token
    Write-TestResult "Login Estudiante" $true "Token obtenido"
} else {
    Write-TestResult "Login Estudiante" $false $studentLogin.Error
}

# Login coordinador
$coordinadorLogin = Invoke-ApiCall -Endpoint "/auth/login" -Method "POST" -Body @{
    email = "coord.inclui2@ucn.cl"
    password = "123456"
}

if ($coordinadorLogin.Success) {
    $Global:CoordinadorToken = $coordinadorLogin.Data.access_token
    Write-TestResult "Login Coordinador" $true "Token obtenido"
} else {
    Write-TestResult "Login Coordinador" $false $coordinadorLogin.Error
}

# 3. TESTING ENDPOINTS DE CONSENTIMIENTOS
Write-Host "`n📋 3. TESTING ENDPOINTS DE CONSENTIMIENTOS" -ForegroundColor Yellow

# 3.1 Obtener consentimiento actual del estudiante
$myConsent = Invoke-ApiCall -Endpoint "/consents/my-consent" -Token $Global:StudentToken
Write-TestResult "GET /consents/my-consent (Estudiante)" $myConsent.Success

# 3.2 Crear/actualizar consentimiento (autorizar)
$createConsent = Invoke-ApiCall -Endpoint "/consents" -Method "POST" -Token $Global:StudentToken -Body @{
    allowsDataSharing = $true
    comments = "Autorizo para testing del sistema"
}
Write-TestResult "POST /consents (Autorizar)" $createConsent.Success

# 3.3 Verificar consentimiento actualizado
$updatedConsent = Invoke-ApiCall -Endpoint "/consents/my-consent" -Token $Global:StudentToken
$hasConsent = $updatedConsent.Success -and $updatedConsent.Data.allowsDataSharing
Write-TestResult "Verificar Consentimiento Autorizado" $hasConsent

# 3.4 Revocar consentimiento
$revokeConsent = Invoke-ApiCall -Endpoint "/consents/revoke" -Method "PATCH" -Token $Global:StudentToken -Body @{
    reason = "Testing revocación del sistema"
}
Write-TestResult "PATCH /consents/revoke" $revokeConsent.Success

# 3.5 Verificar revocación
$revokedConsent = Invoke-ApiCall -Endpoint "/consents/my-consent" -Token $Global:StudentToken
$isRevoked = $revokedConsent.Success -and (-not $revokedConsent.Data.allowsDataSharing)
Write-TestResult "Verificar Consentimiento Revocado" $isRevoked

# 3.6 Restaurar consentimiento para otros tests
$restoreConsent = Invoke-ApiCall -Endpoint "/consents" -Method "POST" -Token $Global:StudentToken -Body @{
    allowsDataSharing = $true
    comments = "Restaurado para continuar testing"
}
Write-TestResult "Restaurar Consentimiento" $restoreConsent.Success

# 4. TESTING ENDPOINTS ADMINISTRATIVOS
Write-Host "`n👥 4. TESTING ENDPOINTS ADMINISTRATIVOS" -ForegroundColor Yellow

# 4.1 Listar todos los consentimientos (coordinador)
$allConsents = Invoke-ApiCall -Endpoint "/consents/all" -Token $Global:CoordinadorToken
Write-TestResult "GET /consents/all (Coordinador)" $allConsents.Success

# 4.2 Obtener estadísticas
$stats = Invoke-ApiCall -Endpoint "/consents/stats" -Token $Global:CoordinadorToken
Write-TestResult "GET /consents/stats (Coordinador)" $stats.Success

if ($stats.Success -and $Verbose) {
    Write-Host "    Estadísticas: Total=$($stats.Data.total), Con Consentimiento=$($stats.Data.withConsent)" -ForegroundColor Gray
}

# 4.3 Verificar acceso denegado para estudiante en endpoints admin
$studentAllConsents = Invoke-ApiCall -Endpoint "/consents/all" -Token $Global:StudentToken
$isBlocked = -not $studentAllConsents.Success -and $studentAllConsents.StatusCode -eq 403
Write-TestResult "Bloqueo Estudiante en /consents/all" $isBlocked

# 5. TESTING CONTROL DE ACCESO A DOCUMENTOS
Write-Host "`n📄 5. TESTING CONTROL DE ACCESO A DOCUMENTOS" -ForegroundColor Yellow

# Obtener ID del estudiante desde su token
$studentProfile = Invoke-ApiCall -Endpoint "/auth/profile" -Token $Global:StudentToken
if ($studentProfile.Success) {
    $studentId = $studentProfile.Data.studentId
    
    # 5.1 Coordinador intenta acceder a documentos CON consentimiento
    $docsWithConsent = Invoke-ApiCall -Endpoint "/documents/student/$studentId" -Token $Global:CoordinadorToken
    Write-TestResult "Acceso Documentos CON Consentimiento" $docsWithConsent.Success
    
    # 5.2 Revocar consentimiento temporalmente
    $tempRevoke = Invoke-ApiCall -Endpoint "/consents/revoke" -Method "PATCH" -Token $Global:StudentToken -Body @{
        reason = "Testing temporal para documentos"
    }
    
    if ($tempRevoke.Success) {
        # 5.3 Coordinador intenta acceder a documentos SIN consentimiento
        $docsWithoutConsent = Invoke-ApiCall -Endpoint "/documents/student/$studentId" -Token $Global:CoordinadorToken
        $isBlocked = -not $docsWithoutConsent.Success -and $docsWithoutConsent.StatusCode -eq 403
        Write-TestResult "Bloqueo Documentos SIN Consentimiento" $isBlocked
        
        # 5.4 Restaurar consentimiento
        $finalRestore = Invoke-ApiCall -Endpoint "/consents" -Method "POST" -Token $Global:StudentToken -Body @{
            allowsDataSharing = $true
            comments = "Restaurado final"
        }
        Write-TestResult "Restauración Final Consentimiento" $finalRestore.Success
    }
}

# 6. RESUMEN FINAL
Write-Host "`n📊 RESUMEN DE TESTING" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$totalTests = $Global:TestResults.Count
$passedTests = ($Global:TestResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $passedTests
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "Total de Tests: $totalTests" -ForegroundColor White
Write-Host "Tests Exitosos: $passedTests" -ForegroundColor Green
Write-Host "Tests Fallidos: $failedTests" -ForegroundColor Red
Write-Host "Tasa de Éxito: $successRate%" -ForegroundColor $(if ($successRate -ge 95) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

if ($failedTests -gt 0) {
    Write-Host "`n❌ TESTS FALLIDOS:" -ForegroundColor Red
    $Global:TestResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "   - $($_.Test): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 EVALUACIÓN FINAL:" -ForegroundColor Cyan
if ($successRate -ge 95) {
    Write-Host "✅ EXCELENTE - Sistema de consentimientos funcionando perfectamente" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "⚠️ BUENO - Sistema mayormente funcional con algunos problemas menores" -ForegroundColor Yellow
} else {
    Write-Host "❌ CRÍTICO - Sistema de consentimientos requiere correcciones urgentes" -ForegroundColor Red
}

Write-Host "`n🔚 Testing completado." -ForegroundColor Cyan 
# 🔍 Script de Validación de Producción UCN Inclui2
# Valida que todos los servicios estén funcionando correctamente

Write-Host "🚀 Iniciando validación del sistema UCN Inclui2..." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Yellow

# Función para validar servicios
function Test-Service {
    param($Name, $Url, $ExpectedStatus = 200)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Name : OK (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name : FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name : ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para validar contenedores Docker
function Test-DockerContainers {
    Write-Host "`n🐳 Validando contenedores Docker..." -ForegroundColor Cyan
    
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}"
    Write-Host $containers
    
    $appContainer = docker ps -q -f name=ucn_inclui2_production
    $mongoContainer = docker ps -q -f name=ucn_inclui2_mongodb
    
    if ($appContainer) {
        Write-Host "✅ Contenedor de aplicación: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "❌ Contenedor de aplicación: NOT RUNNING" -ForegroundColor Red
        return $false
    }
    
    if ($mongoContainer) {
        Write-Host "✅ Contenedor de MongoDB: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "❌ Contenedor de MongoDB: NOT RUNNING" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Validaciones principales
$results = @()

Write-Host "`n🌐 Validando servicios web..." -ForegroundColor Cyan
$results += Test-Service "API Principal" "http://localhost:3000"
$results += Test-Service "Documentación Swagger" "http://localhost:3000/api"

Write-Host "`n🔐 Validando endpoints protegidos (esperamos 401)..." -ForegroundColor Cyan
$results += Test-Service "Categories (Auth Required)" "http://localhost:3000/categories" 401
$results += Test-Service "Users (Auth Required)" "http://localhost:3000/users" 401

# Validar contenedores
$dockerValid = Test-DockerContainers

# Validar MongoDB
Write-Host "`n🗄️ Validando MongoDB..." -ForegroundColor Cyan
try {
    $mongoLogs = docker logs ucn_inclui2_mongodb --tail 10
    if ($mongoLogs -match "waiting for connections") {
        Write-Host "✅ MongoDB: Aceptando conexiones" -ForegroundColor Green
        $mongoValid = $true
    } else {
        Write-Host "❌ MongoDB: No está aceptando conexiones" -ForegroundColor Red
        $mongoValid = $false
    }
} catch {
    Write-Host "❌ MongoDB: Error al verificar logs" -ForegroundColor Red
    $mongoValid = $false
}

# Validar aplicación
Write-Host "`n📱 Validando aplicación..." -ForegroundColor Cyan
try {
    $appLogs = docker logs ucn_inclui2_production --tail 5
    if ($appLogs -match "Nest application successfully started") {
        Write-Host "✅ Aplicación: Iniciada correctamente" -ForegroundColor Green
        $appValid = $true
    } else {
        Write-Host "❌ Aplicación: No se inició correctamente" -ForegroundColor Red
        $appValid = $false
    }
} catch {
    Write-Host "❌ Aplicación: Error al verificar logs" -ForegroundColor Red
    $appValid = $false
}

# Resumen final
Write-Host "`n📊 RESUMEN DE VALIDACIÓN" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

$passedTests = ($results | Where-Object { $_ -eq $true }).Count
$totalTests = $results.Count
$allDockerValid = $dockerValid -and $mongoValid -and $appValid

Write-Host "🌐 Tests de API: $passedTests/$totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Red" })
Write-Host "🐳 Docker Services: $(if ($allDockerValid) { "✅ VÁLIDO" } else { "❌ INVÁLIDO" })" -ForegroundColor $(if ($allDockerValid) { "Green" } else { "Red" })

if ($passedTests -eq $totalTests -and $allDockerValid) {
    Write-Host "`n🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!" -ForegroundColor Green
    Write-Host "   • API funcionando en: http://localhost:3000" -ForegroundColor White
    Write-Host "   • Swagger disponible en: http://localhost:3000/api" -ForegroundColor White
    Write-Host "   • MongoDB funcionando correctamente" -ForegroundColor White
    Write-Host "   • Todos los contenedores operativos" -ForegroundColor White
    exit 0
} else {
    Write-Host "`n⚠️ SISTEMA TIENE PROBLEMAS - Revisar logs" -ForegroundColor Red
    exit 1
} 
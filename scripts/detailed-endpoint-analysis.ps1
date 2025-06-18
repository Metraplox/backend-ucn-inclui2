# 🔬 ANÁLISIS DETALLADO DE ENDPOINTS - UCN INCLUI2
# Verificación específica de rutas implementadas vs documentadas

Write-Host "🔬 ANÁLISIS DETALLADO DE ENDPOINTS UCN INCLUI2" -ForegroundColor Green
Write-Host "📊 Verificando estructura real de la API" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Función para análisis detallado
function Analyze-Endpoint {
    param([string]$Method, [string]$Url, [string]$Description)
    
    Write-Host "🔍 $Description" -ForegroundColor White
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 3
        Write-Host "   ✅ OPERATIVO" -ForegroundColor Green
        return "WORKING"
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        switch ($code) {
            401 { 
                Write-Host "   🔒 PROTEGIDO" -ForegroundColor Yellow
                return "PROTECTED"
            }
            404 { 
                Write-Host "   📭 NO IMPLEMENTADO" -ForegroundColor Red
                return "NOT_IMPLEMENTED"
            }
            default { 
                Write-Host "   ❌ ERROR $code" -ForegroundColor Red
                return "ERROR"
            }
        }
    }
}

Write-Host "📊 1. VERIFICACIÓN DE SWAGGER/DOCUMENTACIÓN" -ForegroundColor Blue
Write-Host ""

# Verificar acceso a Swagger
try {
    $swaggerUrl = "$baseUrl/api"
    $response = Invoke-WebRequest -Uri $swaggerUrl -Method GET -TimeoutSec 5
    Write-Host "✅ Swagger disponible en $swaggerUrl" -ForegroundColor Green
    Write-Host "   📄 Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "   📏 Tamaño: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "❌ Swagger no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 2. ENDPOINTS CORE FUNCIONANDO" -ForegroundColor Blue
Write-Host ""

$working = @()
$protected = @()
$notImplemented = @()

# Verificar endpoints básicos
$result1 = Analyze-Endpoint -Method "GET" -Url "$baseUrl" -Description "Health Check"
if ($result1 -eq "WORKING") { $working += "GET /" }

$result2 = Analyze-Endpoint -Method "GET" -Url "$baseUrl/health" -Description "Health específico"
if ($result2 -eq "WORKING") { $working += "GET /health" }

Write-Host ""
Write-Host "🔒 3. ENDPOINTS PROTEGIDOS (CORRECTO)" -ForegroundColor Blue
Write-Host ""

# Verificar endpoints protegidos principales
$mainEndpoints = @(
    @{ Method = "GET"; Url = "$baseUrl/users"; Description = "Usuarios" },
    @{ Method = "GET"; Url = "$baseUrl/students"; Description = "Estudiantes" },
    @{ Method = "GET"; Url = "$baseUrl/adjustments"; Description = "Ajustes" },
    @{ Method = "GET"; Url = "$baseUrl/resources"; Description = "Recursos" },
    @{ Method = "GET"; Url = "$baseUrl/notifications"; Description = "Notificaciones" }
)

foreach ($endpoint in $mainEndpoints) {
    $result = Analyze-Endpoint -Method $endpoint.Method -Url $endpoint.Url -Description $endpoint.Description
    if ($result -eq "PROTECTED") {
        $protected += "$($endpoint.Method) $($endpoint.Url -replace $baseUrl, '')"
    }
}

Write-Host ""
Write-Host "❓ 4. ENDPOINTS NO IMPLEMENTADOS" -ForegroundColor Blue
Write-Host ""

# Verificar endpoints que podrían faltar
$possibleEndpoints = @(
    @{ Method = "GET"; Url = "$baseUrl/categories"; Description = "Categorías" },
    @{ Method = "GET"; Url = "$baseUrl/departments"; Description = "Departamentos" },
    @{ Method = "GET"; Url = "$baseUrl/careers"; Description = "Carreras" },
    @{ Method = "GET"; Url = "$baseUrl/courses"; Description = "Cursos" },
    @{ Method = "GET"; Url = "$baseUrl/consent"; Description = "Consentimientos" }
)

foreach ($endpoint in $possibleEndpoints) {
    $result = Analyze-Endpoint -Method $endpoint.Method -Url $endpoint.Url -Description $endpoint.Description
    if ($result -eq "NOT_IMPLEMENTED") {
        $notImplemented += "$($endpoint.Method) $($endpoint.Url -replace $baseUrl, '')"
    } elseif ($result -eq "PROTECTED") {
        $protected += "$($endpoint.Method) $($endpoint.Url -replace $baseUrl, '')"
    }
}

Write-Host ""
Write-Host "🔄 5. VERIFICACIÓN DIRECTA DE CONTROLADORES" -ForegroundColor Blue
Write-Host ""

Write-Host "📁 Verificando estructura de controladores en el código..." -ForegroundColor Cyan

# Buscar archivos de controladores
$controllers = Get-ChildItem -Path "src" -Recurse -Filter "*controller.ts" | Where-Object { $_.Name -notlike "*spec*" }

Write-Host "🎯 Controladores encontrados: $($controllers.Count)" -ForegroundColor White
foreach ($controller in $controllers) {
    $relativePath = $controller.FullName -replace [regex]::Escape($PWD.Path + "\"), ""
    Write-Host "   📄 $relativePath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗄️ 6. VERIFICACIÓN DE BASE DE DATOS ACTIVA" -ForegroundColor Blue
Write-Host ""

try {
    $dbCheck = docker exec ucn_inclui2_mongodb mongosh -u admin -p secure_password_123 --authenticationDatabase admin ucn_inclui2_prod --eval "
        print('🗄️ ESTADO DE LA BASE DE DATOS:');
        print('');
        print('✅ Conexión: EXITOSA');
        print('📊 Base de datos: ' + db.getName());
        print('📋 Colecciones: ' + db.getCollectionNames().length);
        print('');
        print('🔢 DATOS DISPONIBLES:');
        const collections = ['users', 'students', 'categories', 'departments', 'careers', 'courses', 'adjustments', 'resources', 'notifications'];
        collections.forEach(col => {
            if (db.getCollectionNames().includes(col)) {
                const count = db.getCollection(col).countDocuments();
                print('   ' + col + ': ' + count + ' documentos');
            }
        });
    " 2>$null
    
    Write-Host $dbCheck -ForegroundColor Gray
} catch {
    Write-Host "❌ Error verificando base de datos" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 RESUMEN DE ANÁLISIS DETALLADO" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ ENDPOINTS FUNCIONANDO ($($working.Count)):" -ForegroundColor Green
foreach ($endpoint in $working) {
    Write-Host "   $endpoint" -ForegroundColor White
}

Write-Host ""
Write-Host "🔒 ENDPOINTS PROTEGIDOS ($($protected.Count)):" -ForegroundColor Yellow
foreach ($endpoint in $protected) {
    Write-Host "   $endpoint (requiere autenticación)" -ForegroundColor White
}

Write-Host ""
Write-Host "📭 ENDPOINTS NO IMPLEMENTADOS ($($notImplemented.Count)):" -ForegroundColor Red
foreach ($endpoint in $notImplemented) {
    Write-Host "   $endpoint" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 ANÁLISIS TÉCNICO:" -ForegroundColor Cyan

$total = $working.Count + $protected.Count + $notImplemented.Count
$implemented = $working.Count + $protected.Count

if ($total -gt 0) {
    $rate = [math]::Round(($implemented / $total) * 100, 1)
    Write-Host "   📊 Tasa de implementación: $rate%" -ForegroundColor White
    Write-Host "   📊 Endpoints implementados: $implemented de $total" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 RECOMENDACIONES:" -ForegroundColor Magenta

if ($notImplemented.Count -gt 0) {
    Write-Host "   🔧 Implementar endpoints faltantes para funcionalidad completa" -ForegroundColor White
    Write-Host "   📋 Priorizar: categorías, departamentos, carreras (datos maestros)" -ForegroundColor White
}

if ($protected.Count -gt $working.Count) {
    Write-Host "   🔐 Sistema bien protegido - mayoría de endpoints requieren autenticación" -ForegroundColor White
    Write-Host "   🎯 Para testing completo, implementar autenticación JWT en scripts" -ForegroundColor White
}

Write-Host ""
Write-Host "🏆 ESTADO GENERAL:" -ForegroundColor Green

if ($rate -ge 75) {
    Write-Host "   ✨ EXCELENTE - Sistema bien implementado" -ForegroundColor Green
} elseif ($rate -ge 50) {
    Write-Host "   👍 BUENO - Sistema funcional con áreas de mejora" -ForegroundColor Yellow
} else {
    Write-Host "   ⚠️ EN DESARROLLO - Requiere más implementación" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ANÁLISIS DETALLADO COMPLETADO" -ForegroundColor Green 
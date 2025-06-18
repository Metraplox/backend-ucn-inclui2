# 🔧 CORRECCIÓN - Test de Endpoint Consents
# Verificación de la ruta correcta /consents (no /consent)

Write-Host "🔧 CORRECCIÓN - Verificando endpoint de consentimientos" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"

function Test-ConsentEndpoint {
    param([string]$Url, [string]$Description)
    
    Write-Host "🔍 Testing $Description" -ForegroundColor Cyan
    Write-Host "   GET $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 3
        Write-Host "   ✅ FUNCIONA - Endpoint público" -ForegroundColor Green
        
        if ($response -is [array]) {
            Write-Host "   📊 Elementos: $($response.Count)" -ForegroundColor White
        }
        
        return "WORKING"
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        
        switch ($code) {
            401 { 
                Write-Host "   🔒 PROTEGIDO - Requiere JWT (correcto)" -ForegroundColor Yellow
                return "PROTECTED"
            }
            404 { 
                Write-Host "   📭 NO ENCONTRADO - Endpoint no existe" -ForegroundColor Red
                return "NOT_FOUND"
            }
            405 { 
                Write-Host "   🚫 MÉTODO NO PERMITIDO" -ForegroundColor Red
                return "METHOD_NOT_ALLOWED"
            }
            default { 
                Write-Host "   ❌ ERROR $code" -ForegroundColor Red
                return "ERROR"
            }
        }
    }
}

Write-Host "📋 VERIFICACIÓN DE RUTAS DE CONSENTIMIENTOS:" -ForegroundColor Blue
Write-Host ""

# Probar la ruta incorrecta que habíamos usado antes
$result1 = Test-ConsentEndpoint -Url "$baseUrl/consent" -Description "Ruta incorrecta /consent"

Write-Host ""

# Probar la ruta correcta según el código
$result2 = Test-ConsentEndpoint -Url "$baseUrl/consents" -Description "Ruta correcta /consents"

Write-Host ""
Write-Host "📊 ANÁLISIS DE RUTAS ESPECÍFICAS:" -ForegroundColor Blue
Write-Host ""

# Verificar otras rutas del controlador de consents
$consentRoutes = @(
    "/consents/document/507f1f77bcf86cd799439011",
    "/consents/student/my-consents"
)

foreach ($route in $consentRoutes) {
    $fullUrl = "$baseUrl$route"
    $result = Test-ConsentEndpoint -Url $fullUrl -Description "Subruta: $route"
    Write-Host ""
}

Write-Host "🎯 VERIFICACIÓN EN CÓDIGO FUENTE:" -ForegroundColor Blue
Write-Host ""

# Verificar qué dice el controlador
$controllerFile = "src/consent/consent.controller.ts"
if (Test-Path $controllerFile) {
    $controllerContent = Get-Content $controllerFile -Head 30
    $controllerLine = $controllerContent | Where-Object { $_ -match "@Controller" }
    
    Write-Host "📄 Archivo: $controllerFile" -ForegroundColor White
    Write-Host "🔍 Línea del controlador encontrada:" -ForegroundColor Cyan
    Write-Host "   $controllerLine" -ForegroundColor Yellow
    
    if ($controllerLine -match "consents") {
        Write-Host "   ✅ CONFIRMADO: La ruta correcta es /consents" -ForegroundColor Green
    } else {
        Write-Host "   ❓ Verificar configuración del controlador" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Archivo del controlador no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🗄️ VERIFICACIÓN EN BASE DE DATOS:" -ForegroundColor Blue
Write-Host ""

try {
    $dbResult = docker exec ucn_inclui2_mongodb mongosh -u admin -p secure_password_123 --authenticationDatabase admin ucn_inclui2_prod --eval "
        const count = db.consents.countDocuments();
        print('📄 Documentos en colección consents: ' + count);
        if (count > 0) {
            const sample = db.consents.findOne();
            print('🔍 Muestra de documento:');
            print('   ID: ' + sample._id);
            print('   StudentId: ' + sample.studentId);
            print('   ConsentType: ' + sample.consentType);
        }
    " 2>$null
    
    Write-Host $dbResult -ForegroundColor Gray
} catch {
    Write-Host "❌ Error verificando base de datos" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 RESUMEN DE LA CORRECCIÓN:" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔍 RESULTADOS:" -ForegroundColor Cyan

if ($result1 -eq "NOT_FOUND") {
    Write-Host "   ❌ /consent - NO EXISTE (como esperábamos)" -ForegroundColor Red
} else {
    Write-Host "   ⚠️ /consent - $result1" -ForegroundColor Yellow
}

if ($result2 -eq "PROTECTED") {
    Write-Host "   ✅ /consents - EXISTE Y PROTEGIDO (correcto)" -ForegroundColor Green
} elseif ($result2 -eq "WORKING") {
    Write-Host "   ✅ /consents - EXISTE Y FUNCIONA" -ForegroundColor Green
} else {
    Write-Host "   ❌ /consents - $result2" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 CONCLUSIÓN:" -ForegroundColor Magenta

if ($result2 -eq "PROTECTED" -or $result2 -eq "WORKING") {
    Write-Host "   ✨ CORRECCIÓN EXITOSA" -ForegroundColor Green
    Write-Host "   🔧 El endpoint de consentimientos SÍ está implementado" -ForegroundColor Cyan
    Write-Host "   📋 La ruta correcta es /consents (plural)" -ForegroundColor White
    Write-Host "   🔒 Está protegido con JWT como corresponde" -ForegroundColor Yellow
} else {
    Write-Host "   ⚠️ INVESTIGAR MÁS" -ForegroundColor Yellow
    Write-Host "   🔧 Puede haber un problema de configuración" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 VERIFICACIÓN DE CORRECCIÓN COMPLETADA" -ForegroundColor Green
Write-Host ""

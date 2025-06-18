# 🎯 TEST FINAL COMPLETO - UCN INCLUI2
# Verificación exhaustiva de todos los endpoints reales

Write-Host "🎯 TEST FINAL COMPLETO - UCN INCLUI2" -ForegroundColor Green
Write-Host "🔍 Verificando TODOS los endpoints implementados" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$global:Results = @{
    Working = @()
    Protected = @()
    NotFound = @()
    Error = @()
}

function Test-RealEndpoint {
    param([string]$Method, [string]$Url, [string]$Description)
    
    Write-Host "🔍 $Description" -ForegroundColor White
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -ContentType "application/json" -TimeoutSec 3
        Write-Host "   ✅ FUNCIONA" -ForegroundColor Green
        $global:Results.Working += @{ Method = $Method; Url = $Url; Description = $Description }
        
        if ($response.data) {
            Write-Host "   📊 Data: $($response.data)" -ForegroundColor Gray
        }
        
        return $true
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        
        switch ($code) {
            401 { 
                Write-Host "   🔒 PROTEGIDO (requiere JWT)" -ForegroundColor Yellow
                $global:Results.Protected += @{ Method = $Method; Url = $Url; Description = $Description }
                return $true
            }
            404 { 
                Write-Host "   📭 NO ENCONTRADO" -ForegroundColor Red
                $global:Results.NotFound += @{ Method = $Method; Url = $Url; Description = $Description }
                return $false
            }
            default { 
                Write-Host "   ❌ ERROR $code" -ForegroundColor Red
                $global:Results.Error += @{ Method = $Method; Url = $Url; Description = $Description }
                return $false
            }
        }
    }
}

Write-Host "🏥 1. ENDPOINTS BÁSICOS Y SISTEMA" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl" -Description "Health Check principal"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/health" -Description "Health Check específico"

Write-Host ""
Write-Host "👤 2. AUTENTICACIÓN Y USUARIOS" -ForegroundColor Blue
Test-RealEndpoint -Method "POST" -Url "$baseUrl/auth/login" -Description "Login con credenciales"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/auth/profile" -Description "Perfil del usuario autenticado"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/users" -Description "Listar todos los usuarios"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/users" -Description "Crear nuevo usuario"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/users/profile" -Description "Perfil del usuario actual"

Write-Host ""
Write-Host "🎓 3. ESTUDIANTES Y GESTIÓN ACADÉMICA" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/students" -Description "Listar estudiantes"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/students" -Description "Crear estudiante"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/categories" -Description "Categorías de ajustes"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/categories" -Description "Crear categoría"

Write-Host ""
Write-Host "🏢 4. ESTRUCTURA ORGANIZACIONAL" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/departments" -Description "Departamentos UCN"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/departments" -Description "Crear departamento"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/careers" -Description "Carreras universitarias"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/careers" -Description "Crear carrera"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/courses" -Description "Cursos académicos"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/courses" -Description "Crear curso"

Write-Host ""
Write-Host "⚙️ 5. AJUSTES Y RECURSOS NEE" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/adjustments" -Description "Ajustes académicos"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/adjustments" -Description "Crear ajuste académico"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/resources" -Description "Recursos educativos"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/resources" -Description "Crear recurso educativo"

Write-Host ""
Write-Host "📄 6. DOCUMENTOS Y CONSENTIMIENTOS" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/documents" -Description "Documentos del sistema"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/documents" -Description "Crear documento"

# CORRECCIÓN: La ruta correcta es /consents (plural)
Test-RealEndpoint -Method "GET" -Url "$baseUrl/consents" -Description "Consentimientos (RUTA CORRECTA)"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/consents" -Description "Crear consentimiento"

Write-Host ""
Write-Host "🔔 7. NOTIFICACIONES Y COMUNICACIÓN" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/notifications" -Description "Sistema de notificaciones"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/notifications" -Description "Crear notificación"

Write-Host ""
Write-Host "📊 8. REPORTES Y ADMINISTRACIÓN DIDDEC" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/diddec" -Description "Panel DIDDEC principal"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/diddec/reports" -Description "Reportes DIDDEC"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/diddec/resources" -Description "Recursos DIDDEC"

Write-Host ""
Write-Host "🎓 9. HISTORIAL Y SEGUIMIENTO ACADÉMICO" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/academic-history" -Description "Historial académico"
Test-RealEndpoint -Method "POST" -Url "$baseUrl/academic-history" -Description "Registrar historial académico"

Write-Host ""
Write-Host "🔄 10. SINCRONIZACIÓN Y DATOS EXTERNOS" -ForegroundColor Blue
Test-RealEndpoint -Method "GET" -Url "$baseUrl/sync" -Description "Estado de sincronización"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/sync/status" -Description "Estado detallado de sync"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/sync/logs" -Description "Logs de sincronización"
Test-RealEndpoint -Method "GET" -Url "$baseUrl/hawaii" -Description "Sincronización Hawaii"

Write-Host ""
Write-Host "📊 11. ENDPOINTS DE SWAGGER Y DOCUMENTACIÓN" -ForegroundColor Blue

# Verificar Swagger específicamente
try {
    $swaggerResponse = Invoke-WebRequest -Uri "$baseUrl/api" -Method GET -TimeoutSec 3
    Write-Host "🔍 Documentación Swagger" -ForegroundColor White
    Write-Host "   GET $baseUrl/api" -ForegroundColor Gray
    Write-Host "   ✅ DISPONIBLE - $($swaggerResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   📄 Tamaño: $($swaggerResponse.Content.Length) bytes" -ForegroundColor Gray
    $global:Results.Working += @{ Method = "GET"; Url = "$baseUrl/api"; Description = "Swagger UI" }
} catch {
    Write-Host "🔍 Documentación Swagger" -ForegroundColor White
    Write-Host "   GET $baseUrl/api" -ForegroundColor Gray
    Write-Host "   ❌ NO DISPONIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 12. VERIFICACIÓN DE BASE DE DATOS ACTIVA" -ForegroundColor Blue

try {
    $dbStatus = docker exec ucn_inclui2_mongodb mongosh -u admin -p secure_password_123 --authenticationDatabase admin ucn_inclui2_prod --eval "
        print('📊 BD: ' + db.getName());
        print('👥 Users: ' + db.users.countDocuments());
        print('🎓 Students: ' + db.students.countDocuments());
        print('📋 Categories: ' + db.categories.countDocuments());
        print('🏢 Departments: ' + db.departments.countDocuments());
        print('🎓 Careers: ' + db.careers.countDocuments());
        print('📚 Courses: ' + db.courses.countDocuments());
        print('⚙️ Adjustments: ' + db.adjustments.countDocuments());
        print('📺 Resources: ' + db.resources.countDocuments());
        print('🔔 Notifications: ' + db.notifications.countDocuments());
        print('📄 Consents: ' + db.consents.countDocuments());
    " 2>$null
    
    Write-Host "✅ BASE DE DATOS OPERATIVA:" -ForegroundColor Green
    Write-Host $dbStatus -ForegroundColor Gray
} catch {
    Write-Host "❌ Error conectando a MongoDB" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 RESUMEN FINAL COMPLETO" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Yellow

$totalWorking = $global:Results.Working.Count
$totalProtected = $global:Results.Protected.Count
$totalNotFound = $global:Results.NotFound.Count
$totalError = $global:Results.Error.Count
$totalTested = $totalWorking + $totalProtected + $totalNotFound + $totalError
$totalFunctional = $totalWorking + $totalProtected

Write-Host ""
Write-Host "📈 ESTADÍSTICAS DETALLADAS:" -ForegroundColor Cyan
Write-Host "   📊 Total endpoints testeados: $totalTested" -ForegroundColor White
Write-Host "   ✅ Públicos funcionando: $totalWorking" -ForegroundColor Green
Write-Host "   🔒 Protegidos (JWT): $totalProtected" -ForegroundColor Yellow
Write-Host "   📭 No implementados: $totalNotFound" -ForegroundColor Red
Write-Host "   ❌ Con errores: $totalError" -ForegroundColor Red

if ($totalTested -gt 0) {
    $functionalRate = [math]::Round(($totalFunctional / $totalTested) * 100, 1)
    Write-Host ""
    Write-Host "🎯 TASA DE FUNCIONALIDAD: $functionalRate%" -ForegroundColor Cyan
    Write-Host "   (Incluye endpoints públicos + protegidos con JWT)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ ENDPOINTS PÚBLICOS FUNCIONANDO:" -ForegroundColor Green
foreach ($endpoint in $global:Results.Working) {
    Write-Host "   $($endpoint.Method) $($endpoint.Url -replace $baseUrl, '') - $($endpoint.Description)" -ForegroundColor White
}

if ($global:Results.Protected.Count -gt 0) {
    Write-Host ""
    Write-Host "🔒 ENDPOINTS PROTEGIDOS (CORRECTO):" -ForegroundColor Yellow
    Write-Host "   Total: $($global:Results.Protected.Count) endpoints requieren autenticación JWT" -ForegroundColor Gray
    
    # Mostrar algunos ejemplos
    $protectedSample = $global:Results.Protected | Select-Object -First 5
    foreach ($endpoint in $protectedSample) {
        Write-Host "   $($endpoint.Method) $($endpoint.Url -replace $baseUrl, '') - $($endpoint.Description)" -ForegroundColor Gray
    }
    
    if ($global:Results.Protected.Count -gt 5) {
        Write-Host "   ... y $($global:Results.Protected.Count - 5) más" -ForegroundColor Gray
    }
}

if ($global:Results.NotFound.Count -gt 0) {
    Write-Host ""
    Write-Host "📭 ENDPOINTS NO IMPLEMENTADOS:" -ForegroundColor Red
    foreach ($endpoint in $global:Results.NotFound) {
        Write-Host "   $($endpoint.Method) $($endpoint.Url -replace $baseUrl, '') - $($endpoint.Description)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🏆 EVALUACIÓN FINAL:" -ForegroundColor Magenta

if ($functionalRate -ge 90) {
    Write-Host "🌟 EXCELENTE - Sistema altamente funcional" -ForegroundColor Green
    Write-Host "   ✨ La mayoría de endpoints están implementados y funcionando" -ForegroundColor Cyan
} elseif ($functionalRate -ge 75) {
    Write-Host "👍 MUY BUENO - Sistema bien implementado" -ForegroundColor Green
    Write-Host "   🔧 Solo algunos endpoints necesitan implementación" -ForegroundColor Cyan
} elseif ($functionalRate -ge 60) {
    Write-Host "⚡ BUENO - Sistema funcional" -ForegroundColor Yellow
    Write-Host "   🛠️ Algunas funcionalidades requieren implementación" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ EN DESARROLLO - Requiere más trabajo" -ForegroundColor Red
    Write-Host "   🔨 Muchos endpoints necesitan implementación" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 RECOMENDACIONES TÉCNICAS:" -ForegroundColor Blue

if ($totalProtected -gt $totalWorking) {
    Write-Host "   🔐 Excelente seguridad: Sistema bien protegido con JWT" -ForegroundColor Green
}

if ($totalNotFound -gt 0) {
    Write-Host "   🔧 Implementar endpoints faltantes para funcionalidad completa" -ForegroundColor White
}

if ($totalWorking -gt 0) {
    Write-Host "   ✅ Endpoints públicos funcionando correctamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 TESTING COMPLETO FINALIZADO" -ForegroundColor Green
Write-Host "🎯 UCN Inclui2 - Sistema de Gestión de Estudiantes con NEE" -ForegroundColor Cyan
Write-Host "" 
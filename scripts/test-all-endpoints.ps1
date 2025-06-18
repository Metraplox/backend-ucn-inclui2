# 🔍 TESTING COMPLETO DE TODOS LOS ENDPOINTS - UCN INCLUI2
# Verificación exhaustiva de la API completa

Write-Host "🚀 TESTING COMPLETO DE ENDPOINTS UCN INCLUI2" -ForegroundColor Green
Write-Host "🎯 Verificando todos los endpoints disponibles" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$global:TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Protected = 0
}

# Función para testing de endpoints
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [string]$Body = $null,
        [bool]$ExpectProtected = $false,
        [string]$Category = "General"
    )
    
    $global:TestResults.Total++
    
    Write-Host "🔍 [$Category] $Description" -ForegroundColor Cyan
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 5
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        
        if ($ExpectProtected) {
            Write-Host "   ⚠️ INESPERADO: Debería estar protegido" -ForegroundColor Yellow
            $global:TestResults.Failed++
        } else {
            Write-Host "   ✅ ÉXITO" -ForegroundColor Green
            $global:TestResults.Passed++
            
            # Mostrar información relevante de la respuesta
            if ($response -is [array]) {
                Write-Host "   📊 Elementos: $($response.Count)" -ForegroundColor White
            } elseif ($response.PSObject.Properties.Name -contains "message") {
                Write-Host "   📝 Mensaje: $($response.message)" -ForegroundColor White
            } else {
                Write-Host "   📊 Respuesta: OK" -ForegroundColor White
            }
        }
        
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($ExpectProtected -and $statusCode -eq 401) {
            Write-Host "   🔒 PROTEGIDO (correcto)" -ForegroundColor Green
            $global:TestResults.Protected++
        } elseif ($statusCode -eq 404) {
            Write-Host "   📭 NO ENCONTRADO" -ForegroundColor Yellow
            $global:TestResults.Failed++
        } elseif ($statusCode -eq 405) {
            Write-Host "   🚫 MÉTODO NO PERMITIDO" -ForegroundColor Yellow
            $global:TestResults.Failed++
        } else {
            Write-Host "   ❌ ERROR $statusCode" -ForegroundColor Red
            $global:TestResults.Failed++
        }
        return $null
    }
}

Write-Host "🏥 1. ENDPOINTS BÁSICOS DEL SISTEMA" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl" -Description "Health Check principal" -Category "Sistema"
Test-Endpoint -Method "GET" -Url "$baseUrl/health" -Description "Health Check específico" -Category "Sistema"
Test-Endpoint -Url "$baseUrl/api" -Description "Documentación Swagger" -Category "Sistema"

Write-Host ""
Write-Host "👤 2. ENDPOINTS DE AUTENTICACIÓN" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login" -Description "Login de usuarios" -Category "Auth" -Body '{"email":"test@test.com","password":"test"}'
Test-Endpoint -Method "GET" -Url "$baseUrl/auth/profile" -Description "Perfil autenticado" -Category "Auth" -ExpectProtected $true

Write-Host ""
Write-Host "👥 3. ENDPOINTS DE USUARIOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/users" -Description "Listar usuarios" -Category "Usuarios" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/users" -Description "Crear usuario" -Category "Usuarios" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/users/profile" -Description "Perfil del usuario" -Category "Usuarios" -ExpectProtected $true

Write-Host ""
Write-Host "🎓 4. ENDPOINTS DE ESTUDIANTES" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/students" -Description "Listar estudiantes" -Category "Estudiantes" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/students" -Description "Crear estudiante" -Category "Estudiantes" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/students/653000000000000000000001" -Description "Obtener estudiante" -Category "Estudiantes" -ExpectProtected $true

Write-Host ""
Write-Host "📋 5. ENDPOINTS DE CATEGORÍAS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/categories" -Description "Listar categorías" -Category "Categorías"
Test-Endpoint -Method "POST" -Url "$baseUrl/categories" -Description "Crear categoría" -Category "Categorías" -ExpectProtected $true

Write-Host ""
Write-Host "🏢 6. ENDPOINTS DE DEPARTAMENTOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/departments" -Description "Listar departamentos" -Category "Departamentos"
Test-Endpoint -Method "POST" -Url "$baseUrl/departments" -Description "Crear departamento" -Category "Departamentos" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/departments/650000000000000000000001/stats" -Description "Stats departamento" -Category "Departamentos" -ExpectProtected $true

Write-Host ""
Write-Host "🎓 7. ENDPOINTS DE CARRERAS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/careers" -Description "Listar carreras" -Category "Carreras"
Test-Endpoint -Method "POST" -Url "$baseUrl/careers" -Description "Crear carrera" -Category "Carreras" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/careers/651000000000000000000001/students" -Description "Estudiantes de carrera" -Category "Carreras" -ExpectProtected $true

Write-Host ""
Write-Host "📚 8. ENDPOINTS DE CURSOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/courses" -Description "Listar cursos" -Category "Cursos"
Test-Endpoint -Method "POST" -Url "$baseUrl/courses" -Description "Crear curso" -Category "Cursos" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/courses/654000000000000000000001" -Description "Obtener curso" -Category "Cursos"

Write-Host ""
Write-Host "⚙️ 9. ENDPOINTS DE AJUSTES ACADÉMICOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/adjustments" -Description "Listar ajustes" -Category "Ajustes" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/adjustments" -Description "Crear ajuste" -Category "Ajustes" -ExpectProtected $true

Write-Host ""
Write-Host "📺 10. ENDPOINTS DE RECURSOS EDUCATIVOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/resources" -Description "Listar recursos" -Category "Recursos" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/resources" -Description "Crear recurso" -Category "Recursos" -ExpectProtected $true

Write-Host ""
Write-Host "🔔 11. ENDPOINTS DE NOTIFICACIONES" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/notifications" -Description "Listar notificaciones" -Category "Notificaciones" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/notifications" -Description "Crear notificación" -Category "Notificaciones" -ExpectProtected $true

Write-Host ""
Write-Host "📄 12. ENDPOINTS DE CONSENTIMIENTOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/consent" -Description "Listar consentimientos" -Category "Consentimientos" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/consent" -Description "Crear consentimiento" -Category "Consentimientos" -ExpectProtected $true

Write-Host ""
Write-Host "📊 13. ENDPOINTS DE DIDDEC" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/diddec/reports" -Description "Reportes DIDDEC" -Category "DIDDEC" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/diddec/resources" -Description "Recursos DIDDEC" -Category "DIDDEC" -ExpectProtected $true

Write-Host ""
Write-Host "📑 14. ENDPOINTS DE DOCUMENTOS" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/documents" -Description "Listar documentos" -Category "Documentos" -ExpectProtected $true
Test-Endpoint -Method "POST" -Url "$baseUrl/documents" -Description "Crear documento" -Category "Documentos" -ExpectProtected $true

Write-Host ""
Write-Host "🔄 15. ENDPOINTS DE SINCRONIZACIÓN" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/sync/status" -Description "Estado sync" -Category "Sync" -ExpectProtected $true
Test-Endpoint -Method "GET" -Url "$baseUrl/sync/logs" -Description "Logs sync" -Category "Sync" -ExpectProtected $true

Write-Host ""
Write-Host "🎓 16. ENDPOINTS DE HISTORIAL ACADÉMICO" -ForegroundColor Blue
Write-Host ""

Test-Endpoint -Method "GET" -Url "$baseUrl/academic-history" -Description "Historial académico" -Category "Historial" -ExpectProtected $true

Write-Host ""
Write-Host "📊 RESUMEN FINAL DEL TESTING" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Yellow

# Calcular estadísticas
$totalTested = $global:TestResults.Total
$successful = $global:TestResults.Passed
$protected = $global:TestResults.Protected
$failed = $global:TestResults.Failed
$actualSuccess = $successful + $protected

Write-Host ""
Write-Host "📈 ESTADÍSTICAS GENERALES:" -ForegroundColor Cyan
Write-Host "   📊 Total de endpoints testeados: $totalTested" -ForegroundColor White
Write-Host "   ✅ Exitosos: $successful" -ForegroundColor Green
Write-Host "   🔒 Protegidos: $protected" -ForegroundColor Yellow
Write-Host "   ❌ Fallidos: $failed" -ForegroundColor Red

$successRate = if ($totalTested -gt 0) { 
    [math]::Round(($actualSuccess / $totalTested) * 100, 1) 
} else { 0 }

Write-Host ""
Write-Host "🎯 TASA DE FUNCIONAMIENTO: $successRate%" -ForegroundColor Cyan
Write-Host "   (Incluye endpoints públicos exitosos + protegidos correctamente)" -ForegroundColor Gray

Write-Host ""
Write-Host "🏆 ENDPOINTS POR CATEGORÍA:" -ForegroundColor Magenta
Write-Host "   🏥 Sistema y Salud" -ForegroundColor White
Write-Host "   🔐 Autenticación y Usuarios" -ForegroundColor White  
Write-Host "   🎓 Gestión Académica (Estudiantes, Cursos, Carreras)" -ForegroundColor White
Write-Host "   ⚙️ Funcionalidades NEE (Ajustes, Recursos)" -ForegroundColor White
Write-Host "   📊 Reportes y Administración" -ForegroundColor White
Write-Host "   🔄 Sincronización y Datos" -ForegroundColor White

Write-Host ""
if ($successRate -ge 80) {
    Write-Host "🎉 EXCELENTE: Sistema funcionando correctamente" -ForegroundColor Green
    Write-Host "✨ La mayoría de endpoints están operativos o correctamente protegidos" -ForegroundColor Cyan
} elseif ($successRate -ge 60) {
    Write-Host "⚠️ BUENO: Sistema mayormente funcional" -ForegroundColor Yellow  
    Write-Host "🔧 Algunos endpoints pueden necesitar revisión" -ForegroundColor Gray
} else {
    Write-Host "❌ ATENCIÓN: Varios endpoints con problemas" -ForegroundColor Red
    Write-Host "🔧 Se recomienda revisar la configuración del sistema" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 TESTING COMPLETO FINALIZADO" -ForegroundColor Green
Write-Host "📋 Todos los endpoints del sistema UCN Inclui2 han sido verificados" -ForegroundColor Cyan
Write-Host "" 
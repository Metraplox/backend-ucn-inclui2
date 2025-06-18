# 🧪 Script de Testing de Endpoints UCN Inclui2
# Prueba todos los endpoints principales con datos reales

Write-Host "🚀 Iniciando testing de endpoints UCN Inclui2..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Función para hacer requests HTTP
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Cyan
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ Status: OK" -ForegroundColor Green
        
        if ($response -is [array]) {
            Write-Host "   📊 Resultados: $($response.Count) elementos" -ForegroundColor Yellow
        } elseif ($response.PSObject.Properties.Name -contains "length") {
            Write-Host "   📊 Resultados: $($response.length) elementos" -ForegroundColor Yellow
        } else {
            Write-Host "   📊 Respuesta: Objeto único" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "🏥 Verificando estado del servidor..." -ForegroundColor Blue
Write-Host ""

# 1. HEALTH CHECK
$success = Test-Endpoint -Method "GET" -Url "$baseUrl" -Description "Health Check - Servidor activo"
if (-not $success) {
    Write-Host ""
    Write-Host "❌ Servidor no disponible. Verifica que Docker esté ejecutándose:" -ForegroundColor Red
    Write-Host "   docker ps" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "📚 Testing endpoints principales..." -ForegroundColor Blue
Write-Host ""

# 2. SWAGGER DOCUMENTATION
Test-Endpoint -Method "GET" -Url "$baseUrl/api" -Description "Swagger Documentation"

# 3. SYSTEM INFO
Test-Endpoint -Method "GET" -Url "$baseUrl/auth/roles" -Description "System Roles Information"

Write-Host ""
Write-Host "👥 Testing módulo de usuarios..." -ForegroundColor Blue
Write-Host ""

# 4. USERS
Test-Endpoint -Method "GET" -Url "$baseUrl/users" -Description "Listar todos los usuarios"
Test-Endpoint -Method "GET" -Url "$baseUrl/users/652000000000000000000001" -Description "Obtener usuario específico (Coordinadora)"

Write-Host ""
Write-Host "🏛️ Testing módulo de departamentos..." -ForegroundColor Blue
Write-Host ""

# 5. DEPARTMENTS
Test-Endpoint -Method "GET" -Url "$baseUrl/departments" -Description "Listar todos los departamentos"
Test-Endpoint -Method "GET" -Url "$baseUrl/departments/650000000000000000000001" -Description "Obtener departamento específico (Informática)"

Write-Host ""
Write-Host "🎓 Testing módulo de carreras..." -ForegroundColor Blue
Write-Host ""

# 6. CAREERS
Test-Endpoint -Method "GET" -Url "$baseUrl/careers" -Description "Listar todas las carreras"
Test-Endpoint -Method "GET" -Url "$baseUrl/careers/651000000000000000000001" -Description "Obtener carrera específica (ICI)"

Write-Host ""
Write-Host "🎓 Testing módulo de estudiantes..." -ForegroundColor Blue
Write-Host ""

# 7. STUDENTS
Test-Endpoint -Method "GET" -Url "$baseUrl/students" -Description "Listar todos los estudiantes"
Test-Endpoint -Method "GET" -Url "$baseUrl/students/653000000000000000000001" -Description "Obtener estudiante específico (Juan Pérez)"

Write-Host ""
Write-Host "📚 Testing módulo de cursos..." -ForegroundColor Blue
Write-Host ""

# 8. COURSES
Test-Endpoint -Method "GET" -Url "$baseUrl/courses" -Description "Listar todos los cursos"
Test-Endpoint -Method "GET" -Url "$baseUrl/courses/654000000000000000000001" -Description "Obtener curso específico (INFO101)"

Write-Host ""
Write-Host "📋 Testing módulo de categorías..." -ForegroundColor Blue
Write-Host ""

# 9. CATEGORIES
Test-Endpoint -Method "GET" -Url "$baseUrl/categories" -Description "Listar todas las categorías de ajustes"

Write-Host ""
Write-Host "⚙️ Testing módulo de ajustes académicos..." -ForegroundColor Blue
Write-Host ""

# 10. ADJUSTMENTS
Test-Endpoint -Method "GET" -Url "$baseUrl/adjustments" -Description "Listar todos los ajustes académicos"
Test-Endpoint -Method "GET" -Url "$baseUrl/adjustments/655000000000000000000001" -Description "Obtener ajuste específico (Tiempo extendido)"

Write-Host ""
Write-Host "📖 Testing módulo de recursos..." -ForegroundColor Blue
Write-Host ""

# 11. RESOURCES
Test-Endpoint -Method "GET" -Url "$baseUrl/resources" -Description "Listar todos los recursos educativos"
Test-Endpoint -Method "GET" -Url "$baseUrl/resources/656000000000000000000001" -Description "Obtener recurso específico (Guía TDAH)"

Write-Host ""
Write-Host "🔔 Testing módulo de notificaciones..." -ForegroundColor Blue
Write-Host ""

# 12. NOTIFICATIONS
Test-Endpoint -Method "GET" -Url "$baseUrl/notifications" -Description "Listar todas las notificaciones"

Write-Host ""
Write-Host "📝 Testing módulo de consentimientos..." -ForegroundColor Blue
Write-Host ""

# 13. CONSENT
Test-Endpoint -Method "GET" -Url "$baseUrl/consent" -Description "Listar todos los consentimientos"

Write-Host ""
Write-Host "📊 Testing módulos específicos por rol..." -ForegroundColor Blue
Write-Host ""

# 14. DIDDEC ENDPOINTS
Test-Endpoint -Method "GET" -Url "$baseUrl/diddec/reports/summary" -Description "DIDDEC - Resumen de reportes"

# 15. DEPARTMENT HEADS
Test-Endpoint -Method "GET" -Url "$baseUrl/departments/650000000000000000000001/heads" -Description "Jefes de departamento - Informática"

# 16. CAREER HEADS
Test-Endpoint -Method "GET" -Url "$baseUrl/careers/651000000000000000000001/heads" -Description "Jefes de carrera - ICI"

Write-Host ""
Write-Host "📈 Resumen del testing..." -ForegroundColor Green
Write-Host ""

# Verificar estado de la BD
Write-Host "🗄️ Verificando estado de la base de datos..." -ForegroundColor Blue

try {
    $dbCheck = docker exec ucn_inclui2_mongodb mongosh -u admin -p secure_password_123 --authenticationDatabase admin ucn_inclui2_prod --eval "print('BD Conectada: ' + db.getName()); print('Usuarios: ' + db.users.countDocuments()); print('Estudiantes: ' + db.students.countDocuments()); print('Cursos: ' + db.courses.countDocuments()); print('Ajustes: ' + db.adjustments.countDocuments());" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos operativa" -ForegroundColor Green
        Write-Host $dbCheck -ForegroundColor Gray
    } else {
        Write-Host "❌ Error conectando a la base de datos" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error verificando base de datos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos para testing avanzado:" -ForegroundColor Yellow
Write-Host "   1. Probar autenticación JWT con usuarios reales" -ForegroundColor Gray
Write-Host "   2. Testing de endpoints con autorización por roles" -ForegroundColor Gray
Write-Host "   3. Probar operaciones CRUD (POST, PUT, DELETE)" -ForegroundColor Gray
Write-Host "   4. Testing de validaciones y casos edge" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Accesos disponibles:" -ForegroundColor Cyan
Write-Host "   API: http://localhost:3000" -ForegroundColor White
Write-Host "   Swagger: http://localhost:3000/api" -ForegroundColor White
Write-Host "" 
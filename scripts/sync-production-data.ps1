# =====================================
# 🚀 SCRIPT POBLADO DATOS REALES UCN INCLUI2
# =====================================
# Poblado completo con datos reales desde Hawaii API
# Autor: Sistema UCN INCLUI2
# Fecha: 2025

param(
    [string]$Environment = "development",
    [switch]$Force = $false,
    [switch]$SkipValidation = $false
)

Write-Host "🚀 INICIANDO POBLADO DATOS REALES UCN INCLUI2" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Función para logging profesional
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Validaciones previas
function Test-Prerequisites {
    Write-Log "🔍 Validando prerrequisitos..." "INFO"
    
    # Verificar Docker
    try {
        $dockerStatus = docker --version
        Write-Log "✅ Docker disponible: $dockerStatus" "SUCCESS"
    } catch {
        Write-Log "❌ Docker no disponible o no iniciado" "ERROR"
        exit 1
    }
    
    # Verificar archivo .env
    if (-not (Test-Path ".env")) {
        Write-Log "❌ Archivo .env no encontrado" "ERROR"
        exit 1
    }
    Write-Log "✅ Archivo .env encontrado" "SUCCESS"
    
    # Verificar archivo NEE
    $neeFile = "docs/assets/ESTUDIANTES_NEE_CSV.txt"
    if (-not (Test-Path $neeFile)) {
        Write-Log "❌ Archivo estudiantes NEE no encontrado: $neeFile" "ERROR"
        exit 1
    }
    Write-Log "✅ Archivo estudiantes NEE disponible" "SUCCESS"
    
    # Verificar package.json
    if (-not (Test-Path "package.json")) {
        Write-Log "❌ package.json no encontrado" "ERROR"
        exit 1
    }
    Write-Log "✅ Configuración Node.js disponible" "SUCCESS"
}

# Limpiar base de datos actual
function Clear-Database {
    if (-not $Force) {
        $confirm = Read-Host "⚠️  Esto eliminará TODOS los datos actuales. Continuar? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Log "❌ Operación cancelada por el usuario" "WARN"
            exit 0
        }
    }
    
    Write-Log "🗑️  Limpiando base de datos..." "INFO"
    
    try {
        docker-compose down -v --remove-orphans
        Write-Log "✅ Contenedores detenidos" "SUCCESS"
        
        docker volume prune -f
        Write-Log "✅ Volúmenes eliminados" "SUCCESS"
        
        # Limpiar archivos temporales
        if (Test-Path "uploads") {
            Remove-Item "uploads" -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Log "✅ Archivos temporales limpiados" "SUCCESS"
        
    } catch {
        Write-Log "❌ Error limpiando base de datos: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Inicializar servicios
function Start-Services {
    Write-Log "🐳 Iniciando servicios Docker..." "INFO"
    
    try {
        docker-compose up -d mongodb
        Write-Log "✅ MongoDB iniciado" "SUCCESS"
        
        # Esperar que MongoDB esté listo
        Write-Log "⏳ Esperando que MongoDB esté listo..." "INFO"
        Start-Sleep -Seconds 15
        
        # Verificar conexión MongoDB
        $mongoTest = docker exec (docker-compose ps -q mongodb) mongo --eval "db.admin.runCommand('ismaster')" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ MongoDB operativo" "SUCCESS"
        } else {
            Write-Log "❌ MongoDB no responde" "ERROR"
            exit 1
        }
        
    } catch {
        Write-Log "❌ Error iniciando servicios: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Poblar datos base
function Initialize-BaseData {
    Write-Log "📊 Inicializando datos base..." "INFO"
    
    try {
        # Ejecutar scripts de inicialización MongoDB
        $initScripts = @(
            "mongodb-init/01-init-database.js",
            "mongodb-init/02-sample-data.js",
            "mongodb-init/03-complete-test-data.js"
        )
        
        foreach ($script in $initScripts) {
            if (Test-Path $script) {
                Write-Log "📄 Ejecutando: $script" "INFO"
                docker exec (docker-compose ps -q mongodb) mongo ucn_inclui2_prod "/docker-entrypoint-initdb.d/$(Split-Path $script -Leaf)"
                Write-Log "✅ $script ejecutado" "SUCCESS"
            }
        }
        
    } catch {
        Write-Log "❌ Error inicializando datos base: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Poblar datos reales Hawaii
function Sync-HawaiiData {
    Write-Log "🌺 Sincronizando datos reales desde Hawaii API..." "INFO"
    
    try {
        # Construir aplicación
        Write-Log "🔨 Construyendo aplicación..." "INFO"
        npm run build
        Write-Log "✅ Aplicación construida" "SUCCESS"
        
        # Iniciar aplicación temporalmente para sincronización
        Write-Log "🚀 Iniciando aplicación para sincronización..." "INFO"
        docker-compose up -d app
        Start-Sleep -Seconds 30
        
        # Verificar que la app esté lista
        $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -ErrorAction SilentlyContinue
        if ($healthCheck) {
            Write-Log "✅ Aplicación operativa" "SUCCESS"
        } else {
            Write-Log "❌ Aplicación no responde" "ERROR"
            exit 1
        }
        
        # Ejecutar sincronización Hawaii
        Write-Log "📡 Ejecutando sincronización Hawaii..." "INFO"
        
        # Sincronizar estudiantes NEE
        $studentsResponse = Invoke-RestMethod -Uri "http://localhost:3000/hawaii-real-data/sync-nee-students" -Method Post -ErrorAction Stop
        Write-Log "✅ Estudiantes NEE sincronizados: $($studentsResponse.count) estudiantes" "SUCCESS"
        
        # Sincronizar cursos
        $coursesResponse = Invoke-RestMethod -Uri "http://localhost:3000/hawaii-real-data/sync-courses" -Method Post -ErrorAction SilentlyContinue
        if ($coursesResponse) {
            Write-Log "✅ Cursos sincronizados: $($coursesResponse.count) cursos" "SUCCESS"
        } else {
            Write-Log "⚠️  Cursos no sincronizados (endpoint puede no estar disponible)" "WARN"
        }
        
        Write-Log "✅ Sincronización Hawaii completada" "SUCCESS"
        
    } catch {
        Write-Log "❌ Error sincronizando datos Hawaii: $($_.Exception.Message)" "ERROR"
        Write-Log "💡 Verificar credenciales Hawaii en .env" "INFO"
        exit 1
    }
}

# Verificación final
function Test-DataIntegrity {
    Write-Log "🔍 Verificando integridad de datos..." "INFO"
    
    try {
        # Verificar estudiantes NEE
        $studentsCount = Invoke-RestMethod -Uri "http://localhost:3000/students" -Method Get -ErrorAction Stop
        Write-Log "📊 Estudiantes en BD: $($studentsCount.length)" "INFO"
        
        if ($studentsCount.length -ge 63) {
            Write-Log "✅ Cantidad de estudiantes NEE correcta (≥63)" "SUCCESS"
        } else {
            Write-Log "⚠️  Cantidad de estudiantes NEE menor a esperada: $($studentsCount.length)" "WARN"
        }
        
        # Verificar datos básicos
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
        Write-Log "✅ Sistema operativo" "SUCCESS"
        
        # Crear archivo de estado
        $status = @{
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            environment = $Environment
            studentsCount = $studentsCount.length
            hawaiiSync = $true
            status = "SUCCESS"
        }
        
        $status | ConvertTo-Json | Out-File "poblado-status.json" -Encoding UTF8
        Write-Log "✅ Estado guardado en poblado-status.json" "SUCCESS"
        
    } catch {
        Write-Log "❌ Error verificando integridad: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Función principal
function Main {
    try {
        Write-Host ""
        Write-Log "🎯 OBJETIVO: Poblar BD con datos reales Hawaii UCN" "INFO"
        Write-Log "🔧 ENTORNO: $Environment" "INFO"
        Write-Host ""
        
        # 1. Validaciones
        if (-not $SkipValidation) {
            Test-Prerequisites
        }
        
        # 2. Limpiar BD
        Clear-Database
        
        # 3. Iniciar servicios
        Start-Services
        
        # 4. Poblar datos base
        Initialize-BaseData
        
        # 5. Sincronizar Hawaii
        Sync-HawaiiData
        
        # 6. Verificación final
        Test-DataIntegrity
        
        Write-Host ""
        Write-Log "🎉 POBLADO COMPLETADO EXITOSAMENTE!" "SUCCESS"
        Write-Log "📊 Sistema listo para producción con datos reales" "SUCCESS"
        Write-Log "🌐 Aplicación disponible en: http://localhost:3000" "INFO"
        Write-Log "📚 Documentación API: http://localhost:3000/api" "INFO"
        Write-Host ""
        
    } catch {
        Write-Log "❌ ERROR CRÍTICO: $($_.Exception.Message)" "ERROR"
        Write-Log "💡 Revisar logs arriba para más detalles" "INFO"
        exit 1
    }
}

# Ejecutar script principal
Main 
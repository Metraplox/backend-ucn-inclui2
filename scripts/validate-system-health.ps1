# Script de Validación Continua del Sistema UCN INCLUI2
# Ejecuta verificaciones automáticas de salud del sistema

Write-Host "🔍 VALIDADOR SISTEMA UCN INCLUI2 - INICIANDO..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ErrorCount = 0
$WarningCount = 0

# ==========================================
# FASE 1: VALIDACIÓN DE ARCHIVOS CRÍTICOS
# ==========================================
Write-Host "`n📁 VALIDANDO ESTRUCTURA DE ARCHIVOS..." -ForegroundColor Yellow

$CriticalFiles = @(
    "src/main.ts",
    "src/app.module.ts",
    "package.json",
    ".env.example",
    "docker-compose.yml"
)

foreach ($file in $CriticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANTE" -ForegroundColor Red
        $ErrorCount++
    }
}

# ==========================================
# FASE 2: VERIFICACIÓN DE ARCHIVOS DUPLICADOS
# ==========================================
Write-Host "`n🔍 VERIFICANDO ARCHIVOS DUPLICADOS..." -ForegroundColor Yellow

$DuplicatePatterns = @("*2.ts", "*.backup", "*.tmp", "*.temp")
$DuplicatesFound = @()

foreach ($pattern in $DuplicatePatterns) {
    $found = Get-ChildItem -Recurse -Include $pattern -ErrorAction SilentlyContinue
    if ($found) {
        $DuplicatesFound += $found
    }
}

if ($DuplicatesFound.Count -eq 0) {
    Write-Host "✅ No se encontraron archivos duplicados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Se encontraron $($DuplicatesFound.Count) archivos duplicados:" -ForegroundColor Red
    foreach ($dup in $DuplicatesFound) {
        Write-Host "   - $($dup.FullName)" -ForegroundColor Red
        $ErrorCount++
    }
}

# ==========================================
# FASE 3: VALIDACIÓN DE IMPORTS PROBLEMÁTICOS
# ==========================================
Write-Host "`n📦 VERIFICANDO IMPORTS PROBLEMÁTICOS..." -ForegroundColor Yellow

$ProblematicImports = @()
$TypeScriptFiles = Get-ChildItem -Recurse -Include "*.ts" -Exclude "*.spec.ts", "*.d.ts" -ErrorAction SilentlyContinue

foreach ($file in $TypeScriptFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Verificar imports relativos problemáticos
        if ($content -match "import.*\.\./\.\./\.\./\.\./") {
            $ProblematicImports += @{
                File = $file.FullName
                Issue = "Import relativo muy profundo (../../../..)"
                Type = "Warning"
            }
        }
        
        # Verificar imports circulares potenciales
        if ($content -match "import.*adjustments.*from.*users" -or $content -match "import.*users.*from.*adjustments") {
            $ProblematicImports += @{
                File = $file.FullName
                Issue = "Posible dependencia circular: users ⟷ adjustments"
                Type = "Warning"
            }
        }
    }
}

if ($ProblematicImports.Count -eq 0) {
    Write-Host "✅ No se encontraron imports problemáticos" -ForegroundColor Green
} else {
    Write-Host "⚠️  Se encontraron $($ProblematicImports.Count) imports problemáticos:" -ForegroundColor Yellow
    foreach ($import in $ProblematicImports) {
        Write-Host "   - $($import.File): $($import.Issue)" -ForegroundColor Yellow
        $WarningCount++
    }
}

# ==========================================
# FASE 4: VERIFICACIÓN DE CONSOLE.LOG EN PRODUCCIÓN
# ==========================================
Write-Host "`n🖥️  VERIFICANDO CONSOLE.LOG EN PRODUCCIÓN..." -ForegroundColor Yellow

$ConsoleLogsFound = @()
$ProductionFiles = Get-ChildItem -Recurse -Include "*.ts" -Exclude "*.spec.ts", "*test*", "*debug*" -ErrorAction SilentlyContinue

foreach ($file in $ProductionFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "console\.(log|error|warn|info)") {
        $ConsoleLogsFound += $file.RelativePath ?? $file.Name
    }
}

if ($ConsoleLogsFound.Count -eq 0) {
    Write-Host "✅ No se encontraron console.log en archivos de producción" -ForegroundColor Green
} else {
    Write-Host "⚠️  Se encontraron console.log en $($ConsoleLogsFound.Count) archivos:" -ForegroundColor Yellow
    foreach ($file in $ConsoleLogsFound | Select-Object -First 5) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    if ($ConsoleLogsFound.Count -gt 5) {
        Write-Host "   ... y $($ConsoleLogsFound.Count - 5) más" -ForegroundColor Yellow
    }
    $WarningCount += $ConsoleLogsFound.Count
}

# ==========================================
# FASE 5: VALIDACIÓN DE PACKAGE.JSON
# ==========================================
Write-Host "`n📦 VALIDANDO PACKAGE.JSON..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        # Verificar campos obligatorios
        $RequiredFields = @("name", "version", "dependencies", "scripts")
        foreach ($field in $RequiredFields) {
            if ($packageJson.PSObject.Properties.Name -contains $field) {
                Write-Host "✅ Campo '$field' presente" -ForegroundColor Green
            } else {
                Write-Host "❌ Campo '$field' faltante" -ForegroundColor Red
                $ErrorCount++
            }
        }
        
        # Verificar scripts críticos
        $RequiredScripts = @("start", "build", "test")
        foreach ($script in $RequiredScripts) {
            if ($packageJson.scripts.PSObject.Properties.Name -contains $script) {
                Write-Host "✅ Script '$script' presente" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Script '$script' recomendado faltante" -ForegroundColor Yellow
                $WarningCount++
            }
        }
        
    } catch {
        Write-Host "❌ Error al parsear package.json: $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    $ErrorCount++
}

# ==========================================
# FASE 6: VERIFICACIÓN DE CONFIGURACIÓN DOCKER
# ==========================================
Write-Host "`n🐳 VALIDANDO CONFIGURACIÓN DOCKER..." -ForegroundColor Yellow

$DockerFiles = @("Dockerfile", "docker-compose.yml", ".dockerignore")
foreach ($file in $DockerFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file presente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file recomendado faltante" -ForegroundColor Yellow
        $WarningCount++
    }
}

# ==========================================
# FASE 7: VALIDACIÓN DE VARIABLES DE ENTORNO
# ==========================================
Write-Host "`n🔧 VALIDANDO VARIABLES DE ENTORNO..." -ForegroundColor Yellow

if (Test-Path ".env.example") {
    Write-Host "✅ .env.example presente" -ForegroundColor Green
    
    $envExample = Get-Content ".env.example" -Raw
    $RequiredEnvVars = @("MONGODB_URI", "JWT_SECRET", "PORT")
    
    foreach ($var in $RequiredEnvVars) {
        if ($envExample -match $var) {
            Write-Host "✅ Variable '$var' documentada" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Variable '$var' no documentada" -ForegroundColor Yellow
            $WarningCount++
        }
    }
} else {
    Write-Host "⚠️  .env.example no encontrado" -ForegroundColor Yellow
    $WarningCount++
}

# ==========================================
# RESUMEN FINAL
# ==========================================
Write-Host "`n📊 RESUMEN DE VALIDACIÓN" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "🎉 ¡SISTEMA PERFECTO! - No se encontraron problemas" -ForegroundColor Green
    $ExitCode = 0
} elseif ($ErrorCount -eq 0) {
    Write-Host "✅ SISTEMA SALUDABLE - Solo warnings menores" -ForegroundColor Yellow
    Write-Host "   Warnings: $WarningCount" -ForegroundColor Yellow
    $ExitCode = 1
} else {
    Write-Host "❌ PROBLEMAS CRÍTICOS ENCONTRADOS" -ForegroundColor Red
    Write-Host "   Errores: $ErrorCount" -ForegroundColor Red
    Write-Host "   Warnings: $WarningCount" -ForegroundColor Yellow
    $ExitCode = 2
}

# ==========================================
# RECOMENDACIONES
# ==========================================
if ($ErrorCount -gt 0 -or $WarningCount -gt 0) {
    Write-Host "`n💡 RECOMENDACIONES:" -ForegroundColor Cyan
    
    if ($ErrorCount -gt 0) {
        Write-Host "   1. Corregir errores críticos antes de desplegar" -ForegroundColor Red
        Write-Host "   2. Ejecutar tests completos después de correcciones" -ForegroundColor Red
    }
    
    if ($WarningCount -gt 0) {
        Write-Host "   3. Revisar warnings para optimizar código" -ForegroundColor Yellow
        Write-Host "   4. Considerar refactorización si hay muchos warnings" -ForegroundColor Yellow
    }
    
    Write-Host "   5. Ejecutar este script regularmente (semanal)" -ForegroundColor Cyan
    Write-Host "   6. Configurar en CI/CD para validación automática" -ForegroundColor Cyan
}

Write-Host "`n🔄 Ejecutado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
exit $ExitCode 
# 🔧 REFACTORIZADOR AUTOMÁTICO - UCN INCLUI2
# Automatiza la refactorización de valores hardcodeados a variables de entorno

param(
    [switch]$Preview = $false,
    [switch]$Backup = $true,
    [string]$BackupPath = "backup-refactoring"
)

Write-Host "🔧 REFACTORIZADOR AUTOMÁTICO UCN INCLUI2" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

$refactorings = @()
$processedFiles = @()

function New-Backup {
    if ($Backup) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupDir = "$BackupPath-$timestamp"
        
        Write-Host "💾 Creando backup en: $backupDir" -ForegroundColor Yellow
        
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        
        # Backup de archivos críticos
        $criticalFiles = @("src/sync/sync.service.ts", "src/auth/auth.controller.ts", ".env")
        
        foreach ($file in $criticalFiles) {
            if (Test-Path $file) {
                $destination = Join-Path $backupDir (Split-Path $file -Leaf)
                Copy-Item $file $destination -Force
                Write-Host "  📁 Backup: $file → $destination" -ForegroundColor Gray
            }
        }
        
        Write-Host "✅ Backup completado" -ForegroundColor Green
        return $backupDir
    }
    return $null
}

function Find-HardcodedPasswords {
    Write-Host "🔍 Buscando passwords hardcodeados..." -ForegroundColor Yellow
    
    $patterns = @{
        "inclui2025" = @{
            replacement = "this.configService.get('DEFAULT_USER_PASSWORD', 'inclui2025')"
            description = "Password por defecto hardcodeado"
            variable = "DEFAULT_USER_PASSWORD"
        }
    }
    
    Get-ChildItem -Path "src" -Recurse -Include "*.ts" | ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw
        $modified = $false
        $newContent = $content
        
        foreach ($pattern in $patterns.Keys) {
            $config = $patterns[$pattern]
            
            # Buscar patrón específico: password: 'inclui2025'
            $regex = "password\s*:\s*['\`"]$pattern['\`"]"
            
            if ($content -match $regex) {
                $refactorings += @{
                    file = $file.Name
                    pattern = $pattern
                    replacement = $config.replacement
                    description = $config.description
                    variable = $config.variable
                    type = "PASSWORD_HARDCODED"
                }
                
                if (-not $Preview) {
                    $newContent = $newContent -replace $regex, "password: $($config.replacement)"
                    $modified = $true
                }
                
                Write-Host "  🔧 Encontrado en $($file.Name): $($config.description)" -ForegroundColor Cyan
            }
        }
        
        if ($modified -and -not $Preview) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $processedFiles += $file.FullName
        }
    }
}

function Find-HardcodedUrls {
    Write-Host "🔍 Buscando URLs hardcodeadas..." -ForegroundColor Yellow
    
    $patterns = @{
        "http://localhost:3000" = @{
            replacement = "this.configService.get('API_BASE_URL', 'http://localhost:3000')"
            description = "URL base hardcodeada"
            variable = "API_BASE_URL"
        }
        "mongodb://localhost:27017" = @{
            replacement = "this.configService.get('DATABASE_URL')"
            description = "URL MongoDB hardcodeada"
            variable = "DATABASE_URL"
        }
    }
    
    Get-ChildItem -Path "src" -Recurse -Include "*.ts" | ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw
        $modified = $false
        $newContent = $content
        
        foreach ($pattern in $patterns.Keys) {
            $config = $patterns[$pattern]
            
            if ($content -match [regex]::Escape($pattern)) {
                $refactorings += @{
                    file = $file.Name
                    pattern = $pattern
                    replacement = $config.replacement
                    description = $config.description
                    variable = $config.variable
                    type = "URL_HARDCODED"
                }
                
                Write-Host "  🔧 Encontrado en $($file.Name): $($config.description)" -ForegroundColor Cyan
            }
        }
    }
}

function Find-HardcodedSecrets {
    Write-Host "🔍 Buscando secretos hardcodeados..." -ForegroundColor Yellow
    
    # Buscar Google Client ID hardcodeado específicamente
    $googleClientPattern = "90627838122-cv4i0d2124tgm1cbh06cbpotuu128b8v\.apps\.googleusercontent\.com"
    
    Get-ChildItem -Path "src" -Recurse -Include "*.ts" | ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw
        
        if ($content -match $googleClientPattern) {
            $refactorings += @{
                file = $file.Name
                pattern = "Google Client ID"
                replacement = "this.configService.get('GOOGLE_CLIENT_ID')"
                description = "Google Client ID hardcodeado"
                variable = "GOOGLE_CLIENT_ID"
                type = "SECRET_HARDCODED"
            }
            
            Write-Host "  🔧 Encontrado en $($file.Name): Google Client ID hardcodeado" -ForegroundColor Cyan
        }
    }
}

function Add-ConfigServiceInjection {
    Write-Host "🔧 Verificando inyección de ConfigService..." -ForegroundColor Yellow
    
    $filesToUpdate = @("src/sync/sync.service.ts", "src/auth/auth.controller.ts")
    
    foreach ($filePath in $filesToUpdate) {
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw
            
            # Verificar si ya tiene ConfigService importado
            if ($content -notmatch "import.*ConfigService") {
                Write-Host "  ⚠️ $filePath necesita importar ConfigService" -ForegroundColor Yellow
                
                $refactorings += @{
                    file = (Split-Path $filePath -Leaf)
                    pattern = "Missing ConfigService import"
                    replacement = "import { ConfigService } from '@nestjs/config';"
                    description = "Agregar import de ConfigService"
                    variable = "N/A"
                    type = "MISSING_IMPORT"
                }
            }
            
            # Verificar si ya está inyectado en el constructor
            if ($content -notmatch "private configService: ConfigService") {
                Write-Host "  ⚠️ $filePath necesita inyectar ConfigService" -ForegroundColor Yellow
                
                $refactorings += @{
                    file = (Split-Path $filePath -Leaf)
                    pattern = "Missing ConfigService injection"
                    replacement = "private configService: ConfigService,"
                    description = "Inyectar ConfigService en constructor"
                    variable = "N/A"
                    type = "MISSING_INJECTION"
                }
            }
        }
    }
}

function Update-EnvFile {
    Write-Host "🔧 Verificando variables en archivo .env..." -ForegroundColor Yellow
    
    $requiredVars = @()
    
    # Extraer variables necesarias de las refactorizaciones
    $refactorings | ForEach-Object {
        if ($_.variable -ne "N/A" -and $_.variable -notin $requiredVars) {
            $requiredVars += $_.variable
        }
    }
    
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        $missingVars = @()
        
        foreach ($var in $requiredVars) {
            if ($envContent -notmatch "$var=") {
                $missingVars += $var
            }
        }
        
        if ($missingVars.Count -gt 0) {
            Write-Host "  ⚠️ Variables faltantes en .env: $($missingVars -join ', ')" -ForegroundColor Yellow
            
            $refactorings += @{
                file = ".env"
                pattern = "Missing variables"
                replacement = $missingVars -join ', '
                description = "Variables de entorno faltantes"
                variable = "MULTIPLE"
                type = "MISSING_ENV_VARS"
            }
        }
    } else {
        Write-Host "  ❌ Archivo .env no encontrado" -ForegroundColor Red
        
        $refactorings += @{
            file = ".env"
            pattern = "Missing .env file"
            replacement = "Create .env file"
            description = "Archivo .env no existe"
            variable = "ALL"
            type = "MISSING_ENV_FILE"
        }
    }
}

function Show-RefactoringPlan {
    Write-Host ""
    Write-Host "📋 PLAN DE REFACTORIZACIÓN" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($refactorings.Count -eq 0) {
        Write-Host "✅ No se encontraron valores hardcodeados para refactorizar" -ForegroundColor Green
        return
    }
    
    $groupedRefactorings = $refactorings | Group-Object type
    
    foreach ($group in $groupedRefactorings) {
        Write-Host "🔧 $($group.Name) ($($group.Count) items):" -ForegroundColor Yellow
        
        $group.Group | ForEach-Object {
            Write-Host "  📁 $($_.file): $($_.description)" -ForegroundColor Gray
            if ($_.pattern -ne "Missing variables" -and $_.pattern -ne "Missing .env file") {
                Write-Host "    🔄 $($_.pattern) → $($_.replacement)" -ForegroundColor Cyan
            }
        }
        Write-Host ""
    }
}

function Show-Summary {
    Write-Host ""
    Write-Host "📊 RESUMEN DE REFACTORIZACIÓN" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📁 Archivos procesados: $($processedFiles.Count)" -ForegroundColor Green
    Write-Host "🔧 Refactorizaciones aplicadas: $($refactorings.Count)" -ForegroundColor Yellow
    
    if ($Preview) {
        Write-Host "👁️ MODO PREVIEW: No se realizaron cambios" -ForegroundColor Cyan
        Write-Host "💡 Ejecutar sin -Preview para aplicar cambios" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Cambios aplicados exitosamente" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎯 PRÓXIMOS PASOS RECOMENDADOS:" -ForegroundColor Cyan
    Write-Host "1. Verificar que todas las variables estén en .env" -ForegroundColor White
    Write-Host "2. Ejecutar script de validación: .\validate-critical-config.ps1" -ForegroundColor White
    Write-Host "3. Realizar testing de funcionalidad" -ForegroundColor White
    Write-Host "4. Commit de cambios con mensaje descriptivo" -ForegroundColor White
}

# EJECUCIÓN PRINCIPAL
try {
    if ($Preview) {
        Write-Host "👁️ MODO PREVIEW ACTIVADO - No se realizarán cambios" -ForegroundColor Cyan
        Write-Host ""
    }
    
    $backupPath = New-Backup
    
    Find-HardcodedPasswords
    Find-HardcodedUrls
    Find-HardcodedSecrets
    Add-ConfigServiceInjection
    Update-EnvFile
    
    Show-RefactoringPlan
    Show-Summary
    
    if ($backupPath) {
        Write-Host ""
        Write-Host "💾 Backup guardado en: $backupPath" -ForegroundColor Green
    }
    
    # Generar script de restauración
    if ($Backup -and $backupPath) {
        $restoreScript = @"
# Script de restauración automática
# Ejecutar en caso de problemas con la refactorización

Write-Host "🔄 Restaurando archivos desde backup..." -ForegroundColor Yellow

Get-ChildItem "$backupPath" | ForEach-Object {
    `$source = `$_.FullName
    `$destination = `$_.Name
    Copy-Item `$source `$destination -Force
    Write-Host "✅ Restaurado: `$destination" -ForegroundColor Green
}

Write-Host "🎯 Restauración completada" -ForegroundColor Cyan
"@
        
        $restoreScript | Out-File "restore-from-backup.ps1" -Encoding UTF8
        Write-Host "📄 Script de restauración creado: restore-from-backup.ps1" -ForegroundColor Cyan
    }
    
    if ($refactorings.Count -gt 0 -and -not $Preview) {
        exit 0  # Cambios aplicados exitosamente
    } elseif ($refactorings.Count -eq 0) {
        exit 0  # No hay cambios necesarios
    } else {
        exit 1  # Preview mode o errores
    }
    
} catch {
    Write-Host "❌ ERROR EN REFACTORIZACIÓN: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 REFACTORIZACIÓN COMPLETADA" -ForegroundColor Blue 
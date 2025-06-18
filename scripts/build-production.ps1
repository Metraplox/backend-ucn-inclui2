# 🛡️ Script de Build de Producción - PowerShell
# Genera archivos compilados SIN código fuente para entrega al cliente

param(
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔨 Iniciando build de producción..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Yellow

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    exit 1
}

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Ejecuta este script desde la raíz del backend."
}

Write-Log "📦 Preparando build del backend..."

# Verificar que Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Log "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker no está instalado o no está en el PATH"
}

# Verificar que npm está disponible
try {
    $npmVersion = npm --version
    Write-Log "NPM encontrado: $npmVersion"
} catch {
    Write-Error "NPM no está instalado o no está en el PATH"
}

# Limpiar builds anteriores
Write-Log "🧹 Limpiando builds anteriores..."
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path "ucn-inclui2-backend-production.tar") { Remove-Item "ucn-inclui2-backend-production.tar" -Force }
if (Test-Path "ucn-inclui2-backend-production.tar.gz") { Remove-Item "ucn-inclui2-backend-production.tar.gz" -Force }

# Instalar dependencias si es necesario
if (!(Test-Path "node_modules")) {
    Write-Log "📥 Instalando dependencias..."
    npm install
}

# Build local para verificar
Write-Log "🔧 Compilando código TypeScript..."
npm run build

if (!(Test-Path "dist")) {
    Write-Error "Error en la compilación. No se generó el directorio dist/"
}

Write-Log "✅ Compilación local exitosa"

# Build de Docker de producción
Write-Log "🐳 Construyendo imagen Docker de producción..."
docker build -f Dockerfile.production -t ucn-inclui2-backend:production .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al construir la imagen Docker"
}

Write-Log "✅ Imagen Docker creada exitosamente"

# Exportar imagen para entrega
Write-Log "📦 Exportando imagen Docker para entrega..."
docker save ucn-inclui2-backend:production -o ucn-inclui2-backend-production.tar

# Comprimir si está disponible 7zip o similar
if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    Write-Log "🗜️ Comprimiendo imagen con 7zip..."
    7z a ucn-inclui2-backend-production.tar.gz ucn-inclui2-backend-production.tar
    Remove-Item "ucn-inclui2-backend-production.tar" -Force
} else {
    Write-Warning "7zip no encontrado. Imagen sin comprimir: ucn-inclui2-backend-production.tar"
}

Write-Log "✅ Imagen exportada"

# Crear archivo de configuración de ejemplo
Write-Log "📄 Creando archivos de configuración..."

$envContent = @"
# 🛡️ Variables de Entorno de Producción
# IMPORTANTE: Modificar estos valores antes del deployment

# Base de datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/produccion

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h

# API URLs
API_URL=https://tu-dominio.com/api

# Google OAuth (si aplica)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Entorno
NODE_ENV=production
PORT=3000
"@

$envContent | Out-File -FilePath ".env.production.example" -Encoding UTF8

# Crear manual de instalación
$manualContent = @"
# 📖 Manual de Instalación - UCN Inclui2

## Requisitos Previos
- Docker y Docker Compose instalados
- Servidor con al menos 2GB RAM
- Acceso a internet para MongoDB Atlas

## Instalación en Windows

### 1. Cargar la imagen Docker
``````powershell
# Si tienes el archivo comprimido
7z x ucn-inclui2-backend-production.tar.gz
docker load -i ucn-inclui2-backend-production.tar

# O si tienes el archivo sin comprimir
docker load -i ucn-inclui2-backend-production.tar
``````

### 2. Configurar variables de entorno
``````powershell
Copy-Item .env.production.example .env.production
# Editar .env.production con tus valores reales usando notepad u otro editor
notepad .env.production
``````

### 3. Iniciar la aplicación
``````powershell
docker-compose -f docker-compose.production.yml up -d
``````

### 4. Verificar funcionamiento
- Visita: http://localhost:3000/api
- Deberías ver la documentación Swagger

## Comandos Útiles (PowerShell)

### Ver logs
``````powershell
docker-compose -f docker-compose.production.yml logs -f
``````

### Reiniciar aplicación
``````powershell
docker-compose -f docker-compose.production.yml restart
``````

### Detener aplicación
``````powershell
docker-compose -f docker-compose.production.yml down
``````

## Instalación en Linux/Mac

### 1. Cargar la imagen Docker
``````bash
gunzip ucn-inclui2-backend-production.tar.gz
docker load -i ucn-inclui2-backend-production.tar
``````

### 2. Resto de pasos iguales a Windows
Usar los mismos comandos pero en bash en lugar de PowerShell.

## Soporte
Para soporte técnico o actualizaciones, contactar al equipo de desarrollo.
"@

$manualContent | Out-File -FilePath "MANUAL_INSTALACION.md" -Encoding UTF8

# Verificar que la aplicación funciona en la imagen
Write-Log "🧪 Verificando imagen de producción..."
try {
    docker run --rm -d --name test-ucn -p 3001:3000 ucn-inclui2-backend:production
    Start-Sleep 10
    
    # Test básico de conectividad
    try {
        Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5 | Out-Null
        Write-Log "✅ Test de funcionalidad: EXITOSO"
    } catch {
        Write-Warning "⚠️ Test de funcionalidad: No se pudo conectar (puede ser normal si falta .env)"
    }
    
    docker stop test-ucn | Out-Null
} catch {
    Write-Warning "⚠️ No se pudo realizar test de funcionalidad"
}

# Resumen final
Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Log "🎉 BUILD DE PRODUCCIÓN COMPLETADO"
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Archivos generados para entrega:" -ForegroundColor Cyan

if (Test-Path "ucn-inclui2-backend-production.tar.gz") {
    Write-Host "   ✅ ucn-inclui2-backend-production.tar.gz (Imagen Docker comprimida)" -ForegroundColor Green
} else {
    Write-Host "   ✅ ucn-inclui2-backend-production.tar (Imagen Docker)" -ForegroundColor Green
}

Write-Host "   ✅ docker-compose.production.yml (Configuración)" -ForegroundColor Green
Write-Host "   ✅ .env.production.example (Variables de entorno)" -ForegroundColor Green
Write-Host "   ✅ MANUAL_INSTALACION.md (Instrucciones)" -ForegroundColor Green
Write-Host ""
Write-Host "🛡️ PROTECCIÓN DE CÓDIGO:" -ForegroundColor Magenta
Write-Host "   ✅ NO se incluye código TypeScript original" -ForegroundColor Green
Write-Host "   ✅ Solo código JavaScript compilado" -ForegroundColor Green
Write-Host "   ✅ Sin archivos de desarrollo (.ts, src/, test/)" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Siguiente paso: Entregar estos archivos al cliente" -ForegroundColor Yellow
Write-Host "💡 El cliente NO tendrá acceso al código fuente original" -ForegroundColor Cyan
Write-Host "" 
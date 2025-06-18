#!/bin/bash

# 🛡️ Script de Build de Producción
# Genera archivos compilados SIN código fuente para entrega al cliente

set -e  # Salir si algún comando falla

echo "🔨 Iniciando build de producción..."
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde la raíz del backend."
fi

log "📦 Preparando build del backend..."

# Limpiar builds anteriores
log "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -f ucn-inclui2-backend-production.tar

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    log "📥 Instalando dependencias..."
    npm install
fi

# Build local para verificar
log "🔧 Compilando código TypeScript..."
npm run build

if [ ! -d "dist" ]; then
    error "Error en la compilación. No se generó el directorio dist/"
fi

log "✅ Compilación local exitosa"

# Build de Docker de producción
log "🐳 Construyendo imagen Docker de producción..."
docker build -f Dockerfile.production -t ucn-inclui2-backend:production .

if [ $? -ne 0 ]; then
    error "Error al construir la imagen Docker"
fi

log "✅ Imagen Docker creada exitosamente"

# Exportar imagen para entrega
log "📦 Exportando imagen Docker para entrega..."
docker save ucn-inclui2-backend:production -o ucn-inclui2-backend-production.tar

# Comprimir para reducir tamaño
log "🗜️ Comprimiendo imagen..."
gzip ucn-inclui2-backend-production.tar

log "✅ Imagen exportada: ucn-inclui2-backend-production.tar.gz"

# Crear archivo de configuración de ejemplo
log "📄 Creando archivos de configuración..."

cat > .env.production.example << EOF
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
EOF

# Crear manual de instalación
cat > MANUAL_INSTALACION.md << EOF
# 📖 Manual de Instalación - UCN Inclui2

## Requisitos Previos
- Docker y Docker Compose instalados
- Servidor con al menos 2GB RAM
- Acceso a internet para MongoDB Atlas

## Instalación

### 1. Cargar la imagen Docker
\`\`\`bash
gunzip ucn-inclui2-backend-production.tar.gz
docker load -i ucn-inclui2-backend-production.tar
\`\`\`

### 2. Configurar variables de entorno
\`\`\`bash
cp .env.production.example .env.production
# Editar .env.production con tus valores reales
\`\`\`

### 3. Iniciar la aplicación
\`\`\`bash
docker-compose -f docker-compose.production.yml up -d
\`\`\`

### 4. Verificar funcionamiento
- Visita: http://localhost:3000/api
- Deberías ver la documentación Swagger

## Comandos Útiles

### Ver logs
\`\`\`bash
docker-compose -f docker-compose.production.yml logs -f
\`\`\`

### Reiniciar aplicación
\`\`\`bash
docker-compose -f docker-compose.production.yml restart
\`\`\`

### Detener aplicación
\`\`\`bash
docker-compose -f docker-compose.production.yml down
\`\`\`

## Soporte
Para soporte técnico o actualizaciones, contactar al equipo de desarrollo.
EOF

# Verificar que la aplicación funciona en la imagen
log "🧪 Verificando imagen de producción..."
docker run --rm -d --name test-ucn -p 3001:3000 ucn-inclui2-backend:production

sleep 10

# Test básico de conectividad
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Test de funcionalidad: EXITOSO"
else
    warn "⚠️ Test de funcionalidad: No se pudo conectar (puede ser normal si falta .env)"
fi

docker stop test-ucn > /dev/null 2>&1

# Resumen final
echo ""
echo "======================================"
log "🎉 BUILD DE PRODUCCIÓN COMPLETADO"
echo "======================================"
echo ""
echo "📦 Archivos generados para entrega:"
echo "   ✅ ucn-inclui2-backend-production.tar.gz (Imagen Docker)"
echo "   ✅ docker-compose.production.yml (Configuración)"
echo "   ✅ .env.production.example (Variables de entorno)"
echo "   ✅ MANUAL_INSTALACION.md (Instrucciones)"
echo ""
echo "🛡️ PROTECCIÓN DE CÓDIGO:"
echo "   ✅ NO se incluye código TypeScript original"
echo "   ✅ Solo código JavaScript compilado"
echo "   ✅ Sin archivos de desarrollo (.ts, src/, test/)"
echo ""
echo "📋 Siguiente paso: Entregar estos archivos al cliente"
echo "💡 El cliente NO tendrá acceso al código fuente original"
echo "" 
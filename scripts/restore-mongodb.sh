#!/bin/bash

# 🔄 Script de Restauración MongoDB - UCN Inclui2
# Restaura backup de la base de datos

set -e

CONTAINER_NAME="ucn_inclui2_mongodb"
DB_NAME="ucn_inclui2_prod"
DB_USER="admin"
DB_PASS="secure_password_123"

# Verificar parámetros
if [ -z "$1" ]; then
    echo "❌ Uso: ./restore-mongodb.sh <archivo_backup.tar.gz>"
    echo ""
    echo "📁 Backups disponibles:"
    ls -la ./backups/*.tar.gz 2>/dev/null || echo "   No hay backups disponibles"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="./restore_temp"

echo "🔄 Iniciando restauración de MongoDB UCN Inclui2..."
echo "📁 Archivo de backup: $BACKUP_FILE"
echo "📦 Container: $CONTAINER_NAME"
echo "🗂️ Base de datos: $DB_NAME"

# Verificar que el archivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: El archivo $BACKUP_FILE no existe"
    exit 1
fi

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: El contenedor $CONTAINER_NAME no está corriendo"
    echo "💡 Inicia primero: docker-compose -f docker-compose.production.yml up -d"
    exit 1
fi

# Confirmación de restauración
echo ""
echo "⚠️  ADVERTENCIA: Esta operación:"
echo "   - Eliminará TODOS los datos actuales de la base de datos"
echo "   - Restaurará los datos del backup seleccionado"
echo "   - Esta acción NO se puede deshacer"
echo ""
read -p "¿Estás seguro de continuar? (escribir 'SI' para confirmar): " confirmation

if [ "$confirmation" != "SI" ]; then
    echo "❌ Restauración cancelada por el usuario"
    exit 1
fi

echo ""
echo "📊 Creando backup de seguridad antes de restaurar..."

# Crear backup de seguridad antes de restaurar
SAFETY_BACKUP="./backups/safety_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
docker exec $CONTAINER_NAME mongodump \
  --username $DB_USER \
  --password $DB_PASS \
  --authenticationDatabase admin \
  --db $DB_NAME \
  --out /tmp/safety_backup > /dev/null 2>&1

docker cp $CONTAINER_NAME:/tmp/safety_backup/$DB_NAME ./safety_backup_temp
tar -czf $SAFETY_BACKUP safety_backup_temp > /dev/null 2>&1
rm -rf safety_backup_temp
docker exec $CONTAINER_NAME rm -rf /tmp/safety_backup

echo "✅ Backup de seguridad creado: $SAFETY_BACKUP"

# Crear directorio temporal para restauración
mkdir -p $RESTORE_DIR

echo "📂 Extrayendo backup..."

# Extraer backup
cd $RESTORE_DIR
tar -xzf ../$BACKUP_FILE

if [ $? -ne 0 ]; then
    echo "❌ Error al extraer el backup"
    cd ..
    rm -rf $RESTORE_DIR
    exit 1
fi

# Encontrar el directorio del backup
BACKUP_DIR_NAME=$(ls -1 | head -n 1)

if [ -z "$BACKUP_DIR_NAME" ]; then
    echo "❌ Error: No se encontró el directorio del backup"
    cd ..
    rm -rf $RESTORE_DIR
    exit 1
fi

echo "🗂️ Directorio del backup: $BACKUP_DIR_NAME"

# Copiar backup al contenedor
echo "📥 Copiando backup al contenedor..."
cd ..
docker cp $RESTORE_DIR/$BACKUP_DIR_NAME $CONTAINER_NAME:/tmp/restore_data

if [ $? -ne 0 ]; then
    echo "❌ Error al copiar backup al contenedor"
    rm -rf $RESTORE_DIR
    exit 1
fi

echo "🔄 Restaurando base de datos..."

# Restaurar usando mongorestore
docker exec $CONTAINER_NAME mongorestore \
  --username $DB_USER \
  --password $DB_PASS \
  --authenticationDatabase admin \
  --db $DB_NAME \
  --drop \
  /tmp/restore_data

if [ $? -ne 0 ]; then
    echo "❌ Error durante la restauración"
    echo "🔧 Intentando restaurar backup de seguridad..."
    
    # Intentar restaurar el backup de seguridad
    docker exec $CONTAINER_NAME mongorestore \
      --username $DB_USER \
      --password $DB_PASS \
      --authenticationDatabase admin \
      --db $DB_NAME \
      --drop \
      /tmp/safety_backup/$DB_NAME || echo "❌ Error al restaurar backup de seguridad"
    
    rm -rf $RESTORE_DIR
    exit 1
fi

# Limpiar archivos temporales
echo "🧹 Limpiando archivos temporales..."
docker exec $CONTAINER_NAME rm -rf /tmp/restore_data
rm -rf $RESTORE_DIR

echo ""
echo "🎉 Restauración completada exitosamente"

# Mostrar estadísticas de la base de datos restaurada
echo ""
echo "📊 Estadísticas de la base de datos restaurada:"
docker exec $CONTAINER_NAME mongo \
  --username $DB_USER \
  --password $DB_PASS \
  --authenticationDatabase admin \
  $DB_NAME \
  --eval "
    print('📄 Colecciones restauradas:');
    db.getCollectionNames().forEach(function(collection) {
      var count = db[collection].countDocuments();
      print('   - ' + collection + ': ' + count + ' documentos');
    });
    print('💾 Tamaño de BD: ' + (db.stats().dataSize / 1024 / 1024).toFixed(2) + ' MB');
    
    // Mostrar fecha del backup si está disponible
    var config = db.system_config.findOne({_id: 'app_settings'});
    if (config && config.initDate) {
      print('📅 Inicialización: ' + config.initDate);
    }
  " --quiet

echo ""
echo "✅ Base de datos restaurada y verificada"
echo "🔒 Backup de seguridad disponible en: $SAFETY_BACKUP"
echo "" 
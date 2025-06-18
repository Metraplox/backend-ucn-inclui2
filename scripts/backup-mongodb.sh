#!/bin/bash

# 🗄️ Script de Backup Automatizado MongoDB - UCN Inclui2
# Genera backup completo de la base de datos de producción

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ucn_inclui2_backup_${TIMESTAMP}"
CONTAINER_NAME="ucn_inclui2_mongodb"
DB_NAME="ucn_inclui2_prod"
DB_USER="admin"
DB_PASS="secure_password_123"

echo "🗄️ Iniciando backup de MongoDB UCN Inclui2..."
echo "⏰ Timestamp: $TIMESTAMP"
echo "📦 Container: $CONTAINER_NAME"
echo "🗂️ Base de datos: $DB_NAME"

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: El contenedor $CONTAINER_NAME no está corriendo"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "📊 Creando backup..."

# Realizar backup usando mongodump
docker exec $CONTAINER_NAME mongodump \
  --username $DB_USER \
  --password $DB_PASS \
  --authenticationDatabase admin \
  --db $DB_NAME \
  --out /tmp/backup

if [ $? -ne 0 ]; then
    echo "❌ Error durante el backup de MongoDB"
    exit 1
fi

echo "📥 Copiando backup al host..."

# Copiar backup al host
docker cp $CONTAINER_NAME:/tmp/backup/$DB_NAME $BACKUP_DIR/$BACKUP_FILE

if [ $? -ne 0 ]; then
    echo "❌ Error al copiar backup al host"
    exit 1
fi

# Comprimir backup
echo "🗜️ Comprimiendo backup..."
cd $BACKUP_DIR
tar -czf "${BACKUP_FILE}.tar.gz" $BACKUP_FILE

if [ $? -eq 0 ]; then
    rm -rf $BACKUP_FILE
    echo "✅ Backup comprimido: ${BACKUP_FILE}.tar.gz"
else
    echo "⚠️ Error al comprimir, backup disponible sin comprimir: $BACKUP_FILE"
fi

# Limpiar backup temporal en contenedor
docker exec $CONTAINER_NAME rm -rf /tmp/backup

# Mostrar información del backup
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
echo ""
echo "🎉 Backup completado exitosamente"
echo "📁 Archivo: ${BACKUP_FILE}.tar.gz"
echo "📏 Tamaño: $BACKUP_SIZE"
echo "📍 Ubicación: $(pwd)/${BACKUP_FILE}.tar.gz"

# Verificar integridad (opcional)
echo "🔍 Verificando integridad del backup..."
if tar -tzf "${BACKUP_FILE}.tar.gz" > /dev/null 2>&1; then
    echo "✅ Integridad del backup verificada"
else
    echo "⚠️ Advertencia: No se pudo verificar la integridad del backup"
fi

# Mostrar estadísticas de la base de datos
echo ""
echo "📊 Estadísticas de la base de datos:"
docker exec $CONTAINER_NAME mongo \
  --username $DB_USER \
  --password $DB_PASS \
  --authenticationDatabase admin \
  $DB_NAME \
  --eval "
    print('📄 Colecciones:');
    db.getCollectionNames().forEach(function(collection) {
      var count = db[collection].countDocuments();
      print('   - ' + collection + ': ' + count + ' documentos');
    });
    print('💾 Tamaño de BD: ' + (db.stats().dataSize / 1024 / 1024).toFixed(2) + ' MB');
  " --quiet

echo ""
echo "💡 Para restaurar este backup:"
echo "   ./restore-mongodb.sh ${BACKUP_FILE}.tar.gz"
echo "" 
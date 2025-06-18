# 🚀 GUÍA DE DEPLOYMENT - UCN INCLUI2

## 📋 Resumen Ejecutivo

Este proyecto está configurado para **deployment de producción completamente autónomo** con:
- ✅ **MongoDB local** (sin dependencias externas)
- ✅ **Código fuente protegido** (solo entregables compilados)
- ✅ **Backup automatizado** de base de datos
- ✅ **Configuración Docker** lista para producción

---

## 🏗️ Arquitectura de Producción

```
┌─────────────────────────────────────┐
│         SERVIDOR CLIENTE            │
├─────────────────────────────────────┤
│  🐳 Docker Network (ucn_network)    │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   Backend   │  │  MongoDB    │  │
│  │  (NestJS)   │←→│   Local     │  │
│  │   :3000     │  │   :27017    │  │
│  └─────────────┘  └─────────────┘  │
├─────────────────────────────────────┤
│  📱 Aplicación Móvil Flutter        │
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Rápido

### **1. Preparar el Entorno**
```bash
# Instalar Docker y Docker Compose en el servidor del cliente
docker --version
docker-compose --version
```

### **2. Configurar Variables de Entorno**
```bash
# Crear archivo .env.production con credenciales seguras
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:TU_PASSWORD_SEGURO@mongodb:27017/ucn_inclui2_prod?authSource=admin
JWT_SECRET=TU_JWT_SECRET_SUPER_SEGURO
```

### **3. Ejecutar Deployment**
```bash
# Levantar todo el stack
docker-compose -f docker-compose.production.yml up -d

# Verificar que todo esté funcionando
docker ps
```

### **4. Verificar Instalación**
```bash
# Probar endpoint de salud
curl http://localhost:3000/health

# Ver logs si hay problemas
docker logs ucn_inclui2_production
docker logs ucn_inclui2_mongodb
```

---

## 📊 Gestión de Base de Datos

### **Backup Manual**
```bash
# Crear backup inmediato
./scripts/backup-mongodb.sh
```

### **Restaurar Backup**
```bash
# Restaurar desde backup
./scripts/restore-mongodb.sh ./backups/backup_file.tar.gz
```

### **Monitoreo de BD**
```bash
# Ver estado de MongoDB
docker exec ucn_inclui2_mongodb mongo \
  --username admin \
  --password TU_PASSWORD \
  --eval "db.adminCommand('serverStatus')"
```

---

## 🔒 Seguridad Implementada

### **✅ Lo que ESTÁ Protegido:**
- **Código Fuente**: Solo código compilado JavaScript
- **Base de Datos**: Red privada Docker, autenticación obligatoria
- **Secrets**: Variables de entorno separadas del código
- **Acceso**: Puertos controlados, firewall recomendado

### **✅ Backups Seguros:**
- **Manuales**: Scripts disponibles (./scripts/backup-mongodb.sh)
- **Comprimidos**: Archivos .tar.gz optimizados
- **Verificados**: Integridad automática
- **Fácil restore**: Script de restauración con confirmación

---

## 📁 Estructura de Archivos Entregados

```
proyecto-entregable/
├── 🐳 docker-compose.production.yml
├── 🛡️ Dockerfile.production
├── 📁 mongodb-init/
│   ├── 01-init-database.js
│   └── 02-sample-data.js
├── 📁 scripts/
│   ├── backup-mongodb.sh
│   ├── restore-mongodb.sh
│   ├── build-production.sh
│   └── build-production.ps1
├── 📁 uploads/ (se crea automáticamente)
├── 📁 exports/ (se crea automáticamente)
├── 📁 backups/ (se crea automáticamente)
└── 📖 DEPLOYMENT_README.md (este archivo)
```

---

## 🛠️ Comandos Útiles

### **Gestión de Contenedores**
```bash
# Ver estado
docker ps

# Reiniciar aplicación
docker restart ucn_inclui2_production

# Ver logs en tiempo real
docker logs -f ucn_inclui2_production

# Detener todo
docker-compose -f docker-compose.production.yml down

# Reiniciar todo
docker-compose -f docker-compose.production.yml restart
```

### **Mantenimiento de BD**
```bash
# Acceder a MongoDB
docker exec -it ucn_inclui2_mongodb mongo \
  --username admin \
  --password TU_PASSWORD \
  --authenticationDatabase admin

# Ver estadísticas de colecciones
docker exec ucn_inclui2_mongodb mongo \
  --username admin \
  --password TU_PASSWORD \
  --authenticationDatabase admin \
  ucn_inclui2_prod \
  --eval "db.stats()"
```

---

## 🚨 Solución de Problemas

### **Aplicación no inicia**
```bash
# 1. Verificar logs
docker logs ucn_inclui2_production

# 2. Verificar variables de entorno
cat .env.production

# 3. Verificar conectividad con BD
docker exec ucn_inclui2_production ping mongodb
```

### **MongoDB no conecta**
```bash
# 1. Verificar que MongoDB esté corriendo
docker ps | grep mongodb

# 2. Verificar logs de MongoDB
docker logs ucn_inclui2_mongodb

# 3. Verificar red Docker
docker network ls
docker network inspect ucn_network
```

### **Problemas de Performance**
```bash
# 1. Ver uso de recursos
docker stats

# 2. Ver logs de aplicación
docker logs ucn_inclui2_production | tail -50

# 3. Verificar índices de BD
docker exec ucn_inclui2_mongodb mongo \
  --username admin \
  --password TU_PASSWORD \
  --authenticationDatabase admin \
  ucn_inclui2_prod \
  --eval "db.adjustments.getIndexes()"
```

---

## 📞 Contacto para Soporte

En caso de problemas técnicos durante el deployment o operación:

1. **Revisar logs** con los comandos indicados arriba
2. **Verificar configuración** de variables de entorno
3. **Consultar guías** en la carpeta `guias/`
4. **Contactar equipo de desarrollo** con información de logs específicos

---

## 🎯 Ventajas de esta Configuración

- ✅ **Autonomía Total**: Sin dependencias de servicios externos
- ✅ **Protección de IP**: Código fuente completamente protegido  
- ✅ **Fácil Deployment**: Un solo comando para levantar todo
- ✅ **Backup Robusto**: Scripts manuales de respaldo y restauración
- ✅ **Escalabilidad**: Fácil actualización y mantenimiento
- ✅ **Seguridad**: Configuración securizada por defecto
- ✅ **Monitoreo**: Logs y métricas disponibles
- ✅ **Recuperación**: Procedures de restore establecidos

> **💡 Esta configuración proporciona una plataforma robusta, segura y completamente autónoma para la gestión de ajustes razonables en la UCN.** 
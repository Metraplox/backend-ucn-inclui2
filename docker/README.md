# 🐳 Configuración Docker - UCN Inclui2

## 📁 **Archivos de Docker**

Esta carpeta contiene las configuraciones de Docker para diferentes entornos del proyecto UCN Inclui2.

---

## 📋 **Archivos Disponibles**

### **`Dockerfile.production`**
- **Propósito**: Imagen Docker optimizada para producción
- **Características**:
  - Build multi-stage para tamaño optimizado
  - Imagen base Node.js Alpine (ligera)
  - Usuario no-root para seguridad
  - Compilación TypeScript -> JavaScript
  - Eliminación de archivos de desarrollo
- **Uso**: `docker build -f docker/Dockerfile.production -t ucn-inclui2:production .`

### **`docker-compose.production.yml`**
- **Propósito**: Orquestación de servicios para producción
- **Servicios incluidos**:
  - **MongoDB**: Base de datos con autenticación
  - **Backend**: Aplicación NestJS
  - **Volumes**: Persistencia de datos
  - **Networks**: Red interna aislada
- **Uso**: `docker-compose -f docker/docker-compose.production.yml up -d`

---

## 🚀 **Deployment de Producción**

### **Paso 1: Build de la Imagen**
```bash
# Desde la raíz del proyecto
docker build -f docker/Dockerfile.production -t ucn-inclui2:production .
```

### **Paso 2: Configurar Variables de Entorno**
```bash
# Crear .env.production
NODE_ENV=production
MONGODB_URI=mongodb://admin:secure_password_123@mongodb:27017/ucn_inclui2_prod?authSource=admin
JWT_SECRET=your-super-secure-jwt-secret-for-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Paso 3: Ejecutar Servicios**
```bash
# Copiar archivo de composición
cp docker/docker-compose.production.yml ./docker-compose.yml

# Ejecutar servicios
docker-compose up -d
```

### **Paso 4: Verificar Deployment**
```bash
# Verificar servicios
docker-compose ps

# Verificar logs
docker-compose logs app

# Testing de endpoints
curl http://localhost:3000/health
```

---

## 🔧 **Configuraciones de Seguridad**

### **Imagen de Producción**
- **Usuario no-root**: `nestjs` (UID 1001)
- **Puertos**: Solo 3000 expuesto
- **Archivos**: Solo runtime necesario
- **Variables**: Mediante .env separado

### **MongoDB**
- **Autenticación**: Habilitada
- **Credenciales**: Configurables
- **Persistencia**: Volume dedicado
- **Red**: Interna isolada

---

## 📊 **Monitoreo y Logs**

### **Logs de Aplicación**
```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Logs de MongoDB
docker-compose logs -f mongodb
```

### **Health Checks**
```bash
# Verificar estado de servicios
docker-compose ps

# Health check manual
curl http://localhost:3000/health
```

---

## 🔄 **Mantenimiento**

### **Actualización de Imagen**
```bash
# Rebuild y restart
docker-compose down
docker build -f docker/Dockerfile.production -t ucn-inclui2:production .
docker-compose up -d
```

### **Backup de Datos**
```bash
# Backup MongoDB
docker exec ucn_inclui2_mongodb mongodump --authenticationDatabase admin -u admin -p secure_password_123 --out /backup

# Copiar backup al host
docker cp ucn_inclui2_mongodb:/backup ./backup-$(date +%Y%m%d)
```

### **Limpieza**
```bash
# Parar servicios
docker-compose down

# Limpiar imágenes no usadas
docker image prune -f

# Limpiar volumes (¡CUIDADO! Borra datos)
docker volume prune -f
```

---

## ⚠️ **Consideraciones Importantes**

### **Antes del Deployment**
- [ ] Actualizar variables de entorno de producción
- [ ] Cambiar passwords por defecto
- [ ] Configurar backups automatizados
- [ ] Configurar monitoreo
- [ ] Testing completo en staging

### **Seguridad**
- **Nunca** usar credenciales de desarrollo en producción
- Configurar firewall para puerto 3000
- Usar HTTPS en producción (proxy reverso)
- Rotar credenciales regularmente

### **Performance**
- Configurar recursos de Docker según hardware
- Monitorear uso de CPU y memoria
- Configurar logs rotation
- Implementar caché si es necesario

---

## 🔗 **Referencias**

- [Documentación Docker](../docs/04-deployment/README.md)
- [Guía de Deployment](../docs/04-deployment/DEPLOYMENT_STATUS.md)
- [Scripts de Build](../scripts/README.md)

---

**Configuraciones optimizadas para**: UCN Inclui2 V2.0  
**Última actualización**: 18 de Enero 2025 
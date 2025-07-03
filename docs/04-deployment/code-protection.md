# 🛡️ GUÍA DE PROTECCIÓN DE CÓDIGO FUENTE
## Proyecto: Plataforma Inclusiva UCN - Estrategias de Deployment Seguro

### 📅 **Última Actualización**: 06 Julio 2025
### 🎯 **Objetivo**: Proteger el código fuente al entregar en producción

---

## 🎯 **ESTRATEGIAS POR COMPONENTE**

### **1. Backend (NestJS) - Protección Máxima**

#### **✅ Build de Producción Optimizado**
```bash
# Build optimizado y minificado
npm run build

# El resultado va a /dist con código JavaScript compilado y optimizado
# El cliente NO recibe el código TypeScript original
```

#### **🐳 Docker Multi-Stage para Máxima Protección**
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main"]
```

#### **🔒 Ofuscación Adicional (Opcional)**
Para máxima protección, se puede agregar ofuscación:
```bash
npm install --save-dev javascript-obfuscator
```

### **2. Frontend (Flutter) - Protección Nativa**

#### **📱 APK/IPA Compilado**
Flutter compila a código nativo, lo que ya proporciona protección:

```bash
# Android - APK/AAB (código nativo protegido)
flutter build apk --release

# iOS - IPA (código nativo protegido)
flutter build ios --release
```

#### **🌐 Web Build (Si aplica)**
```bash
# Web compilado y minificado
flutter build web --release
```

---

## 🏭 **ESTRATEGIAS DE DEPLOYMENT**

### **Opción 1: Solo Compilados (Recomendado)**
- **Backend**: Solo entregar imagen Docker con código compilado
- **Frontend**: Solo entregar APK/IPA compilado
- **Ventaja**: El cliente nunca ve código fuente
- **Desventaja**: Mantenimiento 100% tuyo

### **Opción 2: Servidor Controlado**
- **Backend**: Deploy en servidor que tú controlas
- **Frontend**: APK/IPA que consume tu API
- **Ventaja**: Control total del backend
- **Desventaja**: Costos de infraestructura a largo plazo

### **Opción 3: Licenciamiento y Contratos**
- **Legal**: Contratos de propiedad intelectual
- **Técnico**: Protección básica + términos legales
- **Ventaja**: Balance entre protección y flexibilidad

---

## 🛠️ **IMPLEMENTACIÓN PRÁCTICA**

### **Paso 1: Dockerfile de Producción**
```dockerfile
# Crear backend-ucn-inclui2/Dockerfile.production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build
RUN rm -rf src/ test/ *.md *.ts tsconfig.json

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
```

### **Paso 2: Script de Build Seguro**
```bash
# scripts/build-production.sh
#!/bin/bash
echo "🔨 Construyendo versión de producción..."

# Backend
cd backend-ucn-inclui2
docker build -f Dockerfile.production -t ucn-inclui2-backend:production .

# Frontend
cd ../front/backend-ucn-inclui2/incluye_app
flutter build apk --release
flutter build ios --release

echo "✅ Build de producción completado"
echo "📦 Archivos para entregar:"
echo "   - Docker image: ucn-inclui2-backend:production"
echo "   - Android: build/app/outputs/flutter-apk/app-release.apk"
echo "   - iOS: build/ios/ipa/incluye_app.ipa"
```

### **Paso 3: Configuración de Entrega con MongoDB Local**
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: ucn_inclui2_mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password_123
      - MONGO_INITDB_DATABASE=ucn_inclui2_prod
    volumes:
      - mongodb_data:/data/db
      - ./mongodb-init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - ucn_network

  app:
    image: ucn-inclui2-backend:production
    container_name: ucn_inclui2_production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure_password_123@mongodb:27017/ucn_inclui2_prod?authSource=admin
    env_file:
      - .env.production
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - ucn_network

volumes:
  mongodb_data:
    driver: local

networks:
  ucn_network:
    driver: bridge
```

---

## 🔐 **NIVELES DE PROTECCIÓN**

### **Nivel 1: Básico** ⭐
- Build de producción compilado
- Sin código fuente en entregables
- **Protección**: 70%

### **Nivel 2: Medio** ⭐⭐
- Docker multi-stage
- Variables de entorno separadas
- Código minificado
- **Protección**: 85%

### **Nivel 3: Avanzado** ⭐⭐⭐
- Ofuscación de código
- Licencias y contratos
- Servidor controlado
- **Protección**: 95%

---

## 📋 **CHECKLIST DE ENTREGA SEGURA**

### **Pre-entrega**
- [ ] Código compilado y probado
- [ ] Variables sensibles en `.env.production`
- [ ] Logs de desarrollo removidos
- [ ] Documentación de usuario (no técnica)

### **Entregables al Cliente**
- [ ] Docker image o ejecutable compilado
- [ ] APK/IPA de la app móvil
- [ ] Archivo `.env.production` con variables necesarias
- [ ] Manual de instalación y uso
- [ ] **NO INCLUIR**: Código fuente, archivos `.ts`, `package.json` completo

### **Post-entrega**
- [ ] Backup del código fuente en repositorio privado
- [ ] Documentación interna actualizada
- [ ] Plan de mantenimiento establecido

---

## 💡 **RECOMENDACIONES PROFESIONALES**

### **Para tu Caso Específico**
1. **Usa Docker multi-stage** - Es la opción más profesional
2. **Entrega solo compilados** - APK + Docker image
3. **Mantén el código fuente** - En tu repositorio privado
4. **Establece contrato de mantenimiento** - Ingresos recurrentes

### **Comunicación con el Cliente**
- "Se entrega la aplicación completamente funcional y compilada"
- "El mantenimiento y actualizaciones se manejan por servicio especializado"
- "Se garantiza la funcionalidad, no la transferencia de código fuente"

---

## 🎯 **PRÓXIMOS PASOS**

1. **Implementar Dockerfile.production**
2. **Crear scripts de build automatizados**
3. **Probar el deployment completo**
4. **Preparar documentación de usuario**
5. **Establecer términos de mantenimiento**

---

> **💡 Nota**: La protección del código fuente es tanto técnica como legal. La combinación de build compilado + contratos adecuados ofrece la mejor protección. 

## 🚀 Convención de nombres de ramas (Branch Naming)

| Prefijo | Propósito                    | Ejemplo                       |
|---------|------------------------------|-------------------------------|
| `b/`    | Funcionalidad Backend        | `b/notifications-pagination`  |
| `f/`    | Funcionalidad Frontend       | `f/notifications-ui`          |
| `ops/`  | DevOps / Infraestructura     | `ops/ci-frontend-workflow`    |
| `docs/` | Documentación                | `docs/roadmap-cleanup`        |
| `hotfix/` | Corrección crítica en prod | `hotfix/fix-null-pointer`      |

**Buenas prácticas**

1. Usa verbos en inglés en minúscula y separados con guiones.
2. Mantén el nombre breve y descriptivo (< 30 caracteres) para facilitar `git log`.
3. Evita usar tildes, espacios o caracteres especiales.
4. Cierra tu rama mediante Pull Request: revisiones en español y mensajes claros. 
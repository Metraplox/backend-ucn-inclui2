# 📚 Documentación - UCN Inclui2 Frontend

**Última actualización:** 10/07/2025

Documentación técnica completa del frontend Flutter para el sistema UCN Inclui2.

---

## 📖 **Índice de Documentación**

### 🔧 **Para Desarrolladores** (Esencial)
- **[📋 Guía de Desarrolladores](./development/GUIA_DESARROLLADORES.md)** - ⚠️ **LECTURA OBLIGATORIA**
  - Estándares post-refactoring API
  - Uso correcto de ApiResponseNormalizer
  - Reglas de desarrollo Frontend/Backend

### 🚀 **Setup y Configuración**
- **[📱 Setup Completo](./setup/README.md)**
  - Instalación detallada de Flutter
  - Configuración de entorno de desarrollo
  - Solución de problemas comunes

### 🏗️ **Arquitectura**
- **[🏛️ Arquitectura del Sistema](./architecture/README.md)**
  - Estructura de carpetas Flutter
  - Funcionalidades por rol de usuario
  - Modelos de datos y APIs

### 🧪 **Testing**
- **[🔬 Guía de Testing](./testing/README.md)**
  - Tests unitarios, widgets e integración
  - Configuración de coverage
  - Mocks y debugging

### 🔄 **Refactoring** (Histórico)
- Documentos de refactoring de Julio 2025
- *(Carpeta disponible para futuros refactorings)*

---

## 🎯 **Documentos por Prioridad**

### 🚨 **Críticos** (Leer PRIMERO)
1. **[GUIA_DESARROLLADORES.md](./development/GUIA_DESARROLLADORES.md)** - Estándares obligatorios
2. **[Setup README](./setup/README.md)** - Para nuevos desarrolladores
3. **[Arquitectura](./architecture/README.md)** - Entender el sistema

### 📋 **Importantes**
4. **[Testing](./testing/README.md)** - Calidad de código
5. **Backend docs** - Ver carpeta `../../../Back/backend-ucn-inclui2/docs/`

---

## 🔗 **Enlaces Rápidos**

### 📱 **Frontend Específico**
- [Flutter App](../incluye_app/) - Código principal de la aplicación
- [API Response Normalizer](../incluye_app/lib/services/api_response_normalizer.dart) - Componente crítico

### 🔧 **Backend Related**
- [Backend Documentation](../../../Back/backend-ucn-inclui2/docs/) - Documentación completa del backend
- [API Endpoints](../../../Back/backend-ucn-inclui2/docs/api/) - Referencia de APIs
- [Backend README](../../../Back/backend-ucn-inclui2/README.md) - Información del backend

---

## 📝 **Contribuir a la Documentación**

### ✅ **Al agregar nueva documentación:**
1. **Ubicación correcta:** Usar subcarpetas apropiadas
2. **Formato consistente:** Seguir estructura de archivos existentes
3. **Enlaces:** Actualizar este índice y README principal
4. **Revisión:** Verificar que no hay duplicación

### 📋 **Estructura recomendada:**
```
docs/
├── README.md                    # Este archivo (índice)
├── development/                 # Guías de desarrollo
├── setup/                      # Configuración e instalación
├── architecture/               # Arquitectura del sistema
├── testing/                    # Testing y calidad
└── refactoring/               # Documentos históricos de refactoring
```

---

## 🆘 **¿Necesitas Ayuda?**

### 🔍 **Buscar información:**
1. **Revisar este índice** para encontrar el documento apropiado
2. **Usar búsqueda** en tu editor para encontrar términos específicos
3. **Consultar backend docs** si es relacionado con APIs

### 📞 **Obtener soporte:**
- **Issues:** GitHub Issues para problemas específicos
- **Código:** Revisar implementaciones existentes como referencia
- **Backend:** Verificar que el backend esté ejecutándose correctamente

---

**🎯 Esta documentación se mantiene actualizada y refleja el estado actual del proyecto post-refactoring Julio 2025.**

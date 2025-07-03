# 🗺️ **Mapa de Navegación – Dashboards por Rol**

### 📅 Fecha: 01-07-2025

> Vista de alto nivel de la navegación principal dentro de la app Flutter. El propósito es **alinear UI/UX, endpoints y prioridades** para cada rol.

---

## 📐 Diagrama de navegación (Mermaid)

```mermaid
flowchart TD
    subgraph COMMON "Áreas comunes"
        L["Login / Auth"] --> H["Home selector"]
    end

    H --> INC("Dashboard Incluye")
    H --> JEF("Dashboard Jefatura")
    H --> DOC("Dashboard Docente")
    H --> DID("Dashboard DIDDEC")
    H --> EST("Dashboard Estudiante")

    %% Incluye
    subgraph INCLUYE
        INC --> INC_S["Estudiantes NEE"]
        INC --> INC_A["Ajustes Razonables"]
        INC --> INC_R["Reportes"]
        INC --> INC_N["Notificaciones"]
    end

    %% Jefatura
    subgraph JEFATURA
        JEF --> JEF_L["Listado Estudiantes"]
        JEF --> JEF_A["Alertas Ajustes"]
        JEF --> JEF_R["Reportes"]
    end

    %% Docente
    subgraph DOCENTE
        DOC --> DOC_C["Cursos"]
        DOC --> DOC_E["Estudiantes NEE"]
        DOC --> DOC_A["Ajustes (Check)"]
        DOC --> DOC_S["Solicitar Apoyo"]
    end

    %% DIDDEC
    subgraph DIDDEC
        DID --> DID_P["Pendientes Staff"]
        DID --> DID_H["Historial Ajustes"]
        DID --> DID_R["Recursos de Apoyo"]
    end

    %% Estudiante
    subgraph ESTUDIANTE
        EST --> EST_A["Mis Ajustes"]
        EST --> EST_C["Confirmar Uso"]
        EST --> EST_D["Documentos"]
    end
```

---

## 🖌️ Wireframes de alto nivel

| Rol | Widget clave | Descripción |
|-----|--------------|-------------|
| Incluye | `StatisticCard`, `AlertList`, `QuickActionButton` | Métricas de NEE, ajustes pendientes, acceso rápido a registrar estudiante |
| Jefatura | `StudentTable`, `AlertBadge`, `ExportButton` | Filtrado por carrera, alertas docentes no revisan |
| Docente | `CourseSelector`, `AdjustmentChecklist`, `HelpRequestDialog` | Estado de lectura y solicitud de apoyo |
| DIDDEC | `PendingList`, `ResourceUploader`, `FollowUpChart` | Seguimiento ajustes y material de apoyo |
| Estudiante | `AdjustmentViewer`, `ComplianceForm`, `DocumentUploader` | Confirmación de uso de ajustes y gestión de certificados |

---

## 🚦 Priorización de desarrollo (Sprint 1 y 2)

1. **Dashboard Incluye** (mayor actividad – gestiona datos base)
2. **Dashboard Docente** (impacta directamente la implementación en aula)
3. **Dashboard Jefatura**
4. **Dashboard Estudiante**
5. **Dashboard DIDDEC**

Cada pantalla nueva deberá:
- Contar con componente(s) reutilizables definidos arriba.
- Incluir prueba unitaria básica (Flutter `test/widget_test.dart`).
- Registrar entrada correspondiente en `docs/05-history/changelog.md`.

---

## 🔗 Relación con Endpoints

La tabla `05_ROLE_MINIMUM_FUNCTIONS.md` lista la cobertura actual de endpoints.  Durante la implementación de cada dashboard se verificará que:<br/>
* Todos los servicios requeridos existan.<br/>
* Si falta un endpoint, se crea un *issue técnico* antes de avanzar al desarrollo de UI.

---

## ✅ Próximos pasos operativos

1. Revisión con stakeholders de este mapa de navegación.
2. Ajustes finales al flujo antes de diseñar pantallas detalladas en Figma.
3. Kick-off Sprint 1 con objetivo **Dashboard Incluye** listo y testeado. 
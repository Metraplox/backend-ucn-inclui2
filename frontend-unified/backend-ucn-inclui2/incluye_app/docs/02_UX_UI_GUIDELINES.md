# 🧭 Principios de Diseño y Desarrollo de Frontend (UX/UI)

**📅 Fecha de Creación:** 06 de Julio 2025
**✍️ Autor:** Asistente de IA (Comité de Arquitectura y UX)

---

## 1. Filosofía Central: Coherencia sobre Uniformidad

El objetivo principal de la interfaz de Incluye+UCN es **potenciar la eficiencia y claridad para cada rol**. Una interfaz de "talla única" no es efectiva, ya que las necesidades de un `Estudiante` son fundamentalmente diferentes a las de un miembro de `DIDDEC` o un `Jefe de Carrera`.

Por lo tanto, nuestra guía es la **coherencia lógica**, no la uniformidad rígida del layout.

-   ✅ **Coherencia (Sí):** Usar los mismos componentes (botones, colores, tipografía), estilos de `AppBar` y transiciones para que la aplicación se sienta como un producto unificado.
-   ❌ **Uniformidad (No):** Forzar a que todos los dashboards tengan la misma estructura de `GridView` 2x2 si esa estructura no es la más lógica para el flujo de trabajo de un rol específico.

---

## 2. Principios Fundamentales de UX/UI

Todo desarrollo de una nueva vista o la modificación de una existente debe adherirse a los siguientes principios.

### Principio 1: Diseño Centrado en el Rol (Role-Centered Design)

La estructura de una vista debe ser una respuesta directa a las necesidades del usuario.

-   **Análisis Previo Obligatorio:** Antes de escribir el código de un widget, se deben definir las 3-5 "historias de usuario" o "tareas a realizar" (Jobs-To-Be-Done) más importantes para ese rol en esa vista.
-   **Ejemplo Práctico:**
    -   Un **Estudiante** necesita ver de inmediato si tiene **acciones pendientes** (ej: confirmar un ajuste). Esta tarea es más importante que ver el número total de cursos. Por tanto, las acciones pendientes deben tener la máxima prioridad visual.
    -   Un miembro de **DIDDEC** gestiona múltiples casos. Su dashboard debe facilitar la **búsqueda, el filtrado y el acceso rápido a listas** de pendientes, más que mostrar cuatro métricas generales.

### Principio 2: Jerarquía Visual Clara

Debemos guiar al usuario visualmente hacia lo más importante.

-   **Uso de Contraste:**
    -   **Tamaño:** Los elementos más importantes (ej: una alerta crítica) deben ser más grandes.
    -   **Color:** Usar la paleta de `AppColors` de forma semántica. `alertStatCard` para acciones urgentes, `pendingStatCard` para avisos.
    -   **Espacio en Blanco (Whitespace):** Usar `Padding` y `SizedBox` para agrupar elementos relacionados y separar secciones, reduciendo la carga cognitiva.
-   **Posición:** La información más relevante se ubica en la parte superior o en el punto de enfoque natural del usuario (ej: el centro de la pantalla para un diálogo modal).

### Principio 3: Sistema de Diseño Consistente

La coherencia se logra a través de un sistema de diseño compartido.

-   **Componentes Atómicos:** Siempre se deben usar los colores definidos en `AppColors`, la tipografía del `ThemeData` y los íconos estandarizados.
-   **Componentes Reutilizables:** Utilizar siempre que sea posible los widgets de `lib/widgets/`. Si se crea un nuevo widget que podría ser reutilizado (ej: un `Card` con un estilo específico), se debe colocar en el directorio de widgets compartidos.
-   **Scaffolds y Layouts Base:** El `DashboardScaffold` es la base para la apariencia general (AppBar, fondo), pero su `body` es un lienzo libre para aplicar el Principio 1.

### Principio 4: Feedback y Estado del Sistema

La aplicación debe ser "conversacional", informando siempre al usuario lo que está sucediendo.

-   **Estado de Carga:** Usar `CircularProgressIndicator` o `LinearProgressIndicator` cuando se espera por datos de la red.
-   **Estado Vacío:** Si una lista no tiene elementos, mostrar un mensaje amigable con un ícono. Ej: "No tienes cursos asignados para este semestre." en lugar de una pantalla en blanco.
-   **Estado de Error:** Mostrar un mensaje claro y, si es posible, una acción a seguir. Ej: "Error de conexión. Revisa tu internet y vuelve a intentarlo." con un botón de "Reintentar". Usar `SnackBar` o un widget en el centro de la pantalla.
-   **Confirmación de Acciones:** Confirmar acciones destructivas (ej: "Eliminar") y notificar el éxito de una operación (ej: "Ajuste guardado correctamente").
-   **NOTA:** Todas las alertas y comunicaciones entre roles se realizarán mediante notificaciones internas en la plataforma. El envío de correos automáticos queda fuera del alcance salvo decisión explícita futura.

### Principio 5: Accesibilidad (a11y)

Una aplicación profesional es una aplicación para todos.

-   **Contraste de Color:** La paleta en `AppColors` ha sido diseñada con esto en mente. Verificar con herramientas si se añaden nuevos colores.
-   **Tamaño de Objetivos Táctiles:** Los botones e íconos deben tener un tamaño mínimo de 44x44 dp para ser fácilmente presionables. Usar `Padding` si el ícono es más pequeño.
-   **Etiquetas Semánticas:** Todos los `IconButton` deben tener un `tooltip` que describa su acción. Esto es crucial para los lectores de pantalla.

### Principio 6: Manejo de Múltiples Contextos (Multi-Rol)

Un usuario puede tener múltiples roles. La interfaz debe permitir un cambio de contexto fluido y claro.

-   **Selector de Rol Explícito:** Si un usuario tiene más de un rol, la interfaz debe mostrar un selector de rol visible (ej. en el `AppBar`).
-   **Rol Activo Claro:** Siempre debe ser obvio para el usuario en qué "vista" o "rol" se encuentra actualmente.
-   **Jerarquía por Defecto:** Al iniciar sesión, el rol por defecto debe ser el de mayor jerarquía. El orden es: `INCLUYE` > `DIDDEC` > `JEFE_CARRERA` > `DOCENTE` > `ESTUDIANTE`.

---

## 3. Proceso de Desarrollo de Vistas Recomendado

1.  **Analizar (Definir el "Qué"):** Basado en el rol, definir las tareas clave y la información necesaria.
2.  **Diseñar (Boceto en Papel o Texto):** Proponer una estructura de layout que responda a ese análisis. Justificar por qué esa estructura es mejor que una genérica.
3.  **Implementar (Construir con el Sistema):** Usar los componentes del sistema de diseño para construir la vista.
4.  **Manejar Estados (Carga, Vacío, Error):** Asegurarse de que la vista se comporte de manera predecible en todos los escenarios.
5.  **Revisar (Verificación Final):** Hacer una pasada rápida para verificar la jerarquía visual, el feedback y la accesibilidad.

---

## Decisión de Arquitectura: Notificaciones en Tiempo Real

Para la entrega de notificaciones push (avisos de nuevos eventos, alertas, etc.) se utilizará **SSE (Server-Sent Events)** en lugar de WebSocket. Las razones son:
- Simplicidad de implementación y mantenimiento.
- Reconexión automática y uso de HTTP estándar (puerto 80/443), sin problemas de firewall o proxy.
- Suficiente para el flujo unidireccional de notificaciones (server -> cliente).
- Ya existen endpoints SSE en el backend.

**WebSocket** solo se considerará si en el futuro se requiere chat en tiempo real o colaboración bidireccional. 
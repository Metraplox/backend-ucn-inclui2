# 🏗️ Arquitectura del Frontend (Flutter)

**📅 Fecha de Actualización:** 03 de Julio 2025

Este documento describe la arquitectura y los patrones de diseño adoptados en el proyecto frontend para asegurar un código limpio, escalable y mantenible.

---

## 🏛️ Patrones Principales

### 1. **Capas de la Aplicación**

La aplicación se estructura en las siguientes capas lógicas:

-   **UI / Vistas (`screens`):** Responsables de mostrar la interfaz de usuario. Son "tontas" y no contienen lógica de negocio.
-   **Servicios (`services`):** Contienen la lógica de negocio y orquestan las operaciones. *Ej: `AuthService`*.
-   **Repositorios (`repositories`):** Son la única capa que habla con fuentes de datos (nuestra API REST). Aíslan completamente la lógica de acceso a datos. *Ej: `AuthRepository`*.
-   **Modelos (`models`):** Definen la estructura de los datos. *Ej: `User`*.

### 2. **Patrón Repositorio**

-   **Propósito:** Desacoplar la lógica de negocio (servicios) de la lógica de acceso a datos (llamadas a la API).
-   **Implementación:** Por cada "feature" o entidad (ej: `authentication`, `user`), se crea un `Repository`. Este repositorio es el único que puede usar `Dio` o `http` para comunicarse con el backend.
-   **Beneficios:**
    -   **Testeabilidad:** Podemos "mockear" el repositorio para probar los servicios sin necesidad de una API real.
    -   **Mantenibilidad:** Si el backend cambia un endpoint, solo modificamos el repositorio, no los servicios ni las vistas.
    -   **Claridad:** Cada capa tiene una única responsabilidad.

### 3. **Patrón Singleton para Servicios**

-   **Propósito:** Asegurar que exista una única instancia de nuestros servicios principales (como `AuthService`) en toda la aplicación.
-   **Implementación:**
    ```dart
    class MyService {
      static final MyService _instance = MyService._internal();
      MyService._internal();
      static MyService get instance => _instance;

      // ... métodos del servicio
    }
    ```
-   **Uso:** `MyService.instance.doSomething()`.
-   **Beneficios:**
    -   **Estado Compartido:** Proporciona un punto de acceso global y único al estado y la lógica del servicio.
    -   **Simplicidad:** Evita la necesidad de pasar instancias de servicios a través de múltiples widgets.

---

## 📂 Estructura de Directorios (Feature-First)

Para las nuevas funcionalidades, se adopta un enfoque "feature-first" para organizar los archivos:

```
lib/
└── features/
    └── authentication/
        ├── models/
        ├── repositories/
        │   └── auth_repository.dart
        ├── services/
        │   └── (Opcional si se mantiene el genérico)
        └── views/
            └── login_screen.dart
```

Esta estructura mantiene todo lo relacionado con una funcionalidad en un solo lugar, facilitando la navegación y el desarrollo. 
# Documentación de Endpoints de Perfil de Usuario

## Introducción

Este documento detalla los nuevos endpoints implementados para permitir a los usuarios ver sus perfiles en la aplicación UCN Incluye. Estos endpoints son fundamentales para la experiencia de usuario y permiten tanto a estudiantes como a administradores acceder a su información personal y académica.

## Endpoints Implementados

### 1. Perfil de Usuario Básico

**Ruta:** `GET /users/profile`

**Descripción:** Permite a cualquier usuario autenticado ver su información básica de perfil.

**Autenticación requerida:** Sí (JWT Token)

**Permisos:** Cualquier usuario autenticado puede acceder a su propio perfil.

**Respuesta exitosa (200 OK):**
```json
{
  "_id": "string",
  "email": "string",
  "nombreCompleto": "string",
  "roles": ["string"],
  "isActive": true,
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### 2. Perfil Académico de Estudiante

**Ruta:** `GET /students/profile`

**Descripción:** Permite a un estudiante autenticado ver su perfil académico completo.

**Autenticación requerida:** Sí (JWT Token)

**Permisos:** Cualquier usuario autenticado puede acceder, pero devolverá un error 404 si no existe un perfil de estudiante asociado al email del usuario.

**Respuesta exitosa (200 OK):**
```json
{
  "_id": "string",
  "rut": "string",
  "nombres": "string",
  "apellidos": "string",
  "email": "string",
  "carrera": "string",
  "fechaNacimiento": "string (ISO date)",
  "informacionContacto": "string",
  "necesidadesEducativasEspeciales": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Implementación Técnica

### Decorador CurrentUser

Se ha creado un nuevo decorador `@CurrentUser()` que facilita el acceso a la información del usuario autenticado:

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Modificaciones en el Controlador de Usuarios

Se ha agregado un nuevo endpoint en `UsersController` para obtener el perfil del usuario actual:

```typescript
@Get('profile')
@ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
@ApiResponse({ status: 200, description: 'Perfil del usuario actual.', type: User })
@ApiResponse({ status: 401, description: 'No autorizado.' })
async getProfile(@CurrentUser() user: UserPublicData): Promise<UserPublicData> {
  return user;
}
```

### Modificaciones en el Controlador de Estudiantes

Se ha agregado un nuevo endpoint en `StudentsController` para obtener el perfil académico del estudiante actual:

```typescript
@Get('profile')
@ApiOperation({ summary: 'Obtener el perfil académico del estudiante actual' })
@ApiResponse({ status: 200, description: 'Perfil académico del estudiante.', type: Student })
@ApiResponse({ status: 404, description: 'Perfil de estudiante no encontrado.' })
@ApiResponse({ status: 401, description: 'No autorizado.' })
async getProfile(@CurrentUser() user: UserPublicData): Promise<Student> {
  return this.studentsService.findByEmail(user.email);
}
```

### Nuevo Método en StudentsService

Se ha implementado un nuevo método para buscar estudiantes por email:

```typescript
async findByEmail(email: string): Promise<Student> {
  const student = await this.studentModel.findOne({ email }).exec();
  if (!student) {
    throw new NotFoundException(`Estudiante con email "${email}" no encontrado.`);
  }
  return student;
}
```

## Guía de Integración para Frontend

### Flujo de Autenticación y Acceso a Perfil

1. **Autenticación:**
   - El usuario inicia sesión y obtiene un token JWT
   - El token debe incluirse en todas las solicitudes como encabezado `Authorization: Bearer {token}`

2. **Obtención de Perfil:**
   - Después del inicio de sesión, consultar `/users/profile` para información básica
   - Para usuarios con rol `STUDENT`, consultar adicionalmente `/students/profile` para información académica

### Ejemplo de Implementación en Frontend

```javascript
// Obtener perfil básico
async function getUserProfile() {
  const response = await fetch('http://localhost:3000/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const userProfile = await response.json();
    return userProfile;
  } else {
    throw new Error('Error al obtener el perfil de usuario');
  }
}

// Obtener perfil académico (solo para estudiantes)
async function getStudentProfile() {
  const response = await fetch('http://localhost:3000/students/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const studentProfile = await response.json();
    return studentProfile;
  } else if (response.status === 404) {
    console.log('No existe un perfil de estudiante para este usuario');
    return null;
  } else {
    throw new Error('Error al obtener el perfil académico');
  }
}
```

### Manejo de Errores

- **401 Unauthorized**: El usuario no está autenticado o el token ha expirado
- **404 Not Found**: No se encontró un perfil de estudiante para el email del usuario (solo para `/students/profile`)

## Casos de Uso

1. **Visualización de Perfil Personal**:
   - Un estudiante puede ver su información personal y académica
   - Un administrador puede ver su información de usuario

2. **Panel de Control Personalizado**:
   - Mostrar información relevante basada en el perfil del usuario
   - Adaptar la interfaz según el rol del usuario (ADMIN, STAFF, STUDENT)

3. **Gestión de Ajustes Académicos**:
   - Un estudiante puede ver sus ajustes académicos asociados a su perfil
   - Facilita la solicitud de nuevos ajustes al tener la información del perfil disponible

## Consideraciones de Seguridad

- Los endpoints están protegidos con autenticación JWT
- Cada usuario solo puede acceder a su propio perfil
- La información sensible está protegida por los mecanismos de autorización implementados

## Conclusión

Estos nuevos endpoints proporcionan una base sólida para la implementación de funcionalidades centradas en el usuario en la aplicación UCN Incluye. Facilitan el acceso a la información personal y académica de forma segura y eficiente, mejorando la experiencia general del usuario.

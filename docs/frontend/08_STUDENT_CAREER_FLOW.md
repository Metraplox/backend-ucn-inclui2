# 🚀 **STUDENT CAREER FLOW (Flutter)**

**Fecha:** 03-07-2025  
**Sprint:** S3 – StudentCareerListScreen  
**Autor:** AI Assistant – Frontend Architecture Committee

---

## 1. Objetivo
Implementar la vista para que el estudiante consulte sus asignaturas por semestre y acceda a sus ajustes razonables de cada una.

## 2. Endpoint Backend

- **GET** `/students/{studentId}/courses`
  - Devuelve la lista de cursos del estudiante, con datos: `id`, `codigo`, `nombre`, `nrc`, `profesor`, `semestre`, `students[]`.

## 3. Modelo de datos (Course)
```dart
class Course {
  final String id;
  final String codigo;
  final String nombre;
  final String nrc;
  final String? profesor;
  final String? semestre;
  final List<String> students;
}
```

## 4. StudentCourseListScreen

**Ruta de archivo:** `lib/screens/students/student_course_list_screen.dart`

### 4.1. Estados
- `loading`: indicador de carga mientras se obtienen datos.
- `empty`: mensaje «No hay asignaturas para este semestre» cuando la lista filtrada está vacía.
- `data`: listado de `ListTile` por asignatura.

### 4.2. Componentes clave
- **DropdownButton** para seleccionar semestre.
- **ListView.builder** de tarjetas (`Card` + `ListTile`) por curso.
- **RefreshIndicator** para recargar datos al arrastrar.

### 4.3. Navegación
- Desde `EstudianteDashboard` llamando:
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => const StudentCourseListScreen(),
  ),
);
```
- Al tapear un curso, navega a `StudentAdjustmentSubjectScreen`, pasando `studentId`, `courseNrc` y `courseId`.

## 5. Tests sugeridos
- **Unit Test** de `CourseService.getStudentCourses`: simular respuesta y validar parsing.
- **Widget Test** de `StudentCourseListScreen`: verificar estados `loading`, `empty` y lista con mock.

## 6. Siguientes pasos
1. Escribir pruebas básicas.  
2. Corregir warnings/lints de estilo.  
3. Revisar experiencia de usuario: paginación, filtros avanzados.  
4. Integrar en flujo principal y actualizar `home_screen.dart` (si se decide ruta nombrada). 
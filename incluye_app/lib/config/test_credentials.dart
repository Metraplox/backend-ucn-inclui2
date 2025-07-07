// Archivo con credenciales de prueba para desarrollo
// NO INCLUIR EN PRODUCCIÓN

class TestCredentials {
  // Credenciales de coordinadora (antes admin)
  static const String coordinadoraEmail = 'admin@ucn.cl';
  static const String coordinadoraPassword = 'inclui2025';

  // Credenciales de estudiante
  static const String studentEmail = '123@ucn.cl';
  static const String studentPassword = '12345678';

  // Credenciales de profesor
  static const String teacherEmail = 'profe1@ucn.cl';
  static const String teacherPassword = 'inclui2025';

  // Obtener todas las credenciales como lista para probar automáticamente
  static List<Map<String, String>> get allCredentials => [
    {
      'label': 'Coordinadora',
      'email': coordinadoraEmail,
      'password': coordinadoraPassword,
    },
    {'label': 'Estudiante', 'email': studentEmail, 'password': studentPassword},
    {'label': 'Profesor', 'email': teacherEmail, 'password': teacherPassword},
  ];
}

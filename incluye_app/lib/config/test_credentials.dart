// Archivo con credenciales de prueba para desarrollo
// NO INCLUIR EN PRODUCCIÓN

class TestCredentials {
  // Credenciales de coordinadora (antes admin)
  static const String coordinadoraEmail = 'admin@ucn.cl';
  static const String coordinadoraPassword = 'admin123';
  
  // Credenciales de estudiante
  static const String studentEmail = 'estudiante@ucn.cl';
  static const String studentPassword = 'estudiante123';
  
  // Obtener todas las credenciales como lista para probar automáticamente
  static List<Map<String, String>> get allCredentials => [
    {'label': 'Coordinadora', 'email': coordinadoraEmail, 'password': coordinadoraPassword},
    {'label': 'Estudiante', 'email': studentEmail, 'password': studentPassword},
  ];
}

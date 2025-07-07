// Archivo con credenciales de prueba para desarrollo
// NO INCLUIR EN PRODUCCIÓN

class TestCredentials {
  // Password común para todos los usuarios de prueba
  static const String defaultPassword = 'password123';

  // Credenciales de coordinador
  static const String coordinadorEmail = 'coordinador@ucn.cl';
  static const String coordinadorPassword = defaultPassword;

  // Credenciales de educadora social (INCLUYE)
  static const String educadoraEmail = 'educadora@ucn.cl';
  static const String educadoraPassword = defaultPassword;

  // Credenciales de DIDDEC
  static const String diddecEmail = 'diddec@ucn.cl';
  static const String diddecPassword = defaultPassword;

  // Credenciales de estudiante
  static const String studentEmail = 'estudiante@alumnos.ucn.cl';
  static const String studentPassword = defaultPassword;

  // Credenciales de docente
  static const String teacherEmail = 'docente@ucn.cl';
  static const String teacherPassword = defaultPassword;

  // Credenciales de jefe de carrera
  static const String jefeCarreraEmail = 'jefe.carrera@ucn.cl';
  static const String jefeCarreraPassword = defaultPassword;

  // Credenciales de jefe de departamento
  static const String jefeDepartamentoEmail = 'jefe.departamento@ucn.cl';
  static const String jefeDepartamentoPassword = defaultPassword;

  // Credenciales legacy (mantener compatibilidad)
  static const String coordinadoraEmail = coordinadorEmail;
  static const String coordinadoraPassword = coordinadorPassword;

  // Obtener todas las credenciales como lista para probar automáticamente
  static List<Map<String, String>> get allCredentials => [
    {
      'label': 'Coordinador',
      'email': coordinadorEmail,
      'password': coordinadorPassword,
      'role': 'COORDINADOR'
    },
    {
      'label': 'Educadora (Incluye)',
      'email': educadoraEmail,
      'password': educadoraPassword,
      'role': 'EDUCADORA_SOCIAL'
    },
    {
      'label': 'DIDDEC',
      'email': diddecEmail,
      'password': diddecPassword,
      'role': 'DIDDEC_STAFF'
    },
    {
      'label': 'Estudiante',
      'email': studentEmail,
      'password': studentPassword,
      'role': 'ESTUDIANTE'
    },
    {
      'label': 'Docente',
      'email': teacherEmail,
      'password': teacherPassword,
      'role': 'DOCENTE'
    },
    {
      'label': 'Jefe Carrera',
      'email': jefeCarreraEmail,
      'password': jefeCarreraPassword,
      'role': 'JEFE_CARRERA'
    },
    {
      'label': 'Jefe Departamento',
      'email': jefeDepartamentoEmail,
      'password': jefeDepartamentoPassword,
      'role': 'JEFE_DEPARTAMENTO'
    }
  ];
}

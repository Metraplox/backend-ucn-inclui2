// models/user_model.dart

class User {
  final String id; // Mapeado desde _id
  final String email;
  final String nombreCompleto; // Estandarizar a nombreCompleto
  final List<String> roles;    // Ahora es una lista directamente
  final bool? isActive;       // Hacer opcional si no siempre viene
  final String? token;        // Token JWT de la sesión actual de la app
  final DateTime? createdAt;  // Fecha de creación del usuario
  final DateTime? updatedAt;  // Fecha de última actualización

  User({
    required this.id,
    required this.email,
    required this.nombreCompleto,
    required this.roles,
    this.isActive,
    this.token,
    this.createdAt,
    this.updatedAt,
  });

  // Getter para compatibilidad si alguna parte de tu UI usa 'name' o 'nombre'
  String get name => nombreCompleto; 
  String get nombre => nombreCompleto; // Alias

  // Getter para compatibilidad si alguna parte de tu UI espera un solo 'rol'
  // Devuelve el primer rol o un rol por defecto si la lista está vacía.
  String get rol {
    if (roles.isNotEmpty) {
      return roles.first;
    }
    return 'desconocido'; // O el rol por defecto que prefieras
  }

  factory User.fromJson(Map<String, dynamic> json) {
    // Roles: asegurar que sea una lista de strings
    List<String> parsedRoles = [];
    if (json['roles'] != null && json['roles'] is List) {
      // Filtrar nulos y convertir a String
      parsedRoles = (json['roles'] as List)
          .where((role) => role != null)
          .map((role) => role.toString())
          .toList();
    } else if (json['rol'] is String) { // Para compatibilidad con un solo 'rol'
        parsedRoles = [json['rol'] as String];
    } else if (json['role'] is String) { // Otra posible clave para rol
        parsedRoles = [json['role'] as String];
    }


    return User(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '', // Manejar ObjectId y String
      email: json['email'] ?? '',
      nombreCompleto: json['nombreCompleto'] ?? json['name'] ?? json['nombre'] ?? '', // Priorizar 'nombreCompleto'
      roles: parsedRoles,
      isActive: json['isActive'] as bool?, // Puede ser null si no viene
      token: json['token'] as String?,      // El token se añade en AuthService después del login
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    // Este toJson es principalmente para enviar datos AL backend,
    // usualmente no enviarías el token o las fechas de auditoría de esta forma.
    // Ajusta según lo que tu backend espere para crear/actualizar usuarios.
    return {
      if (id.isNotEmpty) '_id': id, // Enviar _id si existe (para actualizaciones)
      'email': email,
      'nombreCompleto': nombreCompleto,
      'roles': roles,
      if (isActive != null) 'isActive': isActive,
      // No incluir token, createdAt, updatedAt en el JSON para enviar al backend generalmente
    };
  }

  // Métodos de utilidad para roles
  bool hasRole(String roleToCheck) {
    return roles.any((r) => r.toLowerCase() == roleToCheck.toLowerCase());
  }

  bool get isAdmin => hasRole('administrador') || hasRole('admin'); // Ser flexible con nombres de rol
  bool get isStudent => hasRole('estudiante') || hasRole('student');
  bool get isStaff => hasRole('staff') || hasRole('docente') || hasRole('profesor'); // Agrupa roles de personal
  bool get isTeacher => hasRole('docente') || hasRole('profesor');

  // Si aún necesitas acceso tipo Map por alguna razón específica (no recomendado para uso general):
  dynamic operator [](String key) {
    switch (key) {
      case 'id':
      case '_id':
        return id;
      case 'email':
        return email;
      case 'nombreCompleto':
      case 'name':
      case 'nombre':
        return nombreCompleto;
      case 'roles':
        return roles;
      case 'rol': // Devuelve el primer rol para compatibilidad
        return rol;
      case 'isActive':
        return isActive;
      case 'token':
        return token;
      case 'createdAt':
        return createdAt?.toIso8601String();
      case 'updatedAt':
        return updatedAt?.toIso8601String();
      default:
        // Considera lanzar un error o devolver un valor específico para claves no encontradas
        // throw ArgumentError('Clave no válida: $key');
        return null;
    }
  }

  bool containsKey(String key) {
    return [
      'id', '_id', 'email', 'nombreCompleto', 'name', 'nombre', 
      'roles', 'rol', 'isActive', 'token', 'createdAt', 'updatedAt'
    ].contains(key);
  }
}
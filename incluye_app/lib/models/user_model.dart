class User {
  final String? id;
  final String email;
  final String nombre;
  final String rol;
  final String? departamento;
  final String? token;
  
  // Campos adicionales para compatibilidad
  String get name => nombre;
  List<String> get roles => [rol];

  // Operador de acceso por índice para mantener compatibilidad con código existente
  dynamic operator [](String key) {
    switch (key) {
      case 'id': return id;
      case '_id': return id;
      case 'nombre': return nombre;
      case 'name': return nombre;
      case 'email': return email;
      case 'rol': return rol;
      case 'role': return rol;
      case 'roles': return [rol];
      case 'departamento': return departamento;
      case 'token': return token;
      default: return null;
    }
  }

  // Método para verificar si existe una clave, para compatibilidad con Map
  bool containsKey(String key) {
    return ['id', '_id', 'nombre', 'name', 'email', 'rol', 'role', 'roles', 'departamento', 'token'].contains(key);
  }

  User({
    this.id,
    required this.email,
    required this.nombre,
    required this.rol,
    this.departamento,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'],
      email: json['email'] ?? '',
      nombre: json['nombre'] ?? json['name'] ?? '',
      rol: json['rol'] ?? json['role'] ?? '',
      departamento: json['departamento'],
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nombre': nombre,
      'rol': rol,
      'departamento': departamento,
      'token': token,
    };
  }

  bool hasRole(String role) {
    return rol == role;
  }

  bool get isAdmin => hasRole('administrador');
  bool get isStudent => hasRole('estudiante');
  bool get isStaff => hasRole('staff');
}

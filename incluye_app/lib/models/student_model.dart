class Student {
  final String? id;
  final String nombres;
  final String apellidos;
  final String rut;
  final String email;
  final String? telefono;
  final String? carrera;
  final int? anioIngreso;
  final bool consentimientoFirmado;
  final List<String>? diagnosticos;
  final String? diagnostico; // Para compatibilidad con código existente
  final String? fechaNacimiento;
  final String? informacionContacto;
  final String? necesidadesEducativasEspeciales;

  // Operador de acceso por índice para mantener compatibilidad con código existente
  dynamic operator [](String key) {
    switch (key) {
      case 'id': return id;
      case '_id': return id;
      case 'nombres': return nombres;
      case 'apellidos': return apellidos;
      case 'rut': return rut;
      case 'email': return email;
      case 'telefono': return telefono;
      case 'carrera': return carrera;
      case 'anioIngreso': return anioIngreso;
      case 'consentimientoFirmado': return consentimientoFirmado;
      case 'diagnosticos': return diagnosticos;
      case 'diagnostico': return diagnostico;
      case 'fechaNacimiento': return fechaNacimiento;
      case 'informacionContacto': return informacionContacto;
      case 'necesidadesEducativasEspeciales': return necesidadesEducativasEspeciales;
      default: return null;
    }
  }

  Student({
    this.id,
    required this.nombres,
    required this.apellidos,
    required this.rut,
    required this.email,
    this.telefono,
    this.carrera,
    this.anioIngreso,
    this.consentimientoFirmado = false,
    this.diagnosticos,
    this.diagnostico,
    this.fechaNacimiento,
    this.informacionContacto,
    this.necesidadesEducativasEspeciales,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['_id'] ?? json['id'],
      nombres: json['nombres'] ?? '',
      apellidos: json['apellidos'] ?? '',
      rut: json['rut'] ?? '',
      email: json['email'] ?? '',
      telefono: json['telefono'],
      carrera: json['carrera'],
      anioIngreso: json['anioIngreso'],
      consentimientoFirmado: json['consentimientoFirmado'] ?? false,
      diagnosticos: json['diagnosticos'] != null
          ? List<String>.from(json['diagnosticos'])
          : null,
      diagnostico: json['diagnostico'],
      fechaNacimiento: json['fechaNacimiento'],
      informacionContacto: json['informacionContacto'],
      necesidadesEducativasEspeciales: json['necesidadesEducativasEspeciales'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombres': nombres,
      'apellidos': apellidos,
      'rut': rut,
      'email': email,
      'telefono': telefono,
      'carrera': carrera,
      'anioIngreso': anioIngreso,
      'consentimientoFirmado': consentimientoFirmado,
      'diagnosticos': diagnosticos,
    };
  }

  String get nombreCompleto => '$nombres $apellidos';
}

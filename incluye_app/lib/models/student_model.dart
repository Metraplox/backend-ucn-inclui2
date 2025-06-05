// models/student_model.dart
import 'user_model.dart';   // Importa tu UserModel ajustado
import 'career_model.dart'; // Importa el CareerModel

class Student {
  final String id; // _id del documento Student
  final String rut;
  final String nombres;
  final String apellidos;
  final String email;        // Email del estudiante, puede o no ser el mismo que User.email
  final User? userId;        // Objeto User completo asociado
  final Career? carreraId;   // Objeto Career completo asociado
  final String? semester;
  final DateTime? fechaNacimiento;
  final String? informacionContacto;
  final String? necesidadesEducativasEspeciales;
  // final bool hasDisability; // Eliminado
  
  final String? telefono;
  final int? anioIngreso;
  final bool consentimientoFirmado;
  final List<String>? diagnosticosAntiguos;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  String get nombreCompleto => '$nombres $apellidos';
  String? get carreraNombre => carreraId?.name;


  Student({
    required this.id,
    required this.rut,
    required this.nombres,
    required this.apellidos,
    required this.email,
    this.userId,
    this.carreraId,
    this.semester,
    this.fechaNacimiento,
    this.informacionContacto,
    this.necesidadesEducativasEspeciales,
    // required this.hasDisability, // Eliminado
    this.telefono,
    this.anioIngreso,
    this.consentimientoFirmado = false,
    this.diagnosticosAntiguos,
    this.createdAt,
    this.updatedAt,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      rut: json['rut'] ?? '',
      nombres: json['nombres'] ?? '',
      apellidos: json['apellidos'] ?? '',
      email: json['email'] ?? '',
      userId: json['userId'] != null && json['userId'] is Map
          ? User.fromJson(json['userId'] as Map<String, dynamic>)
          : null,
      carreraId: json['carreraId'] != null && json['carreraId'] is Map
          ? Career.fromJson(json['carreraId'] as Map<String, dynamic>)
          : null,
      semester: json['semester'] as String?,
      fechaNacimiento: json['fechaNacimiento'] != null
          ? DateTime.tryParse(json['fechaNacimiento'] as String)
          : null,
      informacionContacto: json['informacionContacto'] as String?,
      necesidadesEducativasEspeciales: json['necesidadesEducativasEspeciales'] as String?,
      // hasDisability: json['hasDisability'] as bool? ?? false, // Eliminado
      
      telefono: json['telefono'] as String?,
      anioIngreso: json['anioIngreso'] as int?,
      consentimientoFirmado: json['consentimientoFirmado'] as bool? ?? json['extras']?['consentimientoFirmado'] as bool? ?? false, // Intenta leer de extras si existe para compatibilidad temporal
      diagnosticosAntiguos: json['diagnosticos'] != null && json['diagnosticos'] is List
          ? List<String>.from(json['diagnosticos'].map((e) => e.toString()))
          : null,
      
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rut': rut,
      'nombres': nombres,
      'apellidos': apellidos,
      'email': email,
      if (userId != null) 'userId': userId!.id,
      if (carreraId != null) 'carreraId': carreraId!.id,
      if (semester != null) 'semester': semester,
      if (fechaNacimiento != null) 'fechaNacimiento': fechaNacimiento!.toIso8601String(),
      if (informacionContacto != null) 'informacionContacto': informacionContacto,
      if (necesidadesEducativasEspeciales != null) 'necesidadesEducativasEspeciales': necesidadesEducativasEspeciales,
      // 'hasDisability': hasDisability, // Eliminado
      if (telefono != null) 'telefono': telefono,
      if (anioIngreso != null) 'anioIngreso': anioIngreso,
      'consentimientoFirmado': consentimientoFirmado,
      if (diagnosticosAntiguos != null) 'diagnosticos': diagnosticosAntiguos,
    };
  }
}
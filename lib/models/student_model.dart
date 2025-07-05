// models/student_model.dart
import 'user_model.dart';
import 'career_model.dart';

class Student {
  final String id;
  final String rut;
  final String nombres;
  final String apellidos;
  final String email;
  final User? userId;
  
  // --- CAMPOS PARA MANEJAR carreraId DE AMBAS FORMAS ---
  final String? rawCarreraId;    // Almacena el ID de carrera como string (de /students)
  final Career? carreraIdObject; // Almacena el objeto Career si viene populado (de /students/profile o /students/:id)
  // --- FIN CAMPOS ---

  final String? semester;
  final DateTime? fechaNacimiento;
  final String? informacionContacto;
  final String? necesidadesEducativasEspeciales;
  
  final String? telefono;
  final int? anioIngreso;
  final bool consentimientoFirmado;
  final List<String>? diagnosticosAntiguos;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  String get nombreCompleto => '$nombres $apellidos';
  
  // Getter para el nombre de la carrera.
  // StudentProfileScreen (vista admin por ID) y StudentOwnProfileScreen usarán esto
  // porque obtienen el objeto Career completo.
  String? get carreraNombre {
    return carreraIdObject?.name;
  }

  Student({
    required this.id,
    required this.rut,
    required this.nombres,
    required this.apellidos,
    required this.email,
    this.userId,
    this.rawCarreraId,     // Añadido al constructor
    this.carreraIdObject,  // Añadido al constructor
    this.semester,
    this.fechaNacimiento,
    this.informacionContacto,
    this.necesidadesEducativasEspeciales,
    this.telefono,
    this.anioIngreso,
    this.consentimientoFirmado = false,
    this.diagnosticosAntiguos,
    this.createdAt,
    this.updatedAt,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    String? parsedRawCarreraId;
    Career? parsedCarreraIdObject;

    if (json['carreraId'] != null) {
      if (json['carreraId'] is String) { // Caso: /students (lista)
        parsedRawCarreraId = json['carreraId'] as String;
        // No creamos parsedCarreraIdObject aquí porque solo tenemos el ID
      } else if (json['carreraId'] is Map) { // Caso: /students/profile o /students/:id (detalle)
        parsedCarreraIdObject = Career.fromJson(json['carreraId'] as Map<String, dynamic>);
        parsedRawCarreraId = parsedCarreraIdObject.id; // También guardamos el ID string
      }
    }
    
    User? parsedUserId;
    if (json['userId'] != null) {
      if (json['userId'] is String) { // Caso: /students (lista, userId es solo ID)
        // Creamos un User básico solo con el ID si es necesario o lo dejamos como String y lo manejamos en la UI
        // Por simplicidad, podríamos tener un campo rawUserId también, o asumir que User.fromJson puede manejar un Map con solo _id
        // Para este ejemplo, si es string, el objeto User será null o un User con solo ID.
        // La versión de UserModel que te di intenta manejar `json['userId'] is String` para crear un User básico.
         parsedUserId = User.fromJson({'_id': json['userId']}); // Asumiendo que User.fromJson puede manejar esto
      } else if (json['userId'] is Map) { // Caso: /students/profile o /students/:id (detalle)
        parsedUserId = User.fromJson(json['userId'] as Map<String, dynamic>);
      }
    }


    return Student(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      rut: json['rut'] ?? '',
      nombres: json['nombres'] ?? '',
      apellidos: json['apellidos'] ?? '',
      email: json['email'] ?? '',
      userId: parsedUserId,
      
      rawCarreraId: parsedRawCarreraId,
      carreraIdObject: parsedCarreraIdObject,
      
      semester: json['semester'] as String?,
      fechaNacimiento: json['fechaNacimiento'] != null
          ? DateTime.tryParse(json['fechaNacimiento'] as String)
          : null,
      informacionContacto: json['informacionContacto'] as String?,
      necesidadesEducativasEspeciales: json['necesidadesEducativasEspeciales'] as String?,
      
      telefono: json['telefono'] as String?,
      anioIngreso: json['anioIngreso'] as int?,
      consentimientoFirmado: json['consentimientoFirmado'] as bool? ?? json['extras']?['consentimientoFirmado'] as bool? ?? false,
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
      if (userId != null) 'userId': userId!.id, // Enviar solo el ID del usuario
      // Al enviar, enviar el ID de carrera que tengamos disponible
      if (rawCarreraId != null && rawCarreraId!.isNotEmpty) 
        'carreraId': rawCarreraId 
      else if (carreraIdObject != null) 
        'carreraId': carreraIdObject!.id,
      'semester': semester,
      'fechaNacimiento': fechaNacimiento?.toIso8601String(),
      'informacionContacto': informacionContacto,
      'necesidadesEducativasEspeciales': necesidadesEducativasEspeciales,
      'telefono': telefono,
      'anioIngreso': anioIngreso,
      'consentimientoFirmado': consentimientoFirmado,
      'diagnosticos': diagnosticosAntiguos,
    };
  }
}
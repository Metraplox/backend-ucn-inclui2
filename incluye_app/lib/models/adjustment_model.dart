class Adjustment {
  String? id;
  final String tipo;
  final String descripcion;
  final String? courseNrc;
  final String? studentId;
  final String? studentRut;
  final String? approvedAt;
  final String? expirationDate;
  final String? status;
  final String? approvedBy;
  final List<String>? documentosAsociados;
  final String? comentarios;
  final bool? requiresSemesterConfirmation;
  final String? fechaInicio;
  final List<Map<String, dynamic>>? readBy;

  // Propiedades para compatibilidad con código existente
  String get curso => courseNrc ?? '';
  String get fechaAprobacion => approvedAt ?? '';
  String get vencimiento => expirationDate ?? '';
  String get estado => status ?? 'pendiente';
  String get aprobadoPor => approvedBy ?? '';

  // Operador de acceso por índice para mantener compatibilidad con código existente
  dynamic operator [](String key) {
    switch (key) {
      case 'id':
        return id;
      case '_id':
        return id;
      case 'tipo':
        return tipo;
      case 'type':
        return tipo;
      case 'descripcion':
        return descripcion;
      case 'description':
        return descripcion;
      case 'curso':
        return courseNrc;
      case 'courseNrc':
        return courseNrc;
      case 'studentId':
        return studentId;
      case 'studentRut':
        return studentRut;
      case 'fechaAprobacion':
        return approvedAt;
      case 'approvedAt':
        return approvedAt;
      case 'vencimiento':
        return expirationDate;
      case 'expirationDate':
        return expirationDate;
      case 'fechaInicio':
        return fechaInicio;
      case 'estado':
        return status;
      case 'status':
        return status;
      case 'aprobadoPor':
        return approvedBy;
      case 'approvedBy':
        return approvedBy;
      case 'documentosAsociados':
        return documentosAsociados;
      case 'comentarios':
        return comentarios;
      case 'comments':
        return comentarios;
      case 'requiresSemesterConfirmation':
        return requiresSemesterConfirmation;
      default:
        return null;
    }
  }

  Adjustment({
    this.id,
    required this.tipo,
    required this.descripcion,
    this.courseNrc,
    this.studentId,
    this.studentRut,
    this.approvedAt,
    this.expirationDate,
    this.readBy,
    this.status = 'PENDIENTE',
    this.approvedBy,
    this.documentosAsociados,
    this.comentarios,
    this.requiresSemesterConfirmation,
    this.fechaInicio,
  });

  factory Adjustment.fromJson(Map<String, dynamic> json) {
    return Adjustment(
      id: json['_id'] ?? json['id'],
      tipo: json['type'] ?? json['tipo'] ?? '',
      descripcion: json['description'] ?? json['descripcion'] ?? '',
      courseNrc: json['courseNrc'] ?? json['curso'],
      studentId: json['studentId'],
      studentRut: json['studentRut'],
      approvedAt: json['approvedAt'] ?? json['fechaAprobacion'],
      expirationDate: json['expirationDate'] ?? json['vencimiento'],
      status: json['status'] ?? json['estado'] ?? 'PENDIENTE',
      approvedBy: json['approvedBy'] ?? json['aprobadoPor'],
      documentosAsociados:
          json['documentosAsociados'] != null
              ? List<String>.from(json['documentosAsociados'])
              : null,
      comentarios: json['comments'] ?? json['comentarios'],
      requiresSemesterConfirmation: json['requiresSemesterConfirmation'],
      fechaInicio: json['fechaInicio'],
      readBy:
          json['readBy'] != null
              ? (json['readBy'] as List)
                  .where((e) => e != null && e is Map)
                  .map<Map<String, dynamic>>(
                    (e) => Map<String, dynamic>.from(e),
                  )
                  .toList()
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'type': tipo,
      'description': descripcion,
    };

    if (id != null) data['id'] = id;
    if (courseNrc != null) data['courseNrc'] = courseNrc;
    if (studentId != null) data['studentId'] = studentId;
    if (studentRut != null) data['studentRut'] = studentRut;
    if (approvedAt != null) data['approvedAt'] = approvedAt;
    if (expirationDate != null) data['expirationDate'] = expirationDate;
    if (status != null) data['status'] = status;
    if (approvedBy != null) data['approvedBy'] = approvedBy;
    if (documentosAsociados != null)
      data['documentosAsociados'] = documentosAsociados;
    if (comentarios != null) data['comments'] = comentarios;
    if (requiresSemesterConfirmation != null)
      data['requiresSemesterConfirmation'] = requiresSemesterConfirmation;
    if (fechaInicio != null) data['fechaInicio'] = fechaInicio;

    return data;
  }

  bool get isActive {
    if (expirationDate == null)
      return status?.toUpperCase() == 'ACTIVO' ||
          status?.toUpperCase() == 'ACTIVE';

    try {
      final fechaVencimiento = DateTime.parse(expirationDate!);
      return fechaVencimiento.isAfter(DateTime.now()) &&
          (status?.toUpperCase() == 'ACTIVO' ||
              status?.toUpperCase() == 'ACTIVE');
    } catch (e) {
      return false;
    }
  }

  bool get isPending =>
      status?.toUpperCase() == 'PENDIENTE' ||
      status?.toUpperCase() == 'PENDING';
  bool get isExpired {
    if (expirationDate == null) return false;

    try {
      final fechaVencimiento = DateTime.parse(expirationDate!);
      return fechaVencimiento.isBefore(DateTime.now());
    } catch (e) {
      return false;
    }
  }
}

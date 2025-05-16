class Course {
  final String id;
  final String codigo;
  final String nombre;
  final String? profesor;
  final String? semestre;
  final List<String>? studentIds;

  Course({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.profesor,
    this.semestre,
    this.studentIds,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['_id'] ?? json['id'] ?? '',
      codigo: json['codigo'] ?? '',
      nombre: json['nombre'] ?? '',
      profesor: json['profesor'],
      semestre: json['semestre'],
      studentIds: json['studentIds'] != null
          ? List<String>.from(json['studentIds'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'id': id,
      'codigo': codigo,
      'nombre': nombre,
    };

    if (profesor != null) data['profesor'] = profesor;
    if (semestre != null) data['semestre'] = semestre;
    if (studentIds != null) data['studentIds'] = studentIds;

    return data;
  }
}

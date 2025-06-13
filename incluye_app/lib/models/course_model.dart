class Course {
  final String id;
  final String codigo;
  final String nombre;
  final String? profesor;
  final String? semestre;
  final List<String> studentIds;

  Course({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.profesor,
    this.semestre,
    required this.studentIds,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['_id'] ?? json['id'] ?? '',
      codigo: json['code'] ?? '',
      nombre: json['nombre'] ?? '',
      profesor: json['teacherName'],
      semestre: json['semestre'],
      studentIds:
          json['students'] != null
              ? List<String>.from(json['students'])
              : [],
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
    if (studentIds != []) data['estudiantes'] = studentIds;

    return data;
  }
}

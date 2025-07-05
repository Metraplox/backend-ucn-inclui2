class Course {
  final String id;
  final String codigo;
  final String nombre;
  final String nrc;
  final String? profesor;
  final String? semestre;
  final List<String> students;

  Course({
    required this.id,
    required this.codigo,
    required this.nombre,
    required this.nrc,
    this.profesor,
    this.semestre,
    required this.students,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['_id'] ?? json['id'] ?? '',
      codigo: json['code'] ?? '',
      nombre: json['nombre'] ?? '',
      nrc: json['nrc'] ?? '',
      profesor: json['teacherName'],
      semestre: json['semestre'],
      students:
          json['students'] != null ? List<String>.from(json['students']) : [],
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
    if (students != []) data['estudiantes'] = students;

    return data;
  }
}

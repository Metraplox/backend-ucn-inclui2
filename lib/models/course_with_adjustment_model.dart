class CourseAdjustment {
  final String id;
  final String codigo;
  final String nombre;
  final String nrc;
  final String? profesor;
  final String? semestre;
  final int studentsWithNeeCount;
  final List<Map<String, dynamic>> studentsWithNee;
  final List<String> students;

  CourseAdjustment({
    required this.id,
    required this.codigo,
    required this.nombre,
    required this.studentsWithNeeCount,
    required this.studentsWithNee,
    required this.nrc,
    this.profesor,
    this.semestre,
    required this.students,
  });

  factory CourseAdjustment.fromJson(Map<String, dynamic> json) {
    return CourseAdjustment(
      id: json['_id'] ?? json['id'] ?? '',
      codigo: json['code'] ?? '',
      nombre: json['nombre'] ?? '',
      nrc: json['nrc'] ?? '',
      profesor: json['teacherName'],
      studentsWithNeeCount: json['studentsWithNeeCount'] ?? 0,
      studentsWithNee:
          json['studentsWithNee'] != null
              ? List<Map<String, dynamic>>.from(json['studentsWithNee'])
              : [],
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

// models/career_model.dart
class Career {
  final String id; // Mapeado desde _id
  final String name;
  final String? code;
  final String? faculty;
  final String? currentSemester;
  // Puedes añadir más campos si los necesitas y vienen del endpoint /careers
  // final String? departmentId;
  // final int? duration;
  // final List<String>? studentIds; // Usualmente no se necesita en el modelo para listar carreras
  // final bool isActive;

  Career({
    required this.id,
    required this.name,
    this.code,
    this.faculty,
    this.currentSemester,
  });

  factory Career.fromJson(Map<String, dynamic> json) {
    return Career(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name'] ?? 'Nombre no disponible',
      code: json['code'] as String?,
      faculty: json['faculty'] as String?,
      currentSemester: json['currentSemester'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'code': code,
      'faculty': faculty,
      'currentSemester': currentSemester,
    };
  }
}
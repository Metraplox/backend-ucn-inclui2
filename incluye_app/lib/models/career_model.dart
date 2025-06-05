// models/career_model.dart

class Career {
  final String id;
  final String name;
  final String? code; // Puede ser opcional

  Career({
    required this.id,
    required this.name,
    this.code,
  });

  factory Career.fromJson(Map<String, dynamic> json) {
    return Career(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      code: json['code'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) '_id': id,
      'name': name,
      if (code != null) 'code': code,
    };
  }
}
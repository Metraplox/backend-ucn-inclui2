class Department {
  final String id;
  final String name;
  final String code;
  final String faculty;
  final String campus;

  Department({
    required this.id,
    required this.name,
    required this.code,
    required this.faculty,
    required this.campus,
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: json['_id'],
      name: json['name'],
      code: json['code'],
      faculty: json['faculty'],
      campus: json['campus'],
    );
  }
}

class TeacherStats {
  final String teacherId;
  final String teacherName;
  final String teacherEmail;
  final int courseCount;
  final int studentCount;
  final int alertCount;
  final String department;
  final double averageRating;
  final bool isActive;

  TeacherStats({
    required this.teacherId,
    required this.teacherName,
    required this.teacherEmail,
    required this.courseCount,
    required this.studentCount,
    required this.alertCount,
    required this.department,
    required this.averageRating,
    required this.isActive,
  });

  factory TeacherStats.fromJson(Map<String, dynamic> json) {
    return TeacherStats(
      teacherId: json['teacherId'] ?? '',
      teacherName: json['teacherName'] ?? '',
      teacherEmail: json['teacherEmail'] ?? '',
      courseCount: json['courseCount'] ?? 0,
      studentCount: json['studentCount'] ?? 0,
      alertCount: json['alertCount'] ?? 0,
      department: json['department'] ?? '',
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'teacherId': teacherId,
      'teacherName': teacherName,
      'teacherEmail': teacherEmail,
      'courseCount': courseCount,
      'studentCount': studentCount,
      'alertCount': alertCount,
      'department': department,
      'averageRating': averageRating,
      'isActive': isActive,
    };
  }
}

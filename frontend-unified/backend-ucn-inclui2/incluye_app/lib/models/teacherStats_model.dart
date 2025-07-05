class TeacherStats {
  final String teacherName;
  final String teacherEmail;
  final String department;
  final int coursesCount;
  final int studentsWithNEE;
  final int totalAdjustment;
  final int readAdjustment;
  final int readPercentage;
  
  TeacherStats({
    required this.teacherEmail,
    required this.teacherName,
    required this.department,
    required this.coursesCount,
    required this.studentsWithNEE,
    required this.totalAdjustment,
    required this.readAdjustment,
    required this.readPercentage,
  });
  
  factory TeacherStats.fromJson(Map<String, dynamic> json) {
    return TeacherStats(
      teacherEmail: json['teacherEmail'] ?? '',
      teacherName: json['teacherName'] ?? '',
      department: json['department'] ?? '',
      coursesCount: json['coursesCount'] ?? 0,
      studentsWithNEE: json['studentsWithNEE'] ?? 0,
      totalAdjustment: json['totalAdjustments'] ?? 0,
      readAdjustment: json['readAdjustments'] ?? 0,
      readPercentage: json['readPercentage'] ?? 0,
    );
  }
}

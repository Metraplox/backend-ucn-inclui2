import 'package:incluye_app/models/adjustment_model.dart';

class StudentAdjustment {
  final String id; // _id del ajuste
  final String studentRut;
  final String studentId;
  final List<Adjustment> currentAdjustments;

  StudentAdjustment({
    required this.id,
    required this.studentRut,
    required this.studentId,
    required this.currentAdjustments,
  });

  factory StudentAdjustment.fromJson(Map<String, dynamic> json) {
    return StudentAdjustment(
      id: json['_id'] ?? '',
      studentRut: json['studentRut'] ?? '',
      studentId: json['studentId'] ?? '',
      currentAdjustments:
          (json['currentAdjustments'] as List<dynamic>? ?? [])
              .map((adj) => Adjustment.fromJson(adj))
              .toList(),
    );
  }
}

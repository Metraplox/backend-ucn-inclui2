// ignore_for_file: constant_identifier_names
enum NotificationType {
  ADJUSTMENT_CREATED,
  ADJUSTMENT_UPDATED,
  ADJUSTMENT_APPROVAL_NEEDED,
  ADJUSTMENT_APPROVED,
  ADJUSTMENT_REJECTED,
  NEW_STUDENT,
  STUDENT_UPDATE,
  TEACHER_ASSIGNMENT,
  TEACHER_ACKNOWLEDGMENT_NEEDED,
  TEACHER_ACKNOWLEDGMENT_RECEIVED,
  NEW_RESOURCE_AVAILABLE,
  REMINDER,
  SYSTEM_ALERT,
  HELP_REQUEST,
  HELP_REQUEST_RESPONSE,
}

enum NotificationPriority { LOW, MEDIUM, HIGH, CRITICAL }

NotificationType? notificationTypeFromString(String? type) {
  return NotificationType.values.firstWhere(
    (e) => e.toString().split('.').last == type,
    orElse: () => NotificationType.SYSTEM_ALERT,
  );
}

NotificationPriority? notificationPriorityFromString(String? priority) {
  return NotificationPriority.values.firstWhere(
    (e) => e.toString().split('.').last == priority,
    orElse: () => NotificationPriority.MEDIUM,
  );
}

class Notifications {
  final String id;
  final String userId;
  final String title;
  final String message;
  final NotificationType type;
  final String semester;
  bool isRead;
  final NotificationPriority priority;
  final String? studentId;
  final String? adjustmentId;
  final String? courseId;
  final String? resourceId;
  final Map<String, dynamic>? metadata;
  final DateTime? expiresAt;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? student;
  final Map<String, dynamic>? adjustment;
  final Map<String, dynamic>? course;
  final Map<String, dynamic>? resource;
  final Map<String, dynamic>? relatedTo;
  final DateTime createdAt;
  final DateTime updatedAt;

  Notifications({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.semester,
    required this.isRead,
    required this.priority,
    this.studentId,
    this.adjustmentId,
    this.courseId,
    this.resourceId,
    this.metadata,
    this.expiresAt,
    this.user,
    this.student,
    this.adjustment,
    this.course,
    this.resource,
    this.relatedTo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notifications.fromJson(Map<String, dynamic> json) {
    return Notifications(
      id: json['_id'],
      userId: json['userId'],
      title: json['title'],
      message: json['message'],
      type: notificationTypeFromString(json['type'])!,
      semester: json['semester'],
      isRead: json['isRead'] ?? false,
      priority:
          notificationPriorityFromString(json['priority']) ??
          NotificationPriority.MEDIUM,
      studentId: json['studentId'],
      adjustmentId: json['adjustmentId'],
      courseId: json['courseId'],
      resourceId: json['resourceId'],
      metadata:
          json['metadata'] != null
              ? Map<String, dynamic>.from(json['metadata'])
              : null,
      expiresAt:
          json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      user: json['user'],
      student: json['student'],
      adjustment: json['adjustment'],
      course: json['course'],
      resource: json['resource'],
      relatedTo: json['relatedTo'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type.toString().split('.').last,
      'semester': semester,
      'isRead': isRead,
      'priority': priority.toString().split('.').last,
      'studentId': studentId,
      'adjustmentId': adjustmentId,
      'courseId': courseId,
      'resourceId': resourceId,
      'metadata': metadata,
      'expiresAt': expiresAt?.toIso8601String(),
      'user': user,
      'student': student,
      'adjustment': adjustment,
      'course': course,
      'resource': resource,
      'relatedTo': relatedTo,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Backward compatibility with NotificationModel
  String get actionType => metadata?['actionType'] ?? type.toString().split('.').last;
  Map<String, dynamic>? get actionData => metadata;
}

// Backward compatibility alias
typedef NotificationModel = Notifications;

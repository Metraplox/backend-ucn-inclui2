class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type;
  final String semester;
  bool isRead;
  final String priority;
  final DateTime createdAt;
  final String? actionType;
  final Map<String, dynamic>? actionData;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.semester,
    required this.isRead,
    required this.priority,
    required this.createdAt,
    this.actionType,
    this.actionData,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? '',
      semester: json['semester'] ?? '',
      isRead: json['isRead'] ?? false,
      priority: json['priority'] ?? 'LOW',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      actionType: json['metadata']?['actionType'] as String?,
      actionData:
          json['metadata'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(json['metadata'])
              : null,
    );
  }
}

import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/utils/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:incluye_app/models/notification_model.dart';

class NotificationService {
  // Singleton pattern
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() {
    return _instance;
  }
  NotificationService._internal();

  // Real-time WebSocket functionality
  io.Socket? _socket;
  final ValueNotifier<int> _unreadCount = ValueNotifier<int>(0);
  final ValueNotifier<bool> _isConnected = ValueNotifier<bool>(false);

  ValueNotifier<int> get unreadCount => _unreadCount;
  ValueNotifier<bool> get isConnected => _isConnected;

  // Notification tracking functionality
  static const String _lastNotificationKey = 'last_notification_check';
  static final GlobalKey<ScaffoldMessengerState> messengerKey =
      GlobalKey<ScaffoldMessengerState>();

  // Real-time WebSocket connection initialization
  Future<void> init() async {
    // Evitar multiples inicializaciones
    if (_socket != null && _socket!.connected) {
      return;
    }

    final token = await AuthService.getToken();
    if (token == null) {
      log.w('NotificationService: No token found, cannot connect.');
      return;
    }

    final uri = AppConfig.apiBaseUrl;
    _socket = io.io('$uri/notifications', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
      'forceNew': true,
      'auth': {'token': token},
    });

    _socket!.onConnect((_) {
      log.i('NotificationService: Connected to WebSocket');
      _isConnected.value = true;
    });

    _socket!.onDisconnect((_) {
      log.i('NotificationService: Disconnected from WebSocket');
      _isConnected.value = false;
    });

    _socket!.onConnectError((data) {
      log.e('NotificationService: Connection Error: $data');
      _isConnected.value = false;
    });

    // Listener para notificaciones genéricas
    _socket!.on('new_notification', (data) {
      if (data is Map<String, dynamic>) {
        final title = data['title'] ?? 'Nueva Notificación';
        final message =
            data['message'] ?? 'Has recibido una nueva notificación.';
        final type = notificationTypeFromString(data['type']) ?? NotificationType.SYSTEM_ALERT;
        showAdvancedNotification(title: title, message: message, type: type);
      }
    });

    // Listener para el contador de no leídas
    _socket!.on('unread_count', (data) {
      if (data is Map<String, dynamic> && data['count'] is int) {
        _unreadCount.value = data['count'];
      }
    });
  }

  // Advanced notification display with type-based styling
  void showAdvancedNotification({
    required String title,
    required String message,
    required NotificationType type,
  }) {
    Color backgroundColor;
    IconData icon;
    
    switch (type) {
      case NotificationType.ADJUSTMENT_APPROVAL_NEEDED:
        backgroundColor = Colors.orange;
        icon = Icons.assignment_late;
        break;
      case NotificationType.ADJUSTMENT_APPROVED:
        backgroundColor = Colors.green;
        icon = Icons.check_circle;
        break;
      case NotificationType.ADJUSTMENT_REJECTED:
        backgroundColor = Colors.red;
        icon = Icons.cancel;
        break;
      case NotificationType.NEW_STUDENT:
        backgroundColor = Colors.blue;
        icon = Icons.person_add;
        break;
      case NotificationType.TEACHER_ACKNOWLEDGMENT_NEEDED:
        backgroundColor = Colors.purple;
        icon = Icons.school;
        break;
      case NotificationType.SYSTEM_ALERT:
        backgroundColor = Colors.red[800]!;
        icon = Icons.warning;
        break;
      default:
        backgroundColor = Colors.blueGrey[800]!;
        icon = Icons.notifications;
    }

    final snackBar = SnackBar(
      content: Row(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(message),
              ],
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor,
      duration: const Duration(seconds: 8),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
    messengerKey.currentState?.showSnackBar(snackBar);
  }

  // Legacy notification methods for backward compatibility
  void showSimpleNotification({
    required String title,
    required String message,
  }) {
    showAdvancedNotification(
      title: title, 
      message: message, 
      type: NotificationType.SYSTEM_ALERT
    );
  }

  // Tracking functionality
  static Future<void> saveLastCheckTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _lastNotificationKey,
      DateTime.now().toIso8601String(),
    );
  }

  static Future<DateTime?> getLastCheckTime() async {
    final prefs = await SharedPreferences.getInstance();
    final lastCheckStr = prefs.getString(_lastNotificationKey);
    if (lastCheckStr != null) {
      return DateTime.parse(lastCheckStr);
    }
    return null;
  }

  static Future<bool> shouldCheckForNotifications() async {
    final lastCheck = await getLastCheckTime();
    if (lastCheck == null) {
      return true;
    }

    final now = DateTime.now();
    final difference = now.difference(lastCheck);
    return difference.inHours >= 24;
  }

  // Specialized notification methods
  void showAdjustmentNotification({
    required int pendingCount,
    required Function onTap,
  }) {
    if (pendingCount <= 0) return;

    final message =
        pendingCount == 1
            ? 'Tienes 1 ajuste pendiente de revisar'
            : 'Tienes $pendingCount ajustes pendientes de revisar';

    final snackBar = SnackBar(
      content: Row(
        children: [
          const Icon(Icons.assignment_late, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
      backgroundColor: Colors.blue,
      duration: const Duration(seconds: 10),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(8),
      action: SnackBarAction(
        label: 'Ver',
        textColor: Colors.white,
        onPressed: () {
          messengerKey.currentState?.hideCurrentSnackBar();
          onTap();
        },
      ),
    );

    messengerKey.currentState?.showSnackBar(snackBar);
  }

  void showDocumentNotification({
    required int pendingCount,
    required Function onTap,
  }) {
    if (pendingCount <= 0) return;

    final message =
        pendingCount == 1
            ? 'Tienes 1 documento pendiente de aprobación'
            : 'Tienes $pendingCount documentos pendientes de aprobación';

    final snackBar = SnackBar(
      content: Row(
        children: [
          const Icon(Icons.description, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
      backgroundColor: Colors.orange,
      duration: const Duration(seconds: 10),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(8),
      action: SnackBarAction(
        label: 'Ver',
        textColor: Colors.white,
        onPressed: () {
          messengerKey.currentState?.hideCurrentSnackBar();
          onTap();
        },
      ),
    );

    messengerKey.currentState?.showSnackBar(snackBar);
  }

  Future<void> checkForPendingAdjustments({
    required Function getPendingCount,
    required Function onAdjustmentsTap,
  }) async {
    if (await shouldCheckForNotifications()) {
      final pendingCount = await getPendingCount();
      if (pendingCount > 0) {
        showAdjustmentNotification(
          pendingCount: pendingCount,
          onTap: onAdjustmentsTap,
        );
      }
      await saveLastCheckTime();
    }
  }

  // API methods for notification management
  static Future<int> checkUnreadNotification() async {
    try {
      final token = ApiService.getToken();
      final response = await ApiService.dio.get(
        '/notifications/unread-count',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      final unreadNotif = response.data['data']['data']['count'];
      return unreadNotif;
    } catch (e) {
      log.e('Error checking unread notifications: $e');
      return 0;
    }
  }

  static Future<List<Notifications>> getAllNotifications() async {
    try {
      final token = ApiService.getToken();
      final response = await ApiService.dio.get(
        '/notifications',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      final List<dynamic> data =
          response.data['data']['data'] as List<dynamic>;
      return data.map((json) => Notifications.fromJson(json)).toList();
    } catch (e) {
      log.e('Error fetching notifications: $e');
      return [];
    }
  }

  static Future<void> setNotificationRead(
    String notificationId,
    BuildContext context,
  ) async {
    try {
      final token = ApiService.getToken();
      final response = await ApiService.dio.patch(
        '/notifications/$notificationId/read',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        // ignore: use_build_context_synchronously
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Marcado como leído exitoso.'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      log.e('Error marking notification as read: $e');
      throw Exception('Error: $e');
    }
  }

  static Future<int> getNotificationByType() async {
    try {
      final token = ApiService.getToken();
      final response = await ApiService.dio.get(
        '/notifications',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      final List<dynamic> data =
          response.data['data']['data'] as List<dynamic>;
      final allNotif =
          data.map((json) => Notifications.fromJson(json)).toList();
      
      List<Notifications> notifData =
          allNotif.where((n) => n.type == NotificationType.ADJUSTMENT_APPROVAL_NEEDED).toList();
      return notifData.length;
    } catch (e) {
      log.e('Error getting notifications by type: $e');
      return 0;
    }
  }

  // Advanced notification creation methods
  static Future<void> studentUpdateNotification(
    String idAdjustment,
    String semester,
    String message,
    String studentId,
    String userId,
    String studentName,
  ) async {
    final body = jsonEncode({
      'userId': '684a18607351fc59d85c09c9',
      'adjustmentId': idAdjustment,
      'notificationType': 'adjustment_help_requested',
      'reason':
          '$studentName solicita modificación de ajuste debido a : $message',
      'semester': semester,
      'status': 'pending',
    });
    final token = await ApiService.getToken();
    log.d('Body enviado al backend: $body');

    final response = await ApiService.dio.post(
      '/notifications/adjustment',
      options: Options(
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        validateStatus: (status) => status! < 500,
      ),
      data: body,
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return;
    } else if (response.statusCode == 409) {
      throw Exception('Notificación duplicada');
    } else {
      throw Exception(
        "Error al solicitar ajuste: ${response.statusCode} - ${response.statusMessage}",
      );
    }
  }

  static Future<void> teacherAdjustmentReadNotification(
    String courseName,
    String studentName,
  ) async {
    final token = ApiService.getToken();
    try {
      final body = jsonEncode({
        "userId": "684a18607351fc59d85c09c9", //ID COORDINADOR ADMIN
        "title": "Ajuste razonable leído",
        "message":
            "Ajuste del alumno: $studentName en curso: $courseName leído.",
        "type": "TEACHER_ACKNOWLEDGMENT_RECEIVED",
        "semester": "2025-1",
        "priority": "MEDIUM",
        "studentId": "68631c4b6b6a1fcb94c337cf",
        "adjustmentId": "6864c4b015905714bc177ef5",
        "courseId": "684bc8341d1770fb2d6f6837",
        "expiresAt": "2025-12-31T23:59:59.999Z",
        "isRead": false,
      });
      final response = await ApiService.dio.post(
        '/notifications',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          validateStatus: (status) => status! < 500,
        ),
        data: body,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return;
      } else if (response.statusCode == 409) {
        throw Exception('Notificación duplicada');
      } else {
        throw Exception(
          "Error al solicitar ajuste: ${response.statusCode} - ${response.statusMessage}",
        );
      }
    } catch (e) {
      log.e('Error sending teacher acknowledgment notification: $e');
      throw Exception("Error al envíar notificacion de lectura ajuste: $e");
    }
  }

  // Cleanup methods
  void dispose() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected.value = false;
  }

  void reconnect() async {
    dispose();
    await init();
  }
}

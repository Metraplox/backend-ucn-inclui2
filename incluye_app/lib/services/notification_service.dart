import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:incluye_app/models/notification_model.dart';

class NotificationService {
  static const String _lastNotificationKey = 'last_notification_check';
  static final GlobalKey<ScaffoldMessengerState> messengerKey =
      GlobalKey<ScaffoldMessengerState>();

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

  static void showAdjustmentNotification({
    required int pendingCount,
    required Function onTap,
  }) {
    if (pendingCount <= 0) return;

    final message =
        pendingCount == 1
            ? 'Tienes 1 ajuste pendiente de revisar'
            : 'Tienes $pendingCount ajustes pendientes de revisar';

    final snackBar = SnackBar(
      content: Text(message),
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

  static void showDocumentNotification({
    required int pendingCount,
    required Function onTap,
  }) {
    if (pendingCount <= 0) return;

    final message =
        pendingCount == 1
            ? 'Tienes 1 documento pendiente de aprobación'
            : 'Tienes $pendingCount documentos pendientes de aprobación';

    final snackBar = SnackBar(
      content: Text(message),
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

  static Future<void> checkForPendingAdjustments({
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

  static Future<int> checkUnreadNotification() async {
    try {
      final token = ApiService.getToken();
      if (token != null) {
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
      }
      return 0;
    } catch (e) {
      throw Exception("NO RECORDAD");
    }
  }

  static Future<List<Notifications>> getAllNotifications() async {
    try {
      final token = ApiService.getToken();
      if (token != null) {
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
      }
      return [];
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  static Future<void> setNotificationRead(
    String notificationId,
    BuildContext context,
  ) async {
    try {
      final token = ApiService.getToken();
      if (token != null) {
        final response = await ApiService.dio.patch(
          '/notifications/${notificationId}/read',
          options: Options(
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
          ),
        );
        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Marcado como leído exitoso.'),
              duration: Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  static Future<int> getNotificationByType() async {
    try {
      final token = ApiService.getToken();
      if (token != null) {
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
        String adjustmentType = "NotificationType.ADJUSTMENT_APPROVAL_NEEDED";
        List<Notifications> notifData =
            allNotif.where((n) => n.type.toString() == adjustmentType).toList();
        final totalAdjustmentsData = notifData.length;
        return totalAdjustmentsData;
      }
      return 0;
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

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
    print('Body enviado al backend: $body');

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
      throw Exception("Error al envíar notificacion de lectura ajuste: $e");
    }
  }

  static Future<void> sendCreateStudentNotification()async{

  }
}

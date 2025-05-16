import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationService {
  static const String _lastNotificationKey = 'last_notification_check';
  static final GlobalKey<ScaffoldMessengerState> messengerKey = GlobalKey<ScaffoldMessengerState>();

  static Future<void> saveLastCheckTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastNotificationKey, DateTime.now().toIso8601String());
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
    
    final message = pendingCount == 1 
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
    
    final message = pendingCount == 1 
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
}

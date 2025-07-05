import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/utils/logger.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:incluye_app/models/notification_model.dart';

class NotificationService {
  // Singleton pattern
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() {
    return _instance;
  }
  NotificationService._internal();

  io.Socket? _socket;
  final ValueNotifier<int> _unreadCount = ValueNotifier<int>(0);
  final ValueNotifier<bool> _isConnected = ValueNotifier<bool>(false);

  ValueNotifier<int> get unreadCount => _unreadCount;
  ValueNotifier<bool> get isConnected => _isConnected;

  static final GlobalKey<ScaffoldMessengerState> messengerKey =
      GlobalKey<ScaffoldMessengerState>();

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
        showSimpleNotification(title: title, message: message);
      }
    });

    // Listener para el contador de no leídas
    _socket!.on('unread_count', (data) {
      if (data is Map<String, dynamic> && data['count'] is int) {
        _unreadCount.value = data['count'];
      }
    });
  }

  void showSimpleNotification({
    required String title,
    required String message,
  }) {
    final snackBar = SnackBar(
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(message),
        ],
      ),
      backgroundColor: Colors.blueGrey[800],
      duration: const Duration(seconds: 8),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
    messengerKey.currentState?.showSnackBar(snackBar);
  }

  void dispose() {
    _socket?.dispose();
    _socket = null;
    _isConnected.value = false;
  }

  // --- Métodos requeridos por UI (stubs temporales) ---
  Future<List<NotificationModel>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await ApiService.dio.get(
        '/notifications',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200 && response.data is List) {
        return (response.data as List)
            .map((json) => NotificationModel.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      log.e('NotificationService.getNotifications error: $e');
      return [];
    }
  }

  Future<void> saveLastCheckTime(DateTime dateTime) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      'notifications_last_check',
      dateTime.toIso8601String(),
    );
  }

  // --- Metodos antiguos (mantener por compatibilidad por ahora) ---

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
    // Este método se deja vacío intencionadamente para evitar errores de compilación
    // en home_screen.dart. La lógica de notificaciones ahora se maneja por WebSockets.
    // TODO: Eliminar la llamada a este método en home_screen.dart y luego eliminar este método.
    return;
  }

  // --- Nuevos métodos REST ---
  Future<bool> markAsRead(String id) async {
    try {
      final response = await ApiService.dio.patch('/notifications/$id/read');
      return response.statusCode == 200;
    } catch (e) {
      log.e('NotificationService.markAsRead error: $e');
      return false;
    }
  }

  Future<bool> markAllRead() async {
    try {
      final response = await ApiService.dio.patch(
        '/notifications/mark-all-read',
      );
      if (response.statusCode == 200) {
        _unreadCount.value = 0;
        return true;
      }
      return false;
    } catch (e) {
      log.e('NotificationService.markAllRead error: $e');
      return false;
    }
  }
}

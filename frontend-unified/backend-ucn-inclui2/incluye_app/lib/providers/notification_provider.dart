import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:incluye_app/core/constants/api_constants.dart';
import 'package:incluye_app/services/auth_service.dart';

class NotificationProvider with ChangeNotifier {
  int _unreadCount = 0;
  StreamSubscription? _subscription;

  int get unreadCount => _unreadCount;

  Future<void> connect() async {
    // Desconectar si ya existe una conexión
    await disconnect();

    final token = await AuthService.getToken();
    if (token == null) {
      debugPrint(
        'NotificationProvider: No hay token, no se puede conectar al stream SSE.',
      );
      return;
    }

    final url = Uri.parse('${ApiConstants.baseUrl}/notifications/stream');
    final request = http.Request("GET", url);
    request.headers["Authorization"] = "Bearer $token";
    request.headers["Accept"] = "text/event-stream";
    request.headers["Cache-Control"] = "no-cache";

    try {
      final response = await http.Client().send(request);

      if (response.statusCode == 200) {
        _subscription = response.stream.listen(
          (data) {
            final message = utf8.decode(data);

            // SSE puede enviar comentarios (líneas que empiezan con ':')
            if (message.startsWith(':')) return;

            // Extraer el JSON de la línea "data:"
            final jsonString = message.replaceFirst('data: ', '');
            if (jsonString.isNotEmpty) {
              try {
                final decodedData = json.decode(jsonString);
                if (decodedData['count'] != null) {
                  _unreadCount = decodedData['count'];
                  notifyListeners();
                }
              } catch (e) {
                debugPrint('Error decodificando JSON de SSE: $e');
              }
            }
          },
          onError: (error) {
            debugPrint('Error en el stream SSE: $error');
            _subscription?.cancel();
            // Opcional: intentar reconectar con backoff
          },
          onDone: () {
            debugPrint('Stream SSE cerrado por el servidor.');
            // Opcional: intentar reconectar
          },
        );
      } else {
        debugPrint(
          'Error al conectar al stream SSE. Status: ${response.statusCode}',
        );
      }
    } catch (e) {
      debugPrint('Excepción al conectar al stream SSE: $e');
    }
  }

  Future<void> disconnect() async {
    if (_subscription != null) {
      await _subscription!.cancel();
      _subscription = null;
      _unreadCount = 0;
      // No notificar listeners aquí para evitar reconstrucciones innecesarias al hacer logout
      debugPrint('Stream SSE desconectado.');
    }
  }

  void clearCount() {
    _unreadCount = 0;
    notifyListeners();
  }
}

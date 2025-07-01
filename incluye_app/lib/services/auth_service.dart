// services/auth_service.dart
// import 'dart:developer'; // Ya no es necesario para print
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import 'package:incluye_app/models/user_model.dart';
import 'dart:math' as math;
import 'dart:js_interop';
import 'dart:async';
import 'package:web/web.dart' as web;
import 'package:js/js.dart';

@JS('startGoogleLogin')
external void startGoogleLogin();

extension CustomEventExtension on web.CustomEvent {
  external JSAny? get detail;
}

class AuthService {
  static const String _googleWebClientId =
      '553729434325-17le89rd3a5aa56r53mpkhmet41n3srr.apps.googleusercontent.com';

  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId: kIsWeb ? _googleWebClientId : null,
  );

  static Future<User?> login(String email, String password) async {
    //print("FRONTEND (AuthService): Intentando login normal con email: $email");
    try {
      final response = await ApiService.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
        options: Options(validateStatus: (status) => true),
      );

      print(
        "FRONTEND (AuthService): Respuesta login normal - StatusCode: ${response.statusCode}, Data: ${response.data}",
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // AJUSTE POR SI LA RESPUESTA DE LOGIN NORMAL VIENE ANIDADA BAJO 'data'
        //final responseBody = response.data;
        //final actualData =
        //  responseBody is Map &&
        //        responseBody.containsKey('data') &&
        //      responseBody['data'] is Map
        // ? responseBody['data'] as Map<String, dynamic>
        //: responseBody as Map<String, dynamic>;
        final level1 = response.data as Map<String, dynamic>;
        final level2 = level1['data'] as Map<String, dynamic>;
        final actualData = level2['data'] as Map<String, dynamic>;

        String? token = actualData['access_token'];
        Map<String, dynamic>? userData =
            actualData['user'] is Map
                ? actualData['user'] as Map<String, dynamic>
                : null;

        if (token == null || userData == null) {
          print(
            'FRONTEND (AuthService): Error login normal - Token o userData nulos desde el backend (después de posible desanidamiento).',
          );
          return null;
        }
        print(email);
        print(password);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString(
          'nombreCompleto',
          userData['nombreCompleto'] ?? '',
        );
        await prefs.setString('userEmail', userData['email'] ?? '');
        await prefs.setString('userId', userData['_id'] ?? '');

        userData['token'] = token;
        //print("FRONTEND (AuthService): Login normal exitoso. Usuario: ${userData['email']}");
        return User.fromJson(userData);
      } else {
        //print('FRONTEND (AuthService): Error login normal - Código: ${response.statusCode}, Respuesta: ${response.data}');
        return null;
      }
    } catch (e, s) {
      //print('FRONTEND (AuthService): Excepción durante login normal: $e');
      //print('FRONTEND (AuthService): Stacktrace login normal: $s');
      if (e is DioException) {
        // print('FRONTEND (AuthService): DioException login normal - details: ${e.response?.data}');
      }
      return null;
    }
  }

  static Future<User?> loginWithGoogle() async {
    final completer = Completer<String?>();
    bool eventHandled = false; // <-- Variable para controlar si ya se completó

    // Listener para evento del JS con el idToken
    void handleEvent(web.Event event) {
      if (eventHandled) return; // Ignorar si ya se completó antes

      final customEvent = event as web.CustomEvent;
      final detail = customEvent.detail;

      if (detail != null && detail is JSString) {
        final token = (detail as JSString).toDart;
        completer.complete(token);
      } else {
        completer.complete(null);
      }

      eventHandled = true; // Marcar como completado
      web.window.removeEventListener('google-login-success', handleEvent.toJS);
    }

    web.window.addEventListener('google-login-success', handleEvent.toJS);

    // Llamada moderna usando JS interop
    startGoogleLogin();

    final idToken = await completer.future;

    if (idToken == null) {}

    try {
      final response = await ApiService.dio.post(
        '/auth/google',
        data: {'idToken': idToken},
        options: Options(validateStatus: (_) => true),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = response.data as Map<String, dynamic>?;

        if (body == null || body['data'] == null) {
          return null;
        }

        final innerData =
            (body['data'] as Map<String, dynamic>)['data']
                as Map<String, dynamic>?;

        if (innerData == null) {
          return null;
        }

        final token = innerData['access_token'] as String?;
        final userData = innerData['user'] as Map<String, dynamic>?;

        if (token == null || userData == null) {
          return null;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString(
          'nombreCompleto',
          userData['nombreCompleto'] ?? '',
        );
        await prefs.setString('userEmail', userData['email'] ?? '');
        await prefs.setString('userId', userData['_id'] ?? '');
        userData['token'] = token;

        return User.fromJson(userData);
      } else {
        return null;
      }
    } catch (e, s) {
      return null;
    }
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  static Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('nombreCompleto');
  }

  static Future<void> logout() async {
    //print("FRONTEND (AuthService): Iniciando logout...");
    try {
      await _googleSignIn.signOut();
      //print("FRONTEND (AuthService): Google Sign Out exitoso.");
    } catch (e) {
      //print("FRONTEND (AuthService): Error durante Google Sign Out: $e");
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('nombreCompleto');
    await prefs.remove('userEmail');
    await prefs.remove('userId');
    //print("FRONTEND (AuthService): SharedPreferences limpiadas. Usuario deslogueado.");
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return token != null && token.isNotEmpty;
  }
}

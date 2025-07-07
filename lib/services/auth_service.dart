// services/auth_service.dart
// import 'dart:developer'; // Ya no es necesario para print
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:incluye_app/models/user_model.dart';
import 'dart:js_interop';
import 'dart:async';
import 'package:web/web.dart' as web;
import 'package:js/js.dart';
import 'package:incluye_app/features/authentication/repositories/auth_repository.dart';
import 'package:incluye_app/services/storage_service.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:incluye_app/utils/logger.dart';

@JS('startGoogleLogin')
external void startGoogleLogin();

extension CustomEventExtension on web.CustomEvent {
  external JSAny? get detail;
}

// Patrón Singleton: Una única instancia del servicio para toda la app.
class AuthService {
  // 1. Instancia privada y estática
  static final AuthService _instance = AuthService._internal();

  // 2. Constructor privado
  AuthService._internal();

  // 3. Getter estático para acceder a la instancia
  static AuthService get instance => _instance;

  // Dependencias
  final AuthRepository _repository = AuthRepository();
  // ignore: unused_field
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId:
        kIsWeb
            ? '553729434325-17le89rd3a5aa56r53mpkhmet41n3srr.apps.googleusercontent.com'
            : null,
  );
  final StorageService _storageService = const StorageService();
  String? _accessToken;

  String? get currentToken => _accessToken;

  // --- Métodos de instancia (lógica de negocio) ---

  Future<User?> login(String email, String password, bool rememberMe) async {
    try {
      final responseData = await _repository.login(email, password);
      
      // Navegar por la estructura anidada del backend
      var actualData = responseData;
      while (actualData is Map<String, dynamic> && actualData.containsKey('data')) {
        actualData = actualData['data'];
      }

      _accessToken = actualData['access_token']; // Nota: backend usa 'access_token', no 'accessToken'
      final refreshToken = actualData['refresh_token']; // Si existe

      if (rememberMe) {
        await _storageService.saveTokens(
          accessToken: _accessToken!,
          refreshToken: refreshToken ?? '',
        );
      }

      final user = User.fromJson(actualData['user']);
      await _saveUserData(user); // Guardar datos del usuario por separado

      return user;
    } catch (e) {
      log.e('AuthService.login error: $e');
      _accessToken = null;
      await _storageService.clearTokens();
      return null;
    }
  }

  Future<User?> loginWithGoogle() async {
    final completer = Completer<String?>();
    bool eventHandled = false;

    void handleEvent(web.Event event) {
      if (eventHandled) return;
      final customEvent = event as web.CustomEvent;
      final detail = customEvent.detail;
      if (detail != null && detail is JSString) {
        completer.complete((detail).toDart);
      } else {
        completer.complete(null);
      }
      eventHandled = true;
      web.window.removeEventListener('google-login-success', handleEvent.toJS);
    }

    web.window.addEventListener('google-login-success', handleEvent.toJS);
    startGoogleLogin();
    final idToken = await completer.future;

    if (idToken == null) return null;

    try {
      // Esta lógica de API también debería estar en el repositorio.
      final response = await Dio().post(
        // Usando una instancia temporal.
        'http://localhost:3000/auth/google',
        data: {'idToken': idToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        var data = response.data;
        while (data is Map<String, dynamic> && data.containsKey('data')) {
          data = data['data'];
        }
        await _saveUserData(User.fromJson(data));
        return User.fromJson(data);
      } else {
        return null;
      }
    } catch (e) {
      log.e('loginWithGoogle error: $e');
      return null;
    }
  }

  Future<void> logout() async {
    _accessToken = null;
    await _storageService.clearTokens();
  }

  Future<bool> tryAutoLogin() async {
    final refreshToken = await _storageService.getRefreshToken();
    if (refreshToken == null) {
      return false;
    }

    try {
      final responseData = await _repository.refreshToken(refreshToken);
      _accessToken = responseData['accessToken'];
      final newRefreshToken = responseData['refreshToken'];

      await _storageService.saveTokens(
        accessToken: _accessToken!,
        refreshToken: newRefreshToken,
      );

      // Decodificar el token para obtener datos del usuario
      final userData = JwtDecoder.decode(_accessToken!);
      final user = User.fromJson(userData);
      await _saveUserData(user); // Guardar datos del usuario

      return true;
    } catch (e) {
      log.e('tryAutoLogin error: $e');
      await logout(); // Si el refresh falla, limpiar todo
      return false;
    }
  }

  Future<User?> registerTeacher(
    String nombre,
    String apellido,
    String email,
    String password,
  ) async {
    try {
      final responseData = await _repository.registerTeacher(
        nombre,
        apellido,
        email,
        password,
      );
      // Suponiendo que el backend devuelve el usuario creado pero no tokens
      final user = User.fromJson(responseData['user']);
      return user;
    } catch (e) {
      log.e('registerTeacher error: $e');
      return null;
    }
  }

  Future<void> _saveUserData(User user) async {
    // Aquí podrías guardar datos del usuario si es necesario,
    // por ejemplo en SharedPreferences si no son sensibles.
    // Por ahora, el AuthProvider manejará el estado del usuario en memoria.
  }

  Future<User?> getLoggedInUser() async {
    final token = _accessToken ?? await _storageService.getAccessToken();
    if (token == null) return null;

    if (JwtDecoder.isExpired(token)) {
      return null; // O intentar refrescar el token aquí si es aplicable
    }

    final userData = JwtDecoder.decode(token);
    return User.fromJson(userData);
  }

  Future<bool> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    // Esta lógica debería estar en el repositorio, pero se mantiene aquí por simplicidad del refactor.
    try {
      // Necesita el token, así que usamos el método estático
      final token = await getToken();
      if (token == null) throw Exception('Usuario no autenticado');

      final dio =
          Dio(); // Se crea una instancia temporal de Dio. Idealmente, ApiService manejaría esto.
      dio.options.headers['Authorization'] = 'Bearer $token';

      final response = await dio.post(
        'http://localhost:3000/auth/change-password', // URL hardcodeada temporalmente
        data: {'oldPassword': oldPassword, 'newPassword': newPassword},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // --- Métodos de ayuda privados ---

  // ignore: unused_element
  Future<void> _saveUserSession(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', userData['token'] ?? '');
    await prefs.setString('nombreCompleto', userData['nombreCompleto'] ?? '');
    await prefs.setString('userEmail', userData['email'] ?? '');
    await prefs.setString('userId', userData['_id'] ?? '');
    final roles =
        (userData['roles'] as List<dynamic>?)
            ?.map((role) => role.toString())
            .toList() ??
        [];
    await prefs.setStringList('roles', roles);
  }

  // --- Métodos estáticos (helpers de acceso a SharedPreferences) ---

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('nombreCompleto');
  }

  static Future<String?> getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userEmail');
  }

  static Future<List<String>> getUserRoles() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList('roles') ?? [];
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}

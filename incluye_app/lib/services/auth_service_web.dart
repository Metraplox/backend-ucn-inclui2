// lib/services/auth_service_web.dart

// Imports específicos para la web
import 'dart:async';
import 'package:js/js.dart';
import 'package:incluye_app/screens/auth/google_signin_inerop.dart' as gsi; // <-- NUESTRO ARCHIVO DE INTEROP

// Imports comunes
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'api_service.dart';
import 'package:incluye_app/models/user_model.dart';

// Ya no necesitamos @JS('startGoogleLogin') ni la extensión de CustomEvent,
// porque ahora llamaremos a la librería de Google directamente desde Dart.

class AuthService {
  static const String _googleWebClientId =
      '553729434325-17le89rd3a5aa56r53mpkhmet41n3srr.apps.googleusercontent.com';

  // Esta instancia es para el método nativo de Google (que en web no usamos para el popup)
  // pero es bueno mantenerla por si se usa en `logout`.
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId: _googleWebClientId,
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


  // --- MÉTODO DE LOGIN CON GOOGLE (VERSIÓN WEB) ---
  static Future<User?> loginWithGoogle() async {
    final completer = Completer<String?>();

    // Definimos la función de callback que se pasará a Google.
    // Usamos allowInterop para que Dart pueda pasar esta función a JavaScript.
    final callback = allowInterop((response) {
      // El 'response' de Google es un objeto JS que contiene el JWT en el campo 'credential'.
      // Como 'response' es un objeto JS, no podemos acceder a él como un mapa.
      // La forma más segura (aunque un poco fea) es convertirlo a String y buscar el campo.
      // O, si confiamos en la estructura, usar helpers de js_interop.
      // Por ahora, asumimos que 'response' tiene un campo 'credential'.
      // La forma correcta con js_interop sería definir una clase para el response.
      // Pero para ser prácticos:
      final String idToken = (response as dynamic).credential;
      completer.complete(idToken);
    });

    // 1. Inicializamos la librería de Google
    gsi.initialize(gsi.GsiConfig(
      client_id: _googleWebClientId,
      callback: callback, // Pasamos nuestra función de Dart
    ));

    // 2. Mostramos el diálogo de inicio de sesión de Google
    gsi.prompt();

    final idToken = await completer.future;

    if (idToken == null) {
      return null;
    }

    // El resto del código es igual, envía el token al backend
    return _sendIdTokenToBackend(idToken);
  }


  // --- El resto de tus métodos (login, logout, etc.) ---
  // Puedes copiar y pegar el resto de los métodos de tu AuthService original aquí.
  // He creado un método privado para no repetir el código del backend.
  static Future<User?> _sendIdTokenToBackend(String idToken) async {
    try {
      final response = await ApiService.dio.post(
        '/auth/google',
        data: {'idToken': idToken},
        options: Options(validateStatus: (_) => true),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = response.data as Map<String, dynamic>?;
        if (body == null || body['data'] == null) return null;
        final innerData = (body['data'] as Map<String, dynamic>)['data'] as Map<String, dynamic>?;
        if (innerData == null) return null;
        final token = innerData['access_token'] as String?;
        final userData = innerData['user'] as Map<String, dynamic>?;

        if (token == null || userData == null) return null;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('nombreCompleto', userData['nombreCompleto'] ?? '');
        await prefs.setString('userEmail', userData['email'] ?? '');
        await prefs.setString('userId', userData['_id'] ?? '');
        userData['token'] = token;

        return User.fromJson(userData);
      } else {
        return null;
      }
    } catch (e) {
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

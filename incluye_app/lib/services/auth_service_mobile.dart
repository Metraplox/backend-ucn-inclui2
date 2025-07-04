import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'api_service.dart';
import 'package:incluye_app/models/user_model.dart';

// No hay imports de 'js', 'web', ni 'dart:html' aquí.

class AuthService {
  // El webClientId no es necesario aquí, pero lo dejamos por consistencia
  // en la definición del _googleSignIn.
  static const String _googleWebClientId =
      '553729434325-17le89rd3a5aa56r53mpkhmet41n3srr.apps.googleusercontent.com';

  // En móvil, clientId es null.
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId: null, 
  );
  
  // --- MÉTODO DE LOGIN CON GOOGLE (VERSIÓN MÓVIL) ---
  static Future<User?> loginWithGoogle() async {
    String? idToken;
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // El usuario canceló
        return null;
      }
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      idToken = googleAuth.idToken; // Obtenemos el token en móvil
    } catch (error) {
      print("FRONTEND (AuthService Mobile): Error en signIn nativo: $error");
      return null;
    }

    if (idToken == null) {
      return null;
    }
    
    // El resto del código que envía el token al backend es idéntico.
    return _sendIdTokenToBackend(idToken);
  }

  // --- El resto de tus métodos (login, logout, etc.) ---
  // Puedes copiar y pegar el resto de los métodos de tu AuthService original aquí.
  // Por ejemplo: login, getUserId, getUserName, logout, isLoggedIn.
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

      if (body == null || body['data'] == null) {
        // Asegurarse de que el primer nivel de 'data' existe
        print("ERROR: El cuerpo o el primer nivel de 'data' es nulo.");
        return null;
      }

      // ▼▼▼ LA CORRECCIÓN ESTÁ AQUÍ ▼▼▼
      // Ya no buscamos un segundo 'data'. El objeto que necesitamos está en el primer nivel.
      final actualData = body['data'] as Map<String, dynamic>?;

      if (actualData == null) {
        print("ERROR: El objeto 'data' de nivel 1 es nulo o no es un mapa.");
        return null;
      }
      
      final token = actualData['access_token'] as String?;
      final userData = actualData['user'] as Map<String, dynamic>?;

      if (token == null || userData == null) {
        print("ERROR: 'access_token' o 'user' son nulos.");
        return null;
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('nombreCompleto', userData['nombreCompleto'] ?? '');
      await prefs.setString('userEmail', userData['email'] ?? '');
      await prefs.setString('userId', userData['_id'] ?? '');
      userData['token'] = token;

      return User.fromJson(userData);
      
    } else {
      print("ERROR: StatusCode no es 200/201, es ${response.statusCode}");
      return null;
    }
  } catch (e, s) {
    print("EXCEPCIÓN: $e");
    print("STACKTRACE: $s");
    return null;
  }
}
  
  // AÑADE AQUÍ TUS OTROS MÉTODOS (login, logout, getUserId, etc.)
  // Por ejemplo:
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
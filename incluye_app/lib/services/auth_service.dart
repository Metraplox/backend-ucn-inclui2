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

class AuthService {
  static const String _googleWebClientId = '90627838122-cv4i0d2124tgm1cbh06cbpotuu128b8v.apps.googleusercontent.com';

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
        options: Options(
          validateStatus: (status) => true,
        ),
      );

      //print("FRONTEND (AuthService): Respuesta login normal - StatusCode: ${response.statusCode}, Data: ${response.data}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        // AJUSTE POR SI LA RESPUESTA DE LOGIN NORMAL VIENE ANIDADA BAJO 'data'
        final responseBody = response.data;
        final actualData = responseBody is Map && responseBody.containsKey('data') && responseBody['data'] is Map 
                           ? responseBody['data'] as Map<String, dynamic>
                           : responseBody as Map<String, dynamic>;


        String? token = actualData['access_token'];
        Map<String, dynamic>? userData = actualData['user'] is Map ? actualData['user'] as Map<String, dynamic> : null;


        if (token == null || userData == null) {
          //print('FRONTEND (AuthService): Error login normal - Token o userData nulos desde el backend (después de posible desanidamiento).');
          return null;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('nombreCompleto', userData['nombreCompleto'] ?? '');
        await prefs.setString('userEmail', userData['email'] ?? '');
        await prefs.setString('userId', userData['_id'] ?? '');

        userData['token'] = token;
        //print("FRONTEND (AuthService): Login normal exitoso. Usuario: ${userData['email']}");
        return User.fromJson(userData);
      } else {
        //print('FRONTEND (AuthService): Error login normal - Código: ${response.statusCode}, Respuesta: ${response.data}');
        return null;
      }
    } catch (e,s) {
      //print('FRONTEND (AuthService): Excepción durante login normal: $e');
      //print('FRONTEND (AuthService): Stacktrace login normal: $s');
      if (e is DioException) {
       // print('FRONTEND (AuthService): DioException login normal - details: ${e.response?.data}');
      }
      return null;
    }
  }

  static Future<User?> loginWithGoogle() async {
    //print("FRONTEND (AuthService): [PRINT 1] Iniciando login con Google...");

    if (!kIsWeb) {
      //print("FRONTEND (AuthService): [PRINT WARN] loginWithGoogle llamado en plataforma no web. Esta implementación está optimizada para web.");
    }

    try {
      //print("FRONTEND (AuthService): [PRINT 1.1] Intentando _googleSignIn.signInSilently() primero...");
      GoogleSignInAccount? googleUser = await _googleSignIn.signInSilently();

      if (googleUser == null) {
        //print("FRONTEND (AuthService): [PRINT 1.1.1] signInSilently() devolvió null o falló. Intentando _googleSignIn.signIn() (interactivo)...");
        try {
            googleUser = await _googleSignIn.signIn();
        } on PlatformException catch (e, s) {
            //print("FRONTEND (AuthService): [PRINT ERROR PLATFORM] PlatformException en _googleSignIn.signIn(): ${e.code} - ${e.message}");
            //print("FRONTEND (AuthService): [PRINT ERROR PLATFORM] Detalle: ${e.details}");
            //print("FRONTEND (AuthService): [PRINT ERROR PLATFORM] Stacktrace: $s");
            return null;
        } catch (e,s) {
            //print("FRONTEND (AuthService): [PRINT ERROR SIGNIN] ERROR en _googleSignIn.signIn(): $e");
            if (e.toString().contains('popup_closed_by_user')) {
              //print("FRONTEND (AuthService): [PRINT ERROR SIGNIN] Popup cerrado por el usuario.");
            } else if (e.toString().contains('idpiframe_initialization_failed')) {
              //print("FRONTEND (AuthService): [PRINT ERROR SIGNIN] Fallo en la inicialización del iframe de Google. Verifica Client ID en index.html y Orígenes de JS en Google Cloud Console.");
            }
            //print("FRONTEND (AuthService): [PRINT ERROR SIGNIN] Stacktrace: $s");
            return null;
        }
      } else {
        //print("FRONTEND (AuthService): [PRINT 1.1.2] signInSilently() exitoso.");
      }
      
      //print("FRONTEND (AuthService): [PRINT 1.2] Después de intentos de signIn. googleUser es ${googleUser == null ? 'null' : 'obtenido'}");

      if (googleUser == null) {
        //print("FRONTEND (AuthService): [PRINT 2] Login con Google cancelado o falló después de todos los intentos.");
        return null;
      }
      //print("FRONTEND (AuthService): [PRINT 3] GoogleSignInAccount obtenido: ${googleUser.email}, displayName: ${googleUser.displayName}");

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      //print("FRONTEND (AuthService): [PRINT AUTH_DETAILS] Inspeccionando GoogleSignInAuthentication...");
      
      String? accessTokenPrint = googleAuth.accessToken;
      if (accessTokenPrint != null) {
        accessTokenPrint = accessTokenPrint.substring(0, math.min(30, accessTokenPrint.length));
      }
      //print("FRONTEND (AuthService): [PRINT AUTH_DETAILS] googleAuth.accessToken (primeros 30 chars): $accessTokenPrint");

      String? idTokenPrint = googleAuth.idToken;
      if (idTokenPrint != null) {
        idTokenPrint = idTokenPrint.substring(0, math.min(30, idTokenPrint.length));
      }
      //print("FRONTEND (AuthService): [PRINT AUTH_DETAILS] googleAuth.idToken (primeros 30 chars): $idTokenPrint");
      
      //print("FRONTEND (AuthService): [PRINT AUTH_DETAILS] googleAuth.serverAuthCode: ${googleAuth.serverAuthCode}");

      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        //print("FRONTEND (AuthService): [PRINT 4] Error Crítico - idToken de Google es NULL en GoogleSignInAuthentication.");
        if (googleAuth.accessToken != null) {
          //print("FRONTEND (AuthService): [PRINT 4.1] Sin embargo, accessToken SÍ está presente en GoogleSignInAuthentication.");
        }
        //print("FRONTEND (AuthService): [PRINT 4.2] Esto podría indicar un problema con la configuración del plugin google_sign_in_web o que el método signIn() ya no provee idToken confiablemente como advierte el plugin.");
        return null;
      }

      //print("FRONTEND (AuthService): [PRINT 5] idToken de Google obtenido y NO es null (primeros 30 chars): ${idToken.substring(0, math.min(30, idToken.length))}...");

      //print("FRONTEND (AuthService): [PRINT 6] Enviando idToken al backend: /auth/google. URL Base API: ${ApiService.dio.options.baseUrl}");
      final response = await ApiService.dio.post(
        '/auth/google',
        data: {'idToken': idToken},
        options: Options(
          validateStatus: (status) => true,
        ),
      );
      
      //print('FRONTEND (AuthService): [PRINT 7] Respuesta del backend /auth/google: StatusCode: ${response.statusCode}, Data: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        // AJUSTE POR SI LA RESPUESTA DE LOGIN CON GOOGLE VIENE ANIDADA BAJO 'data' (aunque tu backend no lo hace así)
        // Por consistencia con el ajuste en login normal, lo pongo, pero tu backend devuelve directamente access_token y user.
        final responseBody = response.data;
        final actualData = responseBody is Map && responseBody.containsKey('data') && responseBody['data'] is Map 
                           ? responseBody['data'] as Map<String, dynamic>
                           : responseBody as Map<String, dynamic>;

        String? token = actualData['access_token'];
        Map<String, dynamic>? userData = actualData['user'] is Map ? actualData['user'] as Map<String, dynamic> : null;

        if (token == null || userData == null) {
          //print('FRONTEND (AuthService): [PRINT ERROR BACKEND] Token o userData nulos desde el backend tras login con Google (después de posible desanidamiento).');
          return null;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('nombreCompleto', userData['nombreCompleto'] ?? '');
        await prefs.setString('userEmail', userData['email'] ?? '');
        await prefs.setString('userId', userData['_id'] ?? '');

        userData['token'] = token;
        //print("FRONTEND (AuthService): [PRINT SUCCESS] Login con Google exitoso. Usuario: ${userData['email']}");
        return User.fromJson(userData);
      } else {
        //print('FRONTEND (AuthService): [PRINT FAIL BACKEND] Error en login con Google desde el backend. Código: ${response.statusCode}, respuesta: ${response.data}');
        return null;
      }
    } catch (e, s) {
      //print('FRONTEND (AuthService): [PRINT EXCEPTION GENERAL] Excepción general durante login con Google: $e');
      //print('FRONTEND (AuthService): [PRINT EXCEPTION GENERAL] Stacktrace: $s');
      if (e is DioException) {
        //print('FRONTEND (AuthService): [PRINT DIO EXCEPTION] DioException details (Google Sign-In): ${e.response?.data}, Error: ${e.error}, Message: ${e.message}');
      }
      return null;
    }
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
    
  }
  static Future <String?> getUserName()async{
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
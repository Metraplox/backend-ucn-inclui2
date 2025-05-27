// services/api_service.dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:developer';
import 'package:jwt_decoder/jwt_decoder.dart';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));

  static Dio get dio => _dio;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
  

  static Options authHeaders(String token, {Map<String, String>? extra}) {
    return Options(
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      },
    );
  }

  static void handleApiError(String context, dynamic error) {
    log('[$context] Error: $error');
  }

   static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }
}



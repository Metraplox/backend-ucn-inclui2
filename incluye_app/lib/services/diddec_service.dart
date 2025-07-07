import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';

class DiddecService {
  static Future<Map<String, dynamic>> getGeneralStatistics(
    String semester,
  ) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(
          '${AppConfig.apiBaseUrl}/diddec/statistics?semester=$semester',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al obtener estadísticas: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Error al obtener estadísticas: $e');
    }
  }

  static Future<Map<String, dynamic>> getSemesterReport(String semester) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/reports/semester/$semester'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al obtener reporte del semestre: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Error al obtener reporte del semestre: $e');
    }
  }

  static Future<List<dynamic>> getAllStudentsWithNEE(String semester) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(
          '${AppConfig.apiBaseUrl}/diddec/students/all?semester=$semester',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        print(response.body);
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al obtener estudiantes con NEE: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Error al obtener estudiantes con NEE: $e');
    }
  }

  static Future<Map<String, dynamic>> getAdjustmentTrends({
    int years = 3,
  }) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(
          '${AppConfig.apiBaseUrl}/diddec/adjustments/trends?years=$years',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener tendencias: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener tendencias: $e');
    }
  }

  static Future<List<dynamic>> getAdjustmentComplianceByDepartment(
    String semester,
  ) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(
          '${AppConfig.apiBaseUrl}/diddec/adjustments/compliance?semester=$semester',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al obtener cumplimiento por departamento: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Error al obtener cumplimiento por departamento: $e');
    }
  }

  static Future<Map<String, dynamic>> exportReport({
    required String semester,
    required String reportType,
    String format = 'excel',
    bool includeSensitiveData = false,
    Map<String, dynamic>? filters,
  }) async {
    try {
      final token = await AuthService.getToken();
      final body = {
        'semester': semester,
        'reportType': reportType,
        'format': format,
        'includeSensitiveData': includeSensitiveData,
        if (filters != null) 'filters': filters,
      };

      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/reports/export'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al generar reporte: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al generar reporte: $e');
    }
  }

  static Future<Uint8List> downloadReport(String filename) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/reports/download/$filename'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        throw Exception('Error al descargar reporte: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al descargar reporte: $e');
    }
  }

  static Future<List<dynamic>> getAvailableResources() async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener recursos: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener recursos: $e');
    }
  }

  static Future<Map<String, dynamic>> uploadResource({
    required String title,
    required String description,
    required String category,
    required Uint8List fileBytes,
    required String fileName,
    List<String>? tags,
  }) async {
    try {
      final token = await AuthService.getToken();

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources/upload'),
      );

      request.headers['Authorization'] = 'Bearer $token';

      request.fields['title'] = title;
      request.fields['description'] = description;
      request.fields['category'] = category;
      if (tags != null) {
        request.fields['tags'] = jsonEncode(tags);
      }

      request.files.add(
        http.MultipartFile.fromBytes('file', fileBytes, filename: fileName),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al subir recurso: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al subir recurso: $e');
    }
  }

  static Future<Uint8List> downloadResource(String resourceId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(
          '${AppConfig.apiBaseUrl}/diddec/resources/$resourceId/download',
        ),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        throw Exception('Error al descargar recurso: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al descargar recurso: $e');
    }
  }
}

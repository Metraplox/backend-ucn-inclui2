import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/services/auth_service.dart';

class DiddecService {
  static Future<Map<String, dynamic>> getGeneralStatistics(String semester) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        throw Exception('Token no disponible');
      }
      
      print('Haciendo petición a: ${AppConfig.apiBaseUrl}/diddec/statistics?semester=$semester');
      print('Con token: ${token.substring(0, 20)}...');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/statistics?semester=$semester'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Respuesta del servidor: ${response.statusCode}');
      print('Cuerpo de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener estadísticas: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error en getGeneralStatistics: $e');
      throw Exception('Error al obtener estadísticas: $e');
    }
  }

  static Future<Map<String, dynamic>> getSemesterReport(String semester) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        throw Exception('Token no disponible');
      }
      
      print('Haciendo petición a: ${AppConfig.apiBaseUrl}/diddec/reports/semester/$semester');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/reports/semester/$semester'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Respuesta reporte semestre: ${response.statusCode}');
      print('Cuerpo reporte semestre: ${response.body.substring(0, response.body.length > 200 ? 200 : response.body.length)}...');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener reporte del semestre: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error en getSemesterReport: $e');
      throw Exception('Error al obtener reporte del semestre: $e');
    }
  }

  static Future<List<dynamic>> getAllStudentsWithNEE(String semester) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/students/all?semester=$semester'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener estudiantes con NEE: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener estudiantes con NEE: $e');
    }
  }

  static Future<Map<String, dynamic>> getAdjustmentTrends({int years = 3}) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/adjustments/trends?years=$years'),
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

  static Future<List<dynamic>> getAdjustmentComplianceByDepartment(String semester) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        throw Exception('Token no disponible');
      }
      
      print('Haciendo petición a: ${AppConfig.apiBaseUrl}/diddec/adjustments/compliance?semester=$semester');
      
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/adjustments/compliance?semester=$semester'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Respuesta cumplimiento: ${response.statusCode}');
      print('Cuerpo cumplimiento: ${response.body}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener cumplimiento por departamento: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error en getAdjustmentComplianceByDepartment: $e');
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
        'reportType': reportType,
        'format': format,
        'semester': semester,
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

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al generar reporte: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al generar reporte: $e');
    }
  }

  static Future<Uint8List> downloadReport(String reportId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/reports/download/$reportId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
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
    required String resourceType,
    required String semester,
    required Uint8List fileBytes,
    required String fileName,
    List<String>? tags,
    List<String>? adjustmentTypeIds,
  }) async {
    try {
      final token = await AuthService.getToken();
      
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources'),
      );
      
      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['title'] = title;
      request.fields['description'] = description;
      request.fields['resourceType'] = resourceType;
      request.fields['semester'] = semester;
      if (tags != null) {
        request.fields['tags'] = jsonEncode(tags);
      }
      if (adjustmentTypeIds != null) {
        request.fields['adjustmentTypeIds'] = jsonEncode(adjustmentTypeIds);
      }
      
      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          fileBytes,
          filename: fileName,
        ),
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
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources/$resourceId/download'),
        headers: {
          'Authorization': 'Bearer $token',
        },
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

  static Future<Map<String, dynamic>> searchResources(String term) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources/search?term=${Uri.encodeComponent(term)}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al buscar recursos: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al buscar recursos: $e');
    }
  }

  static Future<Map<String, dynamic>> deleteResource(String resourceId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.delete(
        Uri.parse('${AppConfig.apiBaseUrl}/diddec/resources/$resourceId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al eliminar recurso: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al eliminar recurso: $e');
    }
  }
}

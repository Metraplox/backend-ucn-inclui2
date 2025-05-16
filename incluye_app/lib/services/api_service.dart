import 'dart:io';
import 'dart:developer' as dev;
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:flutter/foundation.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/document_model.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/config/app_config.dart';

class ApiService {
  static void log(String message) {
    if (AppConfig.enableLogging) {
      debugPrint('[API] $message');
    }
  }

  // Configuración de interceptores para logging y depuración
  static void _setupInterceptors() {
    if (AppConfig.enableLogging) {
      _dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          dev.log('REQUEST[${options.method}] => PATH: ${options.path}', name: 'API');
          if (options.data != null) {
            try {
              dev.log('REQUEST DATA: ${options.data}', name: 'API');
            } catch (e) {
              // Ignorar errores al imprimir datos
            }
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          dev.log('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}', name: 'API');
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          dev.log('ERROR[${e.response?.statusCode}] => PATH: ${e.requestOptions.path}', name: 'API');
          return handler.next(e);
        },
      ));
    }
  }
  
  // Inicializar los interceptores al cargar la clase
  static bool _initialized = false;
  
  static void _ensureInitialized() {
    if (!_initialized) {
      _setupInterceptors();
      _initialized = true;
    }
  }

  static final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: Duration(milliseconds: AppConfig.connectionTimeout),
    receiveTimeout: Duration(milliseconds: AppConfig.receiveTimeout),
    validateStatus: (status) {
      return status! < 500;
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  ));



  // ---------------------- AUTENTICACIÓN ----------------------

  static Future<User?> login(String email, String password) async {
    try {
      // Asegurar que los interceptores estén configurados
      _ensureInitialized();
      
      dev.log('Intentando login con email: $email', name: 'API');
      dev.log('URL de API: ${AppConfig.apiBaseUrl}', name: 'API');
      
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
        options: Options(
          validateStatus: (status) => true, // Aceptar cualquier código de estado para manejar errores manualmente
        ),
      );

      log('Respuesta del servidor: ${response.statusCode}');
      log('Datos de respuesta: ${response.data}');

      if (response.statusCode == 200) {
        if (response.data == null) {
          log('Error: La respuesta del servidor es nula');
          return null;
        }
        
        // Comprobar si la respuesta tiene el formato esperado
        String? token;
        Map<String, dynamic>? userData;
        
        // Formato 1: {token: "...", user: {...}}
        if (response.data['token'] != null && response.data['user'] != null) {
          token = response.data['token'];
          userData = response.data['user'];
        } 
        // Formato 2: {access_token: "...", user: {...}}
        else if (response.data['access_token'] != null && response.data['user'] != null) {
          token = response.data['access_token'];
          userData = response.data['user'];
        }
        // Formato 3: Solo token sin datos de usuario
        else if (response.data['token'] != null) {
          token = response.data['token'];
          userData = {'email': email}; // Datos mínimos
        }
        // Formato 4: Solo access_token sin datos de usuario
        else if (response.data['access_token'] != null) {
          token = response.data['access_token'];
          userData = {'email': email}; // Datos mínimos
        }
        
        if (token == null) {
          log('Error: Token no encontrado en la respuesta');
          return null;
        }
        
        // Almacenar token para futuras solicitudes
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        
        // Crear objeto de usuario con el token
        userData!['token'] = token;
        final user = User.fromJson(userData);
        
        log('Login exitoso para: ${user.email}');
        return user;
      } else if (response.statusCode == 401) {
        log('Error de autenticación: Credenciales inválidas');
        return null;
      } else {
        log('Error de servidor: Código ${response.statusCode}');
        return null;
      }
    } catch (e) {
      log('Error en login: $e');
      return null;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ---------------------- ROLES ----------------------

  static Future<List<String>> getUserRoles() async {
    final token = await getToken();
    if (token != null) {
      final decodedToken = JwtDecoder.decode(token);
      final roles = decodedToken['roles'];
      if (roles is List) {
        return roles.map((e) => e.toString()).toList();
      }
    }
    return [];
  }

  static Future<bool> isStudent() async {
    final roles = await getUserRoles();
    return roles.contains('estudiante');
  }

  static Future<bool> isAdmin() async {
    final roles = await getUserRoles();
    return roles.contains('administrador');
  }
  
  // Obtener información del usuario actual basado en el token JWT
  static Future<User?> getCurrentUserInfo() async {
    try {
      // Usar el nuevo endpoint de perfil para obtener la información del usuario
      final userProfile = await getUserProfile();
      
      if (userProfile != null) {
        // Si el usuario tiene rol de estudiante, obtener sus datos académicos
        if (userProfile.roles.contains('estudiante')) {
          final studentProfile = await getStudentProfile();
          
          if (studentProfile != null) {
            // Combinar la información del perfil de usuario con el perfil académico
            return User(
              id: userProfile.id,
              email: userProfile.email,
              nombre: '${studentProfile.nombres} ${studentProfile.apellidos}',
              rol: 'estudiante',
              token: userProfile.token,
              departamento: studentProfile.carrera,
            );
          }
        }
        
        // Para otros roles, devolver la información del perfil básico
        return userProfile;
      }
    } catch (e) {
      log('Error al obtener información del usuario: $e');
    }
    
    // Si falla el nuevo método, intentar con el método anterior basado en JWT
    final token = await getToken();
    if (token != null) {
      try {
        // Decodificar el token JWT para obtener la información básica del usuario
        final decodedToken = JwtDecoder.decode(token);
        
        // Obtenemos el ID del usuario desde el token
        final userId = decodedToken['sub'];
        
        // Si el usuario tiene rol de estudiante, obtener sus datos completos
        if (decodedToken['roles'].contains('estudiante')) {
          final studentData = await getStudentById(userId);
          if (studentData != null) {
            return User(
              id: userId,
              email: decodedToken['email'] ?? '',
              nombre: '${studentData.nombres} ${studentData.apellidos}',
              rol: 'estudiante',
              token: token,
            );
          }
        }
        
        // Para otros roles, devolver la información básica del token
        String rol = 'usuario';
        if (decodedToken['roles'] is List && decodedToken['roles'].isNotEmpty) {
          rol = decodedToken['roles'][0].toString();
        }
        
        return User(
          id: userId,
          email: decodedToken['email'] ?? '',
          nombre: decodedToken['nombre'] ?? decodedToken['name'] ?? '',
          rol: rol,
          token: token,
        );
      } catch (e) {
        log('Error al obtener información del usuario desde JWT: $e');
      }
    }
    return null;
  }
  
  // Obtener el perfil básico del usuario actual usando el nuevo endpoint
  static Future<User?> getUserProfile() async {
    try {
      _ensureInitialized();
      final token = await getToken();
      if (token == null) return null;
      
      final response = await _dio.get(
        '/users/profile',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      
      if (response.statusCode == 200) {
        final userData = response.data;
        // Añadir el token a los datos del usuario
        userData['token'] = token;
        return User.fromJson(userData);
      } else {
        log('Error al obtener perfil de usuario: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      log('Error al obtener perfil de usuario: $e');
      return null;
    }
  }
  
  // Obtener el perfil académico del estudiante actual usando el nuevo endpoint
  static Future<Student?> getStudentProfile() async {
    try {
      _ensureInitialized();
      final token = await getToken();
      if (token == null) return null;
      
      final response = await _dio.get(
        '/students/profile',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      
      if (response.statusCode == 200) {
        return Student.fromJson(response.data);
      } else if (response.statusCode == 404) {
        // No existe un perfil de estudiante para este usuario
        log('No existe un perfil de estudiante para este usuario');
        return null;
      } else {
        log('Error al obtener perfil académico: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      log('Error al obtener perfil académico: $e');
      return null;
    }
  }

  // ---------------------- ESTUDIANTES ----------------------

  static Future<List<Student>> getAllStudents() async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/students',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final List<dynamic> data = response.data;
      return data.map((item) => Student.fromJson(item)).toList();
    } catch (e) {
      log('Error al obtener estudiantes: $e');
      return [];
    }
  }

  static Future<bool> deleteStudent(String id) async {
    try {
      final token = await getToken();
      await _dio.delete(
        '/students/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return true;
    } catch (e) {
      log('Error al eliminar estudiante: $e');
      return false;
    }
  }

  static Future<Student?> getStudentById(String id) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/students/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return Student.fromJson(response.data);
    } catch (e) {
      log('Error al obtener estudiante: $e');
      return null;
    }
  }

  static Future<bool> updateStudent(
    String? id,
    Student student,
  ) async {
    if (id == null) {
      log('Error: ID de estudiante es nulo');
      return false;
    }
    
    final token = await getToken();
    try {
      final response = await _dio.patch(
        '/students/$id',
        data: student.toJson(),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200;
    } catch (e) {
      log('Error al actualizar estudiante: $e');
      return false;
    }
  }

  static Future<bool> createStudent(Map<String, dynamic> data) async {
    try {
      final token = await getToken();
      final response = await _dio.post(
        '/students',
        data: data,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error al crear estudiante: $e');
      return false;
    }
  }

  // ---------------------- CONSENTIMIENTO ----------------------

  static Future<bool> giveConsent(String studentId) async {
    try {
      final token = await getToken();
      final response = await _dio.post(
        '/consents',
        data: {'studentId': studentId},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      log('Error al dar consentimiento: $e');
      return false;
    }
  }

  // ---------------------- SUBIR DOCUMENTO ----------------------

  static Future<Document?> uploadDocument(File file, String studentId, {String documentType = 'general', String description = '', String category = 'GENERAL'}) async {
    try {
      final token = await getToken();
      final isStudent = await ApiService.isStudent();
      
      // Crear FormData para envío de archivo
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path),
        'studentId': studentId,
        'documentType': documentType,
        'description': description,
        'category': category
      });
      
      // Usar el endpoint correcto según el rol del usuario
      final endpoint = isStudent ? '/documents/student/upload' : '/documents/upload';
      
      final response = await _dio.post(
        endpoint,
        data: formData,
        options: Options(headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        }),
      );
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      log('Error al subir documento: $e');
      return null;
    }
  }

  // Obtener historial de ajustes para un estudiante
  static Future<List<Adjustment>> getAdjustmentHistory(
    String studentId, {
    bool? active,
    String? courseNrc,
    String? semester,
  }) async {
    try {
      final token = await getToken();
      
      // Construir parámetros de consulta opcionales
      final Map<String, dynamic> queryParams = {};
      if (active != null) queryParams['active'] = active.toString();
      if (courseNrc != null) queryParams['courseNrc'] = courseNrc;
      if (semester != null) queryParams['semester'] = semester;
      
      final response = await _dio.get(
        '/adjustments/student/$studentId',
        queryParameters: queryParams,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Adjustment.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener historial de ajustes: $e');
      return [];
    }
  }

  // Guardar un nuevo ajuste o actualizar uno existente
  static Future<bool> saveAdjustment(Adjustment adjustment) async {
    try {
      final token = await getToken();
      
      final bool isUpdate = adjustment.id != null;
      final String endpoint = isUpdate 
          ? '/adjustments/${adjustment.id}'
          : '/adjustments';
      
      final Response response = isUpdate
          ? await _dio.put(
              endpoint,
              data: adjustment.toJson(),
              options: Options(headers: {'Authorization': 'Bearer $token'}),
            )
          : await _dio.post(
              endpoint,
              data: adjustment.toJson(),
              options: Options(headers: {'Authorization': 'Bearer $token'}),
            );
      
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      log('Error al guardar ajuste: $e');
      return false;
    }
  }
  
  // Asociar un documento a un ajuste
  static Future<bool> associateDocumentToAdjustment(String adjustmentId, String documentId) async {
    try {
      final token = await getToken();
      final response = await _dio.post(
        '/adjustments/$adjustmentId/documents',
        data: {'documentId': documentId},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      log('Error al asociar documento con ajuste: $e');
      return false;
    }
  }
  
  // Obtener documentos asociados a un ajuste
  static Future<List<Document>> getAdjustmentDocuments(String adjustmentId) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/adjustments/$adjustmentId/documents',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Document.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener documentos del ajuste: $e');
      return [];
    }
  }
  
  // Actualizar el estado de un ajuste
  static Future<bool> updateAdjustmentStatus(String adjustmentId, String status) async {
    try {
      final token = await getToken();
      final response = await _dio.patch(
        '/adjustments/$adjustmentId/status',
        data: {'status': status.toUpperCase()},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200;
    } catch (e) {
      log('Error al actualizar estado del ajuste: $e');
      return false;
    }
  }
  
  // Eliminar un ajuste
  static Future<bool> deleteAdjustment(String id) async {
    try {
      final token = await getToken();
      final response = await _dio.delete(
        '/adjustments/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      log('Error al eliminar ajuste: $e');
      return false;
    }
  }
  
  // Obtener categorías de ajustes disponibles
  static Future<List<Map<String, dynamic>>> getAdjustmentCategories() async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/adjustments/categories',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      log('Error al obtener categorías de ajustes: $e');
      return [];
    }
  }
  
  // ---------------------- DOCUMENTOS ----------------------

  // Obtener documentos de un estudiante
  static Future<List<Document>> getStudentDocuments(String studentId, {String? category, String? status}) async {
    try {
      final token = await getToken();
      
      // Construir parámetros de consulta opcionales
      final Map<String, dynamic> queryParams = {};
      if (category != null) queryParams['category'] = category;
      if (status != null) queryParams['status'] = status;
      
      final response = await _dio.get(
        '/documents/student/$studentId',
        queryParameters: queryParams,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Document.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener documentos del estudiante: $e');
      return [];
    }
  }
  
  // Descargar un documento específico
  static Future<String?> getDocumentDownloadUrl(String documentId) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/documents/$documentId/download',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          // Configurar para recibir URL en lugar de archivo directamente
          responseType: ResponseType.json,
        ),
      );
      if (response.statusCode == 200 && response.data['fileUrl'] != null) {
        return response.data['fileUrl'];
      }
      return null;
    } catch (e) {
      log('Error al obtener URL de descarga: $e');
      return null;
    }
  }

  // Verificar un documento
  static Future<Document?> verifyDocument(String documentId, {String comments = ''}) async {
    try {
      final token = await getToken();
      final response = await _dio.patch(
        '/documents/verify/$documentId',
        data: {'comments': comments},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      log('Error al verificar documento: $e');
      return null;
    }
  }
  
  // Rechazar un documento
  static Future<Document?> rejectDocument(String documentId, {String comments = ''}) async {
    try {
      final token = await getToken();
      final response = await _dio.patch(
        '/documents/reject/$documentId',
        data: {'comments': comments},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        return Document.fromJson(response.data);
      }
      return null;
    } catch (e) {
      log('Error al rechazar documento: $e');
      return null;
    }
  }

  // Eliminar un documento
  static Future<bool> deleteDocument(String documentId) async {
    try {
      final token = await getToken();
      final response = await _dio.delete(
        '/documents/$documentId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      log('Error al eliminar documento: $e');
      return false;
    }
  }

  // Descargar plantilla de documento
  static Future<String?> getDocumentTemplateUrl(String templateType) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/documents/templates/$templateType',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        return response.data['url'];
      }
      return null;
    } catch (e) {
      log('Error al obtener URL de plantilla: $e');
      return null;
    }
  }

  // ---------------------- CURSOS ----------------------

  // Obtener cursos de un estudiante
  static Future<List<Course>> getStudentCourses(String studentId) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/courses/student/$studentId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Course.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener cursos del estudiante: $e');
      return [];
    }
  }

  // Obtener cursos de un profesor
  static Future<List<Course>> getTeacherCourses(String teacherId) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/courses/teacher/$teacherId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Course.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener cursos del profesor: $e');
      return [];
    }
  }

  // Obtener estudiantes con ajustes en un curso
  static Future<List<Student>> getStudentsWithAdjustmentsInCourse(String courseId) async {
    try {
      final token = await getToken();
      final response = await _dio.get(
        '/courses/$courseId/students-with-adjustments',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((item) => Student.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      log('Error al obtener estudiantes con ajustes: $e');
      return [];
    }
  }
}

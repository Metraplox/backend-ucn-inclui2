// services/student_service.dart
import 'package:dio/dio.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'api_service.dart';

class StudentService {
  // ---------------------- PERFIL DE ESTUDIANTE (ACTUAL) ----------------------
  static Future<Student?> getStudentProfile() async {
    //print("StudentService: Solicitando perfil de estudiante actual (/students/profile)");
    try {
      final response = await ApiService.dio.get('/students/profile');
      //print("StudentService: Respuesta de /students/profile - StatusCode: ${response.statusCode}");

      if (response.statusCode == 200) {
        final responseBody = response.data;
        if (responseBody is Map &&
            responseBody.containsKey('data') &&
            responseBody['data'] is Map) {
          final studentData =
              responseBody['data']['data'] as Map<String, dynamic>;
          //print("StudentService: Perfil de estudiante obtenido y desanidado exitosamente.");
          return Student.fromJson(studentData);
        } else {
          //print("StudentService: Error - La respuesta de /students/profile no tiene la estructura esperada (falta 'data' anidado). Data: $responseBody");
          return null;
        }
      } else if (response.statusCode == 404) {
        //print('StudentService: No existe un perfil de estudiante para este usuario (404).');
        return null;
      } else {
        //print('StudentService: Error al obtener perfil de estudiante: ${response.statusCode}, Data: ${response.data}');
        return null;
      }
    } on DioException catch (e) {
      //print('StudentService: DioException al obtener perfil de estudiante: ${e.message}');
      ApiService.handleApiError('getStudentProfile DioException', e);
      return null;
    } catch (e, s) {
      //print('StudentService: Excepción general al obtener perfil de estudiante: $e');
      //print('StudentService: Stacktrace: $s');
      return null;
    }
  }

  // ---------------------- ROLES Y OTROS MÉTODOS DE USUARIO ----------------------
  static Future<List<String>> getUserRoles() async {
    final token = await ApiService.getToken();
    if (token != null) {
      try {
        final decodedToken = JwtDecoder.decode(token);
        final rolesData = decodedToken['roles'];
        if (rolesData is List) {
          return rolesData.map((e) => e.toString()).toList();
        }
      } catch (e) {
        //print("StudentService: Error decodificando token para roles: $e");
      }
    }
    return [];
  }

  ///GET CAREERID DEL JEFE DE CARRERA////////////
  static Future<String> getHeadCareerId() async {
    final token = await ApiService.getToken();
    if (token != null) {
      try {
        final response = await ApiService.dio.get(
          '/career-heads/my-career',
          options: Options(
            headers: {'Authorization': 'Bearer $token'},
            validateStatus: (status) => true,
          ),
        );
        final data = response.data;
        final careerId = data?['data']?['data']?['careers']?[0]?['_id'];
        if (careerId != null) {
          return careerId;
        } else {
          return '';
        }
      } catch (e) {
        return '';
      }
    } else {
      return '';
    }
  }

  static Future<bool> isStudent() async {
    final roles = await getUserRoles();
    // Usar el método hasRole del UserModel si estuviera disponible globalmente
    // o comparar con las variantes de nombre de rol.
    return roles.any(
      (r) => r.toLowerCase() == 'estudiante' || r.toLowerCase() == 'student',
    );
  }

  static Future<bool> isDiddec() async {
    final roles = await getUserRoles();
    // Usar el método hasRole del UserModel si estuviera disponible globalmente
    // o comparar con las variantes de nombre de rol.
    return roles.any(
      (r) =>
          r.toLowerCase() == 'DIDDEC_STAFF' ||
          r.toLowerCase() == 'diddec_staff',
    );
  }

  static Future<bool> isAdmin() async {
    final roles = await getUserRoles();
    return roles.any(
      (r) =>
          r.toLowerCase() == 'COORDINADOR' || r.toLowerCase() == 'coordinador',
    );
  }

  static Future<bool> isTeacher() async {
    final roles = await getUserRoles();
    return roles.any(
      (r) => r.toLowerCase() == 'docente' || r.toLowerCase() == 'DOCENTE',
    );
  }

  static Future<bool> isHead() async {
    final roles = await getUserRoles();
    return roles.any(
      (r) =>
          r.toLowerCase() == 'JEFE_CARRERA' ||
          r.toLowerCase() == 'jefe_carrera',
    );
  }

  // getCurrentUserInfo:
  // Este método intenta construir un objeto User. Con el UserModel actualizado,
  // necesitamos asegurarnos de pasar los parámetros correctos.
  // La idea principal es que si el usuario es un estudiante, queremos la información
  // más detallada del perfil del estudiante.
  static Future<User?> getCurrentUserInfo() async {
    //print("StudentService: Obteniendo información de usuario actual (getCurrentUserInfo)");

    // Primero, intentamos obtener el perfil completo del estudiante
    final studentProfileData = await getStudentProfile();
    final currentToken =
        await ApiService.getToken(); // Obtenemos el token actual para pasarlo al User

    if (studentProfileData != null && studentProfileData.userId != null) {
      // Si tenemos un perfil de estudiante y su User anidado, usamos eso.
      // studentProfileData.userId ES un objeto User gracias a Student.fromJson.
      final User nestedUser = studentProfileData.userId!;

      // Creamos un nuevo objeto User con la información combinada y el token actual
      return User(
        id: nestedUser.id,
        email: nestedUser.email,
        // Usamos nombreCompleto del User anidado, ya que es la fuente autoritativa.
        nombreCompleto: nestedUser.nombreCompleto,
        // Usamos los roles del User anidado. Si está vacío, intentamos desde el token.
        roles:
            nestedUser.roles.isNotEmpty
                ? nestedUser.roles
                : (await getUserRoles()),
        isActive: nestedUser.isActive, // Tomamos isActive del User anidado
        token: currentToken, // Adjuntamos el token de sesión actual
        createdAt: nestedUser.createdAt, // Tomamos las fechas del User anidado
        updatedAt: nestedUser.updatedAt,
      );
    }

    // Fallback: Si no es un estudiante o no se pudo obtener el perfil de estudiante,
    // intentamos construir un User básico a partir del token JWT.
    //print("StudentService: No se pudo obtener perfil de estudiante completo o no es estudiante, intentando desde JWT.");
    if (currentToken != null) {
      try {
        final decodedToken = JwtDecoder.decode(currentToken);
        final userId = decodedToken['sub']?.toString() ?? '';
        final email = decodedToken['email']?.toString() ?? '';
        // El token JWT podría no tener 'nombreCompleto', pero sí 'name' o un campo similar.
        // UserModel.fromJson maneja esto, pero aquí lo construimos directamente.
        final nombreCompleto =
            decodedToken['nombreCompleto']?.toString() ??
            decodedToken['name']?.toString() ??
            email.split('@').first; // Fallback a parte del email

        List<String> rolesFromToken = [];
        final rolesData = decodedToken['roles'];
        if (rolesData is List) {
          rolesFromToken = rolesData.map((e) => e.toString()).toList();
        } else if (rolesData is String) {
          rolesFromToken = [rolesData];
        }

        if (userId.isNotEmpty && email.isNotEmpty) {
          return User(
            id: userId,
            email: email,
            nombreCompleto: nombreCompleto,
            roles: rolesFromToken,
            token: currentToken,
            // isActive, createdAt, updatedAt no suelen estar en el payload del JWT,
            // por lo que serían null aquí, lo cual es manejado por UserModel.
          );
        }
      } catch (e) {
        //print("StudentService: Error al obtener información del usuario desde JWT: $e");
      }
    }

    //print("StudentService: No se pudo obtener información del usuario ni por perfil ni por JWT.");
    return null;
  }

  // ---------------------- OTROS MÉTODOS DE ESTUDIANTE (CRUD) ----------------------
  // (Estos métodos parecen estar bien y no dependen directamente de la estructura interna de User,
  //  ya que operan con Student o IDs. Los mantengo como estaban en tu código anterior).

  static Future<List<Student>> getAllStudents() async {
    //print("StudentService: Solicitando todos los estudiantes (/students)");
    try {
      final response = await ApiService.dio.get('/students');
      if (response.statusCode == 200) {
        final responseBody = response.data;
        List<dynamic> studentList;
        if (responseBody is Map && responseBody.containsKey('data')) {
          studentList = responseBody['data']['data'] as List<dynamic>;
        } else if (responseBody is List) {
          studentList = responseBody;
        } else {
          //  print("StudentService: getAllStudents - Respuesta no es una lista o estructura esperada. Data: $responseBody");
          return [];
        }
        return studentList
            .map((item) => Student.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        //   print('StudentService: Error al obtener todos los estudiantes: ${response.statusCode}, Data: ${response.data}');
        return [];
      }
    } catch (e) {
      ApiService.handleApiError('getAllStudents', e);
      return [];
    }
  }

  static Future<bool> deleteStudent(String id) async {
    //print("StudentService: Eliminando estudiante ID: $id");
    try {
      final response = await ApiService.dio.delete('/students/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      ApiService.handleApiError('deleteStudent', e);
      return false;
    }
  }

  static Future<Student?> getStudentById(String id) async {
    //print("StudentService: Solicitando estudiante por ID: $id");
    try {
      final response = await ApiService.dio.get('/students/$id');
      print(response);
      if (response.statusCode == 200) {
        final responseBody = response.data['data'];
        if (responseBody is Map &&
            responseBody.containsKey('data') &&
            responseBody['data'] is Map) {
          return Student.fromJson(responseBody['data'] as Map<String, dynamic>);
        } else if (responseBody is Map<String, dynamic> &&
            !responseBody.containsKey('success')) {
          return Student.fromJson(responseBody);
        } else {
          //print("StudentService: getStudentById - Estructura de respuesta inesperada. Data: $responseBody");
          return null;
        }
      } else {
        //print('StudentService: Error al obtener estudiante por ID: ${response.statusCode}, Data: ${response.data}');
        return null;
      }
    } catch (e) {
      ApiService.handleApiError('getStudentById', e);
      return null;
    }
  }

  static Future<bool> updateStudent(String? id, Student student) async {
    if (id == null) {
      //print('StudentService: Error - ID de estudiante es nulo para actualizar.');
      return false;
    }
    //print("StudentService: Actualizando estudiante ID: $id");
    try {
      final response = await ApiService.dio.patch(
        '/students/$id',
        data: student.toJson(),
      );
      return response.statusCode == 200;
    } catch (e) {
      ApiService.handleApiError('updateStudent', e);
      return false;
    }
  }

  static Future<bool> createStudent(Map<String, dynamic> data) async {
    //print("StudentService: Creando nuevo estudiante.");
    try {
      final response = await ApiService.dio.post('/students', data: data);
      return response.statusCode == 201;
    } catch (e) {
      ApiService.handleApiError('createStudent', e);
      return false;
    }
  }

  static Future<List<Student>> getStudentByCareer(String idCareer) async {
    try {
      final response = await ApiService.dio.get(
        '/careers/${idCareer}/students',
      );
      if (response.statusCode == 200) {
        final responseBody = response.data;
        List<dynamic> studentList;
        if (responseBody is Map && responseBody.containsKey('data')) {
          studentList = responseBody['data']['data'] as List<dynamic>;
        } else if (responseBody is List) {
          studentList = responseBody;
        } else {
          return [];
        }
        return studentList
            .map((item) => Student.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  static Future<String> getStudentId() async {
    final studentProfileData = await getStudentProfile();
    return studentProfileData!.id;
  }

  static Future<String> getTeacherId() async {
    final studentProfileData = await getStudentProfile();
    return studentProfileData!.id;
  }

  static Future<List<Course>> getStudentCourses(String studentId) async {
    final token = await ApiService.getToken();
    try {
      final response = await ApiService.dio.get(
        '/courses/student/$studentId',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final listData = response.data['data']['data'];
        final cursos =
            listData.map<Course>((json) => Course.fromJson(json)).toList();
        return cursos;
      } else {
        return [];
      }
    } catch (e) {
      throw Exception("Error al obtener los cursos del estudiante: $e");
    }
  }
}

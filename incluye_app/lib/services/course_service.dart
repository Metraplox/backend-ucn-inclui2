// services/course_service.dart
import 'package:dio/dio.dart';
import 'api_service.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/student_model.dart';

class CourseService {
  static Future<List<Course>> getStudentCourses(String studentId) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');

      final response = await ApiService.dio.get(
        '/courses/student/$studentId',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Course.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      ApiService.handleApiError('Obtener cursos estudiante', e);
      return [];
    }
  }

  static Future<List<Course>> getTeacherCourses(String teacherName) async {
    try {
      final token = await ApiService.getToken();

      if (token == null) throw Exception('Token nulo');
      final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
      final response = await dio.get(
        '/courses',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> responseBody= response.data;
        if(!responseBody.containsKey('data')||responseBody['data']==null){
          throw Exception('La respuesta no contiene datos');
        }
        final List<dynamic> coursesJson=responseBody['data'];
        
        return coursesJson
            .map((json) => Course.fromJson(json))
            .where((course) => course.profesor == teacherName)
            .toList();
        
      } else {
        throw Exception('Error al cargar los cursos');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  static Future<List<Student>> getStudentsBySubject(String IdSubject) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token nulo');
      final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
      final response = await dio.get(
        '/courses/${IdSubject}/students-with-adjustments',
        options: Options(
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );
      if (response.statusCode == 200) {
        final List data = response.data['data'];

        return data.map((json) => Student.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar los cursos');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}

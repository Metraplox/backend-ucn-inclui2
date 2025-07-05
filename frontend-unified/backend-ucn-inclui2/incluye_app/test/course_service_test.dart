import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:dio/dio.dart';

void main() {
  group('CourseService', () {
    test('getStudentCourses returns empty list on error', () async {
      // Simular respuesta 500 usando interceptor en la instancia de ApiService.dio
      ApiService.dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            handler.resolve(
              Response(requestOptions: options, statusCode: 500, data: {}),
            );
          },
        ),
      );

      final courses = await CourseService.getStudentCourses('123');
      expect(courses, isEmpty);
    });
  });
}

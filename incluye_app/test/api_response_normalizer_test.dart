import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/services/api_response_normalizer.dart';

void main() {
  group('ApiResponseNormalizer Tests', () {
    test('debe extraer datos de respuesta con ResponseInterceptor únicamente', () {
      final response = {
        'success': true,
        'statusCode': 200,
        'data': {
          '_id': '123',
          'filename': 'test.xlsx',
          'downloadUrl': '/download/test.xlsx'
        }
      };

      final result = ApiResponseNormalizer.extractData(response);
      
      expect(result, isNotNull);
      expect(result!['_id'], equals('123'));
      expect(result['filename'], equals('test.xlsx'));
    });

    test('debe extraer datos de respuesta con doble anidación (problemática)', () {
      final response = {
        'success': true,
        'statusCode': 200,
        'data': {
          'success': true,
          'message': 'Report generated successfully',
          'data': {
            'filename': 'report.xlsx',
            'downloadUrl': '/download/report.xlsx'
          }
        }
      };

      final result = ApiResponseNormalizer.extractData(response);
      
      expect(result, isNotNull);
      expect(result!['filename'], equals('report.xlsx'));
      expect(result['downloadUrl'], equals('/download/report.xlsx'));
      // No debe contener la estructura anidada
      expect(result.containsKey('success'), isFalse);
    });

    test('debe manejar respuesta directa sin interceptor', () {
      final response = {
        'filename': 'direct.xlsx',
        'downloadUrl': '/download/direct.xlsx'
      };

      final result = ApiResponseNormalizer.extractData(response);
      
      expect(result, isNotNull);
      expect(result!['filename'], equals('direct.xlsx'));
    });

    test('debe manejar respuesta con estructura de estudiante', () {
      final response = {
        'success': true,
        'statusCode': 200,
        'data': {
          '_id': 'student123',
          'rut': '12345678-9',
          'nombres': 'Juan Carlos',
          'apellidos': 'Pérez'
        }
      };

      final result = ApiResponseNormalizer.extractData(response);
      
      expect(result, isNotNull);
      expect(result!['_id'], equals('student123'));
      expect(result['rut'], equals('12345678-9'));
    });
  });
}

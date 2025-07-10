# 🧪 Testing - UCN Inclui2 Frontend

**Última actualización:** 10/07/2025

## 📋 **Estrategia de Testing**

### Tipos de Tests
- **Unitarios:** Lógica de servicios y modelos
- **Widget:** Componentes UI individuales
- **Integración:** Flujos completos de usuario
- **Golden:** Comparación visual de widgets

---

## ⚡ **Ejecución de Tests**

### Tests Básicos
```bash
# Ejecutar todos los tests
flutter test

# Con coverage
flutter test --coverage

# Tests específicos
flutter test test/services/api_response_normalizer_test.dart

# Con verbose output
flutter test --verbose
```

### Análisis de Código
```bash
# Análisis estático
flutter analyze

# Con configuración personalizada
flutter analyze --fatal-warnings

# Formateo de código
dart format .
```

---

## 🔧 **Configuración de Testing**

### `test/` Estructura
```
test/
├── services/
│   ├── api_response_normalizer_test.dart
│   ├── student_service_test.dart
│   └── auth_service_test.dart
├── models/
│   ├── student_test.dart
│   └── user_test.dart
├── widgets/
│   ├── student_card_test.dart
│   └── statistics_chart_test.dart
└── integration/
    └── app_test.dart
```

### Configuración de Coverage

#### `test/coverage_helper.dart`
```dart
// Archivo helper para coverage
// Importa todos los archivos principales
// para generar reporte completo
```

---

## 🧪 **Tests de Servicios**

### Ejemplo: ApiResponseNormalizer Test
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/services/api_response_normalizer.dart';

void main() {
  group('ApiResponseNormalizer Tests', () {
    late ApiResponseNormalizer normalizer;
    
    setUp(() {
      normalizer = ApiResponseNormalizer();
    });
    
    test('should extract data from wrapped response', () {
      // Arrange
      final response = {
        'success': true,
        'statusCode': 200,
        'data': [{'id': 1, 'name': 'Juan'}]
      };
      
      // Act
      final result = normalizer.extractDataGeneric(response);
      
      // Assert
      expect(result, isA<List>());
      expect(result.length, 1);
      expect(result[0]['name'], 'Juan');
    });
    
    test('should handle legacy response format', () {
      // Arrange
      final legacyResponse = {
        'data': {
          'data': [{'id': 2, 'name': 'María'}]
        }
      };
      
      // Act
      final result = normalizer.extractDataGeneric(legacyResponse);
      
      // Assert
      expect(result, isA<List>());
      expect(result[0]['name'], 'María');
    });
    
    test('should return null for invalid response', () {
      // Arrange
      final invalidResponse = null;
      
      // Act
      final result = normalizer.extractData(invalidResponse);
      
      // Assert
      expect(result, isNull);
    });
  });
}
```

---

## 📱 **Tests de Widgets**

### Ejemplo: Widget Test
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/widgets/student_card.dart';
import 'package:incluye_app/models/student.dart';

void main() {
  group('StudentCard Widget Tests', () {
    testWidgets('should display student information correctly', (tester) async {
      // Arrange
      final student = Student(
        id: '1',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan.perez@ucn.cl',
      );
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StudentCard(student: student),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Juan Pérez'), findsOneWidget);
      expect(find.text('juan.perez@ucn.cl'), findsOneWidget);
    });
    
    testWidgets('should handle tap events', (tester) async {
      // Arrange
      bool wasTapped = false;
      final student = Student(id: '1', nombres: 'Juan', apellidos: 'Pérez');
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StudentCard(
              student: student,
              onTap: () => wasTapped = true,
            ),
          ),
        ),
      );
      
      await tester.tap(find.byType(StudentCard));
      await tester.pump();
      
      // Assert
      expect(wasTapped, isTrue);
    });
  });
}
```

---

## 🔄 **Tests de Integración**

### Ejemplo: Integration Test
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:incluye_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('App Integration Tests', () {
    testWidgets('complete login flow', (tester) async {
      // Arrange
      app.main();
      await tester.pumpAndSettle();
      
      // Act - Login flow
      await tester.tap(find.byKey(Key('login_button')));
      await tester.pumpAndSettle();
      
      await tester.enterText(
        find.byKey(Key('email_field')), 
        'test@ucn.cl'
      );
      await tester.enterText(
        find.byKey(Key('password_field')), 
        'password123'
      );
      
      await tester.tap(find.byKey(Key('submit_button')));
      await tester.pumpAndSettle();
      
      // Assert
      expect(find.byKey(Key('dashboard')), findsOneWidget);
    });
  });
}
```

---

## 🎯 **Mocks y Test Doubles**

### Configuración de Mocks
```dart
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:incluye_app/services/student_service.dart';

// Genera mocks automáticamente
@GenerateMocks([StudentService])
import 'student_service_test.mocks.dart';

void main() {
  group('Student Service Tests', () {
    late MockStudentService mockService;
    
    setUp(() {
      mockService = MockStudentService();
    });
    
    test('should return students list', () async {
      // Arrange
      final expectedStudents = [
        Student(id: '1', nombres: 'Juan'),
        Student(id: '2', nombres: 'María'),
      ];
      
      when(mockService.getStudents())
          .thenAnswer((_) async => expectedStudents);
      
      // Act
      final result = await mockService.getStudents();
      
      // Assert
      expect(result, expectedStudents);
      verify(mockService.getStudents()).called(1);
    });
  });
}
```

---

## 📊 **Coverage Reports**

### Generar Reporte
```bash
# Ejecutar tests con coverage
flutter test --coverage

# Generar reporte HTML (requiere lcov)
genhtml coverage/lcov.info -o coverage/html

# Abrir reporte
open coverage/html/index.html
```

### Objetivos de Coverage
- **Servicios:** >= 80%
- **Modelos:** >= 90%
- **Widgets:** >= 70%
- **Total:** >= 75%

---

## 🔍 **Debugging Tests**

### VS Code Configuration
```json
{
  "name": "Debug Tests",
  "request": "launch",
  "type": "dart",
  "program": "test/services/api_response_normalizer_test.dart"
}
```

### Debugging Tips
```dart
// Imprimir información durante tests
test('debug example', () {
  final result = someFunction();
  print('Debug: $result'); // Use para debugging
  expect(result, expectedValue);
});

// Usar debugger
test('with debugger', () {
  debugger(); // Pausa ejecución aquí
  final result = someFunction();
  expect(result, expectedValue);
});
```

---

## ✅ **Checklist de Testing**

### Antes de Commit
- [ ] Todos los tests pasan (`flutter test`)
- [ ] No hay warnings críticos (`flutter analyze`)
- [ ] Coverage mantenido o mejorado
- [ ] Tests para nuevas funcionalidades agregados
- [ ] Mocks actualizados si es necesario

### Antes de PR
- [ ] Tests de integración funcionando
- [ ] Documentación de tests actualizada
- [ ] Performance tests si aplica
- [ ] Tests ejecutándose en CI/CD

---

## 🚀 **CI/CD Integration**

### GitHub Actions Example
```yaml
name: Flutter Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
      
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info
```

---

## 📚 **Resources**

### Documentación
- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [Mockito Documentation](https://pub.dev/packages/mockito)
- [Integration Testing](https://docs.flutter.dev/testing/integration-tests)

### Herramientas Útiles
- **Test Explorer:** VS Code extension
- **Coverage Gutters:** Visual coverage en editor
- **Flutter Inspector:** Para debugging widgets

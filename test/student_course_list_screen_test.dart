import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/screens/students/student_course_list_screen.dart';

void main() {
  testWidgets('Muestra indicador de carga inicial en StudentCourseListScreen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: StudentCourseListScreen()));

    // Debe mostrar un CircularProgressIndicator mientras carga datos
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}

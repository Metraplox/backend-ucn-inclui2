// Test de funcionalidad completa del frontend
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/main.dart';

void main() {
  group('Frontend Integration Tests', () {
    testWidgets('App should start without errors', (WidgetTester tester) async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(const MyApp());

      // Verify that the app starts properly
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('App should show login screen for unauthenticated user', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());
      
      // Wait for async operations
      await tester.pumpAndSettle();
      
      // Should show login screen
      expect(find.text('Iniciar Sesión'), findsOneWidget);
    });
  });
}

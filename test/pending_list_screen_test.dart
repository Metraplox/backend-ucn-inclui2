import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:incluye_app/screens/diddec/pending_list_screen.dart';

void main() {
  testWidgets('PendingListScreen muestra indicador de carga inicialmente', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: PendingListScreen()));
    // Inicialmente debe mostrar el loader
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets(
    'PendingListScreen muestra texto vacío cuando no hay documentos',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: PendingListScreen(useSSE: false, getDocs: () async => []),
        ),
      );
      // Esperar a procesar future y build
      await tester.pumpAndSettle();
      expect(find.text('No hay documentos pendientes'), findsOneWidget);
    },
  );

  testWidgets(
    'PendingListScreen muestra error y botón de reintentar cuando falla',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: PendingListScreen(
            useSSE: false,
            getDocs: () async => throw Exception('fallo'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      // Debe mostrar mensaje de error y botón Reintentar
      expect(find.textContaining('Error:'), findsOneWidget);
      expect(find.text('Reintentar'), findsOneWidget);
    },
  );
}

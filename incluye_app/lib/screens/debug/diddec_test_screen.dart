import 'package:flutter/material.dart';
import 'package:incluye_app/services/diddec_service.dart';
import 'package:incluye_app/config/app_config.dart';

class DiddecTestScreen extends StatefulWidget {
  const DiddecTestScreen({super.key});

  @override
  State<DiddecTestScreen> createState() => _DiddecTestScreenState();
}

class _DiddecTestScreenState extends State<DiddecTestScreen> {
  String _testResult = '';
  bool _testing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test DIDDEC'),
        backgroundColor: Colors.teal,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'URL Backend: ${AppConfig.apiBaseUrl}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _testing ? null : _testDiddecEndpoints,
              child: _testing
                  ? const CircularProgressIndicator()
                  : const Text('Test Endpoints DIDDEC'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  _testResult,
                  style: const TextStyle(fontFamily: 'monospace'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _testDiddecEndpoints() async {
    setState(() {
      _testing = true;
      _testResult = 'Iniciando tests...\n\n';
    });

    const String testSemester = '2025-1';

    // Test 1: Estadísticas generales
    try {
      _appendResult('🔍 Test 1: Estadísticas generales');
      final stats = await DiddecService.getGeneralStatistics(testSemester);
      _appendResult('✅ Éxito: ${stats.keys.length} campos obtenidos');
      _appendResult('   Datos: ${stats.toString().substring(0, 100)}...\n');
    } catch (e) {
      _appendResult('❌ Error: $e\n');
    }

    // Test 2: Reporte del semestre
    try {
      _appendResult('🔍 Test 2: Reporte del semestre');
      final report = await DiddecService.getSemesterReport(testSemester);
      _appendResult('✅ Éxito: ${report.keys.length} campos obtenidos');
      _appendResult('   Datos: ${report.toString().substring(0, 100)}...\n');
    } catch (e) {
      _appendResult('❌ Error: $e\n');
    }

    // Test 3: Estudiantes con NEE
    try {
      _appendResult('🔍 Test 3: Estudiantes con NEE');
      final students = await DiddecService.getAllStudentsWithNEE(testSemester);
      _appendResult('✅ Éxito: ${students.length} estudiantes obtenidos\n');
    } catch (e) {
      _appendResult('❌ Error: $e\n');
    }

    // Test 4: Cumplimiento por departamento
    try {
      _appendResult('🔍 Test 4: Cumplimiento por departamento');
      final compliance = await DiddecService.getAdjustmentComplianceByDepartment(testSemester);
      _appendResult('✅ Éxito: ${compliance.length} departamentos obtenidos\n');
    } catch (e) {
      _appendResult('❌ Error: $e\n');
    }

    // Test 5: Recursos disponibles
    try {
      _appendResult('🔍 Test 5: Recursos disponibles');
      final resources = await DiddecService.getAvailableResources();
      _appendResult('✅ Éxito: ${resources.length} recursos obtenidos\n');
    } catch (e) {
      _appendResult('❌ Error: $e\n');
    }

    _appendResult('🏁 Tests completados');
    setState(() {
      _testing = false;
    });
  }

  void _appendResult(String result) {
    setState(() {
      _testResult += '$result\n';
    });
  }
}

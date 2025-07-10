import 'package:flutter/material.dart';
import 'package:incluye_app/services/diddec_service.dart';
import 'package:incluye_app/services/connectivity_test_helper.dart';
import 'package:incluye_app/config/app_config.dart';

class DiddecTestScreen extends StatefulWidget {
  const DiddecTestScreen({super.key});

  @override
  State<DiddecTestScreen> createState() => _DiddecTestScreenState();
}

class _DiddecTestScreenState extends State<DiddecTestScreen> {
  final List<String> _testResults = [];
  bool _isRunning = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prueba de Conectividad DIDDEC'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Configuración Actual:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text('URL Base: ${AppConfig.apiBaseUrl}'),
                    Text('Entorno: ${AppConfig.currentEnvironment}'),
                    Text('Logging: ${AppConfig.enableLogging}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isRunning ? null : _runAllTests,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
              ),
              child: _isRunning 
                ? const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      ),
                      SizedBox(width: 8),
                      Text('Ejecutando pruebas...'),
                    ],
                  )
                : const Text('Ejecutar Pruebas de Conectividad'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Resultados de las Pruebas:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: _testResults.isEmpty
                          ? const Center(
                              child: Text('Presiona el botón para ejecutar las pruebas'),
                            )
                          : ListView.builder(
                              itemCount: _testResults.length,
                              itemBuilder: (context, index) {
                                final result = _testResults[index];
                                final isSuccess = result.startsWith('✅');
                                final isError = result.startsWith('❌');
                                
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Icon(
                                        isSuccess ? Icons.check_circle : isError ? Icons.error : Icons.info,
                                        color: isSuccess ? Colors.green : isError ? Colors.red : Colors.blue,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          result.substring(2), // Remove emoji
                                          style: TextStyle(
                                            color: isError ? Colors.red[700] : null,
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _runAllTests() async {
    setState(() {
      _isRunning = true;
      _testResults.clear();
    });

    _addResult('🚀 Iniciando pruebas de conectividad DIDDEC...');
    _addResult('📍 URL Backend: ${AppConfig.apiBaseUrl}');
    
    // Test 0: Conectividad básica
    await _testBasicConnectivity();
    
    // Test 1: Estadísticas generales
    await _testGeneralStatistics();
    
    // Test 2: Reporte de semestre  
    await _testSemesterReport();
    
    // Test 3: Estudiantes con NEE
    await _testStudentsWithNEE();
    
    // Test 4: Cumplimiento por departamento
    await _testAdjustmentCompliance();
    
    // Test 5: Recursos disponibles
    await _testAvailableResources();

    _addResult('🏁 Pruebas completadas');
    
    setState(() {
      _isRunning = false;
    });
  }

  void _addResult(String result) {
    setState(() {
      _testResults.add(result);
    });
  }

  Future<void> _testBasicConnectivity() async {
    _addResult('🔍 Probando: Conectividad básica al backend...');
    try {
      final backendInfo = await ConnectivityTestHelper.getBackendInfo();
      if (backendInfo['connected'] == true) {
        _addResult('✅ Backend accesible: Status ${backendInfo['statusCode']}');
      } else {
        _addResult('❌ Backend no accesible: ${backendInfo['error'] ?? 'Sin respuesta'}');
      }
    } catch (e) {
      _addResult('❌ Error de conectividad básica: $e');
    }
  }

  Future<void> _testGeneralStatistics() async {
    _addResult('🔍 Probando: Estadísticas generales...');
    try {
      final result = await DiddecService.getGeneralStatistics('2025-1');
      _addResult('✅ Estadísticas generales: ${result.length} campos obtenidos');
      _addResult('   Estudiantes NEE: ${result['totalStudentsWithNEE'] ?? 'N/A'}');
      _addResult('   Total ajustes: ${result['totalAdjustments'] ?? 'N/A'}');
    } catch (e) {
      _addResult('❌ Error en estadísticas generales: $e');
    }
  }

  Future<void> _testSemesterReport() async {
    _addResult('🔍 Probando: Reporte de semestre...');
    try {
      final result = await DiddecService.getSemesterReport('2025-1');
      _addResult('✅ Reporte de semestre: ${result.length} secciones obtenidas');
    } catch (e) {
      _addResult('❌ Error en reporte de semestre: $e');
    }
  }

  Future<void> _testStudentsWithNEE() async {
    _addResult('🔍 Probando: Estudiantes con NEE...');
    try {
      final result = await DiddecService.getAllStudentsWithNEE('2025-1');
      _addResult('✅ Estudiantes con NEE: ${result.length} estudiantes encontrados');
    } catch (e) {
      _addResult('❌ Error en estudiantes con NEE: $e');
    }
  }

  Future<void> _testAdjustmentCompliance() async {
    _addResult('🔍 Probando: Cumplimiento por departamento...');
    try {
      final result = await DiddecService.getAdjustmentComplianceByDepartment('2025-1');
      _addResult('✅ Cumplimiento por departamento: ${result.length} departamentos');
    } catch (e) {
      _addResult('❌ Error en cumplimiento por departamento: $e');
    }
  }

  Future<void> _testAvailableResources() async {
    _addResult('🔍 Probando: Recursos disponibles...');
    try {
      final result = await DiddecService.getAvailableResources();
      _addResult('✅ Recursos disponibles: ${result.length} recursos encontrados');
    } catch (e) {
      _addResult('❌ Error en recursos disponibles: $e');
    }
  }
}

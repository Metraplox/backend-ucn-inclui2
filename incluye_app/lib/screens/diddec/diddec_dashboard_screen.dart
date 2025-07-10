import 'package:flutter/material.dart';
import 'package:incluye_app/services/diddec_service.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';

class DiddecDashboardScreen extends StatefulWidget {
  const DiddecDashboardScreen({super.key});

  @override
  State<DiddecDashboardScreen> createState() => _DiddecDashboardScreenState();
}

class _DiddecDashboardScreenState extends State<DiddecDashboardScreen> {
  bool _isLoading = true;
  String _currentSemester = '2025-1';
  Map<String, dynamic>? _statistics;
  Map<String, dynamic>? _semesterReport;
  List<dynamic> _compliance = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Cargar datos de forma secuencial para mejor debugging
      print('Cargando estadísticas para semestre: $_currentSemester');
      final statistics = await DiddecService.getGeneralStatistics(_currentSemester);
      print('Estadísticas cargadas: $statistics');

      print('Cargando reporte del semestre...');
      final semesterReport = await DiddecService.getSemesterReport(_currentSemester);
      print('Reporte del semestre cargado');

      print('Cargando cumplimiento por departamento...');
      final compliance = await DiddecService.getAdjustmentComplianceByDepartment(_currentSemester);
      print('Cumplimiento cargado: ${compliance.length} departamentos');

      setState(() {
        _statistics = statistics;
        _semesterReport = semesterReport;
        _compliance = compliance;
        _isLoading = false;
      });
    } catch (e) {
      print('Error al cargar datos del dashboard: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Panel DIDDEC',
      isAdmin: true,
      isStudent: false,
      isTeacher: false,
      isHead: false,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text('Error al cargar datos'),
            const SizedBox(height: 8),
            Text(_error!, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadDashboardData,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSemesterSelector(),
            const SizedBox(height: 24),
            _buildStatisticsCards(),
            const SizedBox(height: 24),
            _buildComplianceChart(),
            const SizedBox(height: 24),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildSemesterSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.calendar_today),
            const SizedBox(width: 8),
            const Text(
              'Semestre:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 16),
            DropdownButton<String>(
              value: _currentSemester,
              items:
                  ['2025-1', '2024-2', '2024-1', '2023-2', '2023-1'].map((
                    semester,
                  ) {
                    return DropdownMenuItem(
                      value: semester,
                      child: Text(semester),
                    );
                  }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _currentSemester = value;
                  });
                  _loadDashboardData();
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatisticsCards() {
    if (_statistics == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Estadísticas Generales',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.5,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildStatCard(
              'Estudiantes con NEE',
              _statistics!['totalStudentsWithNEE']?.toString() ?? '0',
              Icons.school,
              Colors.blue,
            ),
            _buildStatCard(
              'Ajustes Activos',
              _statistics!['totalAdjustments']?.toString() ?? '0',
              Icons.settings,
              Colors.green,
            ),
            _buildStatCard(
              'Ajustes Reconocidos',
              _statistics!['acknowledgedAdjustments']?.toString() ?? '0',
              Icons.check_circle,
              Colors.orange,
            ),
            _buildStatCard(
              'Tasa de Cumplimiento',
              '${_statistics!['acknowledgedPercentage']?.toStringAsFixed(1) ?? '0.0'}%',
              Icons.analytics,
              Colors.purple,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildComplianceChart() {
    if (_compliance.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Cumplimiento por Departamento',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _compliance.length,
              itemBuilder: (context, index) {
                final dept = _compliance[index];
                final complianceRate =
                    (dept['complianceRate'] ?? 0.0).toDouble();
                final color =
                    complianceRate >= 80
                        ? Colors.green
                        : complianceRate >= 60
                        ? Colors.orange
                        : Colors.red;

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(dept['department'].toString()),
                    subtitle: Text('${dept['totalAdjustments']} ajustes total'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '${complianceRate.toStringAsFixed(1)}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Acciones Rápidas',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.5,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildActionButton(
              'Generar Reporte',
              Icons.file_download,
              Colors.blue,
              () => _generateReport(),
            ),
            _buildActionButton(
              'Ver Estudiantes NEE',
              Icons.people,
              Colors.green,
              () => _viewStudentsNEE(),
            ),
            _buildActionButton(
              'Recursos DIDDEC',
              Icons.library_books,
              Colors.orange,
              () => _viewResources(),
            ),
            _buildActionButton(
              'Tendencias',
              Icons.trending_up,
              Colors.purple,
              () => _viewTrends(),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(
    String title,
    IconData icon,
    Color color,
    VoidCallback onPressed,
  ) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  void _generateReport() {
    showDialog(
      context: context,
      builder: (context) => _ReportGeneratorDialog(semester: _currentSemester),
    );
  }

  void _viewStudentsNEE() {
    Navigator.pushNamed(
      context,
      '/diddec/students',
      arguments: _currentSemester,
    );
  }

  void _viewResources() {
    Navigator.pushNamed(context, '/diddec/resources');
  }

  void _viewTrends() {
    Navigator.pushNamed(context, '/diddec/trends');
  }
}

class _ReportGeneratorDialog extends StatefulWidget {
  final String semester;

  const _ReportGeneratorDialog({required this.semester});

  @override
  State<_ReportGeneratorDialog> createState() => _ReportGeneratorDialogState();
}

class _ReportGeneratorDialogState extends State<_ReportGeneratorDialog> {
  String _reportType = 'general_statistics';
  String _format = 'excel';
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Generar Reporte'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<String>(
            value: _reportType,
            decoration: const InputDecoration(labelText: 'Tipo de Reporte'),
            items: const [
              DropdownMenuItem(
                value: 'general_statistics',
                child: Text('Estadísticas Generales'),
              ),
              DropdownMenuItem(
                value: 'students_with_nee',
                child: Text('Estudiantes con NEE'),
              ),
              DropdownMenuItem(
                value: 'adjustments_by_type',
                child: Text('Ajustes por Tipo'),
              ),
              DropdownMenuItem(
                value: 'adjustment_compliance',
                child: Text('Cumplimiento de Ajustes'),
              ),
            ],
            onChanged: (value) => setState(() => _reportType = value!),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _format,
            decoration: const InputDecoration(labelText: 'Formato'),
            items: const [
              DropdownMenuItem(value: 'excel', child: Text('Excel')),
              DropdownMenuItem(value: 'pdf', child: Text('PDF')),
              DropdownMenuItem(value: 'csv', child: Text('CSV')),
            ],
            onChanged: (value) => setState(() => _format = value!),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isGenerating ? null : () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isGenerating ? null : _generateReport,
          child:
              _isGenerating
                  ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                  : const Text('Generar'),
        ),
      ],
    );
  }

  Future<void> _generateReport() async {
    setState(() => _isGenerating = true);

    try {
      final result = await DiddecService.exportReport(
        semester: widget.semester,
        reportType: _reportType,
        format: _format,
      );

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Reporte generado: ${result['data']['filename']}'),
            action: SnackBarAction(
              label: 'Descargar',
              onPressed: () async {
                try {
                  await DiddecService.downloadReport(
                    result['data']['filename'],
                  );
                  // Aquí podrías implementar la descarga del archivo
                  // Por ejemplo, usando file_saver package
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error al descargar: $e')),
                  );
                }
              },
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isGenerating = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error al generar reporte: $e')));
      }
    }
  }
}

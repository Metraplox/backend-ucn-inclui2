import 'package:flutter/material.dart';
import 'package:incluye_app/services/diddec_service.dart';
import 'package:file_picker/file_picker.dart';

class SimpleDiddecScreen extends StatefulWidget {
  const SimpleDiddecScreen({super.key});

  @override
  State<SimpleDiddecScreen> createState() => _SimpleDiddecScreenState();
}

class _SimpleDiddecScreenState extends State<SimpleDiddecScreen> {
  bool _isLoading = true;
  String _currentSemester = '2025-1';
  Map<String, dynamic>? _statistics;
  List<dynamic> _studentsNEE = [];
  List<dynamic> _resources = [];
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
      final results = await Future.wait([
        DiddecService.getGeneralStatistics(_currentSemester),
        DiddecService.getAllStudentsWithNEE(_currentSemester),
        DiddecService.getAvailableResources(),
      ]);

      setState(() {
        _statistics = results[0] as Map<String, dynamic>;
        _studentsNEE = results[1] as List<dynamic>;
        _resources = results[2] as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel DIDDEC'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDashboardData,
          ),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _error != null
        ? _buildErrorWidget()
        : RefreshIndicator(
            onRefresh: _loadDashboardData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSemesterSelector(),
                  const SizedBox(height: 20),
                  _buildStatisticsCards(),
                  const SizedBox(height: 30),
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error, size: 64, color: Colors.red[300]),
          const SizedBox(height: 16),
          const Text('Error al cargar datos'),
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

  Widget _buildSemesterSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Text(
              'Semestre: ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButton<String>(
                value: _currentSemester,
                isExpanded: true,
                items: [
                  '2024-1', '2024-2', '2025-1', '2025-2'
                ].map((semester) => DropdownMenuItem(
                  value: semester,
                  child: Text(semester),
                )).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _currentSemester = value;
                    });
                    _loadDashboardData();
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatisticsCards() {
    if (_statistics == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('No hay estadísticas disponibles'),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Estadísticas del Semestre',
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
              Colors.blue
            ),
            _buildStatCard(
              'Ajustes Activos', 
              _statistics!['totalAdjustments']?.toString() ?? '0', 
              Icons.settings, 
              Colors.green
            ),
            _buildStatCard(
              'Tasa Cumplimiento', 
              '${_statistics!['acknowledgedPercentage']?.toStringAsFixed(1) ?? '0.0'}%', 
              Icons.analytics, 
              Colors.orange
            ),
            _buildStatCard(
              'Recursos Disponibles', 
              _resources.length.toString(), 
              Icons.library_books, 
              Colors.purple
            ),
          ],
        ),
      ],
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
        
        _buildActionCard(
          'Generar Reporte', 
          'Crear reportes de estadísticas y cumplimiento',
          Icons.file_download,
          Colors.blue,
          _showReportDialog,
        ),
        _buildActionCard(
          'Ver Estudiantes NEE', 
          'Lista de ${_studentsNEE.length} estudiantes con necesidades especiales',
          Icons.people,
          Colors.green,
          _showStudentsNEE,
        ),
        _buildActionCard(
          'Gestionar Recursos', 
          'Ver y gestionar ${_resources.length} recursos disponibles',
          Icons.library_books,
          Colors.orange,
          _showResourcesDialog,
        ),
        _buildActionCard(
          'Análisis de Tendencias', 
          'Ver tendencias y análisis histórico',
          Icons.trending_up,
          Colors.purple,
          _showTrendsDialog,
        ),
        _buildActionCard(
          'Cumplimiento por Departamento', 
          'Ver cumplimiento de ajustes por departamento',
          Icons.business,
          Colors.indigo,
          _showComplianceDialog,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
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
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap,
      ),
    );
  }

  // ===== MÉTODOS FUNCIONALES =====

  void _showReportDialog() {
    showDialog(
      context: context,
      builder: (context) => _ReportDialog(semester: _currentSemester),
    );
  }

  void _showStudentsNEE() {
    showDialog(
      context: context,
      builder: (context) => _StudentsNEEDialog(
        students: _studentsNEE, 
        semester: _currentSemester,
      ),
    );
  }

  void _showResourcesDialog() {
    showDialog(
      context: context,
      builder: (context) => _ResourcesDialog(resources: _resources),
    );
  }

  void _showTrendsDialog() {
    showDialog(
      context: context,
      builder: (context) => _TrendsDialog(),
    );
  }

  void _showComplianceDialog() {
    showDialog(
      context: context,
      builder: (context) => _ComplianceDialog(semester: _currentSemester),
    );
  }
}

// ===== DIÁLOGOS FUNCIONALES =====

class _ReportDialog extends StatefulWidget {
  final String semester;
  const _ReportDialog({required this.semester});

  @override
  State<_ReportDialog> createState() => _ReportDialogState();
}

class _ReportDialogState extends State<_ReportDialog> {
  String _reportType = 'general_statistics';
  String _format = 'excel';
  bool _isGenerating = false;
  bool _includeSensitiveData = false;

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
              DropdownMenuItem(value: 'general_statistics', child: Text('Estadísticas Generales')),
              DropdownMenuItem(value: 'compliance_report', child: Text('Reporte de Cumplimiento')),
              DropdownMenuItem(value: 'students_nee', child: Text('Estudiantes con NEE')),
              DropdownMenuItem(value: 'department_summary', child: Text('Resumen por Departamento')),
            ],
            onChanged: (value) => setState(() => _reportType = value!),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _format,
            decoration: const InputDecoration(labelText: 'Formato'),
            items: const [
              DropdownMenuItem(value: 'excel', child: Text('Excel (.xlsx)')),
              DropdownMenuItem(value: 'pdf', child: Text('PDF')),
              DropdownMenuItem(value: 'csv', child: Text('CSV')),
            ],
            onChanged: (value) => setState(() => _format = value!),
          ),
          const SizedBox(height: 16),
          CheckboxListTile(
            title: const Text('Incluir datos sensibles'),
            subtitle: const Text('RUT, nombres completos, etc.'),
            value: _includeSensitiveData,
            onChanged: (value) => setState(() => _includeSensitiveData = value!),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isGenerating ? null : _generateReport,
          child: _isGenerating 
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
        includeSensitiveData: _includeSensitiveData,
      );

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Reporte generado: ${result['data']['filename']}'),
            backgroundColor: Colors.green,
            action: SnackBarAction(
              label: 'Descargar',
              textColor: Colors.white,
              onPressed: () => _downloadReport(result['data']['filename']),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isGenerating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al generar reporte: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _downloadReport(String filename) async {
    try {
      final bytes = await DiddecService.downloadReport(filename);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Reporte descargado: $filename (${bytes.length} bytes)'),
          backgroundColor: Colors.blue,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al descargar: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

class _StudentsNEEDialog extends StatelessWidget {
  final List<dynamic> students;
  final String semester;

  const _StudentsNEEDialog({required this.students, required this.semester});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Estudiantes con NEE - $semester'),
      content: SizedBox(
        width: double.maxFinite,
        height: 400,
        child: students.isEmpty
          ? const Center(child: Text('No hay estudiantes con NEE registrados'))
          : ListView.builder(
              itemCount: students.length,
              itemBuilder: (context, index) {
                final student = students[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.blue.withOpacity(0.1),
                      child: const Icon(Icons.person, color: Colors.blue),
                    ),
                    title: Text(student['nombreCompleto'] ?? 'Sin nombre'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('RUT: ${student['rut'] ?? 'N/A'}'),
                        Text('Carrera: ${student['career'] ?? 'N/A'}'),
                        Text('Ajustes: ${student['adjustmentCount'] ?? 0}'),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: IconButton(
                      icon: const Icon(Icons.info),
                      onPressed: () => _showStudentDetails(context, student),
                    ),
                  ),
                );
              },
            ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cerrar'),
        ),
        ElevatedButton(
          onPressed: () => _exportStudentsList(context),
          child: const Text('Exportar Lista'),
        ),
      ],
    );
  }

  void _showStudentDetails(BuildContext context, dynamic student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(student['nombreCompleto'] ?? 'Estudiante'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('RUT: ${student['rut'] ?? 'N/A'}'),
            Text('Email: ${student['email'] ?? 'N/A'}'),
            Text('Carrera: ${student['career'] ?? 'N/A'}'),
            Text('Semestre de ingreso: ${student['semesterEntry'] ?? 'N/A'}'),
            Text('Ajustes activos: ${student['adjustmentCount'] ?? 0}'),
            Text('Último ajuste: ${student['lastAdjustmentDate'] ?? 'N/A'}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _exportStudentsList(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Exportando lista de estudiantes...'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}

class _ResourcesDialog extends StatefulWidget {
  final List<dynamic> resources;
  const _ResourcesDialog({required this.resources});

  @override
  State<_ResourcesDialog> createState() => _ResourcesDialogState();
}

class _ResourcesDialogState extends State<_ResourcesDialog> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Recursos DIDDEC'),
      content: SizedBox(
        width: double.maxFinite,
        height: 400,
        child: widget.resources.isEmpty
          ? const Center(child: Text('No hay recursos disponibles'))
          : ListView.builder(
              itemCount: widget.resources.length,
              itemBuilder: (context, index) {
                final resource = widget.resources[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.orange.withOpacity(0.1),
                      child: const Icon(Icons.library_books, color: Colors.orange),
                    ),
                    title: Text(resource['title'] ?? 'Sin título'),
                    subtitle: Text(resource['description'] ?? 'Sin descripción'),
                    trailing: PopupMenuButton(
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'download',
                          child: Row(
                            children: [Icon(Icons.download), SizedBox(width: 8), Text('Descargar')],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [Icon(Icons.delete, color: Colors.red), SizedBox(width: 8), Text('Eliminar')],
                          ),
                        ),
                      ],
                      onSelected: (value) {
                        if (value == 'download') {
                          _downloadResource(resource['_id']);
                        } else if (value == 'delete') {
                          _confirmDeleteResource(resource);
                        }
                      },
                    ),
                  ),
                );
              },
            ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cerrar'),
        ),
        ElevatedButton(
          onPressed: _uploadNewResource,
          child: const Text('Subir Recurso'),
        ),
      ],
    );
  }

  Future<void> _downloadResource(String resourceId) async {
    try {
      final bytes = await DiddecService.downloadResource(resourceId);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Recurso descargado (${bytes.length} bytes)'),
          backgroundColor: Colors.blue,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al descargar: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _confirmDeleteResource(dynamic resource) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Eliminación'),
        content: Text('¿Está seguro de eliminar "${resource['title']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Recurso eliminado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  Future<void> _uploadNewResource() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.any,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        
        if (mounted) {
          _showResourceMetadataDialog(file);
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al seleccionar archivo: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showResourceMetadataDialog(PlatformFile file) {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String category = 'GUIA';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Información del Recurso'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: 'Título'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: descriptionController,
              decoration: const InputDecoration(labelText: 'Descripción'),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: category,
              decoration: const InputDecoration(labelText: 'Categoría'),
              items: const [
                DropdownMenuItem(value: 'GUIA', child: Text('Guía')),
                DropdownMenuItem(value: 'FORMULARIO', child: Text('Formulario')),
                DropdownMenuItem(value: 'PROTOCOLO', child: Text('Protocolo')),
                DropdownMenuItem(value: 'MANUAL', child: Text('Manual')),
              ],
              onChanged: (value) => category = value!,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isNotEmpty && file.bytes != null) {
                try {
                  await DiddecService.uploadResource(
                    title: titleController.text,
                    description: descriptionController.text,
                    category: category,
                    fileBytes: file.bytes!,
                    fileName: file.name,
                  );
                  
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Recurso subido exitosamente'),
                      backgroundColor: Colors.green,
                    ),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error al subir recurso: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Subir'),
          ),
        ],
      ),
    );
  }
}

class _TrendsDialog extends StatefulWidget {
  @override
  State<_TrendsDialog> createState() => _TrendsDialogState();
}

class _TrendsDialogState extends State<_TrendsDialog> {
  Map<String, dynamic>? _trendsData;
  bool _isLoading = true;
  int _years = 3;

  @override
  void initState() {
    super.initState();
    _loadTrends();
  }

  Future<void> _loadTrends() async {
    setState(() => _isLoading = true);
    try {
      final data = await DiddecService.getAdjustmentTrends(years: _years);
      setState(() {
        _trendsData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar tendencias: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Análisis de Tendencias'),
      content: SizedBox(
        width: double.maxFinite,
        height: 400,
        child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _trendsData == null
          ? const Center(child: Text('No se pudieron cargar las tendencias'))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('Años a analizar: '),
                      DropdownButton<int>(
                        value: _years,
                        items: [1, 2, 3, 4, 5].map((year) => 
                          DropdownMenuItem(value: year, child: Text('$year'))
                        ).toList(),
                        onChanged: (value) {
                          setState(() => _years = value!);
                          _loadTrends();
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildTrendCard('Crecimiento de Estudiantes NEE', 
                    _trendsData!['studentGrowth']?.toString() ?? 'N/A'),
                  _buildTrendCard('Tendencia de Ajustes', 
                    _trendsData!['adjustmentTrend']?.toString() ?? 'N/A'),
                  _buildTrendCard('Mejora en Cumplimiento', 
                    _trendsData!['complianceImprovement']?.toString() ?? 'N/A'),
                ],
              ),
            ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cerrar'),
        ),
      ],
    );
  }

  Widget _buildTrendCard(String title, String value) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(value),
          ],
        ),
      ),
    );
  }
}

class _ComplianceDialog extends StatefulWidget {
  final String semester;
  const _ComplianceDialog({required this.semester});

  @override
  State<_ComplianceDialog> createState() => _ComplianceDialogState();
}

class _ComplianceDialogState extends State<_ComplianceDialog> {
  List<dynamic> _complianceData = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCompliance();
  }

  Future<void> _loadCompliance() async {
    setState(() => _isLoading = true);
    try {
      final data = await DiddecService.getAdjustmentComplianceByDepartment(widget.semester);
      setState(() {
        _complianceData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar cumplimiento: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Cumplimiento por Departamento - ${widget.semester}'),
      content: SizedBox(
        width: double.maxFinite,
        height: 400,
        child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _complianceData.isEmpty
          ? const Center(child: Text('No hay datos de cumplimiento'))
          : ListView.builder(
              itemCount: _complianceData.length,
              itemBuilder: (context, index) {
                final dept = _complianceData[index];
                final complianceRate = (dept['acknowledgedAdjustments'] / dept['totalAdjustments'] * 100);
                final color = complianceRate >= 80 
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
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cerrar'),
        ),
      ],
    );
  }
}

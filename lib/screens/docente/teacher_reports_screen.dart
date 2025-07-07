import 'package:flutter/material.dart';

class TeacherReportsScreen extends StatefulWidget {
  const TeacherReportsScreen({super.key});

  @override
  State<TeacherReportsScreen> createState() => _TeacherReportsScreenState();
}

class _TeacherReportsScreenState extends State<TeacherReportsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Reportes'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Reportes Disponibles',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Genera reportes sobre tus estudiantes y cursos',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 24),
            _buildReportCard(
              title: 'Reporte de Estudiantes NEE',
              description: 'Lista completa de estudiantes con necesidades especiales en tus cursos',
              icon: Icons.people,
              color: Colors.blue,
              onTap: () => _generateReport('estudiantes_nee'),
            ),
            const SizedBox(height: 16),
            _buildReportCard(
              title: 'Reporte de Ajustes Curriculares',
              description: 'Detalle de todos los ajustes curriculares por curso y estudiante',
              icon: Icons.assignment,
              color: Colors.green,
              onTap: () => _generateReport('ajustes_curriculares'),
            ),
            const SizedBox(height: 16),
            _buildReportCard(
              title: 'Reporte de Seguimiento',
              description: 'Progreso y evolución de estudiantes NEE durante el semestre',
              icon: Icons.trending_up,
              color: Colors.orange,
              onTap: () => _generateReport('seguimiento'),
            ),
            const SizedBox(height: 16),
            _buildReportCard(
              title: 'Reporte de Asistencia',
              description: 'Análisis de asistencia de estudiantes con necesidades especiales',
              icon: Icons.event_available,
              color: Colors.purple,
              onTap: () => _generateReport('asistencia'),
            ),
            const SizedBox(height: 32),
            _buildHistorySection(),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard({
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: _isLoading ? null : onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Reportes Recientes',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildHistoryItem(
                  'Reporte de Estudiantes NEE',
                  'Generado hace 2 días',
                  Icons.people,
                  Colors.blue,
                ),
                const Divider(),
                _buildHistoryItem(
                  'Reporte de Ajustes Curriculares',
                  'Generado hace 1 semana',
                  Icons.assignment,
                  Colors.green,
                ),
                const Divider(),
                _buildHistoryItem(
                  'Reporte de Seguimiento',
                  'Generado hace 2 semanas',
                  Icons.trending_up,
                  Colors.orange,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryItem(
    String title,
    String date,
    IconData icon,
    Color color,
  ) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: color),
      title: Text(title),
      subtitle: Text(date),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.download, color: Colors.blue),
            onPressed: () => _downloadReport(title),
          ),
          IconButton(
            icon: const Icon(Icons.share, color: Colors.green),
            onPressed: () => _shareReport(title),
          ),
        ],
      ),
    );
  }

  void _generateReport(String reportType) {
    setState(() => _isLoading = true);
    
    // Simular generación de reporte
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isLoading = false);
        
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Reporte Generado'),
            content: Text('El reporte "$reportType" ha sido generado exitosamente.'),
            actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cerrar'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _downloadReport(reportType);
              },
              child: const Text('Descargar'),
            ),
          ],
        ),
      );
      }
    });

    // Mostrar indicador de carga
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text('Generando reporte...'),
          ],
        ),
      ),
    );
  }

  void _downloadReport(String reportName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Descargando reporte: $reportName'),
        backgroundColor: Colors.green,
        action: SnackBarAction(
          label: 'Ver',
          onPressed: () {
            // Aquí se abriría el reporte descargado
          },
        ),
      ),
    );
  }

  void _shareReport(String reportName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Compartiendo reporte: $reportName'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}

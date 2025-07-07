import 'package:flutter/material.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  bool _isLoading = false;
  String _selectedFilter = 'Todas';
  final List<String> _filters = ['Todas', 'Críticas', 'Moderadas', 'Resueltas'];

  // Datos simulados de alertas
  final List<Map<String, dynamic>> _alerts = [
    {
      'id': '1',
      'title': 'Estudiante requiere atención inmediata',
      'description': 'Juan Pérez no ha confirmado ajustes curriculares hace 15 días',
      'type': 'Crítica',
      'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
      'status': 'Pendiente',
      'studentName': 'Juan Pérez',
      'teacherName': 'Prof. María González',
    },
    {
      'id': '2',
      'title': 'Ajuste curricular expirado',
      'description': 'Ajuste de evaluación para Ana Torres ha vencido',
      'type': 'Moderada',
      'timestamp': DateTime.now().subtract(const Duration(days: 1)),
      'status': 'Pendiente',
      'studentName': 'Ana Torres',
      'teacherName': 'Prof. Carlos Rodríguez',
    },
    {
      'id': '3',
      'title': 'Falta confirmar asistencia a sesión de apoyo',
      'description': 'Luis Martínez no asistió a sesión programada',
      'type': 'Moderada',
      'timestamp': DateTime.now().subtract(const Duration(days: 2)),
      'status': 'En Proceso',
      'studentName': 'Luis Martínez',
      'teacherName': 'Prof. Elena Vargas',
    },
    {
      'id': '4',
      'title': 'Actualización de plan académico completada',
      'description': 'Plan de Sofía López actualizado exitosamente',
      'type': 'Resuelta',
      'timestamp': DateTime.now().subtract(const Duration(days: 3)),
      'status': 'Resuelta',
      'studentName': 'Sofía López',
      'teacherName': 'Prof. Roberto Silva',
    },
  ];

  List<Map<String, dynamic>> get _filteredAlerts {
    if (_selectedFilter == 'Todas') return _alerts;
    return _alerts.where((alert) => alert['type'] == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alertas y Notificaciones'),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshAlerts,
          ),
          IconButton(
            icon: const Icon(Icons.mark_email_read),
            onPressed: _markAllAsRead,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterSection(),
          _buildSummaryCards(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredAlerts.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredAlerts.length,
                        itemBuilder: (context, index) {
                          final alert = _filteredAlerts[index];
                          return _buildAlertCard(alert);
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createCustomAlert,
        backgroundColor: Colors.orange,
        child: const Icon(Icons.add_alert, color: Colors.white),
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _filters.map((filter) {
            final isSelected = _selectedFilter == filter;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(filter),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    setState(() => _selectedFilter = filter);
                  }
                },
                selectedColor: Colors.orange.shade100,
                checkmarkColor: Colors.orange,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildSummaryCards() {
    final critical = _alerts.where((a) => a['type'] == 'Crítica').length;
    final moderate = _alerts.where((a) => a['type'] == 'Moderada').length;
    final resolved = _alerts.where((a) => a['type'] == 'Resuelta').length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard(
              'Críticas',
              critical.toString(),
              Icons.error,
              Colors.red,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Moderadas',
              moderate.toString(),
              Icons.warning,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Resueltas',
              resolved.toString(),
              Icons.check_circle,
              Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No hay alertas',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No se encontraron alertas para el filtro seleccionado',
            style: TextStyle(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard(Map<String, dynamic> alert) {
    final alertColor = _getAlertColor(alert['type']);
    final statusColor = _getStatusColor(alert['status']);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _viewAlertDetail(alert),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    _getAlertIcon(alert['type']),
                    color: alertColor,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      alert['title'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      border: Border.all(color: statusColor),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      alert['status'],
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                alert['description'],
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.person, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    alert['studentName'],
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.school, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    alert['teacherName'],
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  Text(
                    _formatTimestamp(alert['timestamp']),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
              if (alert['status'] != 'Resuelta') ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => _resolveAlert(alert),
                      child: const Text('Resolver'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _assignAlert(alert),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Asignar'),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getAlertColor(String type) {
    switch (type) {
      case 'Crítica':
        return Colors.red;
      case 'Moderada':
        return Colors.orange;
      case 'Resuelta':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Pendiente':
        return Colors.red;
      case 'En Proceso':
        return Colors.orange;
      case 'Resuelta':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getAlertIcon(String type) {
    switch (type) {
      case 'Crítica':
        return Icons.error;
      case 'Moderada':
        return Icons.warning;
      case 'Resuelta':
        return Icons.check_circle;
      default:
        return Icons.info;
    }
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return 'hace ${difference.inDays} días';
    } else if (difference.inHours > 0) {
      return 'hace ${difference.inHours} horas';
    } else {
      return 'hace ${difference.inMinutes} minutos';
    }
  }

  void _refreshAlerts() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Alertas actualizadas'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  void _markAllAsRead() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Todas las alertas marcadas como leídas'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _viewAlertDetail(Map<String, dynamic> alert) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(alert['title']),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Descripción: ${alert['description']}'),
            const SizedBox(height: 8),
            Text('Estudiante: ${alert['studentName']}'),
            Text('Profesor: ${alert['teacherName']}'),
            Text('Estado: ${alert['status']}'),
            Text('Fecha: ${_formatTimestamp(alert['timestamp'])}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          if (alert['status'] != 'Resuelta')
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _resolveAlert(alert);
              },
              child: const Text('Resolver'),
            ),
        ],
      ),
    );
  }

  void _resolveAlert(Map<String, dynamic> alert) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Resolviendo alerta: ${alert['title']}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _assignAlert(Map<String, dynamic> alert) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Asignar Alerta'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Selecciona a quién asignar esta alerta:'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Asignar a',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'coordinator', child: Text('Coordinador')),
                DropdownMenuItem(value: 'teacher', child: Text('Profesor')),
                DropdownMenuItem(value: 'diddec', child: Text('DIDDEC')),
              ],
              onChanged: (value) {},
            ),
          ],
        ),
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
                  content: Text('Alerta asignada exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Asignar'),
          ),
        ],
      ),
    );
  }

  void _createCustomAlert() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Crear Nueva Alerta'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: 'Título',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Descripción',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Tipo de Alerta',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'Crítica', child: Text('Crítica')),
                DropdownMenuItem(value: 'Moderada', child: Text('Moderada')),
              ],
              onChanged: (value) {},
            ),
          ],
        ),
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
                  content: Text('Alerta creada exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Crear'),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:incluye_app/models/teacher_stats_model.dart';
import 'package:incluye_app/services/career_service.dart';

class TeacherStatsScreen extends StatefulWidget {
  const TeacherStatsScreen({super.key});

  @override
  State<TeacherStatsScreen> createState() => _TeacherStatsScreenState();
}

class _TeacherStatsScreenState extends State<TeacherStatsScreen> {
  bool _isLoading = true;
  List<TeacherStats> _teacherStats = [];
  List<TeacherStats> _filteredStats = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTeacherStats();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTeacherStats() async {
    setState(() => _isLoading = true);
    
    try {
      final teachersData = await CareerService.getTeachersByCareer();
      final teachers = teachersData
          .map((json) => TeacherStats.fromJson(json as Map<String, dynamic>))
          .toList();
      
      setState(() {
        _teacherStats = teachers;
        _filteredStats = teachers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar estadísticas: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _filterStats(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredStats = _teacherStats;
      } else {
        _filteredStats = _teacherStats.where((teacher) =>
          teacher.teacherName.toLowerCase().contains(query.toLowerCase())
        ).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estadísticas de Profesores'),
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTeacherStats,
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: _exportStats,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Buscar profesor',
                hintText: 'Nombre del profesor...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: _filterStats,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredStats.isEmpty
                    ? _buildEmptyState()
                    : Column(
                        children: [
                          _buildSummaryCards(),
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _filteredStats.length,
                              itemBuilder: (context, index) {
                                final teacher = _filteredStats[index];
                                return _buildTeacherCard(teacher);
                              },
                            ),
                          ),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    final totalTeachers = _filteredStats.length;
    final totalCourses = _filteredStats.fold<int>(0, (sum, teacher) => sum + teacher.courseCount);
    final totalStudents = _filteredStats.fold<int>(0, (sum, teacher) => sum + teacher.studentCount);
    final totalAlerts = _filteredStats.fold<int>(0, (sum, teacher) => sum + teacher.alertCount);

    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard(
              'Profesores',
              totalTeachers.toString(),
              Icons.person,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Cursos',
              totalCourses.toString(),
              Icons.book,
              Colors.green,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Estudiantes',
              totalStudents.toString(),
              Icons.people,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Alertas',
              totalAlerts.toString(),
              Icons.warning,
              totalAlerts > 0 ? Colors.red : Colors.grey,
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
            Icons.school_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No se encontraron profesores',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isEmpty
                ? 'No hay profesores registrados'
                : 'Intenta con otro término de búsqueda',
            style: TextStyle(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeacherCard(TeacherStats teacher) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Colors.purple.shade100,
          child: Text(
            teacher.teacherName.split(' ').map((name) => name[0]).take(2).join(),
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.purple,
            ),
          ),
        ),
        title: Text(
          teacher.teacherName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${teacher.courseCount} cursos • ${teacher.studentCount} estudiantes',
        ),
        trailing: teacher.alertCount > 0
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${teacher.alertCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              )
            : const Icon(Icons.expand_more),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        'Cursos',
                        teacher.courseCount.toString(),
                        Icons.book,
                        Colors.blue,
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Estudiantes',
                        teacher.studentCount.toString(),
                        Icons.people,
                        Colors.green,
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Alertas',
                        teacher.alertCount.toString(),
                        Icons.warning,
                        teacher.alertCount > 0 ? Colors.red : Colors.grey,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _viewTeacherDetail(teacher),
                      icon: const Icon(Icons.person),
                      label: const Text('Ver Detalle'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _viewTeacherCourses(teacher),
                      icon: const Icon(Icons.book),
                      label: const Text('Sus Cursos'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    if (teacher.alertCount > 0)
                      ElevatedButton.icon(
                        onPressed: () => _viewTeacherAlerts(teacher),
                        icon: const Icon(Icons.warning),
                        label: const Text('Alertas'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  void _viewTeacherDetail(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Detalle de ${teacher.teacherName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${teacher.teacherId}'),
            const SizedBox(height: 8),
            Text('Cursos a cargo: ${teacher.courseCount}'),
            Text('Estudiantes totales: ${teacher.studentCount}'),
            Text('Alertas activas: ${teacher.alertCount}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _generateTeacherReport(teacher);
            },
            child: const Text('Generar Reporte'),
          ),
        ],
      ),
    );
  }

  void _viewTeacherCourses(TeacherStats teacher) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Mostrando cursos de ${teacher.teacherName}'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _viewTeacherAlerts(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Alertas de ${teacher.teacherName}'),
        content: Text('${teacher.alertCount} alertas activas requieren atención.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Redirigiendo a gestión de alertas'),
                  backgroundColor: Colors.orange,
                ),
              );
            },
            child: const Text('Ver Alertas'),
          ),
        ],
      ),
    );
  }

  void _generateTeacherReport(TeacherStats teacher) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Generando reporte para ${teacher.teacherName}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _exportStats() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Exportando estadísticas de profesores'),
        backgroundColor: Colors.purple,
      ),
    );
  }
}

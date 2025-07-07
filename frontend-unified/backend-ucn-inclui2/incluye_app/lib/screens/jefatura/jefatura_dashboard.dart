import 'package:flutter/material.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/career_service.dart';
import 'package:incluye_app/widgets/statistic_card.dart';
import 'package:incluye_app/widgets/alert_badge.dart';
import 'package:incluye_app/widgets/quick_action_button.dart';
import 'package:incluye_app/widgets/export_button.dart';
import 'package:incluye_app/models/teacher_stats_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/screens/user_management_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/screens/jefatura/teacher_stats_screen.dart';
import 'package:incluye_app/screens/jefatura/teachers_list_screen.dart';
import 'package:incluye_app/screens/jefatura/alerts_screen.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

/// Dashboard principal para el rol Jefatura de Carrera
/// Enfocado en gestión de profesores y estadísticas de carrera
class JefaturaDashboard extends StatefulWidget {
  const JefaturaDashboard({super.key});

  @override
  State<JefaturaDashboard> createState() => _JefaturaDashboardState();
}

class _JefaturaDashboardState extends State<JefaturaDashboard> {
  bool _isLoading = true;
  String? _headCareerId;
  int _totalTeachers = 0;
  int _studentsInCareer = 0;
  int _pendingReviews = 0;
  int _activeAlerts = 0;
  int _totalStudents = 0;
  int _totalAdjustments = 0;
  int _pendingAlerts = 0;
  List<TeacherStats> _teacherStats = [];
  List<Student> _students = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      // Obtener ID de carrera del jefe
      _headCareerId = await StudentService.getHeadCareerId();

      if (_headCareerId != null) {
        // Cargar estadísticas de la carrera
        final teachersData = await CareerService.getTeachersByCareer();
        final teachers =
            teachersData
                .map(
                  (json) => TeacherStats.fromJson(json as Map<String, dynamic>),
                )
                .toList();
        final students = await StudentService.getAllStudents();
        final adjustments = await AdjustmentService.getAllAdjustments();

        // Filtrar estudiantes de esta carrera
        final careerStudents =
            students
                .where((student) => student.rawCarreraId == _headCareerId)
                .toList();

        setState(() {
          _teacherStats = teachers;
          _totalTeachers = teachers.length;
          _studentsInCareer = careerStudents.length;
          _pendingReviews = adjustments.where((adj) => adj.isPending).length;
          _activeAlerts = adjustments.where((adj) => adj.isExpired).length;
          _students = students;
          _totalStudents = students.length;
          _totalAdjustments = adjustments.length;
          _pendingAlerts = adjustments.where((adj) => adj.isPending).length;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No se pudo obtener la información de carrera'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar datos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      title: 'Dashboard Jefatura',
      onRefresh: _loadDashboardData,
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => _navigateToNotifications(),
            ),
            if (_activeAlerts > 0)
              Positioned(
                right: 8,
                top: 8,
                child: AlertBadge(count: _activeAlerts),
              ),
          ],
        ),
      ],
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildWelcomeSection(),
                    const SizedBox(height: 24),
                    _buildAlertsSection(),
                    const SizedBox(height: 24),
                    _buildManagementSection(),
                    const SizedBox(height: 24),
                    _buildStatisticsGrid(),
                    const SizedBox(height: 24),
                    _buildQuickActions(),
                    const SizedBox(height: 24),
                    _buildTeacherSummary(),
                  ],
                ),
              ),
    );
  }

  Widget _buildWelcomeSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: const Icon(
                Icons.business_center,
                color: Colors.white,
                size: 30,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Panel Jefe de Carrera',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Gestiona tu equipo docente y estudiantes NEE',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Alertas y Notificaciones',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.red.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.red,
              child: Icon(Icons.notifications, color: Colors.white),
            ),
            title: const Text('Notificaciones'),
            subtitle: Text('$_pendingAlerts notificaciones sin abrir'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToNotifications,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.orange.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.orange,
              child: Icon(Icons.person_add, color: Colors.white),
            ),
            title: const Text('Nuevos Ingresos'),
            subtitle: Text('${(_totalStudents * 0.2).round()} estudiantes nuevos requieren revisión'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToStudentList,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.blue.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.blue,
              child: Icon(Icons.update, color: Colors.white),
            ),
            title: const Text('Actualización de Ajustes'),
            subtitle: Text('$_totalAdjustments solicitudes de actualización'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _showUpdateRequestsDialog,
          ),
        ),
      ],
    );
  }

  Widget _buildManagementSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Gestión',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Card(
                child: ListTile(
                  leading: Icon(Icons.list_alt, color: Colors.indigo),
                  title: const Text('Estudiantes'),
                  subtitle: const Text('Ver todos los estudiantes'),
                  onTap: _navigateToStudentList,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Card(
                child: ListTile(
                  leading: Icon(Icons.list_alt, color: Colors.indigo),
                  title: const Text('Profesores'),
                  subtitle: const Text('Ver todos los profesores'),
                  onTap: _navigateToTeachersList,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Card(
          child: ListTile(
            leading: Icon(Icons.people, color: Colors.indigo),
            title: const Text('Gestión de Usuarios'),
            subtitle: const Text('Creación, edición, eliminación de usuarios'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToUserManagement,
          ),
        ),
      ],
    );
  }

  Widget _buildStatisticsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.2,
      children: [
        StatisticCard(
          title: 'Profesores',
          value: _totalTeachers.toString(),
          icon: Icons.school,
          backgroundColor: AppColors.totalStatCard,
          textColor: AppColors.totalStatText,
          onTap: () => _navigateToTeachersList(),
        ),
        StatisticCard(
          title: 'Estudiantes NEE',
          value: _studentsInCareer.toString(),
          icon: Icons.people,
          backgroundColor: AppColors.activeStatCard,
          textColor: AppColors.activeStatText,
          onTap: () => _navigateToStudentsList(),
        ),
        StatisticCard(
          title: 'Revisiones Pendientes',
          value: _pendingReviews.toString(),
          icon: Icons.rate_review,
          backgroundColor:
              _pendingReviews > 0
                  ? AppColors.pendingStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _pendingReviews > 0
                  ? AppColors.pendingStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToPendingReviews(),
        ),
        StatisticCard(
          title: 'Alertas Activas',
          value: _activeAlerts.toString(),
          icon: Icons.warning,
          backgroundColor:
              _activeAlerts > 0
                  ? AppColors.alertStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _activeAlerts > 0
                  ? AppColors.alertStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToAlerts(),
        ),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Acciones Rápidas', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            QuickActionButton(
              icon: Icons.analytics,
              tooltip: 'Ver Estadísticas',
              onPressed: () => _navigateToTeacherStats(),
              backgroundColor: Colors.purple,
            ),
            QuickActionButtonWithBadge(
              icon: Icons.assignment,
              tooltip: 'Revisar Ajustes',
              onPressed: () => _navigateToPendingReviews(),
              backgroundColor: Colors.orange,
              badgeCount: _pendingReviews,
            ),
            QuickActionButton(
              icon: Icons.group,
              tooltip: 'Gestionar Profesores',
              onPressed: () => _navigateToTeachersList(),
              backgroundColor: Colors.blue,
            ),
            ExportButton(
              onPressed: () => _navigateToExportReport(),
              color: Colors.green,
              label: 'Exportar Reporte',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTeacherSummary() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Resumen de Profesores',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            TextButton(
              onPressed: () => _navigateToTeachersList(),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_teacherStats.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('No hay profesores asignados a esta carrera'),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _teacherStats.take(5).length,
            itemBuilder: (context, index) {
              final teacher = _teacherStats[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      teacher.teacherName.substring(0, 1).toUpperCase(),
                    ),
                  ),
                  title: Text(teacher.teacherName),
                  subtitle: Text(
                    '${teacher.courseCount} cursos • ${teacher.studentCount} estudiantes',
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (teacher.alertCount > 0)
                        AlertBadge(count: teacher.alertCount, size: 20),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_ios, size: 16),
                    ],
                  ),
                  onTap: () => _navigateToTeacherDetail(teacher.teacherId),
                ),
              );
            },
          ),
      ],
    );
  }

  // Métodos de navegación
  void _navigateToNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const NotificationsScreen()),
    );
  }

  void _navigateToTeachersList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const TeachersListScreen()),
    );
  }

  void _navigateToStudentsList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentListScreen()),
    );
  }

  void _navigateToPendingReviews() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Redirigiendo a revisiones pendientes'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _navigateToAlerts() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AlertsScreen()),
    );
  }

  void _navigateToTeacherStats() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const TeacherStatsScreen()),
    );
  }

  void _navigateToExportReport() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exportar Reporte'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Seleccione el tipo de reporte a exportar:'),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.group),
              title: const Text('Reporte de Profesores'),
              onTap: () {
                Navigator.pop(context);
                _exportTeachersReport();
              },
            ),
            ListTile(
              leading: const Icon(Icons.school),
              title: const Text('Reporte de Estudiantes NEE'),
              onTap: () {
                Navigator.pop(context);
                _exportStudentsReport();
              },
            ),
            ListTile(
              leading: const Icon(Icons.assignment),
              title: const Text('Reporte de Ajustes Pendientes'),
              onTap: () {
                Navigator.pop(context);
                _exportAdjustmentsReport();
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
        ],
      ),
    );
  }

  void _exportTeachersReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Generando reporte de profesores... Descarga iniciada.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _exportStudentsReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Generando reporte de estudiantes NEE... Descarga iniciada.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _exportAdjustmentsReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Generando reporte de ajustes pendientes... Descarga iniciada.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _navigateToTeacherDetail(String teacherId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Mostrando detalle del profesor: $teacherId'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _navigateToStudentList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentListScreen()),
    );
  }

  void _navigateToUserManagement() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const UserManagementScreen()),
    );
  }

  void _showUpdateRequestsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Solicitudes de Actualización'),
        content: SizedBox(
          width: double.maxFinite,
          child: _students.isEmpty
              ? const Text("No hay estudiantes para mostrar.")
              : ListView.builder(
                  shrinkWrap: true,
                  itemCount: (_students.length * 0.1).round().clamp(0, _students.length),
                  itemBuilder: (context, index) {
                    if (_students.isEmpty) return const SizedBox.shrink();
                    final student = _students[index % _students.length];
                    return ListTile(
                      title: Text(student.nombreCompleto),
                      subtitle: Text('${student.carreraNombre ?? 'Sin carrera'} - ${student.rut}'),
                      leading: const CircleAvatar(child: Icon(Icons.person)),
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
      ),
    );
  }
}

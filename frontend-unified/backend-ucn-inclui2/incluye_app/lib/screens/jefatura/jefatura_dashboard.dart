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
  List<TeacherStats> _teacherStats = [];

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
    Navigator.pushNamed(context, '/notifications');
  }

  void _navigateToTeachersList() {
    Navigator.pushNamed(context, '/teachers');
  }

  void _navigateToStudentsList() {
    Navigator.pushNamed(context, '/students/career/$_headCareerId');
  }

  void _navigateToPendingReviews() {
    Navigator.pushNamed(context, '/reviews/pending');
  }

  void _navigateToAlerts() {
    Navigator.pushNamed(context, '/alerts');
  }

  void _navigateToTeacherStats() {
    Navigator.pushNamed(context, '/teachers/stats');
  }

  void _navigateToExportReport() {
    Navigator.pushNamed(context, '/reports/export');
  }

  void _navigateToTeacherDetail(String teacherId) {
    Navigator.pushNamed(context, '/teachers/$teacherId');
  }
}

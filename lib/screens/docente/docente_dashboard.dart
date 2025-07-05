import 'package:flutter/material.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/widgets/statistic_card.dart';
import 'package:incluye_app/widgets/alert_badge.dart';
import 'package:incluye_app/widgets/quick_action_button.dart';
import 'package:incluye_app/models/course_with_adjustment_model.dart';
import 'package:incluye_app/screens/docente/student_adjustments_screen.dart';
import 'package:incluye_app/screens/students/student_subject_list.dart';
import 'package:incluye_app/screens/courses/courses_list_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

/// Dashboard principal para el rol Docente
/// Enfocado en gestión de cursos y estudiantes NEE asignados
class DocenteDashboard extends StatefulWidget {
  const DocenteDashboard({super.key});

  @override
  State<DocenteDashboard> createState() => _DocenteDashboardState();
}

class _DocenteDashboardState extends State<DocenteDashboard> {
  bool _isLoading = true;
  String? _currentTeacherId;
  String? _teacherName;
  int _totalCourses = 0;
  int _studentsWithNEE = 0;
  int _pendingAdjustments = 0;
  int _helpRequests = 0;
  int _unreadNotifications = 0;
  List<CourseAdjustment> _courses = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      // Obtener información del docente actual
      final userInfo = await StudentService.getCurrentUserInfo();
      _currentTeacherId = userInfo?.id;
      _teacherName = userInfo?.nombreCompleto;

      if (_currentTeacherId != null && _teacherName != null) {
        // Cargar cursos del docente usando el nombre completo (como en HomeScreen monolítico)
        final courses = await CourseService.getTeacherCourses(
          _teacherName!,
        );
        final adjustments = await AdjustmentService.getAllAdjustments();

        // Simular carga de notificaciones (como en HomeScreen monolítico)
        final notificationCount = await _loadNotificationsCount();

        // Calcular estadísticas
        final studentsInCourses =
            courses.expand((course) => course.students).toSet().length;

        final pendingAdj = adjustments.where((adj) => adj.isPending).length;

        final helpReq =
            adjustments
                .where((adj) => adj.requiresSemesterConfirmation == true)
                .length;

        setState(() {
          _courses = courses;
          _totalCourses = courses.length;
          _studentsWithNEE = studentsInCourses;
          _pendingAdjustments = pendingAdj;
          _helpRequests = helpReq;
          _unreadNotifications = notificationCount;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No se pudo obtener la información del docente'),
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

  Future<int> _loadNotificationsCount() async {
    try {
      // Simular carga de notificaciones como en HomeScreen monolítico
      return (_studentsWithNEE / 3).round();
    } catch (e) {
      return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      title: 'Dashboard Docente',
      onRefresh: _loadDashboardData,
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => _navigateToNotifications(),
            ),
            if (_pendingAdjustments > 0)
              Positioned(
                right: 8,
                top: 8,
                child: AlertBadge(count: _pendingAdjustments),
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
                    _buildNotificationsSection(),
                    const SizedBox(height: 24),
                    _buildCoursesSection(),
                    const SizedBox(height: 24),
                    _buildStatisticsGrid(),
                    const SizedBox(height: 24),
                    _buildQuickActions(),
                    const SizedBox(height: 24),
                    _buildCourseSummary(),
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
              child: const Icon(Icons.school, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Panel Docente',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Gestiona tus cursos y estudiantes con necesidades especiales',
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

  Widget _buildNotificationsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Alertas y notificaciones',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.red.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.red,
              child: Icon(Icons.warning, color: Colors.white),
            ),
            title: const Text('Notificaciones sin revisar'),
            subtitle: Text('$_unreadNotifications notificaciones sin abrir'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToNotifications,
          ),
        ),
      ],
    );
  }

  Widget _buildCoursesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mis Asignaturas',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.blue.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.blue,
              child: Icon(Icons.book, color: Colors.white),
            ),
            title: const Text('Asignaturas semestre actual'),
            subtitle: Text('$_totalCourses asignaturas a cargo'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToCoursesList,
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
          title: 'Mis Cursos',
          value: _totalCourses.toString(),
          icon: Icons.book,
          backgroundColor: AppColors.totalStatCard,
          textColor: AppColors.totalStatText,
          onTap: () => _navigateToCoursesList(),
        ),
        StatisticCard(
          title: 'Estudiantes NEE',
          value: _studentsWithNEE.toString(),
          icon: Icons.people,
          backgroundColor: AppColors.activeStatCard,
          textColor: AppColors.activeStatText,
          onTap: () => _navigateToStudentsNEE(),
        ),
        StatisticCard(
          title: 'Ajustes Pendientes',
          value: _pendingAdjustments.toString(),
          icon: Icons.assignment,
          backgroundColor:
              _pendingAdjustments > 0
                  ? AppColors.pendingStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _pendingAdjustments > 0
                  ? AppColors.pendingStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToPendingAdjustments(),
        ),
        StatisticCard(
          title: 'Solicitudes Ayuda',
          value: _helpRequests.toString(),
          icon: Icons.help,
          backgroundColor:
              _helpRequests > 0
                  ? AppColors.alertStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _helpRequests > 0
                  ? AppColors.alertStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToHelpRequests(),
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
              icon: Icons.checklist,
              tooltip: 'Marcar Ajustes Leídos',
              onPressed: () => _navigateToMarkAdjustments(),
              backgroundColor: Colors.green,
            ),
            QuickActionButtonWithBadge(
              icon: Icons.help_outline,
              tooltip: 'Solicitar Ayuda',
              onPressed: () => _showHelpRequestDialog(),
              backgroundColor: Colors.orange,
              badgeCount: _helpRequests,
            ),
            QuickActionButton(
              icon: Icons.list_alt,
              tooltip: 'Ver Mis Cursos',
              onPressed: () => _navigateToCoursesList(),
              backgroundColor: Colors.blue,
            ),
            QuickActionButton(
              icon: Icons.assessment,
              tooltip: 'Mi Reporte',
              onPressed: () => _navigateToMyReport(),
              backgroundColor: Colors.purple,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCourseSummary() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Mis Cursos', style: Theme.of(context).textTheme.titleLarge),
            TextButton(
              onPressed: () => _navigateToCoursesList(),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_courses.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('No tienes cursos asignados'),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _courses.take(5).length,
            itemBuilder: (context, index) {
              final course = _courses[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.blue.shade100,
                    child: Text(course.codigo.substring(0, 2).toUpperCase()),
                  ),
                  title: Text(course.nombre),
                  subtitle: Text(
                    '${course.studentsWithNeeCount} estudiantes NEE',
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (course.studentsWithNeeCount > 0)
                        AlertBadge(
                          count: course.studentsWithNeeCount,
                          size: 20,
                        ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_ios, size: 16),
                    ],
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder:
                            (_) => StudentSubjectListScreen(
                              courseId: course.id,
                              courseNrc: course.nrc,
                            ),
                      ),
                    );
                  },
                ),
              );
            },
          ),
      ],
    );
  }

  void _showHelpRequestDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Solicitar Ayuda'),
            content: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Describe tu consulta',
                    hintText: 'Explica en qué necesitas ayuda...',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
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
                      content: Text('Solicitud de ayuda enviada'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                child: const Text('Enviar'),
              ),
            ],
          ),
    );
  }

  // Métodos de navegación
  void _navigateToNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const NotificationsScreen()),
    );
  }

  void _navigateToCoursesList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CoursesListScreen()),
    );
  }

  void _navigateToStudentsNEE() {
    Navigator.pushNamed(context, '/students/nee');
  }

  void _navigateToPendingAdjustments() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const StudentAdjustmentsScreen()),
    );
  }

  void _navigateToHelpRequests() {
    Navigator.pushNamed(context, '/help-requests');
  }

  void _navigateToMarkAdjustments() {
    Navigator.pushNamed(context, '/adjustments/mark-read');
  }

  void _navigateToMyReport() {
    Navigator.pushNamed(context, '/reports/teacher');
  }
}

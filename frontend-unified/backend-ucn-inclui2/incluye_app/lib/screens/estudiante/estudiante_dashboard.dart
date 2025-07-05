import 'package:flutter/material.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/widgets/statistic_card.dart';
import 'package:incluye_app/widgets/alert_badge.dart';
import 'package:incluye_app/widgets/quick_action_button.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/screens/students/student_course_list_screen.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

/// Dashboard principal para el rol Estudiante
/// Enfocado en seguimiento de ajustes razonables y cursos
class EstudianteDashboard extends StatefulWidget {
  const EstudianteDashboard({super.key});

  @override
  State<EstudianteDashboard> createState() => _EstudianteDashboardState();
}

class _EstudianteDashboardState extends State<EstudianteDashboard> {
  bool _isLoading = true;
  String? _currentStudentId;
  int _totalCourses = 0;
  int _activeAdjustments = 0;
  int _pendingConfirmations = 0;
  int _completedAdjustments = 0;
  List<Adjustment> _recentAdjustments = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      // Obtener información del estudiante actual
      _currentStudentId = await StudentService.getStudentId();

      if (_currentStudentId != null) {
        // Cargar datos del estudiante
        final courses = await CourseService.getStudentCourses(
          _currentStudentId!,
        );
        final adjustments = await AdjustmentService.getAdjustmentHistory(
          _currentStudentId!,
        );

        // Calcular estadísticas
        final activeAdj = adjustments.where((adj) => adj.isActive).length;

        final pendingConf =
            adjustments
                .where(
                  (adj) =>
                      adj.requiresSemesterConfirmation == true &&
                      adj.status != 'CONFIRMADO',
                )
                .length;

        final completedAdj =
            adjustments
                .where((adj) => adj.status?.toUpperCase() == 'COMPLETADO')
                .length;

        setState(() {
          _totalCourses = courses.length;
          _activeAdjustments = activeAdj;
          _pendingConfirmations = pendingConf;
          _completedAdjustments = completedAdj;
          _recentAdjustments = adjustments.take(5).toList();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No se pudo obtener la información del estudiante'),
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
      title: 'Mi Dashboard',
      onRefresh: _loadDashboardData,
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => _navigateToNotifications(),
            ),
            if (_pendingConfirmations > 0)
              Positioned(
                right: 8,
                top: 8,
                child: AlertBadge(count: _pendingConfirmations),
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
                    _buildRecentAdjustments(),
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
              child: const Icon(Icons.person, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '¡Hola!',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Aquí puedes ver tus ajustes razonables y progreso académico',
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
          title: 'Mis Cursos',
          value: _totalCourses.toString(),
          icon: Icons.book,
          backgroundColor: AppColors.totalStatCard,
          textColor: AppColors.totalStatText,
          onTap: () => _navigateToCoursesList(),
        ),
        StatisticCard(
          title: 'Ajustes Activos',
          value: _activeAdjustments.toString(),
          icon: Icons.tune,
          backgroundColor: AppColors.activeStatCard,
          textColor: AppColors.activeStatText,
          onTap: () => _navigateToMyAdjustments(),
        ),
        StatisticCard(
          title: 'Confirmaciones Pendientes',
          value: _pendingConfirmations.toString(),
          icon: Icons.assignment,
          backgroundColor:
              _pendingConfirmations > 0
                  ? AppColors.pendingStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _pendingConfirmations > 0
                  ? AppColors.pendingStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToPendingConfirmations(),
        ),
        StatisticCard(
          title: 'Ajustes Completados',
          value: _completedAdjustments.toString(),
          icon: Icons.check_circle,
          backgroundColor: AppColors.activeStatCard,
          textColor: AppColors.activeStatText,
          onTap: () => _navigateToCompletedAdjustments(),
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
              icon: Icons.visibility,
              tooltip: 'Ver Mi Perfil',
              onPressed: () => _navigateToMyProfile(),
              backgroundColor: Colors.blue,
            ),
            QuickActionButtonWithBadge(
              icon: Icons.check_box,
              tooltip: 'Confirmar Ajustes',
              onPressed: () => _navigateToPendingConfirmations(),
              backgroundColor: Colors.orange,
              badgeCount: _pendingConfirmations,
            ),
            QuickActionButton(
              icon: Icons.list_alt,
              tooltip: 'Mis Ajustes',
              onPressed: () => _navigateToMyAdjustments(),
              backgroundColor: Colors.green,
            ),
            QuickActionButton(
              icon: Icons.help_outline,
              tooltip: 'Ayuda',
              onPressed: () => _navigateToHelp(),
              backgroundColor: Colors.purple,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentAdjustments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Mis Ajustes Recientes',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            TextButton(
              onPressed: () => _navigateToMyAdjustments(),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_recentAdjustments.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('No tienes ajustes razonables registrados'),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _recentAdjustments.length,
            itemBuilder: (context, index) {
              final adjustment = _recentAdjustments[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getAdjustmentStatusColor(adjustment),
                    child: Icon(
                      _getAdjustmentStatusIcon(adjustment),
                      color: Colors.white,
                    ),
                  ),
                  title: Text(adjustment.tipo),
                  subtitle: Text(adjustment.descripcion),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => _navigateToAdjustmentDetail(adjustment.id),
                ),
              );
            },
          ),
      ],
    );
  }

  Color _getAdjustmentStatusColor(Adjustment adjustment) {
    if (adjustment.isActive) return Colors.green;
    if (adjustment.requiresSemesterConfirmation == true &&
        adjustment.isPending) {
      return Colors.orange;
    }
    if (adjustment.isExpired) return Colors.red;
    return Colors.grey;
  }

  IconData _getAdjustmentStatusIcon(Adjustment adjustment) {
    if (adjustment.isActive) return Icons.check_circle;
    if (adjustment.requiresSemesterConfirmation == true &&
        adjustment.isPending) {
      return Icons.schedule;
    }
    if (adjustment.isExpired) return Icons.error;
    return Icons.pause_circle;
  }

  // Métodos de navegación
  void _navigateToNotifications() {
    Navigator.pushNamed(context, '/notifications');
  }

  void _navigateToCoursesList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const StudentCourseListScreen()),
    );
  }

  void _navigateToMyAdjustments() {
    Navigator.pushNamed(context, '/student/adjustments');
  }

  void _navigateToPendingConfirmations() {
    Navigator.pushNamed(context, '/student/confirmations');
  }

  void _navigateToCompletedAdjustments() {
    Navigator.pushNamed(context, '/student/adjustments/completed');
  }

  void _navigateToMyProfile() {
    Navigator.pushNamed(context, '/student/profile');
  }

  void _navigateToHelp() {
    Navigator.pushNamed(context, '/help');
  }

  void _navigateToAdjustmentDetail(String? adjustmentId) {
    if (adjustmentId != null) {
      Navigator.pushNamed(context, '/adjustments/$adjustmentId');
    }
  }
}

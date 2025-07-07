import 'package:flutter/material.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/widgets/statistic_card.dart';
import 'package:incluye_app/widgets/alert_badge.dart';
import 'package:incluye_app/widgets/quick_action_button.dart';
import 'package:incluye_app/widgets/export_button.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/screens/diddec/pending_list_screen.dart';
import 'package:incluye_app/screens/diddec/resource_uploader_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/screens/diddec/diddec_students_screen.dart';
import 'package:incluye_app/screens/diddec/diddec_adjustments_screen.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

class DiddecDashboard extends StatefulWidget {
  const DiddecDashboard({super.key});

  @override
  State<DiddecDashboard> createState() => _DiddecDashboardState();
}

class _DiddecDashboardState extends State<DiddecDashboard> {
  bool _isLoading = true;
  int _totalStudents = 0;
  int _activeAdjustments = 0;
  int _pendingResources = 0;
  int _newRequests = 0;
  List<Adjustment> _recentAdjustments = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      final students = await StudentService.getAllStudents();
      final adjustments = await AdjustmentService.getAllAdjustments();

      if (!mounted) return;

      setState(() {
        _totalStudents = students.length;
        _activeAdjustments = adjustments.where((adj) => adj.isActive).length;
        _pendingResources = adjustments.where((adj) => adj.isPending).length;
        _newRequests =
            adjustments
                .where((adj) => adj.documentosAsociados?.isNotEmpty ?? false)
                .length;
        _recentAdjustments = adjustments.take(5).toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al cargar datos: $e'),
          backgroundColor: AppColors.alertStatCard,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      title: 'Dashboard DIDDEC',
      onRefresh: _loadDashboardData,
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => _navigateToNotifications(),
            ),
            if (_newRequests > 0)
              Positioned(
                right: 8,
                top: 8,
                child: AlertBadge(count: _newRequests),
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
                    _buildResourcesSection(),
                    const SizedBox(height: 24),
                    _buildAlertsSection(),
                    const SizedBox(height: 24),
                    _buildStatisticsGrid(),
                    const SizedBox(height: 24),
                    _buildQuickActions(),
                    const SizedBox(height: 24),
                    _buildRecentActivity(),
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
                Icons.accessible_forward,
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
                    'Panel DIDDEC',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Gestión de recursos y apoyo para NEE',
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

  Widget _buildResourcesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Gestión de Recursos',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.blue.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.blue,
              child: Icon(Icons.upload_file, color: Colors.white),
            ),
            title: const Text('Subir Recursos'),
            subtitle: const Text('Materiales educativos y apoyo técnico'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToResourceUploader,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.green.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.green,
              child: Icon(Icons.pending_actions, color: Colors.white),
            ),
            title: const Text('Solicitudes Pendientes'),
            subtitle: Text('$_pendingResources recursos por revisar'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToPendingList,
          ),
        ),
      ],
    );
  }

  Widget _buildAlertsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Alertas y Soporte',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.orange.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.orange,
              child: Icon(Icons.help_outline, color: Colors.white),
            ),
            title: const Text('Nuevas Solicitudes'),
            subtitle: Text('$_newRequests solicitudes de apoyo técnico'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToNotifications,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.purple.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.purple,
              child: Icon(Icons.analytics, color: Colors.white),
            ),
            title: const Text('Estadísticas Generales'),
            subtitle: Text('$_totalStudents estudiantes con NEE registrados'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToStudentList,
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
          title: 'Estudiantes NEE',
          value: _totalStudents.toString(),
          icon: Icons.school,
          backgroundColor: AppColors.totalStatCard,
          textColor: AppColors.totalStatText,
          onTap: () => _navigateToStudentsList(),
        ),
        StatisticCard(
          title: 'Ajustes Activos',
          value: _activeAdjustments.toString(),
          icon: Icons.tune,
          backgroundColor: AppColors.activeStatCard,
          textColor: AppColors.activeStatText,
          onTap: () => _navigateToAdjustmentsList(),
        ),
        StatisticCard(
          title: 'Recursos Pendientes',
          value: _pendingResources.toString(),
          icon: Icons.cloud_upload,
          backgroundColor:
              _pendingResources > 0
                  ? AppColors.pendingStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _pendingResources > 0
                  ? AppColors.pendingStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToPendingResources(),
        ),
        StatisticCard(
          title: 'Nuevas Solicitudes',
          value: _newRequests.toString(),
          icon: Icons.assignment_add,
          backgroundColor:
              _newRequests > 0
                  ? AppColors.alertStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _newRequests > 0
                  ? AppColors.alertStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToNewRequests(),
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
              icon: Icons.upload_file,
              tooltip: 'Subir Recurso',
              onPressed: () => _navigateToUploadResource(),
              backgroundColor: Colors.green,
            ),
            QuickActionButton(
              icon: Icons.assignment,
              tooltip: 'Revisar Solicitudes',
              onPressed: () => _navigateToReviewRequests(),
              backgroundColor: Colors.blue,
            ),
            ExportButton(
              onPressed: () => _navigateToReports(),
              color: Colors.orange,
              label: 'Generar Reporte',
            ),
            QuickActionButtonWithBadge(
              icon: Icons.archive,
              tooltip: 'Gestionar Recursos',
              onPressed: () => _navigateToManageResources(),
              backgroundColor: Colors.purple,
              badgeCount: _pendingResources,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Actividad Reciente',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            TextButton(
              onPressed: () => _navigateToAllActivity(),
              child: const Text('Ver toda'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_recentAdjustments.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('No hay actividad reciente'),
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
                    backgroundColor:
                        adjustment.isActive ? Colors.green : Colors.orange,
                    child: Icon(
                      adjustment.isActive ? Icons.check_circle : Icons.schedule,
                      color: Colors.white,
                    ),
                  ),
                  title: Text(adjustment.tipo),
                  subtitle: Text(adjustment.descripcion),
                  trailing: Text(
                    adjustment.courseNrc ?? 'Sin curso',
                    style: const TextStyle(fontSize: 12),
                  ),
                  onTap: () => _navigateToAdjustmentDetail(adjustment.id),
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

  void _navigateToStudentsList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const DiddecStudentsScreen()),
    );
  }

  void _navigateToAdjustmentsList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const DiddecAdjustmentsScreen()),
    );
  }

  void _navigateToPendingResources() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PendingListScreen()),
    );
  }

  void _navigateToNewRequests() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mostrando nuevas solicitudes'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _navigateToUploadResource() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ResourceUploaderScreen()),
    );
  }

  void _navigateToReviewRequests() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Revisando solicitudes pendientes'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _navigateToReports() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Generando reportes DIDDEC'),
        backgroundColor: Colors.purple,
      ),
    );
  }

  void _navigateToManageResources() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Gestionando recursos y materiales'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _navigateToAllActivity() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mostrando toda la actividad'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _navigateToAdjustmentDetail(String? adjustmentId) {
    if (adjustmentId != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Detalle del ajuste: $adjustmentId'),
          backgroundColor: Colors.blue,
        ),
      );
    }
  }

  void _navigateToResourceUploader() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ResourceUploaderScreen()),
    );
  }

  void _navigateToPendingList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PendingListScreen()),
    );
  }

  void _navigateToStudentList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentListScreen()),
    );
  }
}

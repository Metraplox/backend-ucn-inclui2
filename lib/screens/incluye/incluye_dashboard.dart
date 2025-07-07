import 'package:flutter/material.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/widgets/statistic_card.dart';
import 'package:incluye_app/widgets/alert_badge.dart';
import 'package:incluye_app/widgets/quick_action_button.dart';
import 'package:incluye_app/screens/user_management_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

/// Dashboard principal para el rol Incluye (Coordinadora/Educadora Social)
/// Muestra métricas clave, alertas y acciones rápidas
class IncluyeDashboard extends StatefulWidget {
  const IncluyeDashboard({super.key});

  @override
  State<IncluyeDashboard> createState() => _IncluyeDashboardState();
}

class _IncluyeDashboardState extends State<IncluyeDashboard> {
  bool _isLoading = true;
  int _totalStudents = 0;
  int _activeAdjustments = 0;
  int _pendingDocuments = 0;
  int _newAlerts = 0;
  List<Student> _recentStudents = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      // Cargar estadísticas principales
      final students = await StudentService.getAllStudents();
      final adjustments = await AdjustmentService.getAllAdjustments();

      setState(() {
        _totalStudents = students.length;
        _activeAdjustments = adjustments.where((adj) => adj.isActive).length;
        _pendingDocuments =
            adjustments
                .where((adj) => adj.documentosAsociados?.isNotEmpty ?? false)
                .length;
        _newAlerts = adjustments.where((adj) => adj.isPending).length;
        _recentStudents = students.take(5).toList();
        _isLoading = false;
      });
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
      title: 'Dashboard Incluye',
      onRefresh: _loadDashboardData,
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => _navigateToNotifications(),
            ),
            if (_newAlerts > 0)
              Positioned(
                right: 8,
                top: 8,
                child: AlertBadge(count: _newAlerts),
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
                    _buildInclusionSection(),
                    const SizedBox(height: 24),
                    _buildProgramsSection(),
                    const SizedBox(height: 24),
                    _buildStatisticsGrid(),
                    const SizedBox(height: 24),
                    _buildQuickActions(),
                    const SizedBox(height: 24),
                    _buildRecentStudents(),
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
                Icons.psychology,
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
                    '¡Bienvenida!',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Gestiona estudiantes NEE y sus ajustes razonables',
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

  Widget _buildInclusionSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Inclusión Educativa',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.green.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.green,
              child: Icon(Icons.accessibility_new, color: Colors.white),
            ),
            title: const Text('Estudiantes con NEE'),
            subtitle: Text('$_totalStudents estudiantes registrados'),
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
              child: Icon(Icons.assignment, color: Colors.white),
            ),
            title: const Text('Ajustes Activos'),
            subtitle: Text('$_activeAdjustments ajustes en proceso'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToNotifications,
          ),
        ),
      ],
    );
  }

  Widget _buildProgramsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Programas y Apoyo',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.purple.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.purple,
              child: Icon(Icons.psychology, color: Colors.white),
            ),
            title: const Text('Apoyo Psicopedagógico'),
            subtitle: const Text('Seguimiento y orientación especializada'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToUserManagement,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.orange.shade50,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.orange,
              child: Icon(Icons.folder_special, color: Colors.white),
            ),
            title: const Text('Documentos Pendientes'),
            subtitle: Text('$_pendingDocuments documentos por revisar'),
            trailing: const Icon(Icons.arrow_forward),
            onTap: _navigateToNotifications,
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
          title: 'Documentos Pendientes',
          value: _pendingDocuments.toString(),
          icon: Icons.description,
          backgroundColor:
              _pendingDocuments > 0
                  ? AppColors.pendingStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _pendingDocuments > 0
                  ? AppColors.pendingStatText
                  : AppColors.neutralStatText,
          onTap: () => _navigateToDocumentsList(),
        ),
        StatisticCard(
          title: 'Alertas Nuevas',
          value: _newAlerts.toString(),
          icon: Icons.warning,
          backgroundColor:
              _newAlerts > 0
                  ? AppColors.alertStatCard
                  : AppColors.neutralStatCard,
          textColor:
              _newAlerts > 0
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
              icon: Icons.person_add,
              tooltip: 'Registrar Estudiante',
              onPressed: () => _navigateToNewStudent(),
              backgroundColor: Colors.green,
            ),
            QuickActionButton(
              icon: Icons.add_circle,
              tooltip: 'Crear Ajuste',
              onPressed: () => _navigateToNewAdjustment(),
              backgroundColor: Colors.blue,
            ),
            QuickActionButton(
              icon: Icons.manage_accounts,
              tooltip: 'Gestionar Usuarios',
              onPressed: () => _navigateToUserManagement(),
              backgroundColor: Colors.teal,
            ),
            QuickActionButtonWithBadge(
              icon: Icons.assessment,
              tooltip: 'Generar Reporte',
              onPressed: () => _navigateToReports(),
              backgroundColor: Colors.purple,
              badgeCount: _pendingDocuments,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentStudents() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Estudiantes Recientes',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            TextButton(
              onPressed: () => _navigateToStudentsList(),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_recentStudents.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('No hay estudiantes registrados aún'),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _recentStudents.length,
            itemBuilder: (context, index) {
              final student = _recentStudents[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      student.nombreCompleto.substring(0, 1).toUpperCase(),
                    ),
                  ),
                  title: Text(student.nombreCompleto),
                  subtitle: Text(
                    student.carreraNombre ?? 'Sin carrera asignada',
                  ),
                  trailing: AlertBadge(
                    count: 0, // Sin campo adjustments en modelo
                    size: 20,
                    showZero: true,
                  ),
                  onTap: () => _navigateToStudentDetail(student.id),
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

  void _navigateToStudentsList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentListScreen()),
    );
  }

  void _navigateToAdjustmentsList() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mostrando lista de ajustes curriculares'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _navigateToDocumentsList() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mostrando documentos pendientes'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _navigateToAlerts() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mostrando alertas del sistema'),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _navigateToNewStudent() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Abriendo formulario de nuevo estudiante'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _navigateToNewAdjustment() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Creando nuevo ajuste curricular'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _navigateToReports() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Generando reportes del sistema'),
        backgroundColor: Colors.purple,
      ),
    );
  }

  void _navigateToStudentDetail(String studentId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Abriendo perfil del estudiante: $studentId'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}

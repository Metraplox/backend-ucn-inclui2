// screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:incluye_app/features/authentication/providers/auth_provider.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/screens/estudiante/estudiante_dashboard.dart';
import 'package:incluye_app/screens/docente/docente_dashboard.dart';
import 'package:incluye_app/screens/jefatura/jefatura_dashboard.dart';
import 'package:incluye_app/screens/diddec/diddec_dashboard.dart';
import 'package:incluye_app/screens/incluye/incluye_dashboard.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _unreadNotifications = 0;

  @override
  void initState() {
    super.initState();
    _checkNotifications();
  }

  void _checkNotifications() async {
    try {
      // Llamamos al contador optimizado
      final response = await ApiService.dio.get('/notifications/unread-count');
      if (!mounted) return;
      setState(() {
        _unreadNotifications = response.data['count'] ?? 0;
      });
    } catch (e) {
      // Fallback: contar manualmente
      final list = await NotificationService.getAllNotifications();
      if (!mounted) return;
      setState(() {
        _unreadNotifications = list.where((n) => !n.isRead).length;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Error: Usuario no autenticado.')),
      );
    }

    return DashboardScaffold(
      title: 'Inicio',
      body: _buildDashboard(context, authProvider),
      onRefresh: () async {
        _checkNotifications();
      },
      actions: [
        _buildNotificationIcon(),
        _buildPopupMenu(context, authProvider),
      ],
    );
  }

  Widget _buildDashboard(BuildContext context, AuthProvider authProvider) {
    final activeRole = authProvider.activeRole;
    if (activeRole == null) {
      return const Center(
        child: Text('Rol no seleccionado.', style: TextStyle(fontSize: 24)),
      );
    }

    // Seleccionar el dashboard según el rol activo
    switch (activeRole) {
      case 'ESTUDIANTE':
        return const EstudianteDashboard();
      case 'DOCENTE':
        return const DocenteDashboard();
      case 'JEFE_CARRERA':
        return const JefaturaDashboard();
      case 'DIDDEC':
        return const DiddecDashboard();
      case 'INCLUYE':
        return const IncluyeDashboard();
      default:
        return const Center(
          child: Text(
            'Dashboard no disponible para este rol.',
            style: TextStyle(fontSize: 24),
          ),
        );
    }
  }

  // --- Widgets de la AppBar ---
  Widget _buildNotificationIcon() {
    return IconButton(
      icon: Badge(
        label: Text('$_unreadNotifications'),
        isLabelVisible: _unreadNotifications > 0,
        child: const Icon(Icons.notifications),
      ),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const NotificationsScreen()),
        );
      },
    );
  }

  Widget _buildPopupMenu(BuildContext context, AuthProvider authProvider) {
    return PopupMenuButton<String>(
      onSelected: (value) async {
        if (value == 'logout') {
          await authProvider.logout();
          if (!context.mounted) return;
          Navigator.of(context).pushReplacementNamed('/login');
        } else if (value == 'profile') {
          // Navegar al perfil del usuario
        }
      },
      itemBuilder: (BuildContext context) {
        return [
          const PopupMenuItem<String>(value: 'profile', child: Text('Perfil')),
          const PopupMenuItem<String>(
            value: 'logout',
            child: Text('Cerrar Sesión'),
          ),
        ];
      },
    );
  }
}

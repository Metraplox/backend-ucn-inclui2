// lib/widgets/app_scaffold.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final bool isStudent;
  final bool isHorizontalView;
  final VoidCallback? onToggleView;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    required this.isStudent,
    this.isHorizontalView = false,
    this.onToggleView,
  });

  void _logout(BuildContext context) async {
    await ApiService.logout();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        actions: [
          // Notificaciones
          IconButton(
            icon: const Icon(Icons.notifications),
            tooltip: 'Notificaciones',
            onPressed: () {
              // TODO: Navegar a pantalla de notificaciones
            },
          ),
          // Toggle view icon
          if (onToggleView != null)
            IconButton(
              icon: Icon(isHorizontalView ? Icons.view_agenda : Icons.view_week),
              tooltip: 'Cambiar vista',
              onPressed: onToggleView,
            ),
          // Logout
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () => _logout(context),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.indigo),
              child: Text('Menú', style: TextStyle(color: Colors.white, fontSize: 24)),
            ),
            if (isStudent) ...[
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Mi perfil'),
                onTap: () {
                  Navigator.pop(context);
                  // Navigator.push(...)
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  // Navigator.push(...)
                },
              ),
              ListTile(
                leading: const Icon(Icons.build),
                title: const Text('Solicitar Ajuste'),
                onTap: () {
                  Navigator.pop(context);
                  // Navigator.push(...)
                },
              ),
            ],
          ],
        ),
      ),
      body: body,
    );
  }
}

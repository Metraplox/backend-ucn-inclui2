import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final bool isStudent;
  final bool isAdmin;
  final bool isHorizontalView;
  final VoidCallback? onToggleView;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    required this.isStudent,
    this.isAdmin = false,
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
          IconButton(
            icon: const Icon(Icons.notifications),
            tooltip: 'Notificaciones',
            onPressed: () {
              // TODO: Navegar a pantalla de notificaciones
            },
          ),
          if (onToggleView != null)
            IconButton(
              icon: Icon(isHorizontalView ? Icons.view_agenda : Icons.view_week),
              tooltip: 'Cambiar vista',
              onPressed: onToggleView,
            ),
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
                  // TODO: ir a Mi perfil
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: ir a Configuración
                },
              ),
              ListTile(
                leading: const Icon(Icons.build),
                title: const Text('Solicitar Ajuste'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: ir a Solicitar Ajuste
                },
              ),
            ],
            if (isAdmin) ...[
              ListTile(
                leading: const Icon(Icons.group),
                title: const Text('Ver Estudiantes'),
                 onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const StudentListScreen()),);
 // Asegúrate de registrar la ruta
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: ir a Configuración
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
